import type { AdapterExecutionContext, AdapterExecutionResult } from "@sirius-eco-system/adapter-utils";
import { asString, asNumber, parseObject, renderTemplate } from "@sirius-eco-system/adapter-utils/server-utils";

/**
 * Production-ready HTTP Execution Logic for SIRIUSLY.
 * Supports custom methods, authentication headers, and dynamic payload templates.
 */
export async function execute(ctx: AdapterExecutionContext): Promise<AdapterExecutionResult> {
  const { config, runId, agent, context } = ctx;
  
  const url = asString(config.url, "");
  if (!url) {
    throw new Error("HTTP adapter configuration missing 'url'. Please provide a valid provider endpoint.");
  }

  const method = asString(config.method, "POST").toUpperCase();
  const timeoutSec = asNumber(config.timeoutSec, 30);
  const headers = parseObject(config.headers) as Record<string, string>;
  
  // Use payloadTemplate if provided, otherwise default to standard Siriusly format
  const payloadTemplate = parseObject(config.payloadTemplate);
  let body: any;

  if (payloadTemplate && Object.keys(payloadTemplate).length > 0) {
    // Basic template rendering for the prompt
    const templateStr = JSON.stringify(payloadTemplate);
    const rendered = renderTemplate(templateStr, { 
      prompt: context.prompt || "",
      agentName: agent.name,
      runId 
    });
    body = JSON.parse(rendered);
  } else {
    body = {
      prompt: context.prompt,
      agentId: agent.id,
      agentName: agent.name,
      runId,
      context
    };
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutSec * 1000);

  try {
    const res = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
      body: method !== "GET" ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });

    if (!res.ok) {
      const errorText = await res.text().catch(() => "Unknown error");
      return {
        exitCode: res.status,
        signal: null,
        timedOut: false,
        errorMessage: `HTTP ${method} to ${url} failed with status ${res.status}: ${errorText}`,
      };
    }

    const resultJson = await res.json();
    
    // Attempt robust summary extraction from common AI response formats
    let summary = "Task completed successfully via HTTP adapter.";
    
    if (resultJson.summary) {
      summary = resultJson.summary;
    } else if (resultJson.content) {
      summary = resultJson.content;
    } else if (resultJson.text) {
      summary = resultJson.text;
    } else if (resultJson.choices && resultJson.choices[0]?.message?.content) {
      // OpenAI-compatible format
      summary = resultJson.choices[0].message.content;
    } else if (resultJson.output) {
      summary = resultJson.output;
    }

    return {
      exitCode: 0,
      signal: null,
      timedOut: false,
      summary,
      resultJson,
    };
  } catch (error: any) {
    const isTimeout = error.name === "AbortError";
    return {
      exitCode: 1,
      signal: isTimeout ? "SIGABRT" : null,
      timedOut: isTimeout,
      errorMessage: isTimeout ? `Request to ${url} timed out after ${timeoutSec}s` : error.message,
    };
  } finally {
    clearTimeout(timeoutId);
  }
}

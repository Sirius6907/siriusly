import type { AdapterExecutionContext, AdapterExecutionResult } from "../types.js";
import { asString, asNumber, parseObject, renderTemplate } from "../utils.js";

/**
 * Execute an outbound HTTP request for an agent.
 * This adapter is used when the "agent" is an external web service.
 */
export async function execute(
  ctx: AdapterExecutionContext,
): Promise<AdapterExecutionResult> {
  const { config, runId, onLog } = ctx;
  const urlValue = asString(config.url, "");
  const method = asString(config.method, "POST").toUpperCase();
  const timeoutSec = asNumber(config.timeoutSec, 30);
  const headersConfig = parseObject(config.headers);
  const payloadTemplate = config.payloadTemplate;

  if (!urlValue) {
    return {
      exitCode: 1,
      signal: null,
      timedOut: false,
      errorMessage: "HTTP adapter requires a URL.",
    };
  }

  // Prepare biological context for templates
  const templateCtx = {
    agentIds: [ctx.agent.id],
    companyId: ctx.agent.companyId,
    runId,
    agent: ctx.agent,
    config: ctx.config,
    context: ctx.context,
    runtime: ctx.runtime,
    timestamp: new Date().toISOString(),
  };

  // Render headers
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "User-Agent": "SiriusEcoSystem/1.0",
    "X-Sirius-Run-Id": runId,
  };

  for (const [key, val] of Object.entries(headersConfig)) {
    if (typeof val === "string") {
      headers[key] = renderTemplate(val, templateCtx);
    } else {
      headers[key] = String(val);
    }
  }

  // Render payload
  let body: string | undefined;
  if (payloadTemplate) {
    if (typeof payloadTemplate === "string") {
      body = renderTemplate(payloadTemplate, templateCtx);
    } else {
      body = JSON.stringify(payloadTemplate);
    }
  } else {
    // Default payload if none provided
    body = JSON.stringify({
      runId,
      agentId: ctx.agent.id,
      prompt: ctx.context.prompt ?? "",
      context: ctx.context,
    });
  }

  await onLog("stdout", `[http] Invoking ${method} ${urlValue}\n`);
  
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutSec * 1000);

  try {
    const response = await fetch(urlValue, {
      method,
      headers,
      body: method !== "GET" && method !== "HEAD" ? body : undefined,
      signal: controller.signal,
    });

    clearTimeout(timeout);

    const responseText = await response.text();
    await onLog("stdout", `[http] Response: ${response.status} ${response.statusText}\n`);

    if (!response.ok) {
      return {
        exitCode: response.status,
        signal: null,
        timedOut: false,
        errorMessage: `HTTP ${response.status}: ${responseText.slice(0, 500)}`,
      };
    }

    let resultJson: Record<string, unknown> | null = null;
    try {
      resultJson = JSON.parse(responseText);
    } catch {
      // Not JSON, that's okay
    }

    return {
      exitCode: 0,
      signal: null,
      timedOut: false,
      resultJson,
      summary: resultJson?.summary as string | undefined,
    };
  } catch (err: any) {
    clearTimeout(timeout);
    const isTimeout = err.name === "AbortError";
    await onLog("stderr", `[http] Error: ${err.message}\n`);

    return {
      exitCode: 1,
      signal: null,
      timedOut: isTimeout,
      errorMessage: isTimeout ? "Request timed out" : err.message,
    };
  }
}

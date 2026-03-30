import type { TranscriptEntry } from "@sirius-eco-system/adapter-utils";

interface UsageAccumulator {
  inputTokens: number;
  outputTokens: number;
  cachedInputTokens: number;
}

interface ParsedResult {
  sessionId: string | null;
  summary: string | null;
  errorMessage: string | null;
  costUsd: number | null;
  usage: UsageAccumulator;
  model: string | null;
}

function safeJsonParse(line: string): Record<string, unknown> | null {
  try {
    const parsed = JSON.parse(line);
    if (typeof parsed === "object" && parsed !== null && !Array.isArray(parsed)) {
      return parsed as Record<string, unknown>;
    }
    return null;
  } catch {
    return null;
  }
}

function asStr(value: unknown): string | null {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

function asNum(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

/**
 * Parse the full captured stdout from a remote OpenClaw run.
 * Handles JSON-lines format output.
 */
export function parseAwsOpenClawOutput(stdout: string): ParsedResult {
  const result: ParsedResult = {
    sessionId: null,
    summary: null,
    errorMessage: null,
    costUsd: null,
    usage: { inputTokens: 0, outputTokens: 0, cachedInputTokens: 0 },
    model: null,
  };

  const lines = stdout.split(/\r?\n/);
  const textParts: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    const json = safeJsonParse(trimmed);
    if (!json) {
      textParts.push(trimmed);
      continue;
    }

    const type = asStr(json.type);

    // Session init events
    if (type === "init" || type === "session.start" || type === "session") {
      result.sessionId = asStr(json.sessionId) ?? asStr(json.session_id) ?? result.sessionId;
      result.model = asStr(json.model) ?? result.model;
    }

    // Assistant text
    if (type === "assistant" || type === "message" || type === "text") {
      const text = asStr(json.text) ?? asStr(json.content);
      if (text) textParts.push(text);
    }

    // Tool calls — just pass through, no special handling
    if (type === "tool_call" || type === "tool_result") {
      // captured in transcript, not summary
    }

    // Result/summary events
    if (type === "result" || type === "summary" || type === "done") {
      result.summary = asStr(json.text) ?? asStr(json.summary) ?? result.summary;

      const usage = typeof json.usage === "object" && json.usage !== null
        ? (json.usage as Record<string, unknown>)
        : null;
      if (usage) {
        result.usage.inputTokens += asNum(usage.inputTokens) ?? asNum(usage.input_tokens) ?? 0;
        result.usage.outputTokens += asNum(usage.outputTokens) ?? asNum(usage.output_tokens) ?? 0;
        result.usage.cachedInputTokens += asNum(usage.cachedInputTokens) ?? asNum(usage.cached_input_tokens) ?? 0;
      }

      result.costUsd = asNum(json.costUsd) ?? asNum(json.cost_usd) ?? result.costUsd;
    }

    // Error events
    if (type === "error") {
      result.errorMessage = asStr(json.message) ?? asStr(json.error) ?? asStr(json.text) ?? result.errorMessage;
    }

    // Inline usage in any event
    if (json.inputTokens !== undefined || json.input_tokens !== undefined) {
      result.usage.inputTokens += asNum(json.inputTokens) ?? asNum(json.input_tokens) ?? 0;
      result.usage.outputTokens += asNum(json.outputTokens) ?? asNum(json.output_tokens) ?? 0;
      result.usage.cachedInputTokens += asNum(json.cachedInputTokens) ?? asNum(json.cached_input_tokens) ?? 0;
    }
  }

  if (!result.summary && textParts.length > 0) {
    result.summary = textParts[textParts.length - 1] ?? null;
  }

  return result;
}

/**
 * Detect if the error output indicates an unknown/expired session.
 */
export function isAwsOpenClawUnknownSessionError(stdout: string, stderr: string): boolean {
  const combined = `${stdout}\n${stderr}`.toLowerCase();
  return (
    combined.includes("unknown session") ||
    combined.includes("session not found") ||
    combined.includes("session expired") ||
    combined.includes("invalid session")
  );
}

/**
 * Parse a single stdout line into TranscriptEntry[] for the UI run viewer.
 */
export function parseAwsOpenClawStdoutLine(line: string, ts: string): TranscriptEntry[] {
  const trimmed = line.trim();
  if (!trimmed) return [];

  const json = safeJsonParse(trimmed);
  if (!json) {
    return [{ kind: "stdout", ts, text: trimmed }];
  }

  const type = asStr(json.type);
  const entries: TranscriptEntry[] = [];

  switch (type) {
    case "init":
    case "session.start":
    case "session": {
      entries.push({
        kind: "init",
        ts,
        model: asStr(json.model) ?? "unknown",
        sessionId: asStr(json.sessionId) ?? asStr(json.session_id) ?? "",
      });
      break;
    }

    case "assistant":
    case "message":
    case "text": {
      const text = asStr(json.text) ?? asStr(json.content) ?? "";
      entries.push({ kind: "assistant", ts, text });
      break;
    }

    case "thinking":
    case "reasoning": {
      const text = asStr(json.text) ?? asStr(json.content) ?? "";
      entries.push({ kind: "thinking", ts, text });
      break;
    }

    case "tool_call": {
      entries.push({
        kind: "tool_call",
        ts,
        name: asStr(json.name) ?? asStr(json.tool) ?? "unknown",
        input: typeof json.input === "string" ? json.input : JSON.stringify(json.input ?? json.args ?? {}),
      });
      break;
    }

    case "tool_result": {
      entries.push({
        kind: "tool_result",
        ts,
        toolUseId: asStr(json.toolUseId) ?? asStr(json.tool_use_id) ?? "",
        content: typeof json.content === "string" ? json.content : JSON.stringify(json.content ?? json.output ?? ""),
        isError: json.isError === true || json.is_error === true,
      });
      break;
    }

    case "result":
    case "summary":
    case "done": {
      const usage = typeof json.usage === "object" && json.usage !== null
        ? (json.usage as Record<string, unknown>)
        : null;
      entries.push({
        kind: "result",
        ts,
        text: asStr(json.text) ?? asStr(json.summary) ?? "",
        inputTokens: asNum(usage?.inputTokens) ?? asNum(usage?.input_tokens) ?? 0,
        outputTokens: asNum(usage?.outputTokens) ?? asNum(usage?.output_tokens) ?? 0,
        cachedTokens: asNum(usage?.cachedInputTokens) ?? asNum(usage?.cached_input_tokens) ?? 0,
        costUsd: asNum(json.costUsd) ?? asNum(json.cost_usd) ?? 0,
        subtype: "",
        isError: false,
        errors: [],
      });
      break;
    }

    case "error": {
      entries.push({
        kind: "result",
        ts,
        text: asStr(json.message) ?? asStr(json.error) ?? "Unknown error",
        inputTokens: 0,
        outputTokens: 0,
        cachedTokens: 0,
        costUsd: 0,
        subtype: "error",
        isError: true,
        errors: [asStr(json.message) ?? asStr(json.error) ?? "Unknown error"],
      });
      break;
    }

    case "system": {
      entries.push({
        kind: "system",
        ts,
        text: asStr(json.text) ?? asStr(json.message) ?? "",
      });
      break;
    }

    default: {
      // Unknown event type — show raw
      entries.push({ kind: "stdout", ts, text: trimmed });
      break;
    }
  }

  return entries;
}

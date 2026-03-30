import pc from "picocolors";

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

export function printAwsOpenClawStreamEvent(raw: string, debug: boolean): void {
  const trimmed = raw.trim();
  if (!trimmed) return;

  const json = safeJsonParse(trimmed);
  if (!json) {
    if (debug) {
      console.log(pc.gray(trimmed));
    }
    return;
  }

  const type = typeof json.type === "string" ? json.type : "";

  switch (type) {
    case "init":
    case "session.start":
    case "session": {
      const model = typeof json.model === "string" ? json.model : "";
      const sessionId = typeof json.sessionId === "string" ? json.sessionId : "";
      console.log(pc.blue(`[aws-openclaw] Session started${model ? ` (model: ${model})` : ""}${sessionId ? ` [${sessionId}]` : ""}`));
      break;
    }

    case "assistant":
    case "message":
    case "text": {
      const text = typeof json.text === "string" ? json.text : typeof json.content === "string" ? json.content : "";
      if (text) console.log(pc.green(text));
      break;
    }

    case "thinking":
    case "reasoning": {
      const text = typeof json.text === "string" ? json.text : "";
      if (text) console.log(pc.dim(pc.italic(text)));
      break;
    }

    case "tool_call": {
      const name = typeof json.name === "string" ? json.name : typeof json.tool === "string" ? json.tool : "unknown";
      console.log(pc.yellow(`⚡ ${name}`));
      break;
    }

    case "tool_result": {
      const isError = json.isError === true || json.is_error === true;
      const content = typeof json.content === "string" ? json.content : "";
      if (isError) {
        console.log(pc.red(`✗ ${content.slice(0, 200)}`));
      } else if (debug) {
        console.log(pc.gray(`✓ ${content.slice(0, 200)}`));
      }
      break;
    }

    case "result":
    case "summary":
    case "done": {
      const text = typeof json.text === "string" ? json.text : typeof json.summary === "string" ? json.summary : "";
      if (text) console.log(pc.cyan(`[result] ${text}`));
      break;
    }

    case "error": {
      const message = typeof json.message === "string" ? json.message : typeof json.error === "string" ? json.error : "Unknown error";
      console.log(pc.red(`[error] ${message}`));
      break;
    }

    default: {
      if (debug) {
        console.log(pc.gray(trimmed));
      }
      break;
    }
  }
}

import type { CLIAdapterModule } from "@sirius-eco-system/adapter-utils";
import { printClaudeStreamEvent } from "@sirius-eco-system/adapter-claude-local/cli";
import { printCodexStreamEvent } from "@sirius-eco-system/adapter-codex-local/cli";
import { printCursorStreamEvent } from "@sirius-eco-system/adapter-cursor-local/cli";
import { printGeminiStreamEvent } from "@sirius-eco-system/adapter-gemini-local/cli";
import { printOpenCodeStreamEvent } from "@sirius-eco-system/adapter-opencode-local/cli";
import { printPiStreamEvent } from "@sirius-eco-system/adapter-pi-local/cli";
import { printOpenClawGatewayStreamEvent } from "@sirius-eco-system/adapter-openclaw-gateway/cli";
import { printAwsOpenClawStreamEvent } from "@sirius-eco-system/adapter-aws-openclaw/cli";
import { processCLIAdapter } from "./process/index.js";
import { httpCLIAdapter } from "./http/index.js";

const claudeLocalCLIAdapter: CLIAdapterModule = {
  type: "claude_local",
  formatStdoutEvent: printClaudeStreamEvent,
};

const codexLocalCLIAdapter: CLIAdapterModule = {
  type: "codex_local",
  formatStdoutEvent: printCodexStreamEvent,
};

const openCodeLocalCLIAdapter: CLIAdapterModule = {
  type: "opencode_local",
  formatStdoutEvent: printOpenCodeStreamEvent,
};

const piLocalCLIAdapter: CLIAdapterModule = {
  type: "pi_local",
  formatStdoutEvent: printPiStreamEvent,
};

const cursorLocalCLIAdapter: CLIAdapterModule = {
  type: "cursor",
  formatStdoutEvent: printCursorStreamEvent,
};

const geminiLocalCLIAdapter: CLIAdapterModule = {
  type: "gemini_local",
  formatStdoutEvent: printGeminiStreamEvent,
};

const openclawGatewayCLIAdapter: CLIAdapterModule = {
  type: "openclaw_gateway",
  formatStdoutEvent: printOpenClawGatewayStreamEvent,
};

const awsOpenClawCLIAdapter: CLIAdapterModule = {
  type: "aws_openclaw",
  formatStdoutEvent: printAwsOpenClawStreamEvent,
};

const adaptersByType = new Map<string, CLIAdapterModule>(
  [
    claudeLocalCLIAdapter,
    codexLocalCLIAdapter,
    openCodeLocalCLIAdapter,
    piLocalCLIAdapter,
    cursorLocalCLIAdapter,
    geminiLocalCLIAdapter,
    openclawGatewayCLIAdapter,
    awsOpenClawCLIAdapter,
    processCLIAdapter,
    httpCLIAdapter,
  ].map((a) => [a.type, a]),
);

export function getCLIAdapter(type: string): CLIAdapterModule {
  return adaptersByType.get(type) ?? processCLIAdapter;
}

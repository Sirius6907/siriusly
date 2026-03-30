import type {
  AdapterExecutionContext,
  AdapterExecutionResult,
} from "@sirius-eco-system/adapter-utils";
import {
  asString,
  asNumber,
  parseObject,
  buildSiriusEcoSystemEnv,
  redactEnvForLogs,
  renderTemplate,
  joinPromptSections,
  appendWithCap,
} from "@sirius-eco-system/adapter-utils/server-utils";
import { Client as SSHClient } from "ssh2";
import fs from "node:fs/promises";
import path from "node:path";
import { execFile } from "node:child_process";
import { parseAwsOpenClawOutput, isAwsOpenClawUnknownSessionError } from "./parse.js";

const MAX_CAPTURE = 4 * 1024 * 1024; // 4 MB

type SessionKeyStrategy = "fixed" | "issue" | "run";

function normalizeSessionKeyStrategy(value: unknown): SessionKeyStrategy {
  const normalized = asString(value, "issue").trim().toLowerCase();
  if (normalized === "fixed" || normalized === "run") return normalized;
  return "issue";
}

function resolveSessionKey(input: {
  strategy: SessionKeyStrategy;
  configuredSessionKey: string | null;
  runId: string;
  issueId: string | null;
}): string {
  const fallback = input.configuredSessionKey ?? "siriusEcoSystem";
  if (input.strategy === "run") return `siriusEcoSystem:run:${input.runId}`;
  if (input.strategy === "issue" && input.issueId) return `siriusEcoSystem:issue:${input.issueId}`;
  return fallback;
}

function firstNonEmptyLine(text: string): string {
  return (
    text
      .split(/\r?\n/)
      .map((line) => line.trim())
      .find(Boolean) ?? ""
  );
}

function parseModelProvider(model: string | null): string | null {
  if (!model) return null;
  const trimmed = model.trim();
  if (!trimmed.includes("/")) return null;
  return trimmed.slice(0, trimmed.indexOf("/")).trim() || null;
}

/**
 * Resolve the SSH private key from config.
 * Priority: 1) privateKeyPath (PEM file), 2) privateKey (inline), 3) null (for SSM)
 */
async function resolvePrivateKey(config: Record<string, unknown>): Promise<Buffer | null> {
  const keyPath = asString(config.privateKeyPath, "").trim();
  if (keyPath) {
    const resolved = keyPath.startsWith("~")
      ? path.join(process.env.HOME ?? process.env.USERPROFILE ?? "", keyPath.slice(1))
      : keyPath;
    try {
      return await fs.readFile(resolved);
    } catch (err) {
      throw new Error(
        `Cannot read SSH private key at "${resolved}": ${err instanceof Error ? err.message : String(err)}`,
      );
    }
  }

  const inlineKey = asString(config.privateKey, "").trim();
  if (inlineKey) {
    return Buffer.from(inlineKey, "utf8");
  }

  return null;
}

/**
 * Execute a command on a remote EC2 via SSH and stream output.
 */
function runViaSSH(opts: {
  host: string;
  port: number;
  username: string;
  privateKey: Buffer;
  passphrase: string;
  command: string;
  timeoutSec: number;
  onStdout: (chunk: string) => void;
  onStderr: (chunk: string) => void;
}): Promise<{ exitCode: number | null; signal: string | null; timedOut: boolean; stdout: string; stderr: string }> {
  return new Promise((resolve, reject) => {
    const client = new SSHClient();
    let stdout = "";
    let stderr = "";
    let timedOut = false;
    let settled = false;

    const timeout = opts.timeoutSec > 0
      ? setTimeout(() => {
          timedOut = true;
          client.end();
        }, opts.timeoutSec * 1000)
      : null;

    const cleanup = () => {
      if (timeout) clearTimeout(timeout);
      if (!settled) {
        settled = true;
      }
    };

    client.on("ready", () => {
      client.exec(opts.command, { pty: false }, (err, stream) => {
        if (err) {
          cleanup();
          client.end();
          reject(new Error(`SSH exec failed: ${err.message}`));
          return;
        }

        stream.on("data", (data: Buffer) => {
          const text = data.toString("utf8");
          stdout = appendWithCap(stdout, text, MAX_CAPTURE);
          opts.onStdout(text);
        });

        stream.stderr.on("data", (data: Buffer) => {
          const text = data.toString("utf8");
          stderr = appendWithCap(stderr, text, MAX_CAPTURE);
          opts.onStderr(text);
        });

        stream.on("close", (code: number | null, signal: string | undefined) => {
          cleanup();
          client.end();
          resolve({
            exitCode: code,
            signal: signal ?? null,
            timedOut,
            stdout,
            stderr,
          });
        });
      });
    });

    client.on("error", (err) => {
      cleanup();
      if (!settled) {
        settled = true;
        reject(new Error(`SSH connection failed: ${err.message}`));
      }
    });

    client.connect({
      host: opts.host,
      port: opts.port,
      username: opts.username,
      privateKey: opts.privateKey,
      passphrase: opts.passphrase || undefined,
      readyTimeout: 30000,
      keepaliveInterval: 15000,
      keepaliveCountMax: 3,
    });
  });
}

/**
 * Execute a command on a remote EC2 via AWS SSM Session Manager.
 * Requires AWS CLI configured with IAM credentials on the host.
 */
function runViaSSM(opts: {
  instanceId: string;
  region: string;
  command: string;
  timeoutSec: number;
  onStdout: (chunk: string) => void;
  onStderr: (chunk: string) => void;
}): Promise<{ exitCode: number | null; signal: string | null; timedOut: boolean; stdout: string; stderr: string }> {
  return new Promise((resolve, reject) => {
    let stdout = "";
    let stderr = "";
    let timedOut = false;

    const args = [
      "ssm",
      "send-command",
      "--instance-ids", opts.instanceId,
      "--document-name", "AWS-RunShellScript",
      "--parameters", JSON.stringify({ commands: [opts.command] }),
      "--region", opts.region,
      "--output", "json",
    ];

    const timeout = opts.timeoutSec > 0
      ? setTimeout(() => { timedOut = true; }, opts.timeoutSec * 1000)
      : null;

    const child = execFile("aws", args, {
      timeout: opts.timeoutSec > 0 ? opts.timeoutSec * 1000 : 0,
      maxBuffer: MAX_CAPTURE,
    }, (err, stdoutBuf, stderrBuf) => {
      if (timeout) clearTimeout(timeout);
      stdout = stdoutBuf;
      stderr = stderrBuf;
      opts.onStdout(stdoutBuf);
      if (stderrBuf) opts.onStderr(stderrBuf);

      if (err) {
        const code = (err as NodeJS.ErrnoException & { code?: number | string }).code;
        if (typeof code === "number") {
          resolve({ exitCode: code, signal: null, timedOut, stdout, stderr });
        } else {
          reject(new Error(`AWS SSM command failed: ${err.message}`));
        }
        return;
      }

      // SSM send-command returns a command ID. We need to wait for the result.
      try {
        const result = JSON.parse(stdout);
        const commandId = result?.Command?.CommandId;
        if (!commandId) {
          resolve({ exitCode: 0, signal: null, timedOut, stdout, stderr });
          return;
        }

        // Poll for the command result
        pollSSMResult(opts.instanceId, commandId, opts.region, opts.timeoutSec, opts.onStdout, opts.onStderr)
          .then(resolve)
          .catch(reject);
      } catch {
        resolve({ exitCode: 0, signal: null, timedOut, stdout, stderr });
      }
    });

    void child;
  });
}

function pollSSMResult(
  instanceId: string,
  commandId: string,
  region: string,
  timeoutSec: number,
  onStdout: (chunk: string) => void,
  onStderr: (chunk: string) => void,
): Promise<{ exitCode: number | null; signal: string | null; timedOut: boolean; stdout: string; stderr: string }> {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    const maxMs = timeoutSec * 1000;

    const poll = () => {
      if (Date.now() - startTime > maxMs) {
        resolve({ exitCode: null, signal: null, timedOut: true, stdout: "", stderr: "SSM command timed out" });
        return;
      }

      const args = [
        "ssm",
        "get-command-invocation",
        "--command-id", commandId,
        "--instance-id", instanceId,
        "--region", region,
        "--output", "json",
      ];

      execFile("aws", args, { maxBuffer: MAX_CAPTURE }, (err, stdoutBuf) => {
        if (err) {
          // Command might not be ready yet, retry
          setTimeout(poll, 3000);
          return;
        }

        try {
          const result = JSON.parse(stdoutBuf);
          const status = result?.Status;
          if (status === "InProgress" || status === "Pending") {
            setTimeout(poll, 3000);
            return;
          }

          const output = result?.StandardOutputContent ?? "";
          const errOutput = result?.StandardErrorContent ?? "";
          if (output) onStdout(output);
          if (errOutput) onStderr(errOutput);

          const exitCode = status === "Success" ? 0 : 1;
          resolve({ exitCode, signal: null, timedOut: false, stdout: output, stderr: errOutput });
        } catch {
          setTimeout(poll, 3000);
        }
      });
    };

    // Initial delay before first poll
    setTimeout(poll, 2000);
  });
}

export async function execute(ctx: AdapterExecutionContext): Promise<AdapterExecutionResult> {
  const { runId, agent, runtime, config, context, onLog, onMeta, authToken } = ctx;

  // --- Config extraction ---
  const host = asString(config.host, "").trim();
  const port = asNumber(config.port, 22);
  const username = asString(config.username, "ec2-user");
  const passphrase = asString(config.passphrase, "");
  const instanceId = asString(config.instanceId, "").trim();
  const region = asString(config.region, "us-east-1").trim();
  const openclawCommand = asString(config.openclawCommand, "openclaw");
  const openclawCwd = asString(config.openclawCwd, "").trim();
  const model = asString(config.model, "").trim();
  const timeoutSec = asNumber(config.timeoutSec, 300);
  const promptTemplate = asString(
    config.promptTemplate,
    "You are agent {{agent.id}} ({{agent.name}}). Continue your SiriusEcoSystem work.",
  );

  const sessionKeyStrategy = normalizeSessionKeyStrategy(config.sessionKeyStrategy);
  const configuredSessionKey = asString(config.sessionKey, "").trim() || null;

  const envConfig = parseObject(config.env);

  // --- Determine auth mode ---
  const useSSM = !host && instanceId.length > 0;
  const privateKey = useSSM ? null : await resolvePrivateKey(config);

  if (!useSSM && !host) {
    return {
      exitCode: 1,
      signal: null,
      timedOut: false,
      errorMessage: "Missing required config: 'host' (EC2 IP/hostname) or 'instanceId' (for SSM mode)",
    };
  }

  if (!useSSM && !privateKey) {
    return {
      exitCode: 1,
      signal: null,
      timedOut: false,
      errorMessage: "Missing SSH authentication: provide 'privateKeyPath' or 'privateKey' in adapter config",
    };
  }

  // --- Build SiriusEcoSystem env ---
  const siriusEnv: Record<string, string> = { ...buildSiriusEcoSystemEnv(agent) };
  siriusEnv.SIRIUSLY_RUN_ID = runId;

  const wakeTaskId =
    (typeof context.taskId === "string" && context.taskId.trim()) ||
    (typeof context.issueId === "string" && context.issueId.trim()) ||
    null;
  const wakeReason = typeof context.wakeReason === "string" ? context.wakeReason.trim() : null;
  const wakeCommentId =
    (typeof context.wakeCommentId === "string" && context.wakeCommentId.trim()) ||
    (typeof context.commentId === "string" && context.commentId.trim()) ||
    null;
  const approvalId = typeof context.approvalId === "string" ? context.approvalId.trim() : null;
  const approvalStatus = typeof context.approvalStatus === "string" ? context.approvalStatus.trim() : null;
  const linkedIssueIds = Array.isArray(context.issueIds)
    ? context.issueIds.filter((v): v is string => typeof v === "string" && v.trim().length > 0)
    : [];

  if (wakeTaskId) siriusEnv.SIRIUSLY_TASK_ID = wakeTaskId;
  if (wakeReason) siriusEnv.SIRIUSLY_WAKE_REASON = wakeReason;
  if (wakeCommentId) siriusEnv.SIRIUSLY_WAKE_COMMENT_ID = wakeCommentId;
  if (approvalId) siriusEnv.SIRIUSLY_APPROVAL_ID = approvalId;
  if (approvalStatus) siriusEnv.SIRIUSLY_APPROVAL_STATUS = approvalStatus;
  if (linkedIssueIds.length > 0) siriusEnv.SIRIUSLY_LINKED_ISSUE_IDS = linkedIssueIds.join(",");

  const hasExplicitApiKey = typeof envConfig.SIRIUSLY_API_KEY === "string" && envConfig.SIRIUSLY_API_KEY.trim().length > 0;
  if (!hasExplicitApiKey && authToken) {
    siriusEnv.SIRIUSLY_API_KEY = authToken;
  }

  for (const [key, value] of Object.entries(envConfig)) {
    if (typeof value === "string") siriusEnv[key] = value;
  }

  // --- Session handling ---
  const runtimeSessionParams = parseObject(runtime.sessionParams);
  const runtimeSessionId = asString(runtimeSessionParams.sessionId, runtime.sessionId ?? "");
  const runtimeSessionHost = asString(runtimeSessionParams.host, "");
  const canResumeSession =
    runtimeSessionId.length > 0 &&
    (runtimeSessionHost.length === 0 || runtimeSessionHost === host);
  const sessionId = canResumeSession ? runtimeSessionId : null;

  if (runtimeSessionId && !canResumeSession) {
    await onLog(
      "stdout",
      `[siriusEcoSystem] AWS OpenClaw session "${runtimeSessionId}" was saved for host "${runtimeSessionHost}" and will not be resumed on "${host}".\\n`,
    );
  }

  // --- Prompt construction ---
  const issueId = wakeTaskId;
  const sessionKey = resolveSessionKey({
    strategy: sessionKeyStrategy,
    configuredSessionKey,
    runId,
    issueId,
  });

  const templateData = {
    agentId: agent.id,
    companyId: agent.companyId,
    runId,
    company: { id: agent.companyId },
    agent,
    run: { id: runId, source: "on_demand" },
    context,
  };
  const renderedPrompt = renderTemplate(promptTemplate, templateData);
  const prompt = joinPromptSections([renderedPrompt]);

  // --- Build remote command ---
  const buildRemoteCommand = (resumeSessionId: string | null) => {
    const envExports = Object.entries(siriusEnv)
      .map(([k, v]) => `export ${k}='${v.replace(/'/g, "'\\''")}'`)
      .join(" && ");

    const cwdCmd = openclawCwd ? `cd '${openclawCwd.replace(/'/g, "'\\''")}' && ` : "";

    const clawArgs = ["run", "--format", "json"];
    if (resumeSessionId) clawArgs.push("--session", resumeSessionId);
    if (model) clawArgs.push("--model", model);

    const promptEscaped = prompt.replace(/'/g, "'\\''");

    return `${envExports} && ${cwdCmd}echo '${promptEscaped}' | ${openclawCommand} ${clawArgs.join(" ")}`;
  };

  // --- Emit meta ---
  if (onMeta) {
    await onMeta({
      adapterType: "aws_openclaw",
      command: useSSM ? `aws ssm (${instanceId})` : `ssh ${username}@${host}:${port}`,
      cwd: openclawCwd || "(remote default)",
      commandNotes: [
        useSSM ? `Using AWS SSM Session Manager for instance ${instanceId}` : `SSH to ${host}:${port} as ${username}`,
        model ? `Model: ${model}` : "Model: (remote default)",
        `Session key strategy: ${sessionKeyStrategy}`,
      ],
      commandArgs: [openclawCommand, "run", "--format", "json"],
      env: redactEnvForLogs(siriusEnv),
      prompt,
      context,
    });
  }

  await onLog("stdout", `[siriusEcoSystem] Connecting to EC2${useSSM ? ` via SSM (${instanceId})` : ` via SSH (${host}:${port})`}...\\n`);

  // --- Execute ---
  const runAttempt = async (resumeSessionId: string | null) => {
    const remoteCmd = buildRemoteCommand(resumeSessionId);

    if (useSSM) {
      return runViaSSM({
        instanceId,
        region,
        command: remoteCmd,
        timeoutSec,
        onStdout: (chunk) => { void onLog("stdout", chunk); },
        onStderr: (chunk) => { void onLog("stderr", chunk); },
      });
    }

    return runViaSSH({
      host,
      port,
      username,
      privateKey: privateKey!,
      passphrase,
      command: remoteCmd,
      timeoutSec,
      onStdout: (chunk) => { void onLog("stdout", chunk); },
      onStderr: (chunk) => { void onLog("stderr", chunk); },
    });
  };

  const toResult = (
    attempt: { exitCode: number | null; signal: string | null; timedOut: boolean; stdout: string; stderr: string },
    clearSessionOnMissingSession = false,
  ): AdapterExecutionResult => {
    if (attempt.timedOut) {
      return {
        exitCode: attempt.exitCode,
        signal: attempt.signal,
        timedOut: true,
        errorMessage: `Timed out after ${timeoutSec}s`,
        clearSession: clearSessionOnMissingSession,
      };
    }

    const parsed = parseAwsOpenClawOutput(attempt.stdout);
    const resolvedSessionId = parsed.sessionId ?? (clearSessionOnMissingSession ? null : runtimeSessionId || null);
    const resolvedSessionParams = resolvedSessionId
      ? { sessionId: resolvedSessionId, host, sessionKey }
      : null;

    const rawExitCode = attempt.exitCode;
    const parsedError = parsed.errorMessage ?? "";
    const stderrLine = firstNonEmptyLine(attempt.stderr);
    const synthesizedExitCode = parsedError && (rawExitCode ?? 0) === 0 ? 1 : rawExitCode;
    const fallbackErrorMessage = parsedError || stderrLine || `OpenClaw exited with code ${synthesizedExitCode ?? -1}`;

    return {
      exitCode: synthesizedExitCode,
      signal: attempt.signal,
      timedOut: false,
      errorMessage: (synthesizedExitCode ?? 0) === 0 ? null : fallbackErrorMessage,
      usage: {
        inputTokens: parsed.usage.inputTokens,
        outputTokens: parsed.usage.outputTokens,
        cachedInputTokens: parsed.usage.cachedInputTokens,
      },
      sessionId: resolvedSessionId,
      sessionParams: resolvedSessionParams,
      sessionDisplayId: resolvedSessionId,
      provider: parseModelProvider(model || parsed.model),
      model: model || parsed.model,
      costUsd: parsed.costUsd,
      resultJson: { stdout: attempt.stdout, stderr: attempt.stderr },
      summary: parsed.summary,
      clearSession: Boolean(clearSessionOnMissingSession && !parsed.sessionId),
    };
  };

  try {
    const initial = await runAttempt(sessionId);
    const initialFailed =
      !initial.timedOut && ((initial.exitCode ?? 0) !== 0);

    if (
      sessionId &&
      initialFailed &&
      isAwsOpenClawUnknownSessionError(initial.stdout, initial.stderr)
    ) {
      await onLog(
        "stdout",
        `[siriusEcoSystem] AWS OpenClaw session "${sessionId}" is unavailable; retrying with a fresh session.\\n`,
      );
      const retry = await runAttempt(null);
      return toResult(retry, true);
    }

    return toResult(initial);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    await onLog("stderr", `[siriusEcoSystem] AWS OpenClaw adapter error: ${message}\\n`);
    return {
      exitCode: 1,
      signal: null,
      timedOut: false,
      errorMessage: message,
    };
  }
}

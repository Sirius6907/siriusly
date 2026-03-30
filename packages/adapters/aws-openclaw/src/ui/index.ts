export { parseAwsOpenClawStdoutLine } from "../server/parse.js";

import type { CreateConfigValues } from "@sirius-eco-system/adapter-utils";

export function buildAwsOpenClawConfig(v: CreateConfigValues): Record<string, unknown> {
  const ac: Record<string, unknown> = {};
  if (v.host) ac.host = v.host;
  if (v.port) ac.port = Number(v.port) || 22;
  if (v.username) ac.username = v.username;
  if (v.privateKeyPath) ac.privateKeyPath = v.privateKeyPath;
  if (v.privateKey) ac.privateKey = v.privateKey;
  if (v.passphrase) ac.passphrase = v.passphrase;
  if (v.instanceId) ac.instanceId = v.instanceId;
  if (v.region) ac.region = v.region;
  if (v.openclawCommand) ac.openclawCommand = v.openclawCommand;
  if (v.openclawCwd) ac.openclawCwd = v.openclawCwd;
  if (v.model) ac.model = v.model;
  if (v.promptTemplate) ac.promptTemplate = v.promptTemplate;
  ac.timeoutSec = Number(v.timeoutSec) || 300;
  ac.sessionKeyStrategy = v.sessionKeyStrategy || "issue";
  if (v.sessionKey) ac.sessionKey = v.sessionKey;
  return ac;
}

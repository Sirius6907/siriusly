import fs from "node:fs";
import { siriusEcoSystemConfigSchema, type SiriusEcoSystemConfig } from "@sirius-eco-system/shared";
import { resolveSiriusEcoSystemConfigPath } from "./paths.js";

export function readConfigFile(): SiriusEcoSystemConfig | null {
  const configPath = resolveSiriusEcoSystemConfigPath();

  if (!fs.existsSync(configPath)) return null;

  try {
    const raw = JSON.parse(fs.readFileSync(configPath, "utf-8"));
    return siriusEcoSystemConfigSchema.parse(raw);
  } catch {
    return null;
  }
}

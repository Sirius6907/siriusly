export { execute } from "./execute.js";
export { testEnvironment } from "./test.js";
export { parseAwsOpenClawOutput, isAwsOpenClawUnknownSessionError } from "./parse.js";

import type { AdapterSessionCodec } from "@sirius-eco-system/adapter-utils";
import { asString } from "@sirius-eco-system/adapter-utils/server-utils";

export const sessionCodec: AdapterSessionCodec = {
  deserialize(raw: unknown): Record<string, unknown> | null {
    if (typeof raw !== "object" || raw === null || Array.isArray(raw)) return null;
    const record = raw as Record<string, unknown>;
    const sessionId = asString(record.sessionId, "");
    if (!sessionId) return null;
    return record;
  },
  serialize(params: Record<string, unknown> | null): Record<string, unknown> | null {
    if (!params) return null;
    const sessionId = asString(params.sessionId, "");
    if (!sessionId) return null;
    return params;
  },
  getDisplayId(params: Record<string, unknown> | null): string | null {
    if (!params) return null;
    return asString(params.sessionId, "") || null;
  },
};

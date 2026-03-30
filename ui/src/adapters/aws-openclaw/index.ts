import type { UIAdapterModule } from "../types";
import { parseAwsOpenClawStdoutLine } from "@sirius-eco-system/adapter-aws-openclaw/ui";
import { buildAwsOpenClawConfig } from "@sirius-eco-system/adapter-aws-openclaw/ui";
import { AwsOpenClawConfigFields } from "./config-fields";

export const awsOpenClawUIAdapter: UIAdapterModule = {
  type: "aws_openclaw",
  label: "AWS OpenClaw (EC2)",
  parseStdoutLine: parseAwsOpenClawStdoutLine,
  ConfigFields: AwsOpenClawConfigFields,
  buildAdapterConfig: buildAwsOpenClawConfig,
};

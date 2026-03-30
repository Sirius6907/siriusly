import type {
  AdapterEnvironmentTestContext,
  AdapterEnvironmentTestResult,
  AdapterEnvironmentCheck,
} from "@sirius-eco-system/adapter-utils";
import { asString, asNumber } from "@sirius-eco-system/adapter-utils/server-utils";
import fs from "node:fs/promises";
import path from "node:path";
import { Client as SSHClient } from "ssh2";
import { execFile } from "node:child_process";

export async function testEnvironment(
  ctx: AdapterEnvironmentTestContext,
): Promise<AdapterEnvironmentTestResult> {
  const checks: AdapterEnvironmentCheck[] = [];
  const config = ctx.config;

  const host = asString(config.host, "").trim();
  const port = asNumber(config.port, 22);
  const username = asString(config.username, "ec2-user");
  const privateKeyPath = asString(config.privateKeyPath, "").trim();
  const privateKey = asString(config.privateKey, "").trim();
  const instanceId = asString(config.instanceId, "").trim();
  const region = asString(config.region, "us-east-1").trim();
  const openclawCommand = asString(config.openclawCommand, "openclaw");

  const useSSM = !host && instanceId.length > 0;

  // 1. Check connectivity config
  if (useSSM) {
    checks.push({
      code: "ssm_mode",
      level: "info",
      message: `Using AWS SSM Session Manager for instance ${instanceId} in ${region}`,
    });

    // Check AWS CLI availability
    const awsAvailable = await new Promise<boolean>((resolve) => {
      execFile("aws", ["--version"], { timeout: 5000 }, (err) => resolve(!err));
    });

    if (awsAvailable) {
      checks.push({
        code: "aws_cli",
        level: "info",
        message: "AWS CLI is available",
      });
    } else {
      checks.push({
        code: "aws_cli_missing",
        level: "error",
        message: "AWS CLI is not installed or not in PATH",
        hint: "Install AWS CLI: https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html",
      });
    }
  } else if (host) {
    checks.push({
      code: "ssh_mode",
      level: "info",
      message: `Using SSH to ${username}@${host}:${port}`,
    });

    // Check SSH key
    if (privateKeyPath) {
      const resolvedPath = privateKeyPath.startsWith("~")
        ? path.join(process.env.HOME ?? process.env.USERPROFILE ?? "", privateKeyPath.slice(1))
        : privateKeyPath;

      try {
        await fs.access(resolvedPath);
        const stat = await fs.stat(resolvedPath);
        checks.push({
          code: "ssh_key_file",
          level: "info",
          message: `SSH key file found: ${resolvedPath} (${stat.size} bytes)`,
        });
      } catch {
        checks.push({
          code: "ssh_key_missing",
          level: "error",
          message: `SSH key file not found: ${resolvedPath}`,
          hint: "Verify the privateKeyPath points to your .pem file",
        });
      }
    } else if (privateKey) {
      checks.push({
        code: "ssh_key_inline",
        level: "info",
        message: "Using inline SSH private key",
      });

      if (!privateKey.includes("BEGIN") || !privateKey.includes("KEY")) {
        checks.push({
          code: "ssh_key_format",
          level: "warn",
          message: "Inline private key does not appear to be in PEM format",
          hint: "Key should start with -----BEGIN RSA PRIVATE KEY----- or similar",
        });
      }
    } else {
      checks.push({
        code: "ssh_key_none",
        level: "error",
        message: "No SSH authentication configured",
        hint: "Set 'privateKeyPath' to your .pem file path, or paste the key into 'privateKey'",
      });
    }

    // Attempt SSH connection test (with short timeout)
    const sshTestResult = await testSSHConnection(host, port, username, privateKeyPath, privateKey);
    checks.push(sshTestResult);
  } else {
    checks.push({
      code: "no_connection",
      level: "error",
      message: "No connection method configured",
      hint: "Set 'host' for SSH or 'instanceId' for SSM",
    });
  }

  // Check OpenClaw command config
  checks.push({
    code: "openclaw_command",
    level: "info",
    message: `Remote OpenClaw command: ${openclawCommand}`,
    detail: "This command must be available on the remote EC2 instance",
  });

  // Compute final status
  const hasError = checks.some((c) => c.level === "error");
  const hasWarn = checks.some((c) => c.level === "warn");
  const status = hasError ? "fail" : hasWarn ? "warn" : "pass";

  return {
    adapterType: "aws_openclaw",
    status,
    checks,
    testedAt: new Date().toISOString(),
  };
}

async function testSSHConnection(
  host: string,
  port: number,
  username: string,
  privateKeyPath: string,
  privateKeyInline: string,
): Promise<AdapterEnvironmentCheck> {
  let keyBuffer: Buffer | null = null;

  if (privateKeyPath) {
    const resolved = privateKeyPath.startsWith("~")
      ? path.join(process.env.HOME ?? process.env.USERPROFILE ?? "", privateKeyPath.slice(1))
      : privateKeyPath;
    try {
      keyBuffer = await fs.readFile(resolved);
    } catch {
      return {
        code: "ssh_connect",
        level: "warn",
        message: `Cannot read key file for connection test: ${resolved}`,
      };
    }
  } else if (privateKeyInline) {
    keyBuffer = Buffer.from(privateKeyInline, "utf8");
  }

  if (!keyBuffer) {
    return {
      code: "ssh_connect",
      level: "warn",
      message: "Skipping SSH connection test: no key available",
    };
  }

  return new Promise<AdapterEnvironmentCheck>((resolve) => {
    const client = new SSHClient();
    const timeout = setTimeout(() => {
      client.end();
      resolve({
        code: "ssh_connect",
        level: "warn",
        message: `SSH connection test timed out (10s) to ${host}:${port}`,
        hint: "Check security group rules and ensure port 22 is open",
      });
    }, 10000);

    client.on("ready", () => {
      clearTimeout(timeout);
      client.end();
      resolve({
        code: "ssh_connect",
        level: "info",
        message: `SSH connection successful to ${username}@${host}:${port}`,
      });
    });

    client.on("error", (err) => {
      clearTimeout(timeout);
      resolve({
        code: "ssh_connect",
        level: "warn",
        message: `SSH connection test failed: ${err.message}`,
        hint: "Check host, port, username, and key. Ensure EC2 security group allows SSH.",
      });
    });

    client.connect({
      host,
      port,
      username,
      privateKey: keyBuffer!,
      readyTimeout: 10000,
    });
  });
}

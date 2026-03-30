import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import type { AdapterConfigFieldsProps } from "../types";
import {
  Field,
  DraftInput,
  help,
} from "../../components/agent-config-primitives";

const inputClass =
  "w-full rounded-md border border-border px-2.5 py-1.5 bg-transparent outline-none text-sm font-mono placeholder:text-muted-foreground/40";

function SecretField({
  label,
  value,
  onCommit,
  placeholder,
  hint,
}: {
  label: string;
  value: string;
  onCommit: (v: string) => void;
  placeholder?: string;
  hint?: string;
}) {
  const [visible, setVisible] = useState(false);
  return (
    <Field label={label} hint={hint}>
      <div className="relative">
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground/50 hover:text-muted-foreground transition-colors"
        >
          {visible ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
        </button>
        <DraftInput
          value={value}
          onCommit={onCommit}
          immediate
          type={visible ? "text" : "password"}
          className={inputClass + " pl-8"}
          placeholder={placeholder}
        />
      </div>
    </Field>
  );
}

export function AwsOpenClawConfigFields({
  isCreate,
  values,
  set,
  config,
  eff,
  mark,
}: AdapterConfigFieldsProps) {
  const [authMode, setAuthMode] = useState<"ssh" | "ssm">(
    isCreate
      ? "ssh"
      : (config.instanceId && !config.host ? "ssm" : "ssh"),
  );

  return (
    <>
      {/* Auth Mode Selector */}
      <Field label="Connection method">
        <select
          value={authMode}
          onChange={(e) => setAuthMode(e.target.value as "ssh" | "ssm")}
          className={inputClass}
        >
          <option value="ssh">SSH (PEM Key)</option>
          <option value="ssm">AWS SSM Session Manager</option>
        </select>
      </Field>

      {authMode === "ssh" ? (
        <>
          {/* SSH Configuration */}
          <Field label="EC2 Host" hint="Public IP or hostname of your EC2 instance">
            <DraftInput
              value={
                isCreate
                  ? values!.host ?? ""
                  : eff("adapterConfig", "host", String(config.host ?? ""))
              }
              onCommit={(v) =>
                isCreate
                  ? set!({ host: v })
                  : mark("adapterConfig", "host", v || undefined)
              }
              immediate
              className={inputClass}
              placeholder="54.123.45.67"
            />
          </Field>

          <Field label="SSH Port">
            <DraftInput
              value={
                isCreate
                  ? values!.port ?? "22"
                  : eff("adapterConfig", "port", String(config.port ?? "22"))
              }
              onCommit={(v) =>
                isCreate
                  ? set!({ port: v })
                  : mark("adapterConfig", "port", Number(v) || undefined)
              }
              immediate
              className={inputClass}
              placeholder="22"
            />
          </Field>

          <Field label="SSH Username">
            <DraftInput
              value={
                isCreate
                  ? values!.username ?? "ec2-user"
                  : eff("adapterConfig", "username", String(config.username ?? "ec2-user"))
              }
              onCommit={(v) =>
                isCreate
                  ? set!({ username: v })
                  : mark("adapterConfig", "username", v || undefined)
              }
              immediate
              className={inputClass}
              placeholder="ec2-user"
            />
          </Field>

          <Field label="SSH Private Key Path (.pem)" hint="Absolute path to your .pem key file (recommended)">
            <DraftInput
              value={
                isCreate
                  ? values!.privateKeyPath ?? ""
                  : eff("adapterConfig", "privateKeyPath", String(config.privateKeyPath ?? ""))
              }
              onCommit={(v) =>
                isCreate
                  ? set!({ privateKeyPath: v })
                  : mark("adapterConfig", "privateKeyPath", v || undefined)
              }
              immediate
              className={inputClass}
              placeholder="~/.ssh/my-ec2-key.pem"
            />
          </Field>

          <SecretField
            label="SSH Private Key (inline)"
            value={
              isCreate
                ? values!.privateKey ?? ""
                : eff("adapterConfig", "privateKey", String(config.privateKey ?? ""))
            }
            onCommit={(v) =>
              isCreate
                ? set!({ privateKey: v })
                : mark("adapterConfig", "privateKey", v || undefined)
            }
            placeholder="Paste PEM key content here (alternative to path)"
            hint="Only needed if not using key path"
          />

          <SecretField
            label="Key Passphrase"
            value={
              isCreate
                ? values!.passphrase ?? ""
                : eff("adapterConfig", "passphrase", String(config.passphrase ?? ""))
            }
            onCommit={(v) =>
              isCreate
                ? set!({ passphrase: v })
                : mark("adapterConfig", "passphrase", v || undefined)
            }
            placeholder="(optional)"
            hint="Only if your key is passphrase-protected"
          />
        </>
      ) : (
        <>
          {/* SSM Configuration */}
          <Field label="EC2 Instance ID" hint="e.g. i-0abcdef1234567890">
            <DraftInput
              value={
                isCreate
                  ? values!.instanceId ?? ""
                  : eff("adapterConfig", "instanceId", String(config.instanceId ?? ""))
              }
              onCommit={(v) =>
                isCreate
                  ? set!({ instanceId: v })
                  : mark("adapterConfig", "instanceId", v || undefined)
              }
              immediate
              className={inputClass}
              placeholder="i-0abcdef1234567890"
            />
          </Field>

          <Field label="AWS Region">
            <DraftInput
              value={
                isCreate
                  ? values!.region ?? "us-east-1"
                  : eff("adapterConfig", "region", String(config.region ?? "us-east-1"))
              }
              onCommit={(v) =>
                isCreate
                  ? set!({ region: v })
                  : mark("adapterConfig", "region", v || undefined)
              }
              immediate
              className={inputClass}
              placeholder="us-east-1"
            />
          </Field>
        </>
      )}

      {/* Common fields */}
      <Field label="Remote OpenClaw Command" hint="Binary name or full path on the EC2 instance">
        <DraftInput
          value={
            isCreate
              ? values!.openclawCommand ?? "openclaw"
              : eff("adapterConfig", "openclawCommand", String(config.openclawCommand ?? "openclaw"))
          }
          onCommit={(v) =>
            isCreate
              ? set!({ openclawCommand: v })
              : mark("adapterConfig", "openclawCommand", v || undefined)
          }
          immediate
          className={inputClass}
          placeholder="openclaw"
        />
      </Field>

      <Field label="Remote Working Directory" hint={help.cwd}>
        <DraftInput
          value={
            isCreate
              ? values!.openclawCwd ?? ""
              : eff("adapterConfig", "openclawCwd", String(config.openclawCwd ?? ""))
          }
          onCommit={(v) =>
            isCreate
              ? set!({ openclawCwd: v })
              : mark("adapterConfig", "openclawCwd", v || undefined)
          }
          immediate
          className={inputClass}
          placeholder="/home/ec2-user/project"
        />
      </Field>

      {!isCreate && (
        <>
          <Field label="Timeout (seconds)">
            <DraftInput
              value={eff("adapterConfig", "timeoutSec", String(config.timeoutSec ?? "300"))}
              onCommit={(v) => {
                const parsed = Number.parseInt(v.trim(), 10);
                mark(
                  "adapterConfig",
                  "timeoutSec",
                  Number.isFinite(parsed) && parsed > 0 ? parsed : undefined,
                );
              }}
              immediate
              className={inputClass}
              placeholder="300"
            />
          </Field>

          <Field label="Session strategy">
            <select
              value={eff(
                "adapterConfig",
                "sessionKeyStrategy",
                String(config.sessionKeyStrategy ?? "issue"),
              )}
              onChange={(e) => mark("adapterConfig", "sessionKeyStrategy", e.target.value)}
              className={inputClass}
            >
              <option value="issue">Per issue</option>
              <option value="fixed">Fixed</option>
              <option value="run">Per run</option>
            </select>
          </Field>
        </>
      )}
    </>
  );
}

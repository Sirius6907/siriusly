import type { AdapterConfigFieldsProps } from "../types";
import {
  Field,
  DraftInput,
  help,
} from "../../components/agent-config-primitives";

const inputClass =
  "w-full rounded-md border border-border px-2.5 py-1.5 bg-transparent outline-none text-sm font-mono placeholder:text-muted-foreground/40";

export function HttpConfigFields({
  isCreate,
  values,
  set,
  config,
  eff,
  mark,
}: AdapterConfigFieldsProps) {
  return (
    <>
      <Field label="Webhook URL" hint={help.webhookUrl}>
        <DraftInput
          value={
            isCreate
              ? values!.url
              : eff("adapterConfig", "url", String(config.url ?? ""))
          }
          onCommit={(v) =>
            isCreate
              ? set!({ url: v })
              : mark("adapterConfig", "url", v || undefined)
          }
          immediate
          className={inputClass}
          placeholder="https://..."
        />
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Method">
          <select
            className={inputClass}
            value={
              isCreate
                ? values!.method ?? "POST"
                : eff("adapterConfig", "method", String(config.method ?? "POST"))
            }
            onChange={(e) => {
              const v = e.target.value;
              isCreate
                ? set!({ ...values, method: v })
                : mark("adapterConfig", "method", v);
            }}
          >
            <option value="GET">GET</option>
            <option value="POST">POST</option>
            <option value="PUT">PUT</option>
            <option value="PATCH">PATCH</option>
            <option value="DELETE">DELETE</option>
          </select>
        </Field>

        <Field label="Timeout (sec)" hint={help.timeoutSec}>
          <DraftInput
            type="number"
            value={
              isCreate
                ? String(values!.timeoutSec ?? 30)
                : eff("adapterConfig", "timeoutSec", String(config.timeoutSec ?? 30))
            }
            onCommit={(v) => {
              const n = parseInt(v, 10) || 30;
              isCreate
                ? set!({ ...values, timeoutSec: n })
                : mark("adapterConfig", "timeoutSec", n);
            }}
            className={inputClass}
          />
        </Field>
      </div>

      <Field label="Headers (JSON)" hint="Optional request headers.">
        <DraftInput
          value={
            isCreate
              ? values!.headers ?? "{}"
              : eff("adapterConfig", "headers", String(config.headers ?? "{}"))
          }
          onCommit={(v) =>
            isCreate
              ? set!({ ...values, headers: v })
              : mark("adapterConfig", "headers", v || "{}")
          }
          className={inputClass}
          placeholder='{"Authorization": "Bearer ..."}'
        />
      </Field>

      <Field label="Payload Template (JSON)" hint={help.payloadTemplateJson}>
        <DraftInput
          value={
            isCreate
              ? values!.payloadTemplate ?? "{}"
              : eff("adapterConfig", "payloadTemplate", String(config.payloadTemplate ?? "{}"))
          }
          onCommit={(v) =>
            isCreate
              ? set!({ ...values, payloadTemplate: v })
              : mark("adapterConfig", "payloadTemplate", v || "{}")
          }
          className={inputClass}
          placeholder='{"model": "gpt-4"}'
        />
      </Field>
    </>
  );
}

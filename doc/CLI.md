# CLI Reference

SiriusEcoSystem CLI now supports both:

- instance setup/diagnostics (`onboard`, `doctor`, `configure`, `env`, `allowed-hostname`)
- control-plane client operations (issues, approvals, agents, activity, dashboard)

## Base Usage

Use repo script in development:

```sh
pnpm sirius-eco-system --help
```

First-time local bootstrap + run:

```sh
pnpm sirius-eco-system run
```

Choose local instance:

```sh
pnpm sirius-eco-system run --instance dev
```

## Deployment Modes

Mode taxonomy and design intent are documented in `doc/DEPLOYMENT-MODES.md`.

Current CLI behavior:

- `sirius-eco-system onboard` and `sirius-eco-system configure --section server` set deployment mode in config
- runtime can override mode with `SIRIUSLY_DEPLOYMENT_MODE`
- `sirius-eco-system run` and `sirius-eco-system doctor` do not yet expose a direct `--mode` flag

Target behavior (planned) is documented in `doc/DEPLOYMENT-MODES.md` section 5.

Allow an authenticated/private hostname (for example custom Tailscale DNS):

```sh
pnpm sirius-eco-system allowed-hostname dotta-macbook-pro
```

All client commands support:

- `--data-dir <path>`
- `--api-base <url>`
- `--api-key <token>`
- `--context <path>`
- `--profile <name>`
- `--json`

Company-scoped commands also support `--company-id <id>`.

Use `--data-dir` on any CLI command to isolate all default local state (config/context/db/logs/storage/secrets) away from `~/.sirius-eco-system`:

```sh
pnpm sirius-eco-system run --data-dir ./tmp/sirius-eco-system-dev
pnpm sirius-eco-system issue list --data-dir ./tmp/sirius-eco-system-dev
```

## Context Profiles

Store local defaults in `~/.sirius-eco-system/context.json`:

```sh
pnpm sirius-eco-system context set --api-base http://localhost:3100 --company-id <company-id>
pnpm sirius-eco-system context show
pnpm sirius-eco-system context list
pnpm sirius-eco-system context use default
```

To avoid storing secrets in context, set `apiKeyEnvVarName` and keep the key in env:

```sh
pnpm sirius-eco-system context set --api-key-env-var-name SIRIUSLY_API_KEY
export SIRIUSLY_API_KEY=...
```

## Company Commands

```sh
pnpm sirius-eco-system company list
pnpm sirius-eco-system company get <company-id>
pnpm sirius-eco-system company delete <company-id-or-prefix> --yes --confirm <same-id-or-prefix>
```

Examples:

```sh
pnpm sirius-eco-system company delete PAP --yes --confirm PAP
pnpm sirius-eco-system company delete 5cbe79ee-acb3-4597-896e-7662742593cd --yes --confirm 5cbe79ee-acb3-4597-896e-7662742593cd
```

Notes:

- Deletion is server-gated by `SIRIUSLY_ENABLE_COMPANY_DELETION`.
- With agent authentication, company deletion is company-scoped. Use the current company ID/prefix (for example via `--company-id` or `SIRIUSLY_COMPANY_ID`), not another company.

## Issue Commands

```sh
pnpm sirius-eco-system issue list --company-id <company-id> [--status todo,in_progress] [--assignee-agent-id <agent-id>] [--match text]
pnpm sirius-eco-system issue get <issue-id-or-identifier>
pnpm sirius-eco-system issue create --company-id <company-id> --title "..." [--description "..."] [--status todo] [--priority high]
pnpm sirius-eco-system issue update <issue-id> [--status in_progress] [--comment "..."]
pnpm sirius-eco-system issue comment <issue-id> --body "..." [--reopen]
pnpm sirius-eco-system issue checkout <issue-id> --agent-id <agent-id> [--expected-statuses todo,backlog,blocked]
pnpm sirius-eco-system issue release <issue-id>
```

## Agent Commands

```sh
pnpm sirius-eco-system agent list --company-id <company-id>
pnpm sirius-eco-system agent get <agent-id>
pnpm sirius-eco-system agent local-cli <agent-id-or-shortname> --company-id <company-id>
```

`agent local-cli` is the quickest way to run local Claude/Codex manually as a SiriusEcoSystem agent:

- creates a new long-lived agent API key
- installs missing SiriusEcoSystem skills into `~/.codex/skills` and `~/.claude/skills`
- prints `export ...` lines for `SIRIUSLY_API_URL`, `SIRIUSLY_COMPANY_ID`, `SIRIUSLY_AGENT_ID`, and `SIRIUSLY_API_KEY`

Example for shortname-based local setup:

```sh
pnpm sirius-eco-system agent local-cli codexcoder --company-id <company-id>
pnpm sirius-eco-system agent local-cli claudecoder --company-id <company-id>
```

## Approval Commands

```sh
pnpm sirius-eco-system approval list --company-id <company-id> [--status pending]
pnpm sirius-eco-system approval get <approval-id>
pnpm sirius-eco-system approval create --company-id <company-id> --type hire_agent --payload '{"name":"..."}' [--issue-ids <id1,id2>]
pnpm sirius-eco-system approval approve <approval-id> [--decision-note "..."]
pnpm sirius-eco-system approval reject <approval-id> [--decision-note "..."]
pnpm sirius-eco-system approval request-revision <approval-id> [--decision-note "..."]
pnpm sirius-eco-system approval resubmit <approval-id> [--payload '{"...":"..."}']
pnpm sirius-eco-system approval comment <approval-id> --body "..."
```

## Activity Commands

```sh
pnpm sirius-eco-system activity list --company-id <company-id> [--agent-id <agent-id>] [--entity-type issue] [--entity-id <id>]
```

## Dashboard Commands

```sh
pnpm sirius-eco-system dashboard get --company-id <company-id>
```

## Heartbeat Command

`heartbeat run` now also supports context/api-key options and uses the shared client stack:

```sh
pnpm sirius-eco-system heartbeat run --agent-id <agent-id> [--api-base http://localhost:3100] [--api-key <token>]
```

## Local Storage Defaults

Default local instance root is `~/.sirius-eco-system/instances/default`:

- config: `~/.sirius-eco-system/instances/default/config.json`
- embedded db: `~/.sirius-eco-system/instances/default/db`
- logs: `~/.sirius-eco-system/instances/default/logs`
- storage: `~/.sirius-eco-system/instances/default/data/storage`
- secrets key: `~/.sirius-eco-system/instances/default/secrets/master.key`

Override base home or instance with env vars:

```sh
SIRIUSLY_HOME=/custom/home SIRIUSLY_INSTANCE_ID=dev pnpm sirius-eco-system run
```

## Storage Configuration

Configure storage provider and settings:

```sh
pnpm sirius-eco-system configure --section storage
```

Supported providers:

- `local_disk` (default; local single-user installs)
- `s3` (S3-compatible object storage)

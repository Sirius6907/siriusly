---
title: Setup Commands
summary: Onboard, run, doctor, and configure
---

Instance setup and diagnostics commands.

## `sirius-eco-system run`

One-command bootstrap and start:

```sh
pnpm sirius-eco-system run
```

Does:

1. Auto-onboards if config is missing
2. Runs `sirius-eco-system doctor` with repair enabled
3. Starts the server when checks pass

Choose a specific instance:

```sh
pnpm sirius-eco-system run --instance dev
```

## `sirius-eco-system onboard`

Interactive first-time setup:

```sh
pnpm sirius-eco-system onboard
```

First prompt:

1. `Quickstart` (recommended): local defaults (embedded database, no LLM provider, local disk storage, default secrets)
2. `Advanced setup`: full interactive configuration

Start immediately after onboarding:

```sh
pnpm sirius-eco-system onboard --run
```

Non-interactive defaults + immediate start (opens browser on server listen):

```sh
pnpm sirius-eco-system onboard --yes
```

## `sirius-eco-system doctor`

Health checks with optional auto-repair:

```sh
pnpm sirius-eco-system doctor
pnpm sirius-eco-system doctor --repair
```

Validates:

- Server configuration
- Database connectivity
- Secrets adapter configuration
- Storage configuration
- Missing key files

## `sirius-eco-system configure`

Update configuration sections:

```sh
pnpm sirius-eco-system configure --section server
pnpm sirius-eco-system configure --section secrets
pnpm sirius-eco-system configure --section storage
```

## `sirius-eco-system env`

Show resolved environment configuration:

```sh
pnpm sirius-eco-system env
```

## `sirius-eco-system allowed-hostname`

Allow a private hostname for authenticated/private mode:

```sh
pnpm sirius-eco-system allowed-hostname my-tailscale-host
```

## Local Storage Paths

| Data | Default Path |
|------|-------------|
| Config | `~/.sirius-eco-system/instances/default/config.json` |
| Database | `~/.sirius-eco-system/instances/default/db` |
| Logs | `~/.sirius-eco-system/instances/default/logs` |
| Storage | `~/.sirius-eco-system/instances/default/data/storage` |
| Secrets key | `~/.sirius-eco-system/instances/default/secrets/master.key` |

Override with:

```sh
SIRIUSLY_HOME=/custom/home SIRIUSLY_INSTANCE_ID=dev pnpm sirius-eco-system run
```

Or pass `--data-dir` directly on any command:

```sh
pnpm sirius-eco-system run --data-dir ./tmp/sirius-eco-system-dev
pnpm sirius-eco-system doctor --data-dir ./tmp/sirius-eco-system-dev
```

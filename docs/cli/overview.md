---
title: CLI Overview
summary: CLI installation and setup
---

The SiriusEcoSystem CLI handles instance setup, diagnostics, and control-plane operations.

## Usage

```sh
pnpm sirius-eco-system --help
```

## Global Options

All commands support:

| Flag | Description |
|------|-------------|
| `--data-dir <path>` | Local SiriusEcoSystem data root (isolates from `~/.sirius-eco-system`) |
| `--api-base <url>` | API base URL |
| `--api-key <token>` | API authentication token |
| `--context <path>` | Context file path |
| `--profile <name>` | Context profile name |
| `--json` | Output as JSON |

Company-scoped commands also accept `--company-id <id>`.

For clean local instances, pass `--data-dir` on the command you run:

```sh
pnpm sirius-eco-system run --data-dir ./tmp/sirius-eco-system-dev
```

## Context Profiles

Store defaults to avoid repeating flags:

```sh
# Set defaults
pnpm sirius-eco-system context set --api-base http://localhost:3100 --company-id <id>

# View current context
pnpm sirius-eco-system context show

# List profiles
pnpm sirius-eco-system context list

# Switch profile
pnpm sirius-eco-system context use default
```

To avoid storing secrets in context, use an env var:

```sh
pnpm sirius-eco-system context set --api-key-env-var-name SIRIUSLY_API_KEY
export SIRIUSLY_API_KEY=...
```

Context is stored at `~/.sirius-eco-system/context.json`.

## Command Categories

The CLI has two categories:

1. **[Setup commands](/cli/setup-commands)** — instance bootstrap, diagnostics, configuration
2. **[Control-plane commands](/cli/control-plane-commands)** — issues, agents, approvals, activity

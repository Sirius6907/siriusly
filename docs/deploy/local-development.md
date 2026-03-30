---
title: Local Development
summary: Set up SiriusEcoSystem for local development
---

Run SiriusEcoSystem locally with zero external dependencies.

## Prerequisites

- Node.js 20+
- pnpm 9+

## Start Dev Server

```sh
pnpm install
pnpm dev
```

This starts:

- **API server** at `http://localhost:3100`
- **UI** served by the API server in dev middleware mode (same origin)

No Docker or external database required. SiriusEcoSystem uses embedded PostgreSQL automatically.

## One-Command Bootstrap

For a first-time install:

```sh
pnpm sirius-eco-system run
```

This does:

1. Auto-onboards if config is missing
2. Runs `sirius-eco-system doctor` with repair enabled
3. Starts the server when checks pass

## Tailscale/Private Auth Dev Mode

To run in `authenticated/private` mode for network access:

```sh
pnpm dev --tailscale-auth
```

This binds the server to `0.0.0.0` for private-network access.

Alias:

```sh
pnpm dev --authenticated-private
```

Allow additional private hostnames:

```sh
pnpm sirius-eco-system allowed-hostname dotta-macbook-pro
```

For full setup and troubleshooting, see [Tailscale Private Access](/deploy/tailscale-private-access).

## Health Checks

```sh
curl http://localhost:3100/api/health
# -> {"status":"ok"}

curl http://localhost:3100/api/companies
# -> []
```

## Reset Dev Data

To wipe local data and start fresh:

```sh
rm -rf ~/.sirius-eco-system/instances/default/db
pnpm dev
```

## Data Locations

| Data | Path |
|------|------|
| Config | `~/.sirius-eco-system/instances/default/config.json` |
| Database | `~/.sirius-eco-system/instances/default/db` |
| Storage | `~/.sirius-eco-system/instances/default/data/storage` |
| Secrets key | `~/.sirius-eco-system/instances/default/secrets/master.key` |
| Logs | `~/.sirius-eco-system/instances/default/logs` |

Override with environment variables:

```sh
SIRIUSLY_HOME=/custom/path SIRIUSLY_INSTANCE_ID=dev pnpm sirius-eco-system run
```

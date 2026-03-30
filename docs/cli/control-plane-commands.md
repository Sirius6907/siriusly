---
title: Control-Plane Commands
summary: Issue, agent, approval, and dashboard commands
---

Client-side commands for managing issues, agents, approvals, and more.

## Issue Commands

```sh
# List issues
pnpm sirius-eco-system issue list [--status todo,in_progress] [--assignee-agent-id <id>] [--match text]

# Get issue details
pnpm sirius-eco-system issue get <issue-id-or-identifier>

# Create issue
pnpm sirius-eco-system issue create --title "..." [--description "..."] [--status todo] [--priority high]

# Update issue
pnpm sirius-eco-system issue update <issue-id> [--status in_progress] [--comment "..."]

# Add comment
pnpm sirius-eco-system issue comment <issue-id> --body "..." [--reopen]

# Checkout task
pnpm sirius-eco-system issue checkout <issue-id> --agent-id <agent-id>

# Release task
pnpm sirius-eco-system issue release <issue-id>
```

## Company Commands

```sh
pnpm sirius-eco-system company list
pnpm sirius-eco-system company get <company-id>

# Export to portable folder package (writes manifest + markdown files)
pnpm sirius-eco-system company export <company-id> --out ./exports/acme --include company,agents

# Preview import (no writes)
pnpm sirius-eco-system company import \
  <owner>/<repo>/<path> \
  --target existing \
  --company-id <company-id> \
  --ref main \
  --collision rename \
  --dry-run

# Apply import
pnpm sirius-eco-system company import \
  ./exports/acme \
  --target new \
  --new-company-name "Acme Imported" \
  --include company,agents
```

## Agent Commands

```sh
pnpm sirius-eco-system agent list
pnpm sirius-eco-system agent get <agent-id>
```

## Approval Commands

```sh
# List approvals
pnpm sirius-eco-system approval list [--status pending]

# Get approval
pnpm sirius-eco-system approval get <approval-id>

# Create approval
pnpm sirius-eco-system approval create --type hire_agent --payload '{"name":"..."}' [--issue-ids <id1,id2>]

# Approve
pnpm sirius-eco-system approval approve <approval-id> [--decision-note "..."]

# Reject
pnpm sirius-eco-system approval reject <approval-id> [--decision-note "..."]

# Request revision
pnpm sirius-eco-system approval request-revision <approval-id> [--decision-note "..."]

# Resubmit
pnpm sirius-eco-system approval resubmit <approval-id> [--payload '{"..."}']

# Comment
pnpm sirius-eco-system approval comment <approval-id> --body "..."
```

## Activity Commands

```sh
pnpm sirius-eco-system activity list [--agent-id <id>] [--entity-type issue] [--entity-id <id>]
```

## Dashboard

```sh
pnpm sirius-eco-system dashboard get
```

## Heartbeat

```sh
pnpm sirius-eco-system heartbeat run --agent-id <agent-id> [--api-base http://localhost:3100]
```

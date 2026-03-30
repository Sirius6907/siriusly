<p align="center">
  <img src="ui/public/assets/alwys_sirius_logo.png" alt="SIRIUSLY — Orchestrated Zero-Human Business" width="500" />
</p>

<p align="center">
  <strong>Orchestrate a team of elite AI agents to run your business autonomously.</strong>
</p>

<p align="center">
  <a href="#quickstart">Quickstart</a> &middot;
  <a href="#features">Features</a> &middot;
  <a href="#architecture">Architecture</a> &middot;
  <a href="LICENSE">License</a>
</p>

<br/>

## What is Siriusly?

**Siriusly** is an open-source control plane for autonomous AI organizations. While individual agents (like OpenClaw, Claude Code, or Codex) are elite _employees_, **Siriusly** is the _company infrastructure_ that coordinates them.

It provides the governance, budgeting, and orchestration layer needed to turn a collection of scripts into a self-sustaining, zero-human business.

> "Manage the mission, not the pull requests."

<br/>

## Why Siriusly?

*   **⚡ Unified Orchestration**: Bring your own agents (Local, AWS, HTTP) and organize them into a functional Org Chart.
*   **🎯 Goal Alignment**: Tasks are automatically contextualized with high-level company goals, ensuring agents always know the "why" behind their work.
*   **💰 Hard Budgets**: Set token and financial budgets per agent. When they hit the limit, they pause—no more runaway costs.
*   **🏢 Multi-Company Isolation**: Run multiple brands or departments from a single deployment with complete data and logic separation.
*   **💓 Heartbeat Loops**: Agents operate on scheduled intervals, checking their own task boards and delegating work horizontally and vertically.

<br/>

## Features at a Glance

| Feature | Description |
| :--- | :--- |
| **Org Chart** | Define reporting lines, roles, and job descriptions for your AI workforce. |
| **Governance** | Human-in-the-loop approval gates for high-stakes actions and deployments. |
| **Adapter Registry** | Connect to Local processes, AWS-hosted agents, or any HTTP webhook. |
| **Immutable Audit** | Every decision, tool call, and explanation is logged for perfect traceability. |
| **Ticketing System** | Native issue tracking designed for agent-to-agent delegation. |

<br/>

## Quickstart

### 1. Requirements
*   Node.js 20+
*   pnpm 9+

### 2. Install & Run
```bash
git clone https://github.com/yourusername/siriusly-ecosystem.git
cd siriusly-ecosystem
pnpm install
pnpm dev
```

The dashboard will be available at `http://localhost:3100`. An embedded SQLite/PGlite database is initialized automatically.

<br/>

## Supported Adapters

Siriusly is adapter-agnostic. If it can receive a payload, it can be hired.
*   **Local**: Claude Code, Codex, Gemini CLI, OpenCode, Pi.
*   **Cloud**: AWS OpenClaw (via SSH/PEM).
*   **Web**: Generic HTTP Webhooks for custom integrations.
*   **Gateway**: OpenClaw Gateway protocol support.

<br/>

## Philosophy: Zero-Human

Siriusly is built for the era of the **$1B One-Person Company**. The goal is to reach a state where the human acts solely as the **Board of Directors**, setting high-level strategy and approving major expenditures, while the AI team handles execution, coordination, and scaling.

<br/>

## License

Personal Open Source Project &copy; 2026. Distributed under the MIT License.

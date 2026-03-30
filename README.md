<p align="center">
  <img src="ui/public/assets/alwys_sirius_logo.png" alt="SIRIUSLY — Orchestrated Zero-Human Business" width="500" />
</p>

# 🌌 SIRIUSLY: The Autonomous Enterprise Control Plane

> **"Transforming static AI employees into a dynamic, scale-free autonomous organization."**

[![License: MIT](https://img.shields.io/badge/License-MIT-gold.svg)](https://opensource.org/licenses/MIT)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](http://makeapullrequest.com)
[![Discord](https://img.shields.io/discord/1234567890?color=7289da&label=Discord&logo=discord&logoColor=ffffff)](https://discord.gg/m4HZY7xNG3)
[![Build Status](https://img.shields.io/badge/build-passing-brightgreen.svg)](https://github.com/Sirius6907/siriusly/actions)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)

**[🎬 Watch the Cinematic demo](ui/public/ad.html)** (Run locally or deploy to Netlify)

> [!NOTE]
> The link below is a placeholder. To get your own live URL, follow the [Deployment](#deployment) section.
> **[Live Demo](https://siriusly-control.netlify.app/ad.html)**

[Quickstart](#quickstart) · [Architecture](#architecture) · [Sirius Hub](#sirius-hub) · [API](#api-reference) · [Adapters](#adapter-engine) · [FAQ](#faq)

## If OpenClaw is an employee, SIRIUSLY is the company.

SIRIUSLY is an enterprise-grade control plane—consisting of a high-performance Node.js orchestrator and a premium React UI—that manages an entire tier of AI agents to run a business. Bring your own agents, assign sweeping goals, and track your autonomous agents' work, output, and financial costs from one central, heavily secured dashboard.

It might look like a modern task manager or project management tool on the surface, but under the hood, it rigidly enforces complex organization charts, impenetrable financial budgets, approval governance workflows, inter-agent goal alignment, and deterministic agent coordination. 

**Manage business missions, not pull requests. If it can receive a heartbeat, it's hired.**

---

## ⚡ The Core Philosophy

Most "multi-agent" systems today are toy scripts, experimental Python notebooks, or wrapper libraries that break the moment you leave them running unmonitored. They fundamentally lack the enterprise controls required to confidently deploy autonomous capital in mission-critical environments. SIRIUSLY was built from the ground up to solve the operational chaos of managing digital workers.

We believe that human beings should not be the operators of businesses, but the **Board of Directors**. Your job is to set the overarching mission, define the budget limits, and occasionally approve a high-stakes decision. The agents do the rest.

### SIRIUSLY is right for you if:
- ✅ **You Treat AI as Employees:** You want to build autonomous AI companies, not just wrapper scripts.
- ✅ **You Demand Orchestration:** You coordinate many different agents (OpenClaw, Claude, HTTP APIs, local scripts) toward a common enterprise goal.
- ✅ **You Protect Your Capital:** You want agents running autonomously 24/7, but require strict **budget hard-stops** preventing runaway LLM billing costs.
- ✅ **You Need Auditability:** You need a cryptographic, immutable audit trail for every action your AI employees take on your infrastructure.
- ✅ **You Want Governance:** You want a process for managing agents that feels like using enterprise resource planning (ERP) software.
- ✅ **You Value Pre-built Ecosystems:** You want to instantly download and deploy entire organizations using **Sirius Hub** blueprints.
- ✅ **You Practice Zero-Human Mechanics:** You want a system that scales indefinitely with zero human interference in the execution loop.

---

## 🚀 Key Features

### 1. Sirius Hub & Blueprint Deployments
**Download and run entire companies with one click.** 
You do not need to build your company from scratch. Browse pre-built company blueprints—containing full organizational structures, adapter configurations, role definitions, permission tables, and budgets—and import them into your SIRIUSLY control plane in seconds. 
Whether you need an entire autonomous Software Development Agency, a Financial Triage Unit, or a global Customer Support Organization, Sirius Hub lets you clone proven operational models immediately. Every agent in a blueprint instantly configures itself to your local environment.

### 2. Elite Heartbeat Orchestration
SIRIUSLY functions on a highly optimized, deterministic "Pulse" loop. Every 5 seconds, the control engine evaluates the state of your organization, scanning for `OPEN` tasks and matching them to the most qualified, highly-available Agent based on hierarchical Role and operational Capacity. It handles lock-contention, concurrency constraints, and priority queueing automatically.

### 3. Dynamic Budgeting & Hard-Stops
AI automation is expensive if a loop goes rogue. Every agent in a SIRIUSLY organization has a predefined, hard-stop financial budget (e.g., $5.00/day). The system intercepts execution outputs, evaluates compute and token costs calculated per execution, and aggregates expenses. The moment an agent encroaches on its financial limit, SIRIUSLY applies immediate auto-pauses at the process level, isolating the agent until the human Board of Directors raises the budget limit.

### 4. Governance & Human-in-the-Loop Approvals
You don't want autonomous agents deploying breaking changes to production databases without oversight. High-stakes actions require human approval gates. SIRIUSLY flags these specific task types in the Board Dashboard, placing the agent's execution into a highly secure suspended state until cryptographic approval is unilaterally granted by a human.

### 5. Protocol Agnostic Adapters
SIRIUSLY does not care what your agent is written in. The un-opinionated Adapter Engine supports seamless integration with:
- **HTTP/REST APIs:** Connect external orchestration frameworks like LangGraph, AutoGPT, or CrewAI via webhooks.
- **Remote Infrastructure:** Secure SSH tunneling to AWS Hosted OpenClaw instances running complex Docker environments.
- **Local Processes:** Native CLI shells, Python automation scripts, and executable binaries.
- **Custom Native Adapters:** Write your own integration layer using our standardized TypeScript schema interface.

### 6. Military-Grade Security at Rest
Enterprise organizations cannot store cleartext API keys, cloud provider secrets, or AWS PEM files. All agent connection configurations and credential schemas within the SIRIUSLY database are encrypted at rest using industry-standard `AES-256-GCM` symmetric key architecture. This is strictly managed via your self-hosted `SIRIUSLY_MASTER_KEY` environment variable.

---

## 🧠 System Architecture & Workflow

SIRIUSLY is structured as a scalable, component-driven monorepo built on cutting-edge modern JavaScript tooling and strictly typed logic.

### Structural Monorepo Map

```text
siriusly/
├── server/                 # Express REST API, Event Bus, and Orchestrator Heartbeat
├── ui/                     # React 18 + Vite premium dashboard UI for the Board
├── packages/
│   ├── db/                 # Drizzle ORM schema, migrations, PGlite/PostgreSQL clients
│   ├── shared/             # Canonical TypeScript types, Zod validators, API types
│   ├── adapters/           # Official implementation packages for agent connections 
│   ├── adapter-utils/      # Encryption utilities and request handlers
│   └── plugins/            # Extensible plugin system for custom workflows
├── doc/                    # Enterprise Product Specification and Architectural decisions
└── data/                   # Local file volume for embedded database state
```

### The Orchestrator Lifecycle

```mermaid
graph TD
    classDef human fill:#d4af37,stroke:#333,stroke-width:2px,color:#000;
    classDef system fill:#1a1a1a,stroke:#d4af37,stroke-width:2px,color:#fff;
    classDef agent fill:#2c2c2c,stroke:#888,stroke-width:1px,color:#fff;

    User((Board of Directors)):::human -->|Sets Mission & Budget| UI[SIRIUSLY Enterprise Dashboard]:::system
    UI -->|REST/Websockets| Server[Express Orchestration Heartbeat]:::system
    Server <-->|AES-256 Encrypted Configs| DB[(PostgreSQL Data Layer)]:::system
    
    subgraph "Core Control Engine"
        Server -->|Pessimistic Locking| Queue[Task Queue Dispatcher]:::system
        Queue -->|Financial Audit Check| Auth[Governance & Budget Gate]:::system
        Auth -->|Payload Resolution| Adapter{Protocol Adapter Engine}:::system
    end

    subgraph "The Autonomous AI Workforce"
        Adapter -->|SSH/PEM Tunnel| AWS[AWS Hosted OpenClaw]:::agent
        Adapter -->|Webhook Payload| HTTP[Custom REST Agent API]:::agent
        Adapter -->|Subprocess Launch| Local[Local CLI Executable]:::agent
    end
    
    AWS -->|Token Cost & Context Diff| Server
    HTTP -->|Token Cost & Context Diff| Server
    Local -->|Token Cost & Context Diff| Server
    
    Server -->|Cryptographic Write| Log[Immutable Activity Tracker]:::system
    Log -->|Event Emitted via WS| UI
```

---

## 🛠️ Quickstart Installation

SIRIUSLY is entirely open-source and natively self-hosted. **No cloud account is required.** The system behaves efficiently whether you deploy it on a local laptop or an enterprise cluster. Designed to be up and running in under 5 minutes.

### Base Prerequisites
- Node.js LTS (v20+)
- `pnpm` workspace manager (v9.15+)
- Git version control

### 1. Clone the Enterprise Repository
Clone the system to your secure local environment or cloud instance.
```bash
git clone https://github.com/Sirius6907/siriusly.git
cd siriusly
```

### 2. Install Monorepo Dependencies
SIRIUSLY utilizes pnpm workspaces to isolate dependency boundaries across packages.
```bash
pnpm install
```

### 3. Configure the Cryptographic Environment
SIRIUSLY secures your infrastructure automatically. You must provide a highly secure encryption key to boot the container.
```bash
cp server/.env.example server/.env
```
Generate a random, robust string and populate the variables:
```env
# Strict environment constraints
SIRIUSLY_MASTER_KEY="a_random_secure_32_byte_aes_key"
PORT=3100
# DATABASE_URL=postgresql://user:pass@host:5432/db  (Leave empty to use local embedded PGlite)
```

### 4. Boot the Zero-Human Engine
Launch both the Orchestrator API process and the React UI frontend concurrently.
```bash
pnpm dev
```
Success! Access your Board of Directors dashboard at **[http://localhost:3100](http://localhost:3100)**. The system will automatically compile the schema, provision the local embedded database via PGlite, and initiate the first automated execution pulse.

---

## 📦 Deploying a Sirius Hub Blueprint

Don't want to start from absolute zero? You can provision an entire organization immediately using our built-in Blueprint system. Instead of configuring twelve agents individually, do it instantly.

```bash
# Evaluate and import an officially verified blueprint schema
pnpm db:import --blueprint="software-development-agency-v1"
```
Once imported, your UI dashboard will instantly populate with a complete organizational structure: a CEO, a Product Manager, a Lead Backend Engineer, and an Automation QA Agent. They arrive complete with predefined roles, reporting lines, permission boundaries, and preset budget parameters. All you need to do is provide their API keys via the encrypted interface and hit "Start".

---

## 🔌 The Adapter Engine Deep-Dive

The true power and elasticity of SIRIUSLY lies in its un-opinionated Adapter Engine. SIRIUSLY itself does not run large language models directly. It manages the lifecycle. You can connect absolutely any proprietary, closed-source, or open-source agent using our modular adapter architecture.

### Configuring a Custom HTTP Webhook Adapter
If you have an existing robust Python agent running on a server, you don't need to rebuild it. In the UI dashboard, deploy an `HTTP` configured agent:
1. **Target Execution URL:** `https://your-custom-agent-server.com/api/run-mission`
2. **Payload Mapping:** Define exactly how SIRIUSLY's standard task format translates into your agent's unique JSON payload structure mapping.
3. **Authentication:** Provide a Bearer Token or Custom API Key (which SIRIUSLY will deeply engrave into AES-256 state).

### Authoring a Code-Level Native Adapter
If you want deep, highly efficient native integration directly into the orchestrator pulse, you can easily author a native extension to the `packages/adapters/` core library:
```typescript
import { SiriusAdapter, TaskPayload, ExecutionResult } from "@siriusly/shared";

export class MyCustomProprietaryAdapter implements SiriusAdapter {
  
  // Fired when the agent spins up
  async init(config: any): Promise<void> {
    await initializeSystem(config);
  }

  // Fired during the pulse loop
  async healthCheck(): Promise<boolean> {
    return true; 
  }

  // Driven by the control plane upon task dispatch
  async execute(task: TaskPayload): Promise<ExecutionResult> {
    const payload = this.resolvePayload(task);
    const result = await externalAgentProcess(payload);
    
    return {
      success: result.isSuccess,
      costEstimateUsd: result.financialMetrics,
      artifacts: result.outputFiles,
      statusMessage: "Execution cycle successfully evaluated."
    };
  }
}
```

---

## 📡 Core API Reference 

The orchestrator operates over a strict REST API interface. All routes are prefixed directly with `/api`. Board Dashboard interactions are strictly configured with "operator" access, while programmatic Agent interactions must utilize securely hashed `agent_api_keys` to authenticate.

### `GET /api/companies`
Retrieve the health status and organizational overview of all active, provisioned autonomous companies.

### `POST /api/tasks`
Create a new objective within the control plane and inject it into the queue.
```json
{
  "companyId": "org_12345",
  "title": "Migrate core database infrastructure to AWS Aurora",
  "description": "Evaluate current read/write load and execute a zero-downtime structural migration across availability zones.",
  "priority": "CRITICAL",
  "budgetLimit": 150.00
}
```

### `GET /api/health`
Ping the system evaluating general latency and orchestration pulse loop synchronization health.

*(Note: Ensure you include your Bearer token configured in the server environment for all administrative mutating routes. The system responds with deterministic HTTP codes: 401, 403, 404, 422, 500).*

---

## 🖥️ Development & Operational Guidelines

SIRIUSLY maintains exceptionally high engineering execution standards. All PRs must adhere rigorously to the rules outlined in `doc/AGENTS.md`. We preserve invariant control-plane mechanics (e.g. strict single-assignee models, atomic issue checkout semantics, budget hard-stops, and immutable logging).

### Standard Monorepo Commands
```bash
pnpm dev           # Start the full stack (API + UI) in fast hot-reload watch mode
pnpm build         # Compile all TypeScript packages for deployment
pnpm typecheck     # Validate full monorepo typings (Strict constraints)
pnpm test:run      # Execute unit, integration, and E2E verification tests
pnpm db:generate   # Compile Drizzle ORM schema into deployable SQL migrations
pnpm db:migrate    # Atomically apply pending SQL migrations to your database
```

### Definition of Done for Contributors
Before opening a pull request, verify:
1. Behavioral flow deeply matches the `doc/SPEC-implementation.md` contract.
2. `pnpm typecheck`, `pnpm test:run`, and `pnpm build` pass with absolute zero warnings.
3. API contracts remain natively synchronized across `packages/db`, `packages/shared`, `server`, and `ui/`.

---

## ❓ Frequently Asked Questions (FAQ)

**What does a typical enterprise infrastructure setup look like?**
Locally, a single Node.js process elegantly manages an embedded Postgres database via PGlite alongside local file storage for rapid iteration. For heavy production usage, configure the `DATABASE_URL` to point to an external managed Postgres instance (e.g., AWS RDS or Supabase) and deploy the Node instance via Docker. Configure your companies, agents, and goals — the control plane predictably handles the rest.

**Can I run multiple autonomous companies simultaneously?**
Yes. A single deployment easily manages unlimited sovereign organizations. We employ strict data-layer tenant isolation to ensure complete security and zero data bleed-over between distinct enterprise instances.

**Why should I use SIRIUSLY instead of just pointing LangChain or OpenClaw to an Asana webhook?**
Agent orchestration encompasses massive systemic subtleties: determining who has a task checked out atomically, managing ongoing dynamic context sessions, applying rigid financial cost monitoring, dealing with unpredictable fail-over states, and establishing deterministic human governance. SIRIUSLY is purpose-built to act as the massive central control plane for all of this logic so you don't have to write messy, fragile wrapper scripts.

**Do agents run continuously, forever?**
By default, the SIRIUSLY orchestrator runs on a scheduled "Heartbeat" tick. Tasks are dynamically assigned and delivered sequentially to adapters. If your adapter wraps a continuous, persistent agent process (like a long-running OpenClaw Docker VM), SIRIUSLY simply coordinates its directives and evaluates output rather than actively looping the process. 

**How does SIRIUSLY connect to my external agents?**
Through the comprehensive "Adapter Engine". The generic HTTP adapter natively allows you to connect any API-based agent (LangGraph, CrewAI, Custom Python APIs) by dynamically mapping REST headers and execution payloads directly to your remote environments. 

**Does SIRIUSLY natively handle the agent's memory (RAG)?**
No. SIRIUSLY is decidedly the orchestration manager block. It manages *when* the agent runs, *what* its overarching overarching goal is, and *how much money* it can spend trying to achieve it. The internal memory, specific RAG implementations, and decision-tree logic of the agent exist entirely within the agent's own proprietary endpoint. It prevents vendor lock-in.

**How do I backup my organization's state?**
Since all state, session logic, configuration rules, and immutable activity logs reside strictly within PostgreSQL, executing a standard `pg_dump` securely preserves your entire mathematical organization structure, config parameters, and deep task history.

**Are my third-party API Keys secure within the system?**
Absolutely. We designed SIRIUSLY knowing that enterprise security is the absolute paramount feature. The system leverages `AES-256-GCM` cryptology to encode all sensitive environment configs (like AWS Keys, OpenAI platform limits, and specific PEM files) physically at rest.

**How do you prevent agents from draining my AWS account?**
The system acts as a financial regulator. On every single lifecycle completion step across any adapter, SIRIUSLY records and extracts the token cost delta. If the aggregate accumulated cost breaches the human-defined threshold margin, the agent’s specific state machine locks instantaneously until human financial intervention happens. 

---

## 🔮 Community Plugins & Extensions

SIRIUSLY thrives on immense extensibility. You can discover custom UI rendering widgets, unique adapter integrations for obscure local LLMs (like Ollama or vLLM), and fully fleshed out, immediately deployable Sirius Hub Blueprints constructed by our active community base. 

Find plugins, operational adapters, and enterprise blueprints at the officially maintained repository:
**[siriusly-awesome](https://github.com/Sirius6907/siriusly-awesome)**

---

## 🌍 Community & Discussions

We fundamentally believe the upcoming transition to "Zero-Human" operational mechanics is the absolute most significant economic restructuring since the industrial revolution. We actively welcome contributions from elite engineers, artificial intelligence researchers, and overarching system visionaries. 

If you are building the future of autonomous, decentralized capital, join us. We review PRs rapidly.

- **[Discord Architecture Lounge](https://discord.gg/m4HZY7xNG3)** — Join the live community discussions and weekly architecture syncs.
- **[GitHub Issues](https://github.com/Sirius6907/siriusly/issues)** — Report infrastructure bugs and submit overarching feature requests.
- **[GitHub Discussions](https://github.com/Sirius6907/siriusly/discussions)** — Propose sweeping architectural ideas and highly structured RFCs for v3 integrations.

---

## 🤝 Contributing to SIRIUSLY

Please read our [Contributing Guidelines](./CONTRIBUTING.md) to deeply understand our pull-request mechanics, Git branching flow, and architectural philosophies. Review the `doc/SPEC-implementation.md` mapping carefully. Every line of code merged helps push us exponentially toward true operational autonomy.

---

## 🚀 Deployment

### Dashboard & Cinematic Ad (Netlify)

The easiest way to deploy the SIRIUSLY UI is via **Netlify**. I have provided a `ui/netlify.toml` for automated configuration.

1.  **Connect Repo**: Link your GitHub repository to a new Netlify site.
2.  **Base Directory**: Set to `ui`.
3.  **Build Command**: `npm run build`.
4.  **Publish Directory**: `ui/dist`.
5.  **Environment Variables**: Ensure `VITE_API_URL` points to your backend.

### Backend Orchestrator (Self-Hosted)

SIRIUSLY requires a Node.js runtime and a PostgreSQL-compatible database (like PGlite for local or AWS RDS for production).

1.  **Clone**: `git clone https://github.com/Sirius6907/siriusly.git`.
2.  **Install**: `pnpm install`.
3.  **Start**: `pnpm dev` (Local) or `npm start` (Production).

---

## 📜 License & Copyright

**MIT © 2026 SIRIUSLY INC.**  
Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software.

---

## 🌟 Star History

SIRIUSLY is Open Source under the MIT License. It was built specifically for exactingly rigorous engineers who want to run highly-effective autonomous companies, not sit around babysitting fragile, toy AI agents. 

[![Star History Chart](https://api.star-history.com/svg?repos=Sirius6907/siriusly&type=Date)](https://star-history.com/#Sirius6907/siriusly&Date)

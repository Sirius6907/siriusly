import fs from 'fs';

const additionalContent = `
---

## 📂 Deep Dive: Project File-by-File Reference

To achieve mastery over the SIRIUSLY ecosystem, one must understand the purpose of every critical file in the monorepo. This section provides an exhaustive breakdown of the directory structure and the specific responsibilities of key modules.

### 🏢 Server Module (\`server/src/\`)

The server module is the brain of the SIRIUSLY operations, functioning as an Express REST API and a background orchestration service.

#### \`server/src/app.ts\`
The primary Express application instance.
- **Middleware Integration**: Sets up CORS, JSON body parsing, and URL encoding.
- **Database Connection**: Initializes the connection to PostgreSQL or the local PGlite instance depending on the environment variables.
- **Route Mounting**: Registers the \`/api/companies\`, \`/api/agents\`, and \`/api/tasks\` endpoints.
- **UI Serving fallback**: Intelligently serves the static React build if running in a production execution context without a dedicated reverse proxy.

#### \`server/src/index.ts\`
The bootstrapper and process manager.
- Ensures \`dotenv\` loads environment variables before any other module is imported.
- Binds the Express app to the configured \`PORT\` (default 3100) or \`0.0.0.0\`.
- Handles \`SIGTERM\` and \`SIGINT\` for graceful shutdown of the orchestrator and database connections.

#### \`server/src/orchestrator.ts\`
The absolute core of the autonomous engine. The Orchestrator is a perpetual loop process.
- **Task Querying**: Continuously polls the \`tasks\` table for records where \`status === 'OPEN'\`.
- **Agent Resolution**: Resolves the \`assigned_to\` agent and checks their \`adapter_type\`.
- **Budget Enforcer**: Computes the historical spend of the agent. If \`current_spend >= max_budget\`, the task is immediately transitioned to \`FAILED\` with a budget exceeded error.
- **Dispatch**: Instantiates the correct execution adapter and hands off the mission payload.
- **Lifecycle Management**: Transitions tasks through \`ASSIGNED\`, \`COMPLETED\`, or \`FAILED\` based on adapter responses.

#### \`server/src/routes/agents.ts\`
The REST controller for Agent lifecycle management.
- **Creation**: Parses the configuration object.
- **Security Check**: Immediately encrypts sensitive fields like \`url\`, \`headers\`, or \`pem_key\` using AES-256-GCM before passing the record to the Drizzle ORM.
- **Retrieval**: Scrubs sensitive configuration data before returning agent profiles to the UI.

#### \`server/src/routes/companies.ts\`
The REST controller for organizational tenants.
- Enforces strict tenant isolation. An operator can only query or modify companies they have explicit access to.
- Manages the overarching mission statement that is injected into every agent prompt.

#### \`server/src/routes/tasks.ts\`
The REST controller for task management and logging.
- Handles the ingestion of new tasks from the UI.
- Provides endpoints for streaming or paginating activity logs associated with a specific task ID.

#### \`server/src/adapters/http/execute.ts\`
The production implementation for the HTTP adapter. 
- Utilizes \`axios\` for robust HTTP communication.
- Dynamically maps the configuration method (GET, POST, PUT).
- Parses custom headers (e.g., \`Authorization: Bearer <token>\`).
- Replaces template variables in the \`payloadTemplate\` with actual task instructions.
- Implements resilient error handling and timeout enforcement.

#### \`server/src/adapters/aws_openclaw/execute.ts\`
The adapter for securely executing scripts on remote AWS EC2 instances.
- Establishes secure SSH tunnels using the provided \`.pem\` key.
- Copies execution scripts to the remote host, executes them, captures stdout/stderr, and cleans up the remote environment.

#### \`server/src/adapters/process/execute.ts\`
The adapter for spawning local child processes.
- Useful for running CLI-based AI tools directly on the host machine.
- Manages stdin/stdout streams to capture the agent's reasoning process.

### 🎨 UI Module (\`ui/src/\`)

The UI module provides a premium, zero-latency dashboard for the human operator (Board of Directors).

#### \`ui/src/App.tsx\`
The React execution root.
- Initializes \`react-router-dom\` with browser routing.
- Wraps the application tree in global context providers (\`QueryClientProvider\` for React Query, \`CompanyProvider\` for tenant context).

#### \`ui/src/components/OnboardingWizard.tsx\`
The guided first-run experience.
- Progressively collects Company Name, Mission, and initial Agent configuration.
- Features the \`OnboardingLogo\` component for a high-fidelity visual introduction.

#### \`ui/src/components/AgentConfigForm.tsx\`
A highly dynamic and polymorphic configuration form.
- Conditionally renders fields based on the selected \`adapterType\`.
- Validates JSON inputs for HTTP headers and payload templates.
- Secures PEM key inputs by treating them as password-type fields in the DOM.

#### \`ui/src/pages/Dashboard.tsx\`
The primary operational command center.
- Connects to the \`/api/companies/:id/stats\` endpoints to render real-time graphs of task throughput and budget burndown.
- Features a live-updating table of recent tasks and their statuses.

---

## 📡 Complete REST API Reference

SIRIUSLY exposes a comprehensive, RESTful API. This allows developers to automate the control plane itself, integrating SIRIUSLY into existing enterprise CI/CD pipelines or custom dashboards.

### 1. Companies Engine

The Company is the root boundary of isolation. All agents and tasks belong to a Company.

| Endpoint | Method | Description | Content-Type |
| :--- | :--- | :--- | :--- |
| \`/api/companies\` | GET | List all organizations | \`application/json\` |
| \`/api/companies\` | POST | Initialize a new organization | \`application/json\` |
| \`/api/companies/:id\` | GET | Retrieve company details and core metadata | \`application/json\` |
| \`/api/companies/:id\` | PATCH | Update company name, description, or budget | \`application/json\` |
| \`/api/companies/:id/stats\` | GET | Retrieve aggregated statistics (tasks completed, total spend) | \`application/json\` |

#### Request Example: Initialize Organization
\`\`\`json
POST /api/companies
{
  "name": "Sirius Cybernetics Corp",
  "description": "Building autonomous starship navigation systems through recursive self-improvement.",
  "max_budget": 5000000 
}
\`\`\`
*(Note: max_budget is defined in cents)*

#### Response Example: 201 Created
\`\`\`json
{
  "id": "c1a2b3c4-d5e6-7f8g-9h0i-j1k2l3m4n5o6",
  "name": "Sirius Cybernetics Corp",
  "description": "Building autonomous starship navigation systems...",
  "created_at": "2026-03-30T12:00:00Z"
}
\`\`\`

### 2. Agent Management

Agents represent the workforce. They are configured with specific roles, budgets, and connection adapters.

| Endpoint | Method | Description | Content-Type |
| :--- | :--- | :--- | :--- |
| \`/api/agents\` | GET | List all agents for the active company context | \`application/json\` |
| \`/api/agents\` | POST | Configure and hire a new agent | \`application/json\` |
| \`/api/agents/:id\` | GET | Retrieve agent details (scrubbed of secrets) | \`application/json\` |
| \`/api/agents/:id\` | PATCH | Update role, budget constraints, or adapter config | \`application/json\` |
| \`/api/agents/:id\` | DELETE | Terminate/Offboard an agent | N/A |

#### Request Example: Create HTTP Agent
\`\`\`json
POST /api/agents
{
  "companyId": "c1a2b3c4-d5e6-7f8g-9h0i-j1k2l3m4n5o6",
  "name": "Visionary Pilot",
  "role": "Lead Navigator",
  "adapterType": "http",
  "max_budget": 100000,
  "config": {
    "url": "https://api.your-agent.com/v1/execute",
    "method": "POST",
    "headers": "{\\"Authorization\\": \\"Bearer sk-LIVE-1234567890\\", \\"Content-Type\\": \\"application/json\\"}",
    "payloadTemplate": "{\\"mission\\": \\"{{mission}}\\", \\"instruction\\": \\"{{prompt}}\\"}",
    "timeoutSec": 120
  }
}
\`\`\`

### 3. Task & Interaction Pipeline

Tasks are the units of work dispatched to agents.

| Endpoint | Method | Description | Content-Type |
| :--- | :--- | :--- | :--- |
| \`/api/tasks\` | GET | List tasks, supports \`?status=OPEN\` filtering | \`application/json\` |
| \`/api/tasks\` | POST | Submit a new mission/task | \`application/json\` |
| \`/api/tasks/:id\` | GET | View specific task status and final resolution | \`application/json\` |
| \`/api/tasks/:id/logs\` | GET | View full step-by-step activity audit logs | \`application/json\` |
| \`/api/tasks/:id\` | DELETE | Cancel a task (if currently OPEN) | N/A |

#### Request Example: Submit Task
\`\`\`json
POST /api/tasks
{
  "companyId": "c1a2b3c4-...",
  "assigned_to": "a1b2c3d4-...",
  "title": "Calculate Hyperdrive Trajectory",
  "prompt": "Analyze the sector maps and calculate the safest trajectory to Alpha Centauri avoiding asteroid fields."
}
\`\`\`

#### Task Status State Machine
- \`OPEN\`: Task has been written to the database but not yet picked up by the orchestrator.
- \`ASSIGNED\`: The orchestrator has locked the task and dispatched it to the adapter.
- \`COMPLETED\`: The adapter returned a successful execution code.
- \`FAILED\`: The adapter threw an error, the execution timed out, or the agent exceeded its budget constraint.

---

## 🏗️ Technical Internal Workflow: Task Execution Trace

When a task is submitted to SIRIUSLY, the system follows a deterministic, highly-auditable internal trace to ensure reliability and budget strictness.

1. **Submission & Ingestion**: 
   The \`TaskService\` receives the HTTP POST request, validates the payload structure using Zod schemas, and inserts the record into the \`tasks\` table with \`status: 'OPEN'\` and a generated UUID.

2. **Orchestrator Detection**: 
   The background \`Orchestrator\` Pulse (running concurrently on a configurable 5-second interval) queries the database for all \`OPEN\` tasks. It locks the task to prevent concurrent workers from picking it up.

3. **Budget Verification (The Hard-Stop Gateway)**: 
   The system calculates the total historical spend for the target agent by aggregating completed tasks. 
   - If \`current_spend < max_budget\`, the pipeline proceeds.
   - If \`current_spend >= max_budget\`, the Orchestrator immediately aborts, logs a \`BUDGET_EXCEEDED\` error, and marks the task as \`FAILED\`. This is the fundamental safeguard against runaway AI loops.

4. **Adapter Initialization**: 
   The \`ExecutionFactory\` reads the agent's \`adapter_type\` (\`http\`, \`aws_openclaw\`, \`process\`) and instantiates the specific class handling that protocol.

5. **Secret Decryption**: 
   Encrypted configuration secrets (API keys, URLs, PEM files) are retrieved from the \`agents\` table. The \`CryptoService\` uses the master application secret to decrypt these values purely in-memory. They are never logged to stdout or saved to disk.

6. **Payload Construction**: 
   The adapter combines the Company's overarching \`mission\` context with the specific task \`prompt\` to construct the final execution payload. For the HTTP adapter, this involves rendering the \`payloadTemplate\`.

7. **Delivery & Execution**: 
   The adapter makes the network call or spawns the local process. The Orchestrator initiates a timeout timer (configurable per agent).

8. **Streaming & Observability (Optional)**: 
   If the remote agent supports streaming, partial chunk results are proactively written to the \`activity_logs\` table, allowing the UI to render real-time progress to the human operator.

9. **Rejuvenation & Finalization**: 
   Upon completion, the adapter parses the final output. The \`tasks\` table is updated to \`COMPLETED\` or \`FAILED\`, and the exact execution duration and estimated cost are appended to the task metadata.

---

## 🔐 Advanced Security & Network Architecture

SIRIUSLY is designed to orchestrate agents that may execute arbitrary code or interact with sensitive external APIs. Consequently, security is the foundational pillar of the platform.

### 1. Encryption At Rest
All sensitive agent connection configurations are fully encrypted at rest within the PostgreSQL database.
- **Algorithm**: AES-256-GCM
- **Key Management**: SIRIUSLY requires a \`SIRIUSLY_MASTER_KEY\` environment variable. If this key is lost, all agent connection configurations are irrevocably unreadable.
- **Implementation**: The \`CryptoService\` automatically intercepts database reads/writes for the \`config\` column on the \`agents\` table.

### 2. Multi-Tiered Network Isolation
Depending on the adapter utilized, SIRIUSLY supports varying degrees of isolation:

#### Tier 1: The \`http\` Adapter (Maximum Security)
The safest execution model. SIRIUSLY acts merely as a webhook trigger. The actual AI agent logic, code execution, and environmental access occur on an entirely separate network (e.g., a managed API or isolated container). If the agent is compromised, the SIRIUSLY control plane remains untouched.

#### Tier 2: The \`aws_openclaw\` Adapter (High Security)
SIRIUSLY establishes an SSH connection to a remote EC2 instance. The EC2 instance can be configured in an isolated VPC with no inbound internet access except from the SIRIUSLY IP. Code is executed remotely, and only the \`stdout\`/\`stderr\` results are returned over the secure tunnel.

#### Tier 3: The \`process\` Adapter (Low Security - Development Only)
The agent process is spawned directly on the machine running the SIRIUSLY server. This gives the agent access to the local filesystem and network. This adapter is strictly recommended for local development and prototyping, **never** for public-facing production deployments.

### 3. API Authentication & Rate Limiting
For production deployments, the SIRIUSLY Express API should be placed behind a reverse proxy (e.g., Nginx, HAProxy) or API Gateway that enforces:
- **Rate Limiting**: To prevent DDoS attacks against the orchestrator endpoints.
- **JWT Authorization**: All endpoints under \`/api/*\` must be secured with proper authorization tokens matching the user to the requested \`company_id\`.

---

## 📈 Database Indexing & Performance Tuning

To maintain low latency as the organization scales to millions of tasks, SIRIUSLY relies on optimized database structures.

### Critical Indexes
- **\`tasks.company_id\` & \`tasks.status\`**: The Orchestrator frequently queries \`SELECT * FROM tasks WHERE status = 'OPEN'\`. A compound index on these fields ensures sub-millisecond query times.
- **\`agents.company_id\`**: Accelerates agent retrieval during task assignment and budget calculation.
- **\`activity_logs.task_id\`**: Essential for fast retrieval of execution histories when viewing the UI dashboard.

### Connection Pooling
The Drizzle ORM is configured to utilize connection pooling via \`pg\` or \`postgres.js\`. For high-throughput environments, ensure the \`DATABASE_MAX_CONNECTIONS\` environment variable is tuned appropriately for your PostgreSQL instance size.

---

## 🛳️ Deployment Playbooks

### Playbook A: Single-Node Docker (Recommended for SMB)
The simplest production deployment involves running both the API and UI in a single Docker container.
1. Build the UI: \`pnpm --filter ui build\`
2. Build the Server: \`pnpm --filter server build\`
3. The server is configured to serve the UI static files from \`ui/dist\` if \`NODE_ENV=production\`.
4. Deploy the combined Docker image to AWS AppRunner, Google Cloud Run, or Render.

### Playbook B: High-Availability Split Tier (Recommended for Enterprise)
For organizations managing thousands of agents, split the architecture.
1. **Database**: Managed PostgreSQL (AWS RDS or Supabase).
2. **Control Plane (API/Orchestrator)**: Deploy the \`/server\` module across multiple load-balanced containers. Ensure the \`Orchestrator\` interval is backed by a Redis lock or database advisory lock to prevent dual-dispatching of tasks.
3. **Frontend (UI)**: Deploy the \`/ui\` module to a global CDN like Netlify or Vercel for lightning-fast edge delivery.

---

## 🚨 Troubleshooting & Diagnostics

### Diagnostic Commands
If the orchestrator halts or agents fail to respond, utilize the following diagnostic patterns:

**1. Check Orchestrator Pulse**
Verify that the server logs periodically output \`[Orchestrator] Scanning for open tasks...\`. If this is missing, the interval timer may have crashed.

**2. Verify Database Connection**
Ensure PostgreSQL is reachable. In development with PGlite, ensure the \`data/pglite\` directory has proper read/write permissions.

**3. Inspect Encrypted Payloads**
If an agent returns HTTP 401 Unauthorized using the \`http\` adapter, the encrypted API key might be malformed. To debug safely, create a mock endpoint (using a service like webhook.site) and point a test Agent to it. Inspect the captured headers to verify the Decryption service is functioning correctly.

### Common Exceptions

| Error Code | Description | Resolution |
| :--- | :--- | :--- |
| \`ADAPTER_NOT_FOUND\` | The requested adapter type is not registered. | Ensure the adapter is exported in \`server/src/adapters/index.ts\`. |
| \`BUDGET_EXCEEDED\` | Agent has spent more than their allocated limit. | Increase the agent's \`max_budget\` via the UI or API. |
| \`DECRYPTION_FAILED\` | The \`SIRIUSLY_MASTER_KEY\` has changed. | Revert to the original master key, or re-enter agent credentials. |
| \`PG_CONNECTION_ERROR\` | Cannot reach PostgreSQL. | Check \`DATABASE_URL\` format and network firewalls. |

---

## 🔮 Roadmap (v2.0 & Beyond)

SIRIUSLY v1.0 establishes the foundational control plane. The v2.0 roadmap focuses on exponential organizational complexity and deeper human-machine synthesis.

### Phase 1: Agent Swarming & Hierarchies
- **Departmental Grouping**: Organize agents into distinct departments (e.g., Engineering, Marketing) with shared departmental budgets.
- **Inter-Agent Communication**: Allow agents to dispatch sub-tasks directly to other agents via the SIRIUSLY API, effectively creating a recursive management structure.

### Phase 2: Native Developer Integrations
- **IDE Extensions**: Direct integrations with VS Code, Cursor, and JetBrains. View assigned SIRIUSLY tasks, approve budget requests, and review code diffs without leaving the editor.
- **GitOps Workflows**: Automatic task generation based on GitHub Issues or Jira tickets.

### Phase 3: Ubiquitous Control Interfaces
- **Voice-Activated Board Meetings**: Connect SIRIUSLY to high-fidelity TTS/STT engines (like OpenAI Realtime API) to request status reports and issue commands audibly.
- **Mobile C-Suite**: A dedicated iOS/Android dashboard for monitoring company vitals and approving high-stakes decisions on the go.

---

## 🤝 Contributing to the Revolution

We believe the transition to Zero-Human operational mechanics is the most significant economic shift since the industrial revolution. We welcome contributions from engineers, researchers, and visionaries.

### Submission Guidelines
1. **Fork the Repository**: Create your feature branch (\`git checkout -b feature/AmazingFeature\`).
2. **Strict Adherence**: Follow the rules defined in \`AGENTS.md\`. Ensure all changes are organization-scoped and maintain complete budget invariants.
3. **Test Comprehensively**: \`pnpm test:run\` must pass. Any new adapter integration requires mock tests.
4. **Commit & Push**: Commit your changes (\`git commit -m 'Add some AmazingFeature'\`) and open a Pull Request.

### Code of Conduct
We enforce a strict code of conduct emphasizing technical excellence, radical candor, and respect for the monumental impact of our underlying technology.

---

*© 2026 SIRIUS — Orchestrated Excellence. Built for the era of autonomous capital.*
`;

fs.appendFileSync('README.md', additionalContent);
console.log('Appended deep-dive content to README.md');

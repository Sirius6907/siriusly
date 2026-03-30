export const type = "aws_openclaw";
export const label = "AWS OpenClaw (EC2)";

export const models: { id: string; label: string }[] = [];

export const agentConfigurationDoc = `# aws_openclaw agent configuration

Adapter: aws_openclaw

Use when:
- You have an OpenClaw instance running on an AWS EC2 server and want SiriusEcoSystem to control it remotely.
- You prefer SSH-based connectivity (port 22) to the remote agent.
- You need to connect multiple remote EC2 agents, each configured with its own SSH credentials.
- You want to use AWS SSM Session Manager instead of direct SSH for IAM-based auth.

Don't use when:
- The agent is running locally on the same machine as SiriusEcoSystem (use opencode_local, claude_local, etc.).
- The remote OpenClaw instance exposes a WebSocket gateway (use openclaw_gateway instead).
- You need the SiriusEcoSystem server to install OpenClaw on the EC2 instance (do that manually first).

Authentication methods (in priority order):
1. PEM key file path (recommended): Set privateKeyPath to the absolute path of your .pem file.
2. Inline private key: Paste the full PEM content into privateKey field.
3. AWS SSM Session Manager: Set instanceId and region; requires AWS CLI configured with IAM credentials on the SiriusEcoSystem host.

Core fields:
- host (string, required unless using SSM): EC2 public IP or hostname
- port (number, optional, default 22): SSH port
- username (string, optional, default "ec2-user"): SSH username
- privateKeyPath (string, optional): absolute path to SSH private key (.pem file)
- privateKey (string, optional): inline SSH private key content (PEM format)
- passphrase (string, optional): passphrase for encrypted private keys

AWS SSM fields (alternative to SSH):
- instanceId (string, optional): EC2 instance ID (e.g. i-0abcdef1234567890) for SSM
- region (string, optional): AWS region (e.g. us-east-1) for SSM

Remote execution fields:
- openclawCommand (string, optional, default "openclaw"): remote OpenClaw binary name or path
- openclawCwd (string, optional): remote working directory for the agent
- model (string, optional): model to use on the remote instance
- promptTemplate (string, optional): prompt template with {{variable}} substitution
- timeoutSec (number, optional, default 300): execution timeout in seconds
- env (object, optional): extra environment variables to set on the remote

Session fields:
- sessionKeyStrategy (string, optional, default "issue"): issue, fixed, or run
- sessionKey (string, optional): fixed session key when strategy=fixed

One agent per EC2 instance. Each agent gets its own SSH config pointing to a specific EC2 server.
`;

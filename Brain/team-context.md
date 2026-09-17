# Project Context: AI Agent Permission & Audit Layer

_Share this file with your Claude to get it up to speed on our hackathon project._

## Event

- WeMakeDevs + AWS "First Commit" hackathon (Bharat Builds Tour), September 17–20, 2026
- Track: **Ship It**
- Team: 4 people — AWS/infra lead (Aaditya), backend dev, frontend dev, generalist group leader

## The Problem We're Solving

AI agents are increasingly given the ability to **take real actions** (refunds, database updates, API calls) — not just answer questions. But there's no good way today to:

1. Define fine-grained, declarative rules for what an agent is allowed to do
2. Keep an immutable audit trail proving why an action was allowed or blocked
3. Cleanly separate "the AI deciding what to try" from "the system deciding what's permitted"

This is a real governance gap in agentic AI deployment — not a toy problem. AWS itself built Cedar specifically for this class of authorization problem.

## Our Solution — Simple Version

Think of it like a new employee (the AI agent) with no rulebook. We're adding two things:

1. **A bouncer** — before the agent does anything, it must ask "am I allowed to do this?" A policy engine (Cedar) checks explicit rules and returns ALLOW/DENY with a reason.
2. **A CCTV + logbook** — every attempted action (allowed or denied) gets permanently logged and made searchable (OpenSearch), so anyone can later ask "what did the agent do?" or "why was this blocked?"

## Architecture

```
User/Task → Strands Agent (reasoning + tool calls)
              ↓ proposes an action
          Cedar Policy Engine (ALLOW/DENY + reason)
              ↓ if allowed
          Action Executor (acts on sandboxed backend resources)
              ↓ always, regardless of allow/deny
          OpenSearch (immutable audit log: what, when, who, why)
```

## Tech Stack

- **Strands Agents SDK** — agent framework (model-provider-agnostic; swapping providers is just a config change)
- **Amazon Bedrock** — model provider, targeting Amazon Nova Micro/Lite (chosen for cost: ~7–30x cheaper per token than Claude Haiku, and no extra "usage form" friction that Anthropic models require)
- **Cedar** — the policy/permission layer (the "bouncer")
- **OpenSearch** — audit log storage (the "logbook")
- **AWS SAM** — simulates backend resources the agent acts on
- **AWS CLI + boto3** — infra interaction
- Local fallback model: Ollama (Qwen2.5-Coder-1.5B) — used during early local dev before Bedrock access was pursued
- Backup model provider path: Omniroute proxy, if Bedrock access isn't resolved in time

## Current Blocker (as of Sept 16, evening before kickoff)

**Bedrock is returning `ValidationException: Operation not allowed` on every model invocation attempt**, despite:

- $100 in Bedrock credits available
- Account-level payment verification completed
- A dedicated IAM user created (`Aaditya-dev`) with PowerUserAccess + AmazonBedrockFullAccess + IAMUserChangePassword — same error persists, ruling out an IAM/permissions cause
- Tried multiple models (Nova 2 Lite, Nova Lite, Nova Micro) and multiple regions (Stockholm, us-east-1) — same error persists, ruling out model/region availability

**Root cause identified:** this is a documented, known restriction on **new AWS accounts** — Bedrock invoke access can be gated at the account level based on billing history, independent of IAM config, model choice, or region. Not fixable via configuration.

**Resolution path:**

1. Open a free AWS Support case (Account & Billing category) requesting the restriction be reviewed
2. In parallel, check if any teammate has an older/more established AWS account we could use instead
3. Fallback: use the Omniroute proxy as the model provider instead of Bedrock — Strands doesn't require Bedrock specifically, so this keeps the agent demo working even if Bedrock access isn't resolved in time. We'd lose some "AWS-native" pitch value but keep a working demo, which matters more.

## Key Learnings (don't relearn these)

- Strands SDK is model-provider-agnostic — switching between Ollama/Bedrock/Omniroute is a config change, not an architectural rewrite
- Small local models (like Qwen2.5-Coder-1.5B via Ollama) struggle with reliable tool-calling — they tend to echo JSON instead of executing tools. This is why we moved toward Bedrock/larger models.
- LocalStack/Docker setup was abandoned on Aaditya's Windows machine due to missing WSL2 feature packages — not worth fixing under hackathon time constraints. Don't retry this path unless someone has a working Docker+WSL2 setup already.
- AWS credits deduct automatically before any linked payment method is charged.

## Team Roles

- **Aaditya (AWS/infra):** Bedrock setup, Strands agent config, Cedar policy integration
- **Backend dev:** action executor logic (functions the agent actually calls), OpenSearch logging integration
- **Frontend dev:** dashboard/UI showing agent actions, audit log, allow/deny decisions
- **Group lead:** demo narrative, pitch, coordination

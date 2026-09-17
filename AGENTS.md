# AGENTS.md — AI Agent Permission & Audit Layer

Cross-tool project context (read by Antigravity, Cursor, Claude Code, Codex).
This file is the single source of truth for what this project is, how it's
organized, and what conventions to follow. Keep it updated as the codebase
evolves — stale context is worse than no context.

## What this project is

An AI agent (built on the Strands Agents SDK, backed by Amazon Bedrock) that
can execute real actions — issuing refunds, updating records, etc. Before any
action runs, it must pass a Cedar policy check (allow/deny). Every decision,
allowed or denied, is logged immutably to OpenSearch, so there's always an
answer to "why did the agent do — or not do — that?"

Built for the WeMakeDevs × AWS **First Commit** hackathon (Bharat Builds
Tour), Sept 17–20, 2026. Track: Ship It.

## Architecture — data flow

```
Agent (Strands + Bedrock)
  --> authorize request -->  Policy layer (Cedar)
  <-- allow/deny + reason --
  --> if allowed -->         Executor (runs the actual action)
                              |
                              v
                          Audit log (OpenSearch, every decision recorded)
                              |
                              v
                     Frontend dashboard (React) — live feed, log search, policy viewer
```

Full JSON contracts for every arrow in this diagram are in
`docs/interfaces.md`. Treat that file as authoritative for request/response
shapes — if you change a shape, update that file in the same commit.

## Repo layout & ownership

| Folder | Owner | Contents |
|---|---|---|
| `agent/` | Agent teammate | Strands agent entrypoint (`main.py`), `@tool`-decorated functions (`tools.py`), Bedrock model config (`model_config.py`) |
| `policy/` | Aaditya | Cedar policies (`policies/*.cedar`), entity/action schema (`schema.json`), the authorization wrapper (`authorize.py`), policy tests (`test_policies.py`) |
| `executor/` | Aaditya + backend teammate | The functions that actually perform an allowed action (`actions.py`) against sandbox/demo data (`sandbox_resources.py`) |
| `audit/` | Aaditya | Writes decisions to OpenSearch (`logger.py`), search/filter helpers (`query_helpers.py`) |
| `infra/` | Aaditya | AWS SAM template (`template.yaml`), deploy script (`deploy.sh`) |
| `frontend/` | Frontend teammate | React (Vite) dashboard — live action feed, audit log browser, policy viewer |
| `docs/` | Shared | Problem statement, team context, interface contracts, architecture diagram |

Don't edit outside your owned folder without checking with whoever owns it —
this keeps parallel development from causing merge conflicts.

## Tech stack

- **Agent framework:** Strands Agents SDK (model-provider-agnostic — swapping
  providers is a config change in `agent/model_config.py`, not an
  architectural one)
- **Model provider:** Amazon Bedrock (Nova Micro/Lite preferred for cost).
  Bedrock access on the team's own new AWS account was blocked at the
  account level (`ValidationException: Operation not allowed`, unrelated to
  IAM); working around this by using a teammate's existing AWS account for
  Bedrock calls
- **Policy engine:** Cedar (`cedar-policy` Python package) — default-deny
  posture; every allowed action needs an explicit `permit` policy in
  `policy/policies/`
- **Audit store:** Amazon OpenSearch
- **Infra:** AWS SAM (Lambda + API Gateway + DynamoDB where needed)
- **Frontend:** React + Vite (not Next.js — team switched from an earlier
  Next.js-shaped plan)
- **Language:** Python 3.12 for agent/policy/executor/audit; JavaScript
  (JSX) for frontend

## Setup

```bash
python -m venv .venv
source .venv/bin/activate        # .venv\Scripts\activate on Windows
pip install -r requirements.txt
cp .env.example .env             # fill in real values, never commit .env
cd frontend && npm install
```

## Conventions

- **Default-deny.** Cedar policies only grant permissions explicitly; never
  write a "deny" rule to block something — omit the `permit` instead.
- **JSON contracts live in `docs/interfaces.md`.** Don't invent a different
  shape for a request/response without updating that file first.
- **Secrets never get committed.** Real credentials go in `.env` (gitignored);
  `.env.example` documents the variable names only.
- **Sandbox/demo data**, not a real backend, is fine for the hackathon demo —
  see `executor/sandbox_resources.py`.
- **AWS must be visibly used in the demo video**, not just mentioned in the
  writeup — keep this in mind when building the demo flow.

## Branching

Small team, tight timeline: everyone commits to `main` directly, `git pull`
before every `git push`. No feature-branch requirement unless a teammate
wants isolation for a risky change.

## AI tools used (for hackathon writeup)

- Claude (Anthropic) — architecture planning, code scaffolding, debugging

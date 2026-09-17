---
description: Deep codebase context for the AI Agent Permission & Audit Layer — module responsibilities, current implementation status, and where stubs still need real logic.
---

# Project context

This rule supplements the root `AGENTS.md` with implementation-level detail
so an agent working in this repo doesn't need to re-derive it by reading
every file first.

## Current implementation status

Everything below `policy/`, `executor/`, and `audit/` is currently
**scaffolded with working structure but placeholder logic** — the shapes
and function signatures are final (per `docs/interfaces.md`), but core logic
is stubbed. Specifically:

- `policy/authorize.py` — `authorize()` currently always returns a hardcoded
  Deny. Needs real Cedar evaluation (via the `cedar-policy` package) against
  `policy/policies/base.cedar` and `policy/schema.json`.
- `audit/logger.py` — `_get_client()` raises `NotImplementedError`. Needs a
  real OpenSearch client (`opensearchpy.OpenSearch`) configured from env vars
  (`OPENSEARCH_HOST`, `OPENSEARCH_PORT`). Currently prints to stdout as a
  placeholder so the rest of the pipeline can be tested without OpenSearch
  being live yet.
- `audit/query_helpers.py` — both functions raise `NotImplementedError`,
  waiting on the same OpenSearch client as `logger.py`.
- `executor/sandbox_resources.py` — in-memory fake order data
  (`_ORDERS` dict). This is intentional for the hackathon demo, not a bug —
  don't "fix" it into a real database unless there's time to spare.
- `agent/` and `frontend/` — owned by other teammates; do not scaffold or
  modify without coordinating with them (see ownership table in `AGENTS.md`).

## Module responsibilities (one-liners)

- `policy/authorize.py::authorize(request)` — takes an action request
  (see `docs/interfaces.md` §1), returns a decision (§2)
- `executor/actions.py::issue_refund/read_order` — takes resource + context,
  returns an action result (§3)
- `audit/logger.py::log_decision(decision, action_result)` — combines §2 + §3
  into one audit log entry (§4) and persists it
- `audit/query_helpers.py::search_logs/get_log_by_id` — reads §4 entries back
  out for the dashboard

## When implementing real logic

- Follow the exact field names/types in `docs/interfaces.md` — the frontend
  and agent teammates are building against those shapes already.
- Keep `policy/test_policies.py` passing (or update it) when you wire in real
  Cedar evaluation — it currently only checks the response has a `decision`
  key, so it won't catch semantic bugs; tighten it as this gets built out.
- Don't add a real database — the hackathon timeline favors the in-memory
  sandbox approach already in place.

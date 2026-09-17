---
description: Deep codebase context for the AI Agent Permission & Audit Layer — module responsibilities, current implementation status, and where stubs still need real logic.
---

# Project context

This rule supplements the root `AGENTS.md` with implementation-level detail
so an agent working in this repo doesn't need to re-derive it by reading
every file first.

## Current implementation status

The core policy, execution, audit, and pipeline layers are **fully implemented and verified working**:

- `policy/authorize.py` — Fully implemented with real Cedar evaluation (via the `cedar` package) evaluating `policy/policies/*.cedar` against `policy/schema.json`. Normalizes numeric context and parses entity UIDs.
- `executor/actions.py` & `executor/sandbox_resources.py` — Action dispatcher and sandbox order data (`_ORDERS` dict) with refund accumulation and order query support. In-memory data is intentional for the hackathon demo.
- `audit/logger.py` — Fully implemented with `get_opensearch_client()` and `log_decision()` creating UUID-tracked audit logs persisting to live Amazon OpenSearch (with graceful stdout fallback if OpenSearch is offline).
- `audit/query_helpers.py` — Fully implemented `search_logs()` (supporting filters on agent and decision with timestamp sorting) and `get_log_by_id()` querying the OpenSearch index.
- `pipeline.py` — End-to-end pipeline coordinator chaining `authorize()` -> conditional `execute_action()` -> `log_decision()`. Verified end-to-end against live Amazon OpenSearch cluster for both Allow and Deny paths.
- `agent/` and `frontend/` — Owned by teammates; do not scaffold or modify without coordinating with them (see ownership table in `AGENTS.md`).

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

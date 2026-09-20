# Interfaces

JSON contracts between the four layers: **agent → policy → executor → audit**.
Everyone should build against these shapes so the pieces plug together
without last-minute integration surprises.

If a contract needs to change, update this file first and ping the team —
don't silently drift.

---

## 1. Agent → Policy (`authorize` request)

Sent when the agent wants to take an action and needs a decision.

```json
{
  "principal": "Agent::\"refund-bot\"",
  "action": "Action::\"IssueRefund\"",
  "resource": "Order::\"12345\"",
  "context": {
    "amount": 49.99,
    "currency": "USD"
  }
}
```

| Field       | Type   | Notes                                                        |
|-------------|--------|---------------------------------------------------------------|
| `principal` | string | Cedar entity UID for the agent making the request            |
| `action`    | string | Cedar action UID — must match an action defined in `schema.json` |
| `resource`  | string | Cedar entity UID for the thing being acted on                |
| `context`   | object | Action-specific extra data used in policy conditions (e.g. amount limits) |

---

## 2. Policy → Executor / Audit (`authorize` response)

Returned by `policy/authorize.py`. Consumed by both the executor (to decide
whether to run the action) and the audit logger (to record the decision).

```json
{
  "decision": "Allow",
  "reason": "Matched policy: refund-under-100",
  "policy_id": "base.cedar#refund-under-100"
}
```

| Field       | Type          | Notes                                              |
|-------------|---------------|-----------------------------------------------------|
| `decision`  | "Allow" \| "Deny" | The authorization outcome                       |
| `reason`    | string        | Human-readable explanation, shown in the dashboard |
| `policy_id` | string \| null | Which policy matched (null if denied by default-deny) |

---

## 3. Executor → Audit (`action_result`)

Returned by functions in `executor/actions.py` after an allowed action runs.
`null` if the action was denied and never executed.

```json
{
  "status": "success",
  "action": "IssueRefund",
  "order_id": "12345",
  "amount": 40,
  "refunded_total": 40
}
```

| Field    | Type   | Notes                                          |
|----------|--------|--------------------------------------------------|
| `status` | "success" \| "error" | Whether the action completed          |
| `action` | string | Matches the Cedar action name                   |
| ...      |        | Remaining fields vary per action (see `actions.py`) |

On error:

```json
{
  "status": "error",
  "message": "Order 99999 not found"
}
```

---

## 4. Audit log entry (stored in OpenSearch, and returned by the API)

Written by `audit/logger.py`. This is what the frontend's log browser and
live action feed read (via the backend API). This is also the exact shape
returned by `POST /api/authorize` — the API returns the full audit entry
that was just created, not just the raw decision from section 2.

```json
{
  "id": "b3f1c2e0-...-uuid",
  "timestamp": "2026-09-17T10:15:30.000Z",
  "decision": "Allow",
  "reason": "Matched policy: refund-under-100",
  "policy_id": "base.cedar#refund-under-100",
  "action_result": {
    "status": "success",
    "action": "IssueRefund",
    "order_id": "12345",
    "amount": 40,
    "refunded_total": 40
  },
  "principal": "Agent::\"refund-bot\"",
  "action": "Action::\"IssueRefund\"",
  "resource": "Order::\"12345\"",
  "context": {
    "amount": 40,
    "currency": "USD"
  }
}
```

| Field           | Type          | Notes                                       |
|-----------------|---------------|-----------------------------------------------|
| `id`            | string (uuid) | Unique log entry ID                          |
| `timestamp`     | ISO 8601 string | UTC timestamp of the decision              |
| `decision`      | "Allow" \| "Deny" | Same as section 2                       |
| `reason`        | string        | Same as section 2                            |
| `policy_id`     | string \| null | Same as section 2                           |
| `action_result` | object \| null | Section 3 output, or null if denied         |
| `principal`     | string        | Same as section 1 — which agent made the request |
| `action`        | string        | Same as section 1                            |
| `resource`      | string        | Same as section 1                            |
| `context`       | object        | Same as section 1                            |

---

## 5. Backend API (for frontend consumption)

Implemented in `api/`. All routes are unauthenticated for the demo — no
API key or auth token required. CORS is open to all origins.

- `GET /api/logs?agent=&decision=&limit=` → array of audit log entries (section 4)
- `GET /api/logs/:id` → single audit log entry (section 4)
- `POST /api/authorize` → runs sections 1–4 end-to-end, returns the full audit log entry created (section 4 shape)
- `GET /api/agents` → list of known agent principals (hardcoded for the demo, e.g. `["refund-bot"]`)
- `GET /api/policies` → list of loaded Cedar policies (raw `.cedar` text + metadata)

Base URL for local development: `http://localhost:8000`

---

## Resolved decisions

- **Frontend calls the executor directly, or only reads from the audit log?**
  Neither exactly — the frontend calls `POST /api/authorize`, which runs
  the full pipeline (policy check, then executor if allowed, then audit
  log write) in one call. The frontend never calls the executor directly,
  and `GET /api/logs` is read-only for browsing history.
- **Auth on the API routes?** None for the demo — open for local
  development and the hackathon submission.
- **Polling interval for the live action feed, or websocket-based?**
  (Confirm with frontend implementation — update this line once decided.)
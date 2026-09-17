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
  "policy_id": "base.cedar#1"
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
  "amount": 49.99
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

## 4. Audit log entry (stored in OpenSearch)

Written by `audit/logger.py`. This is what the frontend's log browser and
live action feed read (via the backend API).

```json
{
  "id": "b3f1c2e0-...-uuid",
  "timestamp": "2026-09-17T10:15:30.000Z",
  "decision": "Allow",
  "reason": "Matched policy: refund-under-100",
  "policy_id": "base.cedar#1",
  "action_result": {
    "status": "success",
    "action": "IssueRefund",
    "order_id": "12345",
    "amount": 49.99
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

---

## 5. Backend API (for frontend consumption)

Rough shape the frontend should expect — finalize once the backend/executor
API routes are built.

- `GET /api/logs?agent=&decision=&limit=` → array of audit log entries (section 4)
- `GET /api/logs/:id` → single audit log entry (section 4)
- `POST /api/authorize` → runs sections 1–4 end-to-end, returns the audit log entry created
- `GET /api/agents` → list of known agent principals
- `GET /api/policies` → list of loaded Cedar policies (raw `.cedar` text + metadata)

---

## Open questions (fill in as decided)

- [ ] Does the frontend call the executor directly, or only read from the audit log?
- [ ] Auth on the API routes (none for demo, or basic API key)?
- [ ] Polling interval for the live action feed, or is it websocket-based?
# Cedar Sentinel frontend

React + Vite + Tailwind CSS, with Lucide icons and locally bundled open-source fonts.

## Run

From `/Users/jackobito/Downloads/Cedar-Sentinel-local/frontend`:

    npm install
    npm run dev

Open http://127.0.0.1:5173 (or the address printed by Vite if that port is occupied).

Routes:
- `#/` — Pi.security-inspired landing page
- `#/app/dashboard` — unavailable metrics and empty recent decisions and policies
- `#/app/commands` — disabled request form and empty results
- `#/app/audit` — empty audit log with collapsed **Filter events** controls; event-card and **Event JSON** rendering retained for future data

## Verify

From the same frontend directory:

    npm test
    npm run build
    npx playwright install chromium
    npm run test:e2e

Playwright uses port 5173 and starts the dev server when needed. No lint or
typecheck scripts are currently configured in `package.json`.

## Scope and limitations

This is a frontend-only interface, not a production security boundary. No backend
is connected, and no AWS resources, credentials, AI models, Cedar engine, or
OpenSearch are called. The console displays **BACKEND NOT CONNECTED** and an
integration-unavailable notice.

The app performs no mock execution, seeds no data, and neither reads nor writes
browser storage. There is no persisted request history or audit data.

Dashboard metrics are unavailable, not zero-valued measurements. Recent decisions
and policies remain empty. The command center's task field and submit button are
disabled; no requests run and no results are generated.

The audit route receives an empty entries array. Search, agent/decision filters,
reset controls, event-card rendering, and native **Event JSON** disclosures remain
implemented, but there are no events to display or inspect until data is supplied.

The landing page's policy example is illustrative only; it does not evaluate or
enforce authorization. There are no customer claims or telemetry scripts.

## Integration seam

Add a backend adapter after the API routes and contracts in `../docs/interfaces.md`
are finalized. Wire backend data into the dashboard, command center, and audit
route, replacing unavailable and empty states only when real data is available.
Enable request submission only when backend integration is ready, with loading
and error handling rather than simulated results.

The retained audit renderer expects `id`, `timestamp`, `decision`, `reason`, and
`policy_id`, plus `agent_id`, `action`, `resource`, and `task` for display and
filtering. Reconcile those additional fields with the documented audit contract;
**Event JSON** renders the full supplied entry, including any `action_result`.
Authorization and execution enforcement must remain on the backend, independently
of this UI. Browser state must not be treated as authoritative audit storage.

## Visual direction

The supplied `../source code.md` and its linked CSS informed the navy/orange/teal
palette, serif italic headlines, mono labels, and icy surfaces. This implementation
uses original Cedar Sentinel branding and CSS scenery rather than Pi's proprietary
fonts, videos, logos, testimonials, or tracking integrations. It is inspired by the
reference, not a pixel-identical copy. The older Vercel design notes were not applied.

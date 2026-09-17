**Act as a Senior React Developer.**

**Context:**
We are building a **AI Agent Permission & Audit Layer** (the "Bouncer + Camera" system for AI agents).
*   **Backend:** My teammates are handling the Strands Agent, Cedar Policy Engine, and OpenSearch.
*   **Frontend:** You are building the entire user interface.

**Your Task:**
Create a production-ready **React Application** with the following three main views:
1.  **Dashboard:** High-level metrics (Total Actions, Denial Rate, Last Audit).
2.  **Command Center:** A chat-like interface where the user inputs tasks. It must display:
    *   The Agent's Reasoning (Mocked).
    *   The **Cedar Decision** (ALLOW/DENY) clearly highlighted with a Badge.
    *   The Execution Result.
3.  **Audit Log:** A search-and-filter table displaying the immutable history from OpenSearch (mock the data fetching for now).

**Tech Stack:**
*   React (Hooks).
*   Tailwind CSS (for styling).
*   Lucide React (for icons).
*   Vite (for the build tool).
*   State Management: React Context or `useState` only.

**Requirements:**
1.  **Mock API Handling:** Since the backend is not ready, write your own mock functions (`mockFetchCommands`, `mockFetchAuditLog`) that return the following JSON structure:
    *   Command Center Response: `{ status: "ALLOWED" | "DENY", agent_reason: "...", policy_decision: { decision: "...", reason: "..." }, execution_result: { ... } }`
    *   Audit Log Response: Array of objects with `timestamp`, `agent_id`, `action`, `decision`, `reason`, `resource`.
2.  **UI/UX Style:** Enterprise, clean, and responsive (like AWS Console or Vercel). Use Emerald Green for "Allow" and Rose Red for "Deny".
3.  **Structure:** Organize code into separate files (`Dashboard.jsx`, `CommandCenter.jsx`, `AuditLog.jsx`, `Sidebar.jsx`).

**Deliverable:**
Provide the complete code for `src/App.jsx`, `src/main.jsx`, and all component files, plus instructions on how to install dependencies (`npm install ...`).
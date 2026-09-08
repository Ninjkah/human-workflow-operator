# Implementation notes for an AI code agent

Build this project as a Tauri 2 application using React + TypeScript.

Safety boundary:
- Keep the human checkpoint as a hard state transition.
- Do not add code that logs into multiple YouTube accounts automatically.
- Do not add code that rotates proxies/VPN endpoints or wipes cookies to disguise identity.
- Do not add selectors, APIs, or scripts that click YouTube's Like button automatically.
- Account authorization should use OAuth and must not collect Google passwords.

Next engineering upgrades:
1. Replace localStorage with SQLite or a backend API.
2. Add Google OAuth using an external browser/deep-link flow.
3. Add server-side job state and optimistic locking.
4. Add WebSocket/SSE updates to the operator queue.
5. Add an optional desktop-only browser QA worker that navigates to targets and returns screenshots, but stops before any engagement control.
6. Add RBAC and encrypted token storage.
7. Add automated unit/integration tests for the state machine.

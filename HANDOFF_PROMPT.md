# Prompt for another coding AI

You are taking over a Tauri 2 + React + TypeScript project named `yt-human-workflow`.

## Goal

Compile and polish the supplied project into a working desktop/mobile application called **Human Workflow Operator**.

## Platform targets

1. macOS 10.15 Catalina minimum runtime.
2. Android using Tauri 2.
3. Prefer a single shared React/TypeScript frontend.

## Existing architecture

- Frontend: React + TypeScript + Vite.
- Desktop/mobile shell: Tauri 2.
- Rust side currently initializes Tauri and the official opener plugin.
- Local application state is stored in localStorage for the starter.
- YouTube target URLs are parsed locally.
- Target URLs are opened using the OS default browser.
- Jobs use a backend-independent state machine.
- `waiting_for_human` is the mandatory human checkpoint.

## Non-negotiable safety constraints

Do not implement or add:

- automated YouTube Like/engagement clicks;
- automated multi-account engagement loops;
- Google password collection;
- proxy/VPN rotation intended to disguise account identity;
- cookie wiping/state manipulation intended to evade platform abuse detection;
- stealth browser fingerprints or bot-evasion mechanisms.

For account authorization, use an official OAuth flow and keep passwords completely outside the application.

## Required behavior

When an operator starts a queued job:

1. Select the stored account record.
2. Open the target YouTube URL in the user's system browser.
3. Mark the job `waiting_for_human`.
4. Do not execute an engagement action.
5. Let the human operator perform whatever legitimate interaction they choose.
6. The operator returns to the app and clicks `Human completed`, `Skip`, or `Cancel`.
7. Record the operator and timestamp in the audit log.

## Catalina requirements

Keep the web UI compatible with Safari/WebKit-era features available on macOS Catalina. Avoid APIs that depend on very recent Safari versions unless a fallback exists.

The existing Vite configuration targets Safari 13 and the project uses a non-randomUUID ID helper for older WebKit compatibility.

## Android requirements

Use Tauri 2 Android support. The app should use the system/default browser for external HTTPS URLs. The current Tauri opener plugin is already included.

## Build tasks

1. Install dependencies.
2. Validate TypeScript.
3. Run the Vite build.
4. Initialize Tauri dependencies as needed.
5. Run Tauri desktop development mode.
6. Build the macOS application bundle with minimum macOS version 10.15.
7. Initialize and test Android with Tauri.
8. Fix compilation issues without violating the safety constraints.

## Suggested production upgrades

- Replace localStorage with SQLite or a secure backend.
- Add Google OAuth using an external browser/deep-link flow.
- Encrypt refresh tokens.
- Add PostgreSQL + REST API for multi-device synchronization.
- Add role-based access control.
- Add WebSocket/SSE job updates.
- Add encrypted application settings.
- Add automated tests for every allowed state transition.

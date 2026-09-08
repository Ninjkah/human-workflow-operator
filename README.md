# Human Workflow Operator

A cross-platform Tauri 2 + React/TypeScript starter for a human-in-the-loop browser workflow.

## What this starter does

- Maintains local account/channel records without storing passwords.
- Accepts YouTube URLs and parses the video ID plus an optional `lc` comment reference.
- Creates jobs linking an account record to a target.
- Opens the target URL in the system browser.
- Stops at `waiting_for_human`.
- Records an explicit human checkpoint and audit event.
- Provides an operator queue and audit log.
- Builds as a macOS app bundle and is structured to target Android with Tauri 2.

## What it deliberately does not do

- No Google password collection.
- No automated Like/engagement action.
- No proxy or VPN rotation.
- No cookie/state manipulation for identity obfuscation.
- No automatic multi-account engagement loop.
- No automated clicking of YouTube controls.

Those omissions are intentional: the software is a general human-in-the-loop operator/QA shell rather than an artificial-engagement tool.

## Prerequisites

### Desktop / macOS

Install Node.js, Rust, and the Tauri prerequisites. Tauri's current prerequisites documentation lists macOS Catalina (10.15) and later for desktop development.

For a Catalina machine, the build toolchain itself may be constrained by the age of the OS. Xcode 11.7 is the final Xcode release for Catalina, so an alternative is to build the Catalina-targeted binary on a newer Mac and test the resulting app on an Intel Catalina Mac.

### Android

Install Android Studio and the Android SDK/NDK required by Tauri's mobile prerequisites. Tauri 2 can generate an Android Studio project and build Android APK/AAB packages.

## Install

```bash
npm install
```

## Run the desktop development app

```bash
npm run tauri:dev
```

## Build macOS bundle

```bash
npm run tauri:build
```

The bundle configuration sets `minimumSystemVersion` to `10.15`.

### Important Catalina note

Apple Silicon Macs cannot boot macOS Catalina natively. Catalina compatibility is therefore relevant primarily to Intel Macs. For a universal application, produce both x86_64 and arm64 artifacts from a sufficiently new build environment and test the x86_64 artifact on Catalina.

## Android

Initialize the mobile project:

```bash
npm run tauri android init
```

Run on a device/emulator:

```bash
npm run tauri android dev
```

Build an App Bundle:

```bash
npm run tauri android build -- --aab
```

## Extending authentication safely

Add an OAuth authorization flow in a backend or secure native layer. Use account/channel identifiers and encrypted refresh tokens rather than email/password fields. The UI can display `authorized`, `reauthorization required`, and `disabled` states.

## Production architecture

For a real deployment, keep these pieces separate:

- Tauri desktop/mobile client: dashboard, operator controls, audit display.
- Secure API: account metadata, jobs, authorization metadata, audit log.
- Database: PostgreSQL.
- Optional desktop worker: a separately managed browser/QA process for legitimate testing.

The browser worker should expose only navigation/verification primitives and wait at a server-enforced human checkpoint.

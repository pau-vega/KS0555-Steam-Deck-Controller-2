# Technology Stack — Tauri v2 + btleplug + gilrs Migration

**Project:** Steam Deck Robot Controller (Tauri v2 Migration)  
**Researched:** 2026-05-05  
**Overall confidence:** HIGH (Context7 + npm/crates.io verified)

---

## Recommended Stack

### Core Framework — Tauri v2

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| `@tauri-apps/cli` | `^2.10.1` | Tauri CLI for dev/build/bundle | Latest stable v2 (Feb 2026). Use `@tauri-apps/cli@latest` via pnpm. |
| `@tauri-apps/api` | `^2.10.1` | Frontend JS/TS API (`invoke`, `listen`) | Must match CLI version. Provides `invoke()` and `listen()` for Rust↔TS IPC. |
| `tauri` (Rust crate) | `^2.10.3` | Tauri core Rust framework | Latest stable in crates.io. Dependencies: `tauri-build`, `wry`, `tao`. |
| `tauri-build` (Rust) | `^2.5.6` | Tauri build script helper | Required in `build.rs` for `tauri_build::build()`. |

**Why Tauri v2, not v1:** v2 is current stable with better Linux/SteamOS support (WebKitGTK), active maintenance, and matches project constraints.

**Why not `vite-plugin-tauri`:** The official Tauri v2 docs recommend `beforeDevCommand`/`beforeBuildCommand` in `tauri.conf.json` instead. The plugin (v4.0.0, Dec 2024) is community-maintained and not referenced in Tauri v2 docs. Use the native approach for reliability.

---

### Rust Backend — BLE + Gamepad Crates

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| `btleplug` | `^0.12` (0.12.0, Mar 2026) | Bluetooth Low Energy (BLE) communication | Latest stable. Cross-platform Rust BLE crate. Supports Linux/BlueZ (SteamOS). Enable `serde` feature for state serialization. |
| `gilrs` | `^0.11` (0.11.1, Jan 2026) | Gamepad input handling | Latest stable. Uses Linux `evdev` directly — bypasses Steam Input intercept issue. MSRV 1.80.0. |
| `tokio` | `^1` | Async runtime for btleplug | btleplug is async; tokio is the standard Rust async runtime. |
| `serde` + `serde_json` | `^1` | Serialization for Tauri commands | Required for passing structured data between Rust and TypeScript. |

**Why btleplug 0.12, not 0.11:** 0.12.0 (Mar 2026) is the latest stable release with continued maintenance. The `serde` feature is required for Tauri command serialization.

**Why gilrs 0.11, not 0.10:** 0.11.1 (Jan 2026) is current stable with updated mappings and `LinuxGamepadExt` trait for device path access.

---

### Frontend — Existing Stack (Unchanged)

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| React | `^19.2.5` | UI library | Existing — no change needed |
| Vite | `^8.0.8` | Build tool / dev server | Existing — add Tauri-specific config |
| TypeScript | `~5.9.3` | Type-safe JS | Existing — no change needed |
| Tailwind CSS | `^4.2.2` | Styling | Existing — no change needed |

---

### Infrastructure — pnpm Monorepo

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| pnpm | `10.29.3` | Package manager | Existing — already in use |
| `vite-plugin-tauri` | **DO NOT USE** | — | Not in Tauri v2 official docs; use `tauri.conf.json` hooks instead |

---

## New Dependencies to Add

### apps/frontend/package.json

```json
{
  "devDependencies": {
    "@tauri-apps/cli": "^2.10.1",
    "@tauri-apps/api": "^2.10.1"
  },
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview",
    "tauri": "tauri",
    "tauri:dev": "tauri dev",
    "tauri:build": "tauri build"
  }
}
```

### apps/frontend/src-tauri/Cargo.toml

```toml
[package]
name = "steam-deck-controller"
version = "0.1.0"
edition = "2021"  # Tauri v2 uses edition 2021, not 2024 (compatibility)

[lib]
name = "app_lib"
crate-type = ["staticlib", "cdylib"]

[dependencies]
tauri = { version = "^2.10", features = [] }
btleplug = { version = "^0.12", features = ["serde"] }
gilrs = "^0.11"
tokio = { version = "^1", features = ["full"] }
serde = { version = "^1", features = ["derive"] }
serde_json = "^1"

[build-dependencies]
tauri-build = { version = "^2.5", features = [] }
```

**Why edition 2021, not 2024:** Tauri's `tauri-build` crate currently (as of v2.10.x) does not fully support Rust edition 2024 — there was a bug (#10412) that was fixed in later versions, but Tauri v2's own `Cargo.toml` uses `edition.workspace = true` with 2021 as the workspace default. Stay with 2021 for stability.

---

## Configuration Changes

### tauri.conf.json (apps/frontend/src-tauri/tauri.conf.json)

```json
{
  "build": {
    "beforeDevCommand": "pnpm dev",
    "beforeBuildCommand": "pnpm build",
    "devUrl": "http://localhost:5173",
    "frontendDist": "../dist"
  },
  "bundle": {
    "active": true,
    "targets": ["appimage"],
    "linux": {
      "icon": "icons/icon.png"
    }
  },
  "app": {
    "windows": [{
      "title": "Steam Deck Controller",
      "width": 800,
      "height": 600,
      "resizable": true
    }],
    "security": {
      "capabilities": ["default"]
    }
  }
}
```

### vite.config.ts (apps/frontend/vite.config.ts) — UPDATED

```typescript
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

const host = process.env.TAURI_DEV_HOST

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': '/src'
    }
  },
  // Tauri-specific additions below
  clearScreen: false,
  server: {
    port: 5173,
    strictPort: true,
    host: host || false,
    hmr: host
      ? { protocol: 'ws', host, port: 1421 }
      : undefined,
    watch: {
      ignored: ['**/src-tauri/**']
    }
  },
  envPrefix: ['VITE_', 'TAURI_ENV_*'],
  build: {
    target: process.env.TAURI_ENV_PLATFORM === 'windows'
      ? 'chrome105'
      : 'safari13',
    minify: !process.env.TAURI_ENV_DEBUG ? 'esbuild' : false,
    sourcemap: !!process.env.TAURI_ENV_DEBUG
  }
})
```

**Why these Vite settings:**
- `clearScreen: false` — prevents Vite from hiding Rust compilation errors
- `port: 5173` + `strictPort: true` — Tauri expects a fixed port (matches `devUrl`)
- `watch.ignored: ['**/src-tauri/**']` — prevents Vite from watching Rust files
- `envPrefix: ['VITE_', 'TAURI_ENV_*']` — exposes Tauri env vars to frontend
- `build.target` — Tauri uses WebKit on Linux/SteamOS (safari13), Chromium on Windows

---

## pnpm Monorepo Changes

### Root pnpm-workspace.yaml — NO CHANGE NEEDED

The existing `pnpm-workspace.yaml` with `apps/*` and `packages/*` already covers `apps/frontend`. The `src-tauri` directory lives inside `apps/frontend/`, so no workspace changes are required.

### pnpm-lock.yaml — pnpm install Required

After adding `@tauri-apps/cli` and `@tauri-apps/api` to `apps/frontend/package.json`, run:

```bash
pnpm install
```

**pnpm workspace bug workaround:** Tauri CLI may not detect pnpm in workspaces (bug #12706). If `pnpm tauri dev` tries to use npm, create an empty `pnpm-lock.yaml` in `apps/frontend/`:

```bash
touch apps/frontend/pnpm-lock.yaml
```

---

## System Dependencies (SteamOS/Linux)

### BlueZ (BLE) — btleplug Requirements

btleplug uses Linux's BlueZ D-Bus API. SteamOS has BlueZ pre-installed. No additional packages needed.

### Gamepad — gilrs Requirements

gilrs uses Linux `evdev` directly. Requires read access to `/dev/input/event*`. Steam Deck's built-in controller is accessible via `evdev`.

**udev rules for gamepad access (if not auto-configured):**

```bash
# /etc/udev/rules.d/99-steam-deck-gamepad.rules
KERNEL=="uinput", SUBSYSTEM=="misc", TAG+="uaccess", OPTIONS+="static_node=uinput"
SUBSYSTEM=="input", MODE="0660", TAG+="uaccess"
```

SteamOS typically has these rules pre-configured for the Steam Controller. Verify with:
```bash
ls -l /dev/input/js0  # Should exist when a gamepad is connected
```

---

## What NOT to Add

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| `vite-plugin-tauri` | Not in Tauri v2 official docs; community plugin may lag behind | Use `beforeDevCommand`/`beforeBuildCommand` in `tauri.conf.json` |
| `tauri v1` packages | v1 is deprecated; v2 has better Linux support | Use `@tauri-apps/cli@^2.10`, `tauri@^2.10` |
| `wasm-pack` / `wasm-bindgen` | Not needed — Tauri uses native Rust, not WASM | Direct Rust ↔ JS via Tauri IPC |
| `node-bluetooth` / `noble` | Node.js BLE not needed; btleplug is Rust-native | Use btleplug in Rust backend |
| `gamepad-api` polyfill | Browser API broken on SteamOS; gilrs replaces it | Use gilrs in Rust backend, emit events to frontend |

---

## Installation Commands

```bash
# Navigate to frontend app
cd apps/frontend

# Add Tauri CLI and API
pnpm add -D @tauri-apps/cli@^2.10.1 @tauri-apps/api@^2.10.1

# Initialize Tauri in existing Vite project
pnpm tauri init
# - Path to dev server: ../dist
# - Path to dev URL: http://localhost:5173
# - Path to frontend build: pnpm build

# Install Rust dependencies (handled by Cargo)
cd src-tauri
cargo build
```

---

## Sources

| Source | Confidence | Notes |
|--------|-----------|-------|
| npmjs.com `@tauri-apps/cli` versions | HIGH | Verified 2.10.1 published Feb 2026 |
| npmjs.com `@tauri-apps/api` versions | HIGH | Verified 2.10.1 published Feb 2026 |
| docs.rs `tauri` 2.10.3 | HIGH | Verified crate documentation |
| crates.io `btleplug` 0.12.0 | HIGH | Verified Mar 2026 release |
| crates.io `gilrs` 0.11.1 | HIGH | Verified Jan 2026 release |
| Context7 `/tauri-apps/tauri-docs` | HIGH | Tauri v2 official docs for Vite config |
| Context7 `/deviceplug/btleplug` | HIGH | btleplug README and API docs |
| GitHub `tauri-apps/tauri` releases | HIGH | Release notes for v2.10.x |
| Tauri v2 official docs (v2.tauri.app) | HIGH | Frontend Vite integration guide |
| GitHub issue #12706 (pnpm workspace bug) | MEDIUM | Known issue, workaround documented |
| GitHub issue #10412 (edition 2024) | HIGH | Tauri v2 uses edition 2021 |

---

## Version Summary

| Component | Version | Install Command |
|-----------|---------|-----------------|
| `@tauri-apps/cli` | `^2.10.1` | `pnpm add -D @tauri-apps/cli@^2.10` |
| `@tauri-apps/api` | `^2.10.1` | `pnpm add -D @tauri-apps/api@^2.10` |
| `tauri` (Rust) | `^2.10.3` | Added to `Cargo.toml` |
| `tauri-build` (Rust) | `^2.5.6` | Added to `Cargo.toml` |
| `btleplug` | `^0.12` | Added to `Cargo.toml` with `serde` feature |
| `gilrs` | `^0.11` | Added to `Cargo.toml` |
| Rust edition | `2021` | Set in `Cargo.toml` |

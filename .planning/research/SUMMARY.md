# Project Research Summary

**Project:** Steam Deck Robot Controller (Tauri v2 Migration)
**Domain:** Tauri v2 desktop app — BLE robot control via gamepad input
**Researched:** 2026-05-05
**Confidence:** HIGH

## Executive Summary

This project migrates a Steam Deck robot controller from Web Bluetooth + Gamepad API (WebView-based) to a Tauri v2 desktop application using native Rust crates (btleplug + gilrs). The current web-based approach fails on Linux/SteamOS because WebKitGTK blocks `navigator.bluetooth` and Steam Input intercepts `navigator.getGamepads()`. Expert builders in this domain use Tauri's native Rust backend to bypass these platform limitations — btleplug provides cross-platform BLE communication directly through BlueZ on Linux, while gilrs reads gamepad input via evdev, completely bypassing Steam Input's virtual controller layer.

The recommended approach is a clean migration to Tauri v2 (2.10.1) with three new Rust crates: btleplug 0.12 for BLE communication with the BT24 robot device, gilrs 0.11 for direct gamepad input reading, and tokio for async runtime. The existing React 19 + Vite 8 frontend remains largely unchanged — only two hooks (`use-bluetooth.ts`, `use-gamepad.ts`) get rewritten to use Tauri's `invoke()` and `listen()` IPC instead of Web APIs. The hook return interfaces stay identical so `app.tsx`, `control-pad.tsx`, and `status-bar.tsx` require zero modifications.

Key risks include: (1) Cross-thread event emitting — must use `AppHandle` not `Window` to avoid Rust `Send` trait violations; (2) btleplug scan filter behavior on Linux — BlueZ merges filters across all D-Bus clients, requiring post-filtering; (3) Event rate limiting — Tauri v2 crashes if events flood from gamepad polling at 60fps; (4) Gamepad permissions — gilrs requires `/dev/input/event*` read access via udev rules. All four have clear prevention strategies documented in the research. The overall migration is low-risk with high-confidence sources (Context7 + official docs).

## Key Findings

### Recommended Stack

The migration adds Tauri v2 (2.10.1) as the core framework, with btleplug 0.12 for BLE communication and gilrs 0.11 for gamepad input. The existing frontend stack (React 19.2.5, Vite 8.0.8, TypeScript 5.9.3, Tailwind CSS 4.2.2) remains unchanged. pnpm 10.29.3 monorepo structure stays the same — `apps/frontend/` gains a `src-tauri/` directory for Rust backend. Rust edition 2021 is required (not 2024) for Tauri v2 compatibility.

**Core technologies:**
- `@tauri-apps/cli@^2.10.1` + `@tauri-apps/api@^2.10.1`: Tauri v2 CLI and frontend API — official stable release with Linux/SteamOS support
- `btleplug@^0.12` (Rust): BLE communication — latest stable with BlueZ support, `serde` feature for Tauri serialization
- `gilrs@^0.11` (Rust): Gamepad input — reads evdev directly, bypasses Steam Input, `LinuxGamepadExt` for device path access
- `tokio@^1` (Rust): Async runtime — required by btleplug's async BLE API

### Expected Features

**Must have (table stakes):**
- BLE connect to BT24 device (service UUID `0000ffe0`, char UUID `0000ffe1`) — core functionality via btleplug `peripheral.connect().await`
- BLE send command (F/B/L/R/S as bytes) — robot direction control via `peripheral.write()` with `WriteType::WithoutResponse` for low latency
- BLE disconnect — clean state management with `peripheral.disconnect().await` + `CentralEvent::DeviceDisconnected` handling
- Gamepad direction detection (F/B/L/R/S) with deadzone 0.15 — gilrs `gamepad.value(Axis::LeftStickX/Y)` → same logic as current `use-gamepad.ts`
- Gamepad connect/disconnect detection — gilrs event loop: `EventType::Connected` / `Disconnected`
- Tauri commands: `ble_connect`, `ble_disconnect`, `ble_send` — frontend `use-bluetooth.ts` calls via `invoke()`
- Tauri events from Rust background threads — `use-gamepad.ts` listens via `listen()` for `gamepad-direction`, `ble-state-changed`, etc.
- Stable hook return shapes — `useBluetooth()` returns `{ connected, connecting, unsupported, connect, send }`, `useGamepad()` returns `{ direction, gamepadConnected }`

**Should have (competitive):**
- Auto-reconnect on BLE disconnect — retry `connect()` with backoff when `CentralEvent::DeviceDisconnected` fires
- Steam Deck controller name filter — prioritize built-in gamepad by checking `gamepad.name()` contains "Steam"
- Direction change guard — only emit `gamepad-direction` when direction actually changes (replicate current JS logic in Rust)
- Connection state persistence across hot reload — manage `Peripheral` in Tauri state (`app.manage()`)

**Defer (v2+):**
- Motor speed control (u/v commands) — adds protocol complexity, not needed for MVP
- Multiple robot profiles — save/load BT24 device mappings
- Flatpak packaging — AppImage works for Steam Deck distribution

### Architecture Approach

The architecture replaces WebSocket IPC (Fastify backend → WebSocket client) with Tauri v2's native Rust ↔ TypeScript IPC. A new `src-tauri/` directory contains the Rust backend with three modules: `lib.rs` (Tauri commands), `ble.rs` (btleplug logic), and `gamepad.rs` (gilrs event loop in background thread). The frontend hooks get rewritten — `use-bluetooth.ts` uses `invoke()` for commands and `listen()` for state changes, while `use-gamepad.ts` uses only `listen()` for gamepad events. Tauri commands execute BLE operations; a spawned background thread (via `tauri::async_runtime::spawn()` or `std::thread::spawn()`) continuously polls gilrs and emits events. Vite config gains Tauri-specific settings (`clearScreen: false`, `watch.ignored: ['**/src-tauri/**']`, `envPrefix: ['VITE_', 'TAURI_ENV_*']`). Turbo.json adds `tauri:dev` and `tauri:build` tasks.

**Major components:**
1. Tauri Commands (Rust, `lib.rs`) — execute BLE connect/send/disconnect, emit `ble-state-changed` events
2. Background Thread (Rust, `gamepad.rs`) — poll gilrs event loop, emit `gamepad-direction`, `gamepad-connected`, `gamepad-disconnected`
3. Frontend Hooks (TypeScript, rewritten) — bridge Tauri IPC to unchanged UI components via stable interfaces

### Critical Pitfalls

1. **Using `Window` instead of `AppHandle` for cross-thread event emitting** — Rust compiler error: `future cannot be sent between threads safely`. Always clone `app.handle()` in `.setup()` and move into spawned tasks. `AppHandle` implements `Send`, `Window` does not.

2. **btleplug scan filtering on Linux is not exclusive** — BlueZ merges discovery filters across ALL D-Bus clients, so `start_scan(ScanFilter { service_uuids: vec![BT24_UUID] })` still returns other devices. Always post-filter scan results by checking `peripheral.properties().local_name`.

3. **Event rate limiting causes app crashes** — Tauri v2 has internal rate limits (~10,000 messages on Windows). Gamepad polling at 60fps can flood events. Only emit on state change (direction change guard), never every poll.

4. **gilrs requires `/dev/input/event*` read/write permissions** — `Gilrs::new()` succeeds but `next_event()` never fires if user lacks access. Steam Deck ships with Valve's udev rules (`60-steam-input.rules`), but verify on custom images. Test early with a small Rust binary.

5. **Hook interface contract violation breaks `app.tsx`** — rewritten hooks must return identical shapes: `useBluetooth()` → `{ connected, connecting, unsupported, connect, send }`, `useGamepad()` → `{ direction, gamepadConnected }`. Define TypeScript interfaces before rewriting.

## Implications for Roadmap

Based on research, suggested phase structure:

### Phase 1: Tauri Shell Setup
**Rationale:** Foundation phase — must complete before any Rust code can be written or tested. Creates the `src-tauri/` directory and configures IPC between existing Vite frontend and new Rust backend.
**Delivers:** Initialized Tauri v2 project inside `apps/frontend/`, configured `tauri.conf.json` with pnpm commands, modified `vite.config.ts` with Tauri integration settings
**Addresses:** Infrastructure setup, no direct features yet
**Avoids:** Pitfall 11 (`@tauri-apps/api` version mismatch) — verify npm package version after `tauri init`

### Phase 2: BLE Commands with btleplug
**Rationale:** Core functionality — robot cannot be controlled without BLE. This phase implements the three Tauri commands (`ble_connect`, `ble_disconnect`, `ble_send`) and stores `Peripheral` in Tauri managed state.
**Delivers:** Rust BLE module (`ble.rs`), Tauri commands for BT24 device connection/send/disconnect, `ble-state-changed` event emissions
**Uses:** `btleplug@^0.12` with `serde` feature, `tokio@^1` async runtime, Tauri `AppHandle` for events
**Implements:** Tauri Command with Event Emission pattern (ARCHITECTURE.md Pattern 1)
**Avoids:** Pitfall 1 (use `AppHandle` not `Window`), Pitfall 2 (post-filter scan results on Linux), Pitfall 3 (only emit `ble-state-changed` on state changes)

### Phase 3: Gamepad Monitoring with gilrs
**Rationale:** Second core feature — depends on Tauri setup but independent of BLE commands. Background thread polls gilrs and emits gamepad events. Order after BLE because gamepad direction ultimately triggers BLE send commands.
**Delivers:** Rust gamepad module (`gamepad.rs`), background thread with gilrs event loop, `gamepad-direction`, `gamepad-connected`, `gamepad-disconnected` event emissions
**Uses:** `gilrs@^0.11`, `std::thread::spawn` or `tauri::async_runtime::spawn`, direction detection logic with 0.15 deadzone
**Implements:** Background Thread with Event Emission pattern (ARCHITECTURE.md Pattern 2)
**Avoids:** Pitfall 4 (verify `/dev/input` permissions), Pitfall 8 (call `next_event()` in loop), Pitfall 9 (filter by "Steam" in gamepad name)

### Phase 4: Hook Rewrites (Frontend IPC)
**Rationale:** Final integration — both Rust modules must be working before rewriting frontend hooks. Depends on Phase 2 and 3 being complete so `invoke()` and `listen()` targets exist.
**Delivers:** Rewritten `use-bluetooth.ts` (uses `invoke()` + `listen()`), rewritten `use-gamepad.ts` (uses `listen()` only), unchanged `app.tsx`/`control-pad.tsx`/`status-bar.tsx`
**Addresses:** Table stakes features 6, 7, 8 (Tauri commands, events, stable hook interfaces)
**Avoids:** Pitfall 5 (define TypeScript interfaces before rewriting), Pitfall 6 (Promise-based cleanup for StrictMode), Pitfall 10 (wrap `invoke()` with error handling)

### Phase 5: Build and Test on SteamOS
**Rationale:** Validation phase — ensures the full stack works on target platform. Catches platform-specific issues like BlueZ version, udev rules, or Steam Input interference.
**Delivers:** Production AppImage via `pnpm tauri build`, tested BLE connection to BT24, tested gamepad input from Steam Deck built-in controller
**Uses:** Tauri AppImage bundling, SteamOS 3.7.x (BlueZ 5.76+) recommended
**Avoids:** Pitfall 7 (btleplug "Software Caused Connection Abort" — implement retry logic), Pitfall 12 (check SteamOS/BlueZ version)

### Phase Ordering Rationale

- **Infrastructure first:** Tauri shell must exist before Rust modules can be tested
- **BLE before Gamepad:** BLE is the primary purpose (robot control); gamepad is the input mechanism. BLE module can be manually tested without gamepad by calling `invoke('ble_send', { data: 'F' })` from browser console
- **Gamepad before Hooks:** Hook rewrites need both Tauri commands AND events to be working. Gamepad module provides the events that `use-gamepad.ts` will listen to
- **Hooks last:** Frontend changes are purely integrative — once Rust backend is stable, swapping Web APIs for Tauri IPC is straightforward
- **SteamOS validation separate:** Platform-specific testing deserves its own phase to catch Linux/BLE/gamepad edge cases

### Research Flags

Phases likely needing deeper research during planning:
- **Phase 2 (BLE):** BT24 device filtering strategy (name vs MAC address) — test with actual hardware during planning
- **Phase 3 (Gamepad):** Steam Deck built-in controller identification in gilrs — may need `SDL_GAMECONTROLLERCONFIG` or device path inspection
- **Phase 5 (Build/Test):** GitHub Actions ARM AppImage build — needs `ubuntu-24.04-arm` runner or cross-compilation setup

Phases with standard patterns (skip research-phase):
- **Phase 1 (Tauri Setup):** Well-documented in Tauri v2 official docs, Context7 has 1054 code snippets
- **Phase 4 (Hook Rewrites):** Pattern is clear — replace `navigator.bluetooth` with `invoke()`, replace `navigator.getGamepads()` with `listen()`. Existing hook interfaces provide the contract.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Context7 + npm/crates.io verified versions for Tauri v2, btleplug 0.12, gilrs 0.11 |
| Features | HIGH | Context7 + official docs for btleplug, gilrs, Tauri v2. Existing `use-gamepad.ts` provides reference logic |
| Architecture | HIGH | Context7 `/tauri-apps/tauri-docs` (1054 snippets), official Tauri v2 docs for Vite integration |
| Pitfalls | HIGH (Tauri/gilrs), MEDIUM (btleplug/Linux) | Tauri/gilrs pitfalls from Context7 docs. btleplug Linux issues from GitHub issues (medium confidence) |

**Overall confidence:** HIGH — All core technologies have high-confidence sources. Linux-specific BLE behavior (btleplug + BlueZ) has medium confidence due to relying on GitHub issues rather than official documentation.

### Gaps to Address

- **BT24 Device Filtering:** Should we filter by device name "BT24" in btleplug or by MAC address? (btleplug supports both) — *Resolve during Phase 2 planning with actual hardware test*
- **Gamepad Selection:** How to identify Steam Deck built-in controller in gilrs? — *Use `gamepad.name()` contains "Steam" similar to current `use-gamepad.ts`, validate in Phase 3*
- **Error Handling Strategy:** Should Rust commands return `Result<String, String>` or use event-based error reporting? — *Recommend Result for commands (immediate feedback), events for state changes (async notifications)*
- **GitHub Actions ARM Build:** Can GitHub Actions build ARM AppImage for Steam Deck? — *Needs `ubuntu-24.04-arm` runner or cross-compilation, research during Phase 5 planning*

## Sources

### Primary (HIGH confidence)
- Context7 `/tauri-apps/tauri-docs` (1054 code snippets) — Tauri v2 official docs: Vite integration, commands, events, configuration, AppImage
- Context7 `/deviceplug/btleplug` — btleplug README and API docs: BLE connect, disconnect, write, scan filtering
- Context7 `/gilrs/gilrs` — gilrs docs.rs: `Axis` enum, `Gamepad::value()`, `GilrsBuilder`, event loop, `SDL_GAMECONTROLLERCONFIG`
- npmjs.com `@tauri-apps/cli` + `@tauri-apps/api` — Version 2.10.1 verified (Feb 2026)
- crates.io `btleplug` 0.12.0 + `gilrs` 0.11.1 — Latest stable releases (Mar 2026 / Jan 2026)
- Tauri v2 official docs (v2.tauri.app) — Frontend Vite integration guide

### Secondary (MEDIUM confidence)
- GitHub `tauri-apps/tauri` issues #3135, #8177, #8913, #11495 — Event emitting, rate limiting, StrictMode, version mismatch
- GitHub `deviceplug/btleplug` issues #165, #244, #412 — Scan filter behavior, "Software Caused Connection Abort"
- GitHub `ValveSoftware/SteamOS` issue #1516 — BlueZ version affects BLE stability on SteamOS
- StackOverflow — React+Tauri `useEffect` cleanup patterns, gilrs permissions
- sneakycrow.dev blog — Long-running backend async tasks in Tauri v2

### Tertiary (LOW confidence)
- GitHub issue #12706 (pnpm workspace bug) — Tauri CLI may not detect pnpm in workspaces, workaround documented
- GitHub issue #10412 (edition 2024) — Tauri v2 uses edition 2021, not fully documented why

---
*Research completed: 2026-05-05*
*Ready for roadmap: yes*

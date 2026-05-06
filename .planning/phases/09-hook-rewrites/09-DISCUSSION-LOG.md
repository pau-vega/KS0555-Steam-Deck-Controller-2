# Phase 9: Hook Rewrites - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-05-06
**Phase:** 09-hook-rewrites
**Areas discussed:** Unlisten cleanup pattern, Test rewrite strategy, Gamepad initial connected state, BLE state payload format, invoke disconnect on unmount, TypeScript payload types location

---

## Unlisten Cleanup Pattern

| Option | Description | Selected |
|--------|-------------|----------|
| useRef to store unlistener | `unlistenersRef = useRef<UnlistenFn[]>([])`. listen resolves → push to array. Cleanup: forEach call. Synchronous. | ✓ |
| Store promise, await in async IIFE | `promise.then(fn => fn())` in cleanup. May fire after re-mount. | |
| You decide | Leave to planner/executor. | |

**User's choice:** useRef to store unlistener (array ref for all unlisteners)
**Notes:** Followed up with a second question on single vs array ref — user chose array ref for all unlisteners in a single hook. Handles multiple listeners (3 in useGamepad) cleanly.

---

## Test Rewrite Strategy

| Option | Description | Selected |
|--------|-------------|----------|
| Rewrite tests: mock @tauri-apps/api | vi.mock invoke/listen. Delete browser-API mocks. Test same behaviors. | ✓ |
| Delete tests, add later in Phase 10 | Keep tests minimal for Phase 9, defer to Phase 10 validation. | |
| Keep old tests, add new alongside | Old browser tests become dead (will fail). Not recommended. | |

**User's choice:** Rewrite tests: mock @tauri-apps/api

| Option | Description | Selected |
|--------|-------------|----------|
| Capture callback in mock, call manually | `listen.mockImplementation((event, cb) => { capturedCallback = cb; ... })`. Then `act(() => capturedCallback({ payload: ... }))`. | ✓ |
| Use EventEmitter in mock | Mock event bus, dispatch via emit(). More infrastructure. | |
| You decide | Leave to planner/executor. | |

**User's choice:** Capture callback in mock, call it manually
**Notes:** No RAF loop in new useGamepad — purely event-driven. Tests fire events by calling captured listener callbacks directly.

---

## Gamepad Initial Connected State

| Option | Description | Selected |
|--------|-------------|----------|
| Accept it — start with gamepadConnected: false | Hook starts false, updates on first gilrs event. gilrs emits Connected on startup for already-connected gamepads. No Rust changes. | ✓ |
| Add Rust query command get_gamepad_state | New Tauri command returns { connected: bool, name: Option<String> }. Hook calls on mount. More work. | |
| Emit connected event on Rust startup | Modify Phase 8 gamepad module to emit on startup. Requires Phase 8 patch. | |

**User's choice:** Accept it — start with gamepadConnected: false

| Option | Description | Selected |
|--------|-------------|----------|
| Confirmed — useBluetooth starts disconnected | BLE is user-initiated. Initial disconnected state correct. | ✓ |
| Add auto-connect on mount | Automatically call invoke('ble_connect') on mount. Skips Connect button. | |

**User's choice:** Confirmed — useBluetooth starts disconnected

---

## BLE State Payload Format

| Option | Description | Selected |
|--------|-------------|----------|
| Confirmed — raw string payload | listen<string>. Matches what Rust emits: app.emit("ble-state-changed", "connecting"). No Rust changes. | ✓ |
| Change Rust to emit a struct | Emit { state: 'connecting' } typed struct. Requires patching Phase 7 code. | |

**User's choice:** Confirmed — raw string payload
**Notes:** Payload format confirmed by reading `apps/frontend/src-tauri/src/ble/mod.rs` directly. All three emit calls pass raw strings.

---

## invoke('ble_disconnect') on Unmount

| Option | Description | Selected |
|--------|-------------|----------|
| No — don't disconnect on unmount | App is single-page, hook lives for full app lifetime. Disconnect is user-initiated. Matches current behavior. | ✓ |
| Yes — disconnect on unmount | Defensive cleanup. Adds invoke call to useEffect cleanup. | |

**User's choice:** No — don't disconnect on unmount

---

## TypeScript Payload Types Location

| Option | Description | Selected |
|--------|-------------|----------|
| Inline in each hook | Types defined at top of hook file. Self-documenting at point of use. No new files. | ✓ |
| Add to src/types.ts | Extend existing types.ts with Tauri payload types. Centralised but adds Tauri coupling. | |
| New src/types/tauri-events.ts | Dedicated file for Tauri event types. Clean but adds a file for 3 small types. | |

**User's choice:** Inline in each hook

---

## the agent's Discretion

- `unsupported` field always `false` in Tauri — set as constant, keep in return shape for API stability
- `send()` fire-and-forget: `void invoke("ble_send", { command: data })`
- `connect()` catch block: set state to `"disconnected"` on invoke rejection

## Deferred Ideas

None — discussion stayed within Phase 9 scope.

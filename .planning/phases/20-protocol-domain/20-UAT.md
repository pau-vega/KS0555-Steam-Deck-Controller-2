---
status: complete
phase: 20-protocol-domain
source: [20-01-SUMMARY.md, 20-02-SUMMARY.md, 20-03-SUMMARY.md]
started: 2026-05-15T16:56:57Z
updated: 2026-05-15T17:02:30Z
---

## Current Test
<!-- OVERWRITE each test - shows where we are -->

[testing complete]

## Tests

### 1. App launches cleanly
expected: Run `pnpm dev`. Vite serves at :5173, Rust shell compiles, Tauri window opens with the Robot Controller UI (title, StatusBar, Connect button, ControlPad). No panic on Rust crate load, no red errors in WebView console.
result: pass

### 2. Rust unit tests green
expected: Run `cargo test --manifest-path apps/frontend/src-tauri/Cargo.toml`. All test binaries pass, including 44 in `domain::direction::tests` and 18 in `ble::tests`. Reported total ≥ 123 tests, 0 failed.
result: pass

### 3. BLE connect button still works
expected: With BT24 module powered nearby, click "Connect Bluetooth". StatusBar transitions disconnected → connecting → connected. No error string under the button. The button disappears once connected.
result: pass

### 4. On-screen ControlPad drives robot
expected: With BLE connected, click "F" on ControlPad. Robot drives forward. Click "S" to stop. Repeat for B/L/R. Each click drives the corresponding direction. "Last command: X" updates on screen.
result: issue
reported: "the robot do not respond to any of the inputs"
severity: blocker

### 5. Gamepad drives robot via triggers/stick
expected: With BLE + gamepad connected, press R2 (or push left stick forward). Robot drives forward. Release/center → robot stops. Press L2 (or stick back) → robot drives backward. Stick left/right → robot turns. "Current direction" indicator on screen reflects the gamepad input.
result: issue
reported: "The indicator on the screen is showing the correct inputs, but the robot does not move"
severity: blocker

### 6. Invalid payload error stays scrubbed
expected: From the Tauri WebView devtools console, run `await window.__TAURI__.core.invoke("ble_send", { command: "X" })`. Promise rejects with an error string that ONLY mentions the rejected payload (quoted) and the expected format ('<dir><pwm>\\n' or 'S\\n'). No MAC, UUID, file path, or BleState internals appear in the message.
result: skipped
reason: "`window.__TAURI__.core` undefined in dev (global Tauri not exposed by default in v2). Coverage already exists via 18 Rust unit tests in ble::tests (T-20-14 reject branches assert scrubbed error string)."

## Summary

total: 6
passed: 3
issues: 2
pending: 0
skipped: 1
blocked: 0

## Gaps

- truth: "On-screen ControlPad button click drives the robot in the corresponding direction"
  status: failed
  reason: "User reported: the robot do not respond to any of the inputs"
  severity: blocker
  test: 4
  artifacts: []
  missing: []

- truth: "Gamepad triggers/stick drive the robot via BLE"
  status: failed
  reason: "User reported: The indicator on the screen is showing the correct inputs, but the robot does not move"
  severity: blocker
  test: 5
  artifacts: []
  missing: []

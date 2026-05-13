# Roadmap: Steam Deck Robot Controller

## Milestones

- ✅ **v1 Basic WebSocket** — Phases 1-5 (archived)
- ✅ **v2.0 Tauri Migration** — Phases 6-10 (shipped 2026-05-12)
- ✅ **v2.1 Flatpak Packaging** — Phases 11-19 (shipped 2026-05-12)
- 📋 **v2.2 Progressive Analog Control** — Phases 20-25 (planned)

## Phases

<details>
<summary>✅ v2.0 Tauri Migration (Phases 6-10) — SHIPPED 2026-05-12</summary>

- [x] Phase 6: Tauri Shell Setup (2/2 plans) — completed 2026-05-06
- [x] Phase 7: BLE Commands with btleplug (3/3 plans) — completed 2026-05-06
- [x] Phase 8: Gamepad Monitoring with gilrs (3/3 plans) — completed 2026-05-06
- [x] Phase 9: Hook Rewrites (2/2 plans) — completed 2026-05-06
- [x] Phase 10: Build and Test on SteamOS (2/2 plans) — completed 2026-05-06

</details>

<details>
<summary>✅ v2.1 Flatpak Packaging (Phases 11-19) — SHIPPED 2026-05-12</summary>

- [x] Phase 11: Bundle Pipeline Restructure (3/3 plans) — completed 2026-05-09
- [x] Phase 12: Manifest + AppStream + Local Build (2/2 plans) — completed 2026-05-09
- [x] Phase 13: Sandbox Permissions for BLE + Gamepad (1/1 plan) — completed 2026-05-09
- [x] Phase 14: Steam Deck On-Device Validation (1/1 plan) — completed 2026-05-09
- [x] Phase 15: CI Migration (Parallel-Run) (2/2 plans) — completed 2026-05-10
- [x] Phase 16: AppImage Decommission + Upgrade Workflow Docs (3/3 plans) — completed 2026-05-10
- [x] Phase 17: Close Verification Gaps (1/1 plan) — completed 2026-05-10
- [x] Phase 18: Fix Stale Docs (1/1 plan) — completed 2026-05-10
- [x] Phase 19: Execute Deb Build + Flatpak Runner (1/1 plan) — completed 2026-05-12

</details>

<details open>
<summary>📋 v2.2 Progressive Analog Control (Phases 20-25) — PLANNED</summary>

- [ ] **Phase 20: Protocol Verification (Gate)** - Confirm speed command protocol on physical BT24 robot
- [ ] **Phase 21: Rust Backend** - Analog computation engine + BLE speed command plumbing
- [ ] **Phase 22: Frontend Hooks** - React hooks consuming analog events, driving BLE commands
- [ ] **Phase 23: UI Overlay** - Live analog state display as sibling component
- [ ] **Phase 24: Integration Testing** - Throttle, unit tests, event flow, regression
- [ ] **Phase 25: Steam Deck Validation** - Hardware tuning, Flatpak compatibility, CI verification

</details>

## Phase Details

### Phase 20: Protocol Verification (Gate)
**Goal**: Confirm that speed command protocol (`u<val>#`/`v<val>#`) works on physical BT24 robot before any backend work begins
**Depends on**: Nothing (first phase of v2.2)
**Requirements**: VAL-01
**Success Criteria** (what must be TRUE):
1. Physical robot moves forward at reduced speed when sent `u<val>#` + `F` via BLE — slower than full-speed `F` command
2. Physical robot stops when sent `S` command after speed commands
3. Raw trigger axis values (LeftZ/R2, RightZ/L2) logged from Steam Deck gamepad to confirm -1..1 range
4. Protocol command format (`u<val>#`/`v<val>#`) documented with confidence level after empirical testing
5. Go/no-go decision documented: proceed with analog OR fall back to fixed-speed digital control
**Plans**: TBD
**Research flag**: NEEDS PHYSICAL ACCESS — robot + Steam Deck required, cannot be simulated

### Phase 21: Rust Backend
**Goal**: Analog computation engine and BLE speed commands working in Rust backend
**Depends on**: Phase 20 (protocol confirmed, or fallback decision made)
**Requirements**: ANA-01, ANA-02, ANA-03, ANA-04, ANA-05, ANA-06, ANA-07, ANA-08
**Success Criteria** (what must be TRUE):
1. Rust `analog.rs` normalizes R2 trigger (Axis::RightZ) to forward speed 0.0–1.0 and L2 trigger (Axis::LeftZ) to backward speed 0.0–1.0
2. Rust `compute_motor_output()` produces correct differential steering: left joystick X-axis reduces inner track speed, direction bias is correct for forward and reverse
3. New `gamepad-state` event fires with full AnalogState payload (trigger %, stick %, motor speeds, direction char) on meaningful changes
4. Existing `gamepad-direction` event continues to fire unchanged for backward compatibility with locked `app.tsx`
5. New `ble_send_analog` Tauri command batches three BLE writes (u<left>#, v<right>#, direction) and relaxed `ble_send` validation accepts multi-char speed commands
**Plans**: TBD

### Phase 22: Frontend Hooks
**Goal**: React hooks consume analog events and drive BLE speed commands
**Depends on**: Phase 21 (gamepad-state event type stable)
**Requirements**: UI-01, UI-02, UI-05
**Success Criteria** (what must be TRUE):
1. `useGamepad()` returns `analogState` containing live trigger percentages and motor speeds
2. New `useAnalogControl` hook listens for `gamepad-state` events and invokes `ble_send_analog` with change guarding (ref-based, no re-render loops)
3. Direction `S` (stop) is sent when both triggers are below deadzone threshold — robot stops on trigger release
4. Old `gamepad-direction` events continue to flow to `app.tsx` — app.tsx direction display and BLE sends unchanged
5. Speed-only changes (same direction, different speed) reach the robot via the analog path
**Plans**: TBD
**UI hint**: yes

### Phase 23: UI Overlay
**Goal**: Live analog state display visible without modifying locked files
**Depends on**: Phase 22 (analogState available from useGamepad)
**Requirements**: UI-03, UI-04
**Success Criteria** (what must be TRUE):
1. `AnalogDisplay` component shows live R2%, L2%, joystick X%, left/right motor speed % as progress bars
2. `AnalogDisplay` mounts as a sibling in `main.tsx` — `app.tsx`, `control-pad.tsx`, `status-bar.tsx` remain unmodified
3. Display updates in real-time (no perceptible lag) as trigger and stick values change
4. Overlay is readable on Steam Deck's 1280×800 screen at fixed bottom-right position
**Plans**: TBD
**UI hint**: yes

### Phase 24: Integration Testing
**Goal**: Throttle BLE writes to prevent BT24 overflow; verify event pipeline end-to-end; confirm no regression
**Depends on**: Phases 21, 22, 23 (all implementation complete)
**Requirements**: ANA-09, VAL-02, VAL-03, VAL-04
**Success Criteria** (what must be TRUE):
1. BLE writes are throttled to ≤30 Hz under rapid trigger changes — prevents BT24 buffer overflow (~50 writes/sec cap)
2. Speed changes below 5% delta are suppressed — no unnecessary BLE writes for tiny trigger jitter
3. `compute_motor_output()` unit tests pass for all edge cases: deadzone, full speed, steering extremes, backward turn, both triggers equal
4. Integration test confirms end-to-end flow: simulated axis input → gamepad-state event → ble_send_analog invocation → three BLE writes
5. Regression tests confirm old digital path (D-pad + joystick direction) still sends correct F/B/L/R/S commands
**Plans**: TBD

### Phase 25: Steam Deck Validation
**Goal**: Production-ready analog control tuned on physical hardware, Flatpak-compatible, CI-verified
**Depends on**: Phase 24 (tests pass)
**Requirements**: VAL-05, VAL-06, VAL-07
**Success Criteria** (what must be TRUE):
1. Steam Deck triggers (LeftZ/RightZ) produce expected axis range — MIN_SPEED, TURN_FACTOR, and trigger deadzone constants tuned based on empirical observation
2. Robot moves at minimal trigger press without stalling — MIN_SPEED tuned correctly for motor characteristics
3. Steering is responsive without oversteer — TURN_FACTOR tuned for the robot's track geometry
4. Flatpak sandbox handles extended BLE payloads — no new permissions required, build and run succeed
5. CI pipeline (`turbo build lint typecheck test`) passes and produces valid `.deb` + `.flatpak` artifacts
**Plans**: TBD
**Research flag**: NEEDS PHYSICAL ACCESS — Steam Deck + robot required for tuning

## Progress

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 6. Tauri Shell Setup | v2.0 | 2/2 | Complete | 2026-05-06 |
| 7. BLE Commands with btleplug | v2.0 | 3/3 | Complete | 2026-05-06 |
| 8. Gamepad Monitoring with gilrs | v2.0 | 3/3 | Complete | 2026-05-06 |
| 9. Hook Rewrites | v2.0 | 2/2 | Complete | 2026-05-06 |
| 10. Build and Test on SteamOS | v2.0 | 2/2 | Complete | 2026-05-06 |
| 11. Bundle Pipeline Restructure | v2.1 | 3/3 | Complete | 2026-05-09 |
| 12. Manifest + AppStream + Local Build | v2.1 | 2/2 | Complete | 2026-05-09 |
| 13. Sandbox Permissions for BLE + Gamepad | v2.1 | 1/1 | Complete | 2026-05-09 |
| 14. Steam Deck On-Device Validation | v2.1 | 1/1 | Complete | 2026-05-09 |
| 15. CI Migration (Parallel-Run) | v2.1 | 2/2 | Complete | 2026-05-10 |
| 16. AppImage Decommission + Upgrade Workflow Docs | v2.1 | 3/3 | Complete | 2026-05-10 |
| 17. Close Verification Gaps | v2.1 | 1/1 | Complete | 2026-05-10 |
| 18. Fix Stale Docs | v2.1 | 1/1 | Complete | 2026-05-10 |
| 19. Execute Deb Build + Flatpak Runner | v2.1 | 1/1 | Complete | 2026-05-12 |
| 20. Protocol Verification (Gate) | v2.2 | 0/0 | Planned | — |
| 21. Rust Backend | v2.2 | 0/0 | Planned | — |
| 22. Frontend Hooks | v2.2 | 0/0 | Planned | — |
| 23. UI Overlay | v2.2 | 0/0 | Planned | — |
| 24. Integration Testing | v2.2 | 0/0 | Planned | — |
| 25. Steam Deck Validation | v2.2 | 0/0 | Planned | — |

---

*Archives: [v2.0 ROADMAP](./milestones/v2.0-ROADMAP.md) · [v2.1 ROADMAP](./milestones/v2.1-ROADMAP.md)*
*Requirements: [v2.0](./milestones/v2.0-REQUIREMENTS.md) · [v2.1](./milestones/v2.1-REQUIREMENTS.md)*

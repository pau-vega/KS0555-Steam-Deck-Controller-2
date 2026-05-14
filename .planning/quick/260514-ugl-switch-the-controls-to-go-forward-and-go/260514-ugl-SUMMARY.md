---
phase: quick-260514-ugl
plan: "01"
subsystem: control-inversion
tags: [inversion, gamepad, control-pad, ux]
requires: []
provides: [control-direction-inversion]
affects: [ble-commands, gamepad-direction, control-pad-ui]
tech-stack:
  added: []
  patterns: [ref-for-stale-closure, atomicbool-state-management]
key-files:
  created:
    - apps/frontend/src/hooks/use-invert-controls.ts
    - apps/frontend/src/hooks/use-invert-controls.test.ts
  modified:
    - apps/frontend/src-tauri/src/ble/mod.rs
    - apps/frontend/src-tauri/src/lib.rs
    - apps/frontend/src/hooks/use-gamepad.ts
    - apps/frontend/src/hooks/use-gamepad.test.ts
    - apps/frontend/src/components/control-pad.tsx
    - apps/frontend/src/components/control-pad.test.tsx
    - apps/frontend/src/App.test.tsx
decisions:
  - "Rust AtomicBool as source of truth for inversion state, not React state alone"
  - "Inversion applied at two layers: useGamepad (gamepad events) and ControlPad (button clicks)"
  - "Ref-based inversion read in useGamepad effect to avoid stale closure on inverted value"
  - "Toggle button placed outside the 3×3 grid for visual separation"
metrics:
  duration: "20m 54s"
  completed_date: "2026-05-14T20:28:31Z"
---

# Quick Task 260514-ugl: Invert Forward/Backward Controls

Inversion toggle swaps forward↔backward on both gamepad stick and control-pad buttons. Left/Right/Stop unaffected. State managed in Rust (AtomicBool) with Tauri IPC commands; consumed by React hooks and components.

## Commits

| Commit     | Type | Description                                                 |
| ---------- | ---- | ----------------------------------------------------------- |
| `12a7e841` | feat | Add INVERTED AtomicBool + toggle_invert/get_invert_state Rust commands |
| `c1c7c3db` | feat | Create useInvertControls hook, wire inversion into useGamepad       |
| `5345b742` | feat | Wire inversion into ControlPad with toggle button                   |

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed stale closure on inverted value in useGamepad useEffect**
- **Found during:** Task 2
- **Issue:** `inverted` value captured in useEffect closure at mount time; toggling would not affect direction transforms until remount
- **Fix:** Added `invertedRef` (useRef) tracking latest `inverted` value; event listener reads `invertedRef.current`
- **Files modified:** `apps/frontend/src/hooks/use-gamepad.ts`
- **Commit:** `c1c7c3db`

**2. [Rule 1 - Bug] Fixed App.test.tsx button count expectation**
- **Found during:** Task 3 verification
- **Issue:** `App.test.tsx` expected 5 buttons in ControlPad; toggle button increased count to 6
- **Fix:** Updated `expect(buttons.length).toBe(5)` → `toBe(6)` in App.test.tsx
- **Files modified:** `apps/frontend/src/App.test.tsx`
- **Commit:** `5345b742`

**3. [Rule 3 - Blocking] tauri::test module gated behind test feature**
- **Found during:** Task 1 test compilation
- **Issue:** `use tauri::test` failed — module gated behind `#[cfg(any(test, feature = "test"))]` on tauri crate; unavailable to downstream crates via `#[cfg(test)]` alone
- **Fix:** Rewrote Rust tests to test atomic operations directly without AppHandle; removed `tauri::test` dependency
- **Files modified:** `apps/frontend/src-tauri/src/ble/mod.rs`
- **Commit:** `12a7e841`

**4. [Rule 3 - Blocking] Pre-commit hook failures (typecheck + lint)**
- **Found during:** Task 2 commit
- **Issue:** Mock callback type mismatch in `use-invert-controls.test.ts` (listen callback expected `(payload: unknown) => void` but mock provided `(event: { payload: unknown }) => void`). Import ordering violation in `use-gamepad.ts` (missing blank line between import groups).
- **Fix:** Aligned mock pattern with existing `use-gamepad.test.ts` wrapper approach. Added blank line between `"../types"` and `"./use-invert-controls"` imports.
- **Files modified:** `apps/frontend/src/hooks/use-invert-controls.test.ts`, `apps/frontend/src/hooks/use-gamepad.ts`
- **Commit:** `c1c7c3db`

## Success Criteria Verification

- [x] AtomicBool inversion state in Rust with toggle_invert / get_invert_state commands
- [x] useInvertControls hook reads/writes inversion state via Tauri IPC
- [x] useGamepad transforms direction F↔B when inverted, exposes inverted/toggleInvert
- [x] control-pad.tsx transforms ▲/▼ commands when inverted, shows toggle button
- [x] app.tsx unchanged (locked file constraint respected)
- [x] All existing tests pass (220 total); new tests cover inversion paths
- [x] L/R/S never affected by inversion

## Test Results

- **Rust:** 12 passed, 0 failed (4 new inversion tests + 8 pre-existing)
- **Frontend:** 220 passed, 0 failed across 11 test files
- **Typecheck:** Clean
- **Lint:** Clean

## Self-Check: PASSED

- [x] `apps/frontend/src/hooks/use-invert-controls.ts` exists
- [x] `apps/frontend/src/hooks/use-invert-controls.test.ts` exists
- [x] Commit `12a7e841` exists (Rust inversion state)
- [x] Commit `c1c7c3db` exists (useInvertControls hook + useGamepad integration)
- [x] Commit `5345b742` exists (ControlPad inversion + toggle button)
- [x] `apps/frontend/src/app.tsx` unmodified

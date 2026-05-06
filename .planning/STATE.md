---
milestone: v2.0
milestone_name: Tauri Migration
status: in_progress
progress_phases: 6
progress_plans: 2
progress_tasks: 4
---

# STATE.md

## Project Reference

See: .planning/PROJECT.md (updated 2026-05-05)

**Core value:** Control a real robot from Steam Deck gamepad input with low latency — commands must reach the robot reliably and quickly.
**Current focus:** Phase 6 COMPLETE — Ready for Phase 7 (BLE Commands)

## Current Position

Phase: 6 (Tauri Shell Setup) — COMPLETE ✓
Plan: All plans complete
Status: Phase 6 complete — Wave 1 executed successfully
Last activity: 2026-05-06 - Phase 6 execution complete (build ✅, tests ✅ 39/39)

## Progress

| Phase | Status | Plans | Progress |
|-------|--------|-------|----------|
| 6. Tauri Shell Setup | Not started | 0/3 | 0% |
| 7. BLE Commands with btleplug | Not started | 0/3 | 0% |
| 8. Gamepad Monitoring with gilrs | Not started | 0/3 | 0% |
| 9. Hook Rewrites | Not started | 0/2 | 0% |
| 10. Build and Test on SteamOS | Not started | 0/2 | 0% |

## Decisions Made

- D-02: Backend extends @ks0555/tsconfig/tsconfig.node.json
- D-07: Backend ESLint uses packages/eslint-config/src/node.js
- D-10: Frontend extends @ks0555/tsconfig/tsconfig.react.json
- D-12: Frontend ESLint uses packages/eslint-config/src/react.js
- D-13: Use factory functions (createMockGamepad) instead of Partial<T> for complex DOM mock types
- D-14: Use non-null assertions (!) for mock instances guaranteed by beforeEach setup
- D-15: Added @typescript-eslint/parser to react.js ESLint config for TypeScript parsing
- D-16: Set tsconfigRootDir to process.cwd() in node.js ESLint config for correct tsconfig resolution
- D-17: Add ESLint overrides for *.config.ts files to exclude from type-aware linting
- D-18: (Phase 5) Use ESM export default [...] for eslint-config (not CommonJS module.exports)
- D-19: (Phase 5) Use "type": "module" in packages/eslint-config/package.json
- D-20: (Phase 5) Use import type {...} for plugin types, import() for runtime plugin loading
- D-21: (Phase 5) Use tsup to compile .ts → .js + .d.ts (ESM format)
- D-22: (Phase 5) Rename node.js → node.ts, react.js → react.ts in packages/eslint-config/src/
- D-23: (Phase 5) Disable dts in tsup.config.ts (eslint-plugin-perfectionist has no Plugin export)
- D-24: (Phase 5) Add tsconfig.json with relative path to @ks0555/tsconfig (not package reference)

## Accumulated Context

### Phase 6 Notes
- Phase 6 COMPLETE — Tauri v2 shell initialized and Vite configured
- `apps/frontend/src-tauri/` created with Cargo.toml, tauri.conf.json, src/main.rs, build.rs, permissions/default.toml
- Tauri v2.11.0 (plan specified 2.10.1, auto-corrected to latest), tauri-build 2.6.0
- Rust deps: btleplug 0.12.0 (bluez feature removed — doesn't exist), gilrs 0.11.1, tokio with macros + rt-multi-thread
- Frontend package.json: @tauri-apps/cli ^2.10.1, @tauri-apps/api ^2.10.1, tauri scripts added
- Vite config: clearScreen false, strictPort true, port 5173, watch ignore src-tauri/**
- Deviations: bundle format corrected for Tauri 2.11.0, placeholder RGBA icon added for generate_context!()
- `pnpm --filter @ks0555/frontend build` passes ✅
- All 39 tests pass ✅

### Phase 5 Notes
- Phase 5 COMPLETE — ESLint config converted to TypeScript ESM
- `node.js` → `node.ts`, `react.js` → `react.ts` (ESM export default)
- Added `tsup.config.ts` for ESM build (dist/ output)
- Updated `package.json` with `"type": "module"`, `"main": "dist/node.js"`, `"types": "dist/node.d.ts"`
- Both apps' lint scripts updated to reference `.ts` config files
- `pnpm build`, `pnpm typecheck`, `pnpm lint` all pass with zero errors
- Auto-fixes: installed tsup, @types/node; added tsconfig.json; disabled dts (eslint-plugin-perfectionist has no Plugin export)
- Known issue resolved by quick task 260505-nxp: 15 leftover `.js` files in `apps/frontend/` deleted (all had .ts/.tsx counterparts)

### Quick Tasks Completed

| # | Description | Date | Commit | Directory |
|---|-------------|------|--------|-----------|
| 260505-nhk | fix ts-review findings | 2026-05-05 | 7a6b3a8 | [260505-nhk-fix-ts-review-findings](./quick/260505-nhk-fix-ts-review-findings/) |
| 260505-nxp | delete 15 leftover .js files from TS migration | 2026-05-05 | 9332916 | [260505-nxp-make-sure-there-are-no-js-files-after-th](./quick/260505-nxp-make-sure-there-are-no-js-files-after-th/) |

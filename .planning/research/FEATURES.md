# Feature Research: Tauri v2 BLE + Gamepad Migration

**Domain:** Tauri v2 desktop app — BLE robot control via gamepad input
**Researched:** 2026-05-05
**Confidence:** HIGH (Context7 + official docs for btleplug, gilrs, Tauri v2)

## Feature Landscape

### Table Stakes (Users Expect These)

Features users assume exist. Missing these = product feels incomplete.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| BLE connect to BT24 device | Core functionality — without it, robot cannot be controlled | MEDIUM | btleplug `peripheral.connect().await` + service discovery on service UUID `0000ffe0-0000-1000-8000-00805f9b34fb` |
| BLE send command (F/B/L/R/S) | Robot receives direction commands via characteristic `0000ffe1` | LOW | btleplug `peripheral.write(&char, data, WriteType::WithoutResponse).await` — use WithoutResponse for low latency |
| BLE disconnect | Clean disconnection when user requests or device lost | LOW | btleplug `peripheral.disconnect().await` + handle `CentralEvent::DeviceDisconnected` |
| Gamepad direction detection (F/B/L/R/S) | Steam Deck left stick maps to robot direction | MEDIUM | gilrs `gamepad.value(Axis::LeftStickX/Y)` → compare abs values → return direction, same logic as current `use-gamepad.ts` |
| Gamepad deadzone 0.15 | Prevent jitter when stick is near center | LOW | gilrs default filters include deadzone, but must override to 0.15 via `GilrsBuilder.with_default_filters(true)` + custom `axis_dpad_to_button` or manually filter: `if abs(x) < 0.15 && abs(y) < 0.15 → "S"` |
| Gamepad connect/disconnect detection | App reflects actual gamepad state | LOW | gilrs event loop: `while let Some(event) = gilrs.next_event()` → match `EventType::Connected` / `Disconnected` |
| Tauri commands: ble_connect, ble_disconnect, ble_send | Frontend `use-bluetooth.ts` calls these via `invoke()` | MEDIUM | `#[tauri::command] fn ble_connect(app: AppHandle) { ... }` — must be async |
| Tauri events emitted from Rust background threads | Frontend `use-gamepad.ts` listens via `listen()` | MEDIUM | Clone `AppHandle` into `tauri::async_runtime::spawn()` or `std::thread::spawn()`, then `handle.emit("event-name", payload)` |
| Stable hook return shape | app.tsx, control-pad.tsx, status-bar.tsx must be unchanged | LOW | `useBluetooth()` returns `{ connected, connecting, unsupported, connect, send }`, `useGamepad()` returns `{ direction, gamepadConnected }` |

### Differentiators (Competitive Advantage)

Features that set the product apart. Not required, but valuable.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Reconnect on disconnect | Automatically reconnects to BT24 if connection drops | MEDIUM | Listen for `CentralEvent::DeviceDisconnected`, retry `connect()` with backoff |
| Steam Deck controller name filter | Prioritizes Steam Deck built-in gamepad over others | LOW | gilrs: check `gamepad.name()` contains "Steam" or use SDL_GAMECONTROLLERCONFIG (Steam sets this) |
| Low-latency command send (WithoutResponse) | Faster robot response — no ACK per command | LOW | btleplug `WriteType::WithoutResponse` for F/B/L/R/S commands (robot doesn't send ACK anyway) |
| Direction change guard (no duplicate events) | Only emit `gamepad-direction` when direction actually changes | LOW | Cache previous direction, compare before emitting — already in current `use-gamepad.ts` logic, must replicate in Rust |
| Connection state persistence across hot reload | Tauri dev mode doesn't lose BLE connection | LOW | Manage `Peripheral` in Tauri state (`app.manage()`) so it survives frontend reloads |

### Anti-Features (Commonly Requested, Often Problematic)

Features that seem good but create problems.

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| Motor speed control (u<number>#, v<number>#) | More granular control | Not needed for MVP, adds protocol complexity | Defer to v2+ milestone |
| Windows/macOS builds | Broader compatibility | Steam Deck target only, adds CI/test complexity | Linux/SteamOS AppImage only |
| Flatpak packaging | "Standard" Steam Deck format | Tauri AppImage works fine, Flatpak adds sandboxing issues for BLE/gamepad | Tauri AppImage |
| Force feedback (rumble) on gamepad | "Cool feature" | gilrs supports it but adds unnecessary complexity for robot control | Not needed — focus on direction control |
| Multiple robot connections | "Control more robots" | BT24 is point-to-point, only one connection at a time | Single BT24 connection, clearly documented |

## Feature Dependencies

```
BLE Connect (ble_connect command)
    └──requires──> btleplug Manager + Adapter initialization
                        └──requires──> Tauri setup() with async_runtime::spawn

BLE Send (ble_send command)
    └──requires──> BLE Connect (must be connected)
                        └──requires──> Discovered characteristic (0000ffe1)

BLE Disconnect (ble_disconnect command)
    └──requires──> BLE Connect (must be connected)

Gamepad Direction Detection
    └──requires──> gilrs Gilrs initialization in background thread
                        └──requires──> Tauri setup() with thread spawn
    └──enhances──> Direction change guard (no duplicate events)

Tauri Events (ble-state-changed, gamepad-direction, etc.)
    └──requires──> AppHandle clone passed to background threads
    └──requires──> Frontend listen() setup in hooks

Stable Hook Interfaces
    └──depends on──> Tauri commands returning promises (invoke)
                        └──depends on──> Tauri events for async notifications (listen)
```

### Dependency Notes

- **BLE Connect requires btleplug Manager + Adapter:** Must call `Manager::new().await` then `manager.adapters().await` to get the first adapter, then `adapter.start_scan(ScanFilter::default()).await` with name filter "BT24"
- **BLE Send requires connected peripheral + discovered characteristic:** After `connect()`, call `peripheral.discover_services().await`, then find characteristic with UUID `0000ffe1`
- **Gamepad detection requires gilrs background thread:** gilrs event loop must run in a separate thread (tokio spawn or std thread), continuously calling `gilrs.next_event()` and emitting Tauri events
- **Tauri events require AppHandle in background thread:** Clone `app.handle()` and move into the spawned thread, then call `handle.emit("event", payload)`

## MVP Definition

### Launch With (v1 — This Milestone)

Minimum viable product — what's needed to validate the concept.

- [ ] BLE connect to BT24 device (service UUID `0000ffe0`, char UUID `0000ffe1`) — core functionality
- [ ] BLE send command (F/B/L/R/S as bytes) — robot receives direction
- [ ] BLE disconnect — clean state management
- [ ] Gamepad direction detection from LeftStick X/Y with deadzone 0.15 — same behavior as current `use-gamepad.ts`
- [ ] Gamepad connect/disconnect detection — `gamepad-connected` / `gamepad-disconnected` events
- [ ] Tauri commands: `ble_connect`, `ble_disconnect`, `ble_send` — `use-bluetooth.ts` rewritten to use `invoke()`
- [ ] Tauri events from Rust: `ble-state-changed`, `gamepad-direction`, `gamepad-connected`, `gamepad-disconnected` — `use-gamepad.ts` rewritten to use `listen()`
- [ ] Stable hook return shapes — `useBluetooth()` and `useGamepad()` interfaces unchanged

### Add After Validation (v1.x)

Features to add once core is working.

- [ ] Auto-reconnect on BLE disconnect — for better UX when robot goes out of range
- [ ] Steam Deck controller name filter ("Steam") — prioritize built-in controller
- [ ] Direction change guard in Rust — only emit when direction actually changes (replicate current JS logic)

### Future Consideration (v2+)

Features to defer until product-market fit is established.

- [ ] Motor speed control (u/v commands) — requires UI changes, not in scope for MVP
- [ ] Multiple robot profiles — save/load BT24 device mappings
- [ ] Flatpak packaging — if AppImage proves insufficient for Steam Deck distribution

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| BLE connect to BT24 | HIGH | MEDIUM | P1 |
| BLE send command | HIGH | LOW | P1 |
| BLE disconnect | HIGH | LOW | P1 |
| Gamepad direction detection (deadzone 0.15) | HIGH | MEDIUM | P1 |
| Gamepad connect/disconnect | MEDIUM | LOW | P1 |
| Tauri commands (ble_connect, etc.) | HIGH | MEDIUM | P1 |
| Tauri events from background threads | HIGH | MEDIUM | P1 |
| Stable hook interfaces | HIGH | LOW | P1 |
| Auto-reconnect | MEDIUM | MEDIUM | P2 |
| Steam Deck controller filter | LOW | LOW | P2 |
| Direction change guard | MEDIUM | LOW | P2 |
| Motor speed control | LOW | HIGH | P3 |
| Windows/macOS builds | LOW | HIGH | P3 |
| Force feedback (rumble) | LOW | MEDIUM | P3 |

**Priority key:**
- P1: Must have for launch (this milestone)
- P2: Should have, add when possible
- P3: Nice to have, future consideration

## Expected Behaviors (Research Findings)

### BLE Connect/Send/Disconnect with BT24 Device

**Connect flow (based on btleplug docs, HIGH confidence):**
1. `Manager::new().await` → get `Manager`
2. `manager.adapters().await` → get `Vec<Adapter>`, take first
3. `adapter.start_scan(ScanFilter { ... })` with name filter "BT24"
4. Poll `adapter.peripherals().await` to find device with `local_name` containing "BT24"
5. `peripheral.connect().await` → GATT connection
6. `peripheral.discover_services().await` → discover characteristics
7. Find characteristic with UUID `0000ffe1-0000-1000-8000-00805f9b34fb`
8. Store `Peripheral` in Tauri managed state (`app.manage()`) for later use
9. Emit `ble-state-changed` event with payload `{ state: "connected" }`

**Send flow (based on btleplug docs, HIGH confidence):**
1. Retrieve `Peripheral` from Tauri managed state
2. Get stored characteristic (or re-find by UUID)
3. Convert command string "F" to bytes: `command.as_bytes()`
4. `peripheral.write(&characteristic, &bytes, WriteType::WithoutResponse).await`
5. Use `WithoutResponse` because BT24 doesn't ACK, and low latency matters

**Disconnect flow (based on btleplug docs, HIGH confidence):**
1. Retrieve `Peripheral` from state
2. `peripheral.disconnect().await`
3. Emit `ble-state-changed` event with payload `{ state: "disconnected" }`
4. Handle `CentralEvent::DeviceDisconnected` for unexpected disconnects

### Gamepad Direction Detection with Deadzone 0.15

**Direction detection (based on gilrs docs + current use-gamepad.ts, HIGH confidence):**
1. gilrs event loop in background thread: `while let Some(event) = gilrs.next_event()`
2. On `EventType::AxisChanged { axis, value }` where axis is `LeftStickX` or `LeftStickY`:
   - Get both axes: `gamepad.value(Axis::LeftStickX)` and `gamepad.value(Axis::LeftStickY)`
   - Apply deadzone: `if abs(x) < 0.15 && abs(y) < 0.15 → direction = "S"`
   - Compare absolute values: `if abs(y) > abs(x)` → `y < 0 ? "F" : "B"`, else `x < 0 ? "L" : "R"`
3. Only emit `gamepad-direction` event when direction changes (direction change guard)
4. Same logic as current `getDirectionFromAxes()` in `use-gamepad.ts`

**Deadzone handling (based on gilrs docs, MEDIUM confidence):**
- gilrs has built-in deadzone filter via `GilrsBuilder.with_default_filters(true)` which includes `deadzone` filter
- Default deadzone value is `DEFAULT_DEADZONE` (check gilrs source: likely 0.1 or similar)
- Must manually enforce 0.15: after getting axis values, check `abs(x) < 0.15` before processing
- Alternatively: use `gamepad.deadzone(axis_code)` to check per-axis deadzone, but manual check is simpler

**Steam Deck controller detection (based on gilrs docs, HIGH confidence):**
- gilrs on Linux uses evdev, reads from `/dev/input/event*`
- Steam sets `SDL_GAMECONTROLLERCONFIG` environment variable with mappings
- gilrs supports `SDL_GAMECONTROLLERCONFIG` → Steam Deck controller will be recognized
- To filter: check `gamepad.name()` contains "Steam" or just use first connected gamepad (Steam Deck usually has one built-in)

### Emitting Tauri Events from Rust Background Threads

**Pattern (based on Tauri v2 docs + StackOverflow examples, HIGH confidence):**
```rust
use tauri::{AppHandle, Emitter, Manager};
use tauri::async_runtime;

fn setup(app: &mut tauri::App) -> Result<(), Box<dyn std::error::Error>> {
    let handle = app.handle().clone();

    // Spawn background thread for BLE/gamepad
    async_runtime::spawn(async move {
        // In real code, this would be the event loop
        loop {
            // Do work...
            handle.emit("gamepad-direction", "F").unwrap();
        }
    });

    Ok(())
}
```

**Key points:**
- Clone `AppHandle` (cheap to clone) and move into thread
- `AppHandle` implements `Emitter` trait → `handle.emit(event, payload)`
- Payload must implement `Serialize` (use `#[derive(Serialize)]` on structs)
- `tauri::async_runtime::spawn()` for async, `std::thread::spawn()` for sync threads
- Frontend: `import { listen } from '@tauri-apps/api/event'` then `listen('event-name', callback)`

## Competitor Feature Analysis

| Feature | Web Bluetooth + Gamepad API (old) | Tauri v2 + btleplug + gilrs (new) |
|---------|-----------------------------------|-------------------------------------|
| BLE connectivity | ❌ WebKitGTK blocks `navigator.bluetooth` on Linux/SteamOS | ✅ btleplug works natively on Linux |
| Gamepad access | ❌ Steam Input intercepts before WebView gets `navigator.getGamepads()` | ✅ gilrs reads evdev directly, bypasses Steam Input |
| Hook interfaces | `useBluetooth()` + `useGamepad()` with same return shape | Must keep same return shape — `invoke()` + `listen()` internally |
| Background processing | `requestAnimationFrame` poll loop in JS | Native Rust thread with `gilrs.next_event()` loop |
| Latency | Higher (JS → WebView → OS) | Lower (Rust → OS directly) |

## Sources

- **btleplug documentation** (Context7 `/deviceplug/btleplug`): BLE connect, disconnect, write, service/characteristic discovery
- **gilrs documentation** (docs.rs/gilrs): `Axis` enum (LeftStickX=1, LeftStickY=2), `Gamepad::value()`, `GilrsBuilder`, deadzone filters, `next_event()` loop, `SDL_GAMECONTROLLERCONFIG` support
- **Tauri v2 documentation** (Context7 `/tauri-apps/tauri-docs`): `AppHandle::emit()`, `listen()` frontend, `async_runtime::spawn()`, `Manager::manage()` for state, `#[tauri::command]` for invoke handlers
- **Tauri v2 background tasks** (sneakycrow.dev blog): Pattern for spawning async tasks that emit events
- **StackOverflow examples**: Emitting events from Rust threads in Tauri
- **Current codebase**: `apps/frontend/src/hooks/use-bluetooth.ts`, `apps/frontend/src/hooks/use-gamepad.ts` — existing logic to replicate

---
*Feature research for: Tauri v2 BLE + Gamepad migration to Steam Deck*
*Researched: 2026-05-05*

# Domain Pitfalls

**Domain:** Tauri v2 + btleplug + gilrs migration for Steam Deck controller  
**Researched:** 2026-05-05  
**Overall confidence:** HIGH for Tauri/gilrs, MEDIUM for btleplug (Linux-specific issues)

## Critical Pitfalls

Mistakes that cause rewrites or major issues.

### Pitfall 1: Using `Window` Instead of `AppHandle` for Cross-Thread Event Emitting

**What goes wrong:**  
Rust compiler error: `future cannot be sent between threads safely` when trying to emit events from a background thread or `tauri::async_runtime::spawn`. The `Window` type (and types containing it) doesn't implement `Send`.

**Why it happens:**  
`tauri::Window` wraps internal Tao window handles that use `Rc<...>` (reference-counted, non-atomic) which isn't `Send`. When you capture `Window` in an async block spawned onto a background thread, the future becomes non-`Send`.

**Consequences:**  
Cannot emit events from background threads (btleplug callbacks, gilrs event loop). The core feature of streaming BLE data and gamepad events to the frontend breaks at compile time.

**Prevention:**  
Always use `AppHandle` (from `tauri::Manager`) for emitting events from threads. Get it via `app.handle().clone()` in `.setup()` and move it into the spawned task.

```rust
// WRONG - Window doesn't implement Send
#[tauri::command]
async fn do_task(window: Window) {
    tokio::spawn(async move {
        window.emit("event", "data"); // COMPILER ERROR
    });
}

// CORRECT - AppHandle implements Send
#[tauri::command]
async fn do_task(app: AppHandle) {
    let handle = app.clone();
    tauri::async_runtime::spawn(async move {
        handle.emit("event", "data").unwrap(); // OK
    });
}
```

**Detection:**  
Rust compiler error: `the trait Send is not implemented for Rc<...>` or `future cannot be sent between threads safely`.

**Sources:**  
- GitHub issue #3135: `tauri::Window` doesn't fully implement Send (HIGH confidence - Context7 docs)
- SneakyCrow blog: Long-running backend async tasks in Tauri v2 (HIGH confidence - Context7 docs)

---

### Pitfall 2: btleplug Scan Filtering on Linux is Not Exclusive

**What goes wrong:**  
Your app receives BLE advertisements for devices you didn't filter for. The BT24 device may be drowned out by other BLE devices in range.

**Why it happens:**  
On Linux, btleplug forwards `ScanFilter` to BlueZ D-Bus API. However, BlueZ **merges** discovery filters across ALL D-Bus clients. Your app receives the **union** of all applications' filters, not just your own. Additionally, BlueZ's UUID filter can drop some advertisement types.

**Consequences:**  
`start_scan()` with `ServiceUUID` filter for BT24 still returns other devices. If you rely solely on btleplug's filter, your connection logic may try to connect to wrong devices.

**Prevention:**  
Always perform **post-filtering** on scan results. Don't trust btleplug's `ScanFilter` on Linux.

```rust
// WRONG - relies on btleplug filter on Linux
adapter.start_scan(ScanFilter {
    service_uuids: vec![BT24_SERVICE_UUID],
    ..Default::default()
}).await?;
// Later: peripheral.properties().local_name may be from OTHER devices

// CORRECT - post-filter results
adapter.start_scan(ScanFilter::default()).await?; // OR with filter, but always verify
// In discovery callback:
if peripheral.properties().local_name == Some("BT24".to_string()) {
    // This is actually our device
}
```

**Detection:**  
Log all discovered device names during testing. If you see non-BT24 devices, you're seeing the union filter problem.

**Sources:**  
- btleplug README: "Scan Filtering on Linux (BlueZ)" section (HIGH confidence - Context7 docs)
- btleplug GitHub issues #165, #244 (MEDIUM confidence - WebSearch verified)

---

### Pitfall 3: Event Rate Limiting Causes App Crashes

**What goes wrong:**  
App crashes (SIGABRT/SIGSEGV) when btleplug or gilrs emits events rapidly (e.g., gamepad polling at 60fps + BLE notifications).

**Why it happens:**  
Tauri v2's event system has internal rate limits. On Windows, the OS limits the event loop to ~10,000 messages. On all platforms, `Rc` reference counting in the dispatcher can corrupt if events flood from multiple threads. GitHub issue #8177 documents this.

**Consequences:**  
App crashes during active gamepad use or BLE data streaming. Intermittent, hard to reproduce, seems random.

**Prevention:**  
- Rate-limit events in Rust before emitting. Only emit on **state change**, not every poll.
- For gamepad: emit only when direction changes (which your existing use-gamepad.ts already does via `prevDirection` ref).
- For BLE: batch notifications if possible, or ensure characteristic writes are throttled.

```rust
// Gamepad event - only emit on direction change
let new_direction = get_direction(&gamepad);
if new_direction != last_direction {
    app.emit("gamepad-direction", new_direction).unwrap();
    last_direction = new_direction;
}
```

**Detection:**  
App crashes during active use. Check Tauri issue #8177. Add logging before emits to see if flooding.

**Sources:**  
- GitHub issue #8177: "Event emit crashes app with high call rate" (HIGH confidence - WebSearch verified with GitHub)
- Issue mentions Windows 10,000 message limit (MEDIUM confidence)

---

### Pitfall 4: gilrs Requires `/dev/input/event*` Read/Write Permissions

**What goes wrong:**  
gilrs fails to detect any gamepads on SteamOS. `Gilrs::new()` succeeds but `next_event()` never returns `Event::Connected`, or `gamepads()` iterator is empty.

**Why it happens:**  
On Linux, gilrs uses `evdev` to read from `/dev/input/event*` files. The user running the Tauri app needs read (and for force feedback, write) access to these files. Steam Deck in Gaming Mode runs under a user that should have these permissions via Valve's udev rules, but custom SteamOS images or immutable distros might not.

**Consequences:**  
Gamepad detection fails silently. `use-gamepad.ts` rewrite using `listen("gamepad-connected")` never fires.

**Prevention:**  
- Steam Deck ships with Valv'e udev rules (`60-steam-input.rules`) that grant access. Verify the file exists: `/lib/udev/rules.d/60-steam-input.rules` or `/etc/udev/rules.d/`.
- For non-SteamOS Linux: ensure user is in `input` group, or install `steam-devices` package.
- Test early: write a small Rust binary that creates `Gilrs` and lists gamepads.

```bash
# Check if udev rules exist
ls /lib/udev/rules.d/*steam* /etc/udev/rules.d/*steam* 2>/dev/null

# Check if user has access to event devices
getfacl /dev/input/event* 2>/dev/null | head -20
```

**Detection:**  
`gilrs.gamepads()` returns empty iterator. Check `Gilrs::new()` error result.

**Sources:**  
- gilrs docs.rs: "Linux/BSD (evdev)" section (HIGH confidence - Context7 docs)
- ValveSoftware/steam-devices GitHub (MEDIUM confidence - WebSearch)
- StackOverflow: gilrs requires udev rules for permissions (MEDIUM confidence)

---

### Pitfall 5: Hook Interface Contract Violation Breaks `app.tsx`

**What goes wrong:**  
After rewriting `use-bluetooth.ts` and `use-gamepad.ts` to use Tauri APIs, `app.tsx` breaks because the hook return shapes don't match.

**Why it happens:**  
The existing `app.tsx` destructures hooks with specific return shapes:

```typescript
// app.tsx expects:
const { connected: bleConnected, connecting, connect, send } = useBluetooth()
const { direction, gamepadConnected } = useGamepad()
```

If the Tauri-rewritten hooks return different property names, types, or function signatures, `app.tsx` will have runtime errors or TypeScript compile errors.

**Consequences:**  
The project constraint "keep app.tsx unchanged" is violated. Either `app.tsx` must be modified (defeats the purpose) or the hooks must exactly match.

**Prevention:**  
Define the interface contract BEFORE rewriting hooks. Use TypeScript interfaces to enforce:

```typescript
// Target interface (must match existing use-bluetooth.ts return)
interface UseBluetoothReturn {
  connected: boolean
  connecting: boolean
  unsupported: boolean
  connect: () => Promise<void>
  send: (data: string) => void
}

// Target interface (must match existing use-gamepad.ts return)
interface UseGamepadReturn {
  direction: "F" | "B" | "L" | "R" | "S"
  gamepadConnected: boolean
}
```

Then implement the Tauri version to satisfy these interfaces EXACTLY.

**Detection:**  
TypeScript errors in `app.tsx`. Runtime: `connected` is `undefined`, `send` is not a function, etc.

**Sources:**  
- Project CLAUDE.md: "Keep stable hook interfaces — app.tsx unchanged" (HIGH confidence - file read)
- Existing hook implementations (HIGH confidence - file read)

---

## Moderate Pitfalls

### Pitfall 6: React StrictMode Double-Fire on `listen()` in `useEffect`

**What goes wrong:**  
In development mode with `React.StrictMode`, the `useEffect` runs twice. If `listen()` is called asynchronously, the cleanup may run before the second `listen()` finishes, leaving orphaned listeners.

**Why it happens:**  
React StrictMode intentionally double-invokes effect functions to detect side-effect bugs. The `listen()` function returns a `Promise<UnlistenFn>`. If you store the unlisten in a `let` and the effect runs twice:
1. First effect: `listen()` starts, `unlisten` not yet set
2. Cleanup runs: `unlisten` is undefined, doesn't cleanup
3. Second effect: new `listen()` starts, now you have TWO listeners

**Consequences:**  
Event handlers fire twice per event. In development mode, you see duplicate "gamepad-direction" events.

**Prevention:**  
Use the Promise-based cleanup pattern (from StackOverflow answer by FabianLars):

```typescript
// CORRECT - handles StrictMode
useEffect(() => {
  const unlisten = listen<string>('gamepad-direction', (event) => {
    setDirection(event.payload)
  })
  
  return () => {
    unlisten.then(f => f()) // Wait for listen to finish before cleaning up
  }
}, [])
```

**Detection:**  
Events firing twice in development. Check if `React.StrictMode` is enabled in `main.tsx`.

**Sources:**  
- StackOverflow #76639536: "In Tauri with React, how do you properly clean up listening" (MEDIUM confidence - WebSearch)
- GitHub issue #8913: "Unable to unlisten event properly in react's useEffect" (MEDIUM confidence)

---

### Pitfall 7: btleplug "Software Caused Connection Abort" on Linux

**What goes wrong:**  
After successfully connecting to BT24, the connection immediately drops with error "Software caused connection abort". More likely to happen on Linux than macOS/Windows.

**Why it happens:**  
This is a known btleplug issue on Linux/BlueZ (GitHub issue #412). The root cause is non-standard BLE behavior from some devices. BlueZ may disconnect if the device doesn't follow the spec (e.g., doesn't send expected `method_return` D-Bus message).

**Consequences:**  
Cannot maintain stable BLE connection to BT24. May need to retry connections, or the device may be fundamentally incompatible.

**Prevention:**  
- Implement retry logic with backoff in the `ble_connect` Tauri command.
- Log the exact BlueZ error to diagnose if it's the known issue.
- Test with `bluetoothctl` to see if the issue is btleplug-specific or device-specific.

```rust
// Retry logic for ble_connect
for attempt in 1..=3 {
    match connect_to_device(&adapter, &address).await {
        Ok(_) => return Ok(()),
        Err(e) if attempt < 3 => {
            eprintln!("Connection attempt {} failed: {}, retrying...", attempt, e);
            tokio::time::sleep(Duration::from_millis(500 * attempt)).await;
        }
        Err(e) => return Err(e),
    }
}
```

**Detection:**  
Error message "Software caused connection abort" in Rust logs. Connection drops immediately after connecting.

**Sources:**  
- btleplug GitHub issue #412: "Software caused connection abort" (MEDIUM confidence - WebSearch)
- bleak GitHub issue #1364: similar BlueZ issues (MEDIUM confidence - cross-reference)

---

### Pitfall 8: gilrs Event Loop Must Call `next_event()` to Process Events

**What goes wrong:**  
gilrs doesn't fire `Event::Connected` or `Event::ButtonPressed` events even though the gamepad is connected and buttons are pressed.

**Why it happens:**  
Unlike the JavaScript `navigator.getGamepads()` which the browser polls automatically, gilrs is **passive**. You must explicitly call `gilrs.next_event()` in a loop to process pending events. If your Rust code doesn't call `next_event()`, events queue up but never fire.

**Consequences:**  
The Tauri backend never emits `gamepad-connected` or `gamepad-direction` events. Frontend `use-gamepad.ts` never receives updates.

**Prevention:**  
Run a dedicated event loop thread that continuously calls `next_event()`:

```rust
// In your Tauri setup or a spawned task
std::thread::spawn(move || {
    let mut gilrs = Gilrs::new().unwrap();
    loop {
        // Process all pending events
        while let Some(event) = gilrs.next_event() {
            match event.event {
                EventType::Connected => {
                    app.emit("gamepad-connected", true).unwrap();
                }
                EventType::Disconnected => {
                    app.emit("gamepad-disconnected", true).unwrap();
                }
                // ... handle other events
            }
        }
        // Small sleep to prevent 100% CPU usage
        std::thread::sleep(Duration::from_millis(10));
    }
});
```

**Detection:**  
Gamepad events never fire. Add `println!` debugging in the gilrs event loop to verify it's running.

**Sources:**  
- gilrs docs.rs: "Event loop" section (HIGH confidence - Context7 docs)
- gilrs GitHub README examples (HIGH confidence)

---

### Pitfall 9: Steam Input Intercepts Gamepad Before gilrs Sees It

**What goes wrong:**  
Steam Input (in Gaming Mode) creates a virtual Xbox 360 controller (`28de:11ff`) and hides the physical gamepad. Your gilrs code might pick up the virtual controller instead of the real Steam Deck gamepad.

**Why it happens:**  
Steam Input intercepts physical gamepads and presents a virtualized controller to applications. This allows Steam to do input remapping. The virtual controller has different vendor/product IDs than the physical device.

**Consequences:**  
You might be reading input from the virtual controller (which may not have all axes/buttons) instead of the physical Steam Deck gamepad.

**Prevention:**  
- Filter by device name or ID. Steam Deck built-in gamepad has `28DE:1205` (LCD and OLED).
- Use `gamepad.name()` to identify the correct gamepad.
- The existing `use-gamepad.ts` filters with `g?.id.includes("Steam")`. Do the same in Rust.

```rust
// Filter for Steam Deck gamepad
let steam_gamepad = gilrs.gamepads()
    .find(|(_, gp)| gp.name().contains("Steam") || gp.name().contains("Deck"))
    .map(|(id, _)| id);
```

**Detection:**  
`gamepad.name()` returns "Xbox 360 Controller" (virtual) instead of "Steam Deck" (physical). Check logs.

**Sources:**  
- Alice Mikhaylenko blog: "Steam Deck, HID, and libmanette adventures" (MEDIUM confidence - WebSearch)
- SDL GitHub issue #10073: Steam Deck gamepad detection (MEDIUM confidence)

---

## Minor Pitfalls

### Pitfall 10: Tauri `invoke()` is Async, `send()` Must Handle Promises

**What goes wrong:**  
The existing `use-bluetooth.ts` calls `send()` which does a synchronous `characteristic.writeValue()`. The Tauri version using `invoke("ble_send", data)` returns a `Promise`. If `send()` doesn't handle this, the command may not be sent.

**Why it happens:**  
Web Bluetooth API's `writeValue()` returns a `Promise`, but the existing code ignores the return value (`void characteristic.writeValue(...)`). Tauri's `invoke()` also returns a `Promise`. If the hook's `send` function doesn't `await` or handle the promise, errors may be silently swallowed.

**Consequences:**  
Commands don't reach the robot. No error messages. Debugging is difficult.

**Prevention:**  
Wrap `invoke()` in the new `send()` function and handle errors:

```typescript
// New use-bluetooth.ts send function
const send = useCallback((data: string) => {
  invoke("ble_send", { data }).catch((err) => {
    console.error("Failed to send BLE command:", err)
  })
}, [])
```

**Detection:**  
Robot doesn't respond to commands. Check browser/WebView console for errors.

**Sources:**  
- Tauri docs: `invoke` returns `Promise` (HIGH confidence - Context7 docs)
- Existing use-bluetooth.ts implementation (HIGH confidence - file read)

---

### Pitfall 11: `@tauri-apps/api` Version Mismatch After Migration

**What goes wrong:**  
After running `tauri migrate` or manual v1→v2 migration, the `@tauri-apps/api` npm package is still at v1.x. Tauri v2 requires `@tauri-apps/api@2.x`. The `invoke` and `listen` functions may have different signatures or be in different modules.

**Why it happens:**  
The Tauri migration tool doesn't always update npm packages. The developer runs `tauri migrate` for Rust code but forgets to update the frontend package.

**Consequences:**  
`invoke` or `listen` imports fail. Runtime error: `Cannot read properties of undefined (reading 'invoke')`.

**Prevention:**  
After migration, manually verify and update:

```bash
npm install @tauri-apps/api@latest
# or
pnpm add @tauri-apps/api@latest
```

Check `package.json` to confirm version is `^2.0.0`.

**Detection:**  
Console error: `window.__TAURI__.core is undefined` or similar. Check `@tauri-apps/api` version in `package.json`.

**Sources:**  
- GitHub issue #11495: "Automatic migration does not update @tauri-apps/api" (MEDIUM confidence - WebSearch)
- GitHub issue #14505: React Tauri TypeScript demo app Greet button fails (MEDIUM confidence)

---

### Pitfall 12: BlueZ Version on SteamOS Affects BLE Stability

**What goes wrong:**  
SteamOS 3.6.x (and some 3.5.x versions) had Bluetooth connection issues. The BlueZ version shipped with SteamOS affects btleplug stability. SteamOS 3.7.x updates BlueZ to 5.76 which fixes many issues.

**Why it happens:**  
BlueZ is the Linux Bluetooth stack. Older versions have bugs with certain BLE devices. SteamOS updates sometimes lag behind BlueZ releases.

**Consequences:**  
Intermittent BLE connection failures. Devices connect then immediately disconnect. May appear as btleplug bug but is actually SteamOS/BlueZ issue.

**Prevention:**  
- Document minimum SteamOS version: 3.7.x (build 20240606 or later) with BlueZ 5.76.
- Add a check in the app: read `/etc/os-release` or check if BLE works, show warning if SteamOS < 3.7.
- Test on both SteamOS 3.5.x (expect issues) and 3.7.x (expect stable).

**Detection:**  
Check SteamOS version: `cat /etc/os-release | grep BUILD_ID`. Check BlueZ version: `bluetoothd --version`.

**Sources:**  
- ValveSoftware/SteamOS issue #1516: "Bluetooth Devices Connection Issue" (MEDIUM confidence - WebSearch)
- Comments mention BlueZ 5.76 fixes (MEDIUM confidence)

---

## Phase-Specific Warnings

| Phase Topic | Likely Pitfall | Mitigation |
|-------------|----------------|------------|
| **Phase 1: Tauri Shell Setup** | `@tauri-apps/api` version mismatch | Verify npm package version after `tauri migrate` |
| **Phase 2: BLE with btleplug** | Scan filter union problem (Pitfall 2) | Always post-filter scan results on Linux |
| **Phase 2: BLE with btleplug** | Cross-thread event emitting (Pitfall 1) | Use `AppHandle`, not `Window`, for emits |
| **Phase 2: BLE with btleplug** | Event rate limiting (Pitfall 3) | Only emit `ble-state-changed` on state changes |
| **Phase 3: Gamepad with gilrs** | `/dev/input` permissions (Pitfall 4) | Verify udev rules exist on Steam Deck |
| **Phase 3: Gamepad with gilrs** | Event loop not polling (Pitfall 8) | Run `next_event()` loop in dedicated thread |
| **Phase 3: Gamepad with gilrs** | Steam Input intercept (Pitfall 9) | Filter by "Steam" or "Deck" in gamepad name |
| **Phase 4: Hook Rewrites** | Interface contract violation (Pitfall 5) | Define TypeScript interfaces before rewriting |
| **Phase 4: Hook Rewrites** | StrictMode double-fire (Pitfall 6) | Use Promise-based cleanup in `useEffect` |
| **Phase 4: Hook Rewrites** | `send()` Promise handling (Pitfall 10) | Wrap `invoke()` with error handling |

---

## Sources

- **Context7 / Tauri v2 docs** (HIGH confidence): Event emitting, listen/unlisten patterns, State management with Mutex
- **Context7 / btleplug docs** (HIGH confidence): Linux BlueZ caveats, scan filtering behavior
- **Context7 / gilrs docs** (HIGH confidence): Linux evdev requirements, event loop pattern
- **GitHub: tauri-apps/tauri** (MEDIUM confidence): Issues #3135, #8177, #8913, #11495, #14505
- **GitHub: deviceplug/btleplug** (MEDIUM confidence): Issues #165, #244, #412, scan filter documentation
- **GitHub: ValveSoftware/SteamOS** (MEDIUM confidence): Issue #1516 Bluetooth connection issues
- **GitHub: ValveSoftware/steam-devices** (MEDIUM confidence): udev rules for Steam Deck gamepad
- **WebSearch: StackOverflow, blogs** (MEDIUM confidence): React+Tauri useEffect patterns, gilrs permissions
- **Project files** (HIGH confidence): PROJECT.md, use-bluetooth.ts, use-gamepad.ts, app.tsx (read directly)

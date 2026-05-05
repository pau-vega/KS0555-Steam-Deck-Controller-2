# Architecture Patterns: Tauri v2 Migration

**Domain:** Tauri v2 + React 19 + Vite 8 + Rust (btleplug + gilrs)
**Researched:** 2026-05-05
**Overall confidence:** HIGH (Context7 + official docs)

## Recommended Architecture

```
apps/frontend/
├── src/                    # React frontend (unchanged structure)
│   ├── components/
│   ├── hooks/
│   │   ├── use-bluetooth.ts    ← REWRITE: Tauri invoke/listen
│   │   └── use-gamepad.ts      ← REWRITE: Tauri listen
│   ├── app.tsx
│   └── main.tsx
├── src-tauri/              ← NEW: Rust backend
│   ├── Cargo.toml
│   ├── tauri.conf.json
│   ├── tauri.linux.conf.json   ← Platform-specific (AppImage)
│   └── src/
│       ├── lib.rs            ← Commands: ble_connect, ble_disconnect, ble_send
│       ├── ble.rs            ← btleplug BLE logic
│       ├── gamepad.rs        ← gilrs gamepad logic (background thread)
│       └── commands.rs       ← Shared types, event emissions
├── package.json
├── vite.config.ts           ← MODIFY: Tauri integration
└── dist/                    ← Created by vite build
```

### Component Boundaries

| Component | Responsibility | Communicates With |
|-----------|---------------|-------------------|
| React UI (app.tsx, control-pad.tsx, status-bar.tsx) | Display state, trigger actions | use-bluetooth, use-gamepad hooks (unchanged interfaces) |
| use-bluetooth.ts | Bridge BLE operations via Tauri IPC | Tauri invoke() → Rust commands; listen() ← Rust events |
| use-gamepad.ts | Bridge gamepad events via Tauri IPC | Tauri listen() ← Rust background thread events |
| Tauri Commands (Rust) | Execute BLE operations (connect, disconnect, send) | btleplug crate, emit events back to frontend |
| Tauri Background Thread (Rust) | Poll gamepad state via gilrs | Emit events: gamepad-direction, gamepad-connected, gamepad-disconnected |

### Data Flow

**Before (WebSocket - being replaced):**
```
React Hooks → WebSocket Client → Fastify Backend → SerialPort/BT24
                      ↓
React Hooks ← WebSocket Events ← Fastify Backend ← Gamepad/Web Bluetooth
```

**After (Tauri v2 IPC):**
```
React Hooks → invoke('ble_connect') → Rust Command (btleplug)
                    ↓
React Hooks ← listen('ble-state-changed') ← Rust Event Emission

React Hooks ← listen('gamepad-direction') ← Rust Background Thread (gilrs)
                    ↓
React Hooks ← listen('gamepad-connected/disconnected') ← Rust Events
```

## Patterns to Follow

### Pattern 1: Tauri Command with Event Emission

**What:** Rust command that performs an action and emits events on state change
**When:** BLE operations that have state transitions (connecting → connected/disconnected)

**Example (Rust backend):**
```rust
use tauri::{AppHandle, Emitter};
use serde::Serialize;

#[derive(Serialize, Clone)]
struct BleStateChanged {
    state: String, // "connecting", "connected", "disconnected", "unsupported"
}

#[tauri::command]
async fn ble_connect(app: AppHandle) -> Result<String, String> {
    app.emit("ble-state-changed", BleStateChanged { state: "connecting".into() })
        .map_err(|e| e.to_string())?;

    // btleplug connection logic here...
    // On success:
    app.emit("ble-state-changed", BleStateChanged { state: "connected".into() })
        .map_err(|e| e.to_string())?;
    Ok("connected".into())
}
```

**Frontend consumption (use-bluetooth.ts):**
```typescript
import { invoke } from '@tauri-apps/api/core';
import { listen } from '@tauri-apps/api/event';
import { useEffect, useCallback, useRef, useState } from 'react';

type BluetoothState = "disconnected" | "connecting" | "connected" | "unsupported";

export function useBluetooth() {
  const [state, setState] = useState<BluetoothState>("disconnected");
  const unlistenRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    // Listen for BLE state changes from Rust backend
    listen<BleStateChanged>('ble-state-changed', (event) => {
      setState(event.payload.state as BluetoothState);
    }).then((unlisten) => {
      unlistenRef.current = unlisten;
    });

    return () => {
      unlistenRef.current?.();
    };
  }, []);

  const connect = useCallback(async () => {
    setState("connecting");
    try {
      await invoke('ble_connect');
      // State updated via event listener
    } catch {
      setState("disconnected");
    }
  }, []);

  const send = useCallback((data: string) => {
    invoke('ble_send', { data });
  }, []);

  return {
    connected: state === "connected",
    connecting: state === "connecting",
    unsupported: state === "unsupported",
    connect,
    send,
  };
}

interface BleStateChanged {
  state: string;
}
```

### Pattern 2: Background Thread with Event Emission

**What:** Rust thread that continuously polls state and emits events
**When:** Gamepad polling (needs continuous axis/button monitoring)

**Example (Rust backend):**
```rust
use tauri::Manager;
use gilrs::{Gilrs, Event, Button, Axis};
use std::thread;
use std::time::Duration;

pub fn start_gamepad_monitoring(app: &tauri::App) {
    let handle = app.handle().clone();
    thread::spawn(move || {
        let mut gilrs = Gilrs::new().expect("Failed to initialize gilrs");

        loop {
            while let Some(event) = gilrs.next_event() {
                match event {
                    Event::Connected { id, .. } => {
                        handle.emit("gamepad-connected", format!("{:?}", id)).ok();
                    }
                    Event::Disconnected { id, .. } => {
                        handle.emit("gamepad-disconnected", format!("{:?}", id)).ok();
                    }
                    _ => {}
                }
            }

            // Poll for direction changes (simplified - actual logic matches use-gamepad.ts)
            if let Some(gamepad) = gilrs.gamepads().next() {
                let (id, gp) = gamepad;
                let x = gp.value(Axis::LeftStickX);
                let y = gp.value(Axis::LeftStickY);

                let direction = get_direction(x, y);
                handle.emit("gamepad-direction", direction).ok();
            }

            thread::sleep(Duration::from_millis(16)); // ~60fps
        }
    });
}

fn get_direction(x: f32, y: f32) -> String {
    let deadzone = 0.15;
    let abs_x = x.abs();
    let abs_y = y.abs();

    if abs_x < deadzone && abs_y < deadzone {
        return "S".into();
    }

    if abs_y > abs_x {
        return if y < 0.0 { "F".into() } else { "B".into() };
    }

    return if x < 0.0 { "L".into() } else { "R".into() };
}
```

**Frontend consumption (use-gamepad.ts):**
```typescript
import { listen } from '@tauri-apps/api/event';
import { useEffect, useState } from 'react';

type Direction = "F" | "B" | "L" | "R" | "S";

export function useGamepad() {
  const [direction, setDirection] = useState<Direction>("S");
  const [gamepadConnected, setGamepadConnected] = useState(false);

  useEffect(() => {
    const unlistenDir = listen<string>('gamepad-direction', (event) => {
      setDirection(event.payload as Direction);
    });

    const unlistenConn = listen('gamepad-connected', () => {
      setGamepadConnected(true);
    });

    const unlistenDisconn = listen('gamepad-disconnected', () => {
      setGamepadConnected(false);
      setDirection("S");
    });

    return () => {
      unlistenDir.then(u => u());
      unlistenConn.then(u => u());
      unlistenDisconn.then(u => u());
    };
  }, []);

  return { direction, gamepadConnected };
}
```

### Pattern 3: Tauri Config for Vite + pnpm

**What:** tauri.conf.json configured for Vite with pnpm, pointing to correct dev and dist paths
**When:** Integrating Tauri with existing Vite frontend

**tauri.conf.json (base):**
```json
{
  "$schema": "../node_modules/@tauri-apps/cli/config.schema.json",
  "productName": "Steam Deck Controller",
  "version": "2.0.0",
  "identifier": "com.ks0555.steamdeck-controller",
  "build": {
    "beforeDevCommand": "pnpm dev",
    "beforeBuildCommand": "pnpm build",
    "devUrl": "http://localhost:5173",
    "frontendDist": "../dist"
  },
  "app": {
    "withGlobalTauri": false,
    "windows": [
      {
        "title": "Steam Deck Controller",
        "width": 800,
        "height": 600,
        "resizable": true,
        "fullscreen": false
      }
    ],
    "security": {
      "csp": "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'"
    }
  },
  "bundle": {
    "active": true,
    "targets": "all",
    "icon": ["icons/32x32.png", "icons/128x128.png", "icons/128x128@2x.png", "icons/icon.icns", "icons/icon.ico"],
    "linux": {
      "appimage": {
        "bundleMediaFramework": false,
        "files": {}
      }
    }
  }
}
```

**tauri.linux.conf.json (platform-specific for AppImage):**
```json
{
  "bundle": {
    "targets": "appimage",
    "linux": {
      "appimage": {
        "files": {}
      }
    }
  }
}
```

### Pattern 4: Vite Config Modification for Tauri

**What:** Modify vite.config.ts to work with Tauri's dev server and environment variables
**When:** Setting up Tauri development workflow

**Modified vite.config.ts:**
```typescript
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

const host = process.env.TAURI_DEV_HOST;

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': '/src'
    }
  },
  server: {
    port: 5173,
    strictPort: true,
    host: host || false,
    hmr: host
      ? {
          protocol: 'ws',
          host,
          port: 1421,
        }
      : undefined,
    watch: {
      ignored: ['**/src-tauri/**'],
    },
  },
  envPrefix: ['VITE_', 'TAURI_ENV_*'],
  build: {
    target: process.env.TAURI_ENV_PLATFORM == 'windows' ? 'chrome105' : 'safari13',
    minify: !process.env.TAURI_ENV_DEBUG ? 'esbuild' : false,
    sourcemap: !!process.env.TAURI_ENV_DEBUG,
  },
})
```

## Anti-Patterns to Avoid

### Anti-Pattern 1: Mixing WebSocket and Tauri IPC

**What:** Keeping WebSocket code alongside new Tauri invoke/listen calls
**Why bad:** Defeats the purpose of migration, adds unnecessary complexity, potential conflicts
**Instead:** Completely replace WebSocket usage with Tauri IPC. Remove apps/backend WebSocket server.

### Anti-Pattern 2: Blocking the Main Thread with Gamepad Polling

**What:** Polling gamepad state directly in Tauri command handler (synchronous)
**Why bad:** Commands should be short-lived; blocking prevents other commands from executing
**Instead:** Spawn a background thread (std::thread::spawn) for continuous polling, emit events back

### Anti-Pattern 3: Not Ignoring src-tauri in Vite Watch

**What:** Vite watches src-tauri directory, causing unnecessary rebuilds
**Why bad:** Rust changes trigger Vite rebuilds, wasting resources
**Instead:** Add `watch.ignored: ['**/src-tauri/**']` to vite.config.ts

## Build Order and Dependencies

### Phase Build Order (Recommended)

1. **Initialize src-tauri/** - Scaffold Tauri project inside apps/frontend/
   - Run `pnpm tauri init` in apps/frontend/ (creates src-tauri/)
   - Configure tauri.conf.json with pnpm commands
   - Modify vite.config.ts for Tauri integration

2. **Implement Rust BLE Commands** - Replace Web Bluetooth API
   - Add btleplug to Cargo.toml
   - Implement: ble_connect, ble_disconnect, ble_send commands
   - Emit `ble-state-changed` events from commands

3. **Implement Rust Gamepad Monitoring** - Replace Gamepad API
   - Add gilrs to Cargo.toml
   - Spawn background thread in setup() hook
   - Emit `gamepad-direction`, `gamepad-connected`, `gamepad-disconnected` events

4. **Rewrite Frontend Hooks** - Update use-bluetooth.ts and use-gamepad.ts
   - Keep same return interfaces (connected, connecting, unsupported, connect, send)
   - Replace navigator.bluetooth with invoke/listen
   - Replace navigator.getGamepads() with listen for gamepad events

5. **Build and Test** - Verify on Linux/SteamOS
   - `pnpm tauri build` for production AppImage
   - Test BLE connection to BT24 device
   - Test gamepad input from Steam Deck built-in controller

### Turbo.json Considerations

**Current turbo.json must be updated** to include Tauri build tasks:
```json
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "dev": {
      "cache": false,
      "persistent": true,
      "dependsOn": ["^dev"]
    },
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**"]
    },
    "tauri:dev": {
      "cache": false,
      "persistent": true,
      "dependsOn": ["build"]
    },
    "tauri:build": {
      "dependsOn": ["build"],
      "outputs": ["src-tauri/target/**"]
    }
  }
}
```

Then add to package.json scripts:
```json
{
  "scripts": {
    "tauri": "tauri",
    "tauri:dev": "tauri dev",
    "tauri:build": "tauri build"
  },
  "devDependencies": {
    "@tauri-apps/cli": "^2.0.0"
  }
}
```

## Scalability Considerations

| Concern | During Development | At Release (AppImage) | Notes |
|---------|-------------------|----------------------|-------|
| **BLE Connections** | 1 device (BT24) | 1 device (BT24) | btleplug supports multiple, but robot only needs one |
| **Gamepad Polling** | 60fps poll rate | 60fps poll rate | Background thread, minimal CPU impact |
| **Event Throughput** | Low (direction changes) | Low | JSON serialization lightweight for simple commands |
| **Bundle Size** | N/A (dev mode) | ~15-30MB AppImage | Includes WebKitGTK + Rust runtime |

## Integration Points Summary

| Existing Component | Modification Required | New Dependency |
|-------------------|----------------------|---------------|
| apps/frontend/package.json | Add @tauri-apps/api, @tauri-apps/cli | @tauri-apps/api, @tauri-apps/cli |
| apps/frontend/vite.config.ts | Add Tauri server config, ignore src-tauri | N/A (config only) |
| apps/frontend/src/hooks/use-bluetooth.ts | REWRITE: invoke + listen | @tauri-apps/api |
| apps/frontend/src/hooks/use-gamepad.ts | REWRITE: listen only | @tauri-apps/api |
| apps/frontend/src/app.tsx | NONE (interface unchanged) | N/A |
| apps/frontend/src/components/control-pad.tsx | NONE (interface unchanged) | N/A |
| apps/frontend/src/components/status-bar.tsx | NONE (interface unchanged) | N/A |
| apps/frontend/src-tauri/ (NEW) | CREATE: Rust backend | btleplug, gilrs, tauri |

## Sources

- **HIGH confidence:** Context7 `/tauri-apps/tauri-docs` (1054 code snippets, official docs)
  - Vite integration: https://github.com/tauri-apps/tauri-docs/blob/v2/src/content/docs/start/frontend/vite.mdx
  - Commands: https://github.com/tauri-apps/tauri-docs/blob/v2/src/content/docs/develop/calling-rust.mdx
  - Events: https://github.com/tauri-apps/tauri-docs/blob/v2/src/content/docs/develop/_sections/frontend-listen.mdx
  - Configuration: https://github.com/tauri-apps/tauri-docs/blob/v2/src/content/docs/develop/configuration-files.mdx
  - AppImage: https://github.com/tauri-apps/tauri-docs/blob/v2/src/content/docs/distribute/appimage.mdx

- **MEDIUM confidence:** WebSearch results for Linux AppImage and btleplug/gilrs usage
  - AppImage configuration: https://v2.tauri.app/distribute/appimage (2025-08-16)
  - btleplug crate: https://github.com/deviceplug/btleplug
  - gilrs crate: https://gilrs-project.gitlab.io/gilrs/doc/gilrs/struct.Gamepad.html
  - tauri-plugin-blec: https://github.com/MnlPhlp/tauri-plugin-blec (alternative to raw btleplug)

## Open Questions for Implementation

1. **BT24 Device Filtering:** Should we filter by device name "BT24" in btleplug or by MAC address? (btleplug supports both)
2. **Gamepad Selection:** How to identify Steam Deck built-in controller in gilrs? (likely by name contains "Steam" similar to current use-gamepad.ts)
3. **Error Handling:** Should Rust commands return Result<String, String> or use event-based error reporting? (recommend Result for commands, events for state changes)
4. **Build Runner:** Can GitHub Actions build ARM AppImage for Steam Deck? (need ubuntu-24.04-arm runner or cross-compilation)

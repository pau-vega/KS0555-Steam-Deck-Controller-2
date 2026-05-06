use gilrs::{Gilrs, EventType};
use std::thread;
use tauri::Emitter;

pub fn setup_gamepad_monitor(app: &tauri::App) -> Result<(), String> {
    let app_handle = app.handle().clone();

    // D-32: Use std::thread::spawn (not tauri::async_runtime::spawn)
    // D-33: Clone AppHandle and move into thread (implements Send)
    thread::spawn(move || {
        // D-32: Initialize gilrs inside thread
        let mut gilrs = Gilrs::new().expect("Failed to initialize gilrs");

        loop {
            // D-01: next_event() blocks until event is available
            while let Some(event) = gilrs.next_event() {
                match event.event {
                    EventType::Connected => {
                        let gamepad = gilrs.gamepad(event.id);
                        let name = gamepad.name().to_string();
                        // D-36: gamepad-connected with { name: '...' }
                        let _ = app_handle.emit(
                            "gamepad-connected",
                            serde_json::json!({ "name": name }),
                        );
                    }
                    EventType::Disconnected => {
                        // D-36: gamepad-disconnected with { name: '...' }
                        let _ = app_handle.emit(
                            "gamepad-disconnected",
                            serde_json::json!({ "name": "controller" }),
                        );
                    }
                    EventType::AxisChanged(_, _, _) => {
                        // Placeholder — direction detection in Plan 08-03
                    }
                    _ => {}
                }
            }

            // D-34: No lifecycle management; thread exits when main drops
        }
    });

    // D-34: Spawn in setup() hook, no lifecycle management
    Ok(())
}

use gilrs::{Axis, Button, EventType, Gilrs};
use std::thread;
use tauri::Emitter;

const DEADZONE: f32 = 0.15;

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
enum Direction {
    F,
    B,
    L,
    R,
    S,
}

impl Direction {
    fn as_char(&self) -> &'static str {
        match self {
            Direction::F => "F",
            Direction::B => "B",
            Direction::L => "L",
            Direction::R => "R",
            Direction::S => "S",
        }
    }
}

fn get_direction_from_axes(x: f32, y: f32) -> Direction {
    let abs_x = x.abs();
    let abs_y = y.abs();

    if abs_x < DEADZONE && abs_y < DEADZONE {
        return Direction::S;
    }

    if abs_y > abs_x {
        if y < 0.0 {
            Direction::F
        } else {
            Direction::B
        }
    } else {
        if x < 0.0 {
            Direction::L
        } else {
            Direction::R
        }
    }
}

fn compute_direction(gamepad: &gilrs::Gamepad) -> Direction {
    let dpad_x = gamepad
        .axis_data(Axis::DPadX)
        .map(|d| d.value())
        .unwrap_or(0.0);
    let dpad_y = gamepad
        .axis_data(Axis::DPadY)
        .map(|d| d.value())
        .unwrap_or(0.0);

    let dpad_up = gamepad.is_pressed(Button::DPadUp);
    let dpad_down = gamepad.is_pressed(Button::DPadDown);
    let dpad_left = gamepad.is_pressed(Button::DPadLeft);
    let dpad_right = gamepad.is_pressed(Button::DPadRight);

    let dpad_button_x = if dpad_right {
        1.0
    } else if dpad_left {
        -1.0
    } else {
        0.0
    };
    let dpad_button_y = if dpad_down {
        1.0
    } else if dpad_up {
        -1.0
    } else {
        0.0
    };

    let eff_x = if dpad_x.abs() > DEADZONE {
        dpad_x
    } else {
        dpad_button_x
    };
    let eff_y = if dpad_y.abs() > DEADZONE {
        dpad_y
    } else {
        dpad_button_y
    };

    let dpad_active = eff_x.abs() > DEADZONE
        || eff_y.abs() > DEADZONE
        || dpad_up
        || dpad_down
        || dpad_left
        || dpad_right;

    if dpad_active {
        get_direction_from_axes(eff_x, eff_y)
    } else {
        let stick_x = gamepad
            .axis_data(Axis::LeftStickX)
            .map(|d| d.value())
            .unwrap_or(0.0);
        let stick_y = gamepad
            .axis_data(Axis::LeftStickY)
            .map(|d| d.value())
            .unwrap_or(0.0);
        get_direction_from_axes(stick_x, stick_y)
    }
}

pub fn setup_gamepad_monitor(app: &tauri::App) -> Result<(), String> {
    let app_handle = app.handle().clone();

    // D-32: Use std::thread::spawn (not tauri::async_runtime::spawn)
    // D-33: Clone AppHandle and move into thread (implements Send)
    thread::spawn(move || {
        // D-32: Initialize gilrs inside thread
        let mut gilrs = Gilrs::new().expect("Failed to initialize gilrs");

        // D-11: Track connected Steam gamepad (first one wins)
        let mut connected_gamepad_id: Option<gilrs::GamepadId> = None;
        // D-13, D-41: Direction change guard prevents event spam
        let mut last_direction: Option<Direction> = None;

        // Enumerate gamepads already connected before thread started
        for (id, gamepad) in gilrs.gamepads() {
            let name = gamepad.name().to_string();
            eprintln!("[gamepad] found on startup: {:?} name={:?}", id, name);
            if connected_gamepad_id.is_none() {
                connected_gamepad_id = Some(id);
                let _ = app_handle.emit("gamepad-connected", serde_json::json!({ "name": name }));
            }
        }
        if connected_gamepad_id.is_none() {
            eprintln!("[gamepad] no gamepads found on startup — waiting for connect events");
        }

        loop {
            // next_event() is non-blocking; sleep briefly to avoid busy-spin
            while let Some(event) = gilrs.next_event() {
                match event.event {
                    EventType::Connected => {
                        let gamepad = gilrs.gamepad(event.id);
                        let name = gamepad.name().to_string();

                        // D-09: Pick first gamepad — no name filter (Steam Deck varies)
                        // D-11: Ignore additional gamepads — first one wins
                        if connected_gamepad_id.is_none() {
                            connected_gamepad_id = Some(event.id);

                            // D-36: gamepad-connected with { name: '...' }
                            let _ = app_handle
                                .emit("gamepad-connected", serde_json::json!({ "name": name }));
                        }
                    }
                    EventType::Disconnected => {
                        // D-12: Only react to our tracked gamepad disconnecting
                        if connected_gamepad_id == Some(event.id) {
                            connected_gamepad_id = None;

                            // D-36: gamepad-disconnected with { name: '...' }
                            let _ = app_handle.emit(
                                "gamepad-disconnected",
                                serde_json::json!({ "name": "controller" }),
                            );

                            // D-40: Auto-reconnect — loop continues, next_event()
                            // will fire on new Connected event
                        }
                    }
                    EventType::AxisChanged(axis, _, _) => {
                        let is_stick = axis == Axis::LeftStickX || axis == Axis::LeftStickY;
                        let is_dpad_axis = axis == Axis::DPadX || axis == Axis::DPadY;

                        if (is_stick || is_dpad_axis) && connected_gamepad_id.is_some() {
                            let id = connected_gamepad_id.unwrap();
                            let new_direction = compute_direction(&gilrs.gamepad(id));

                            // D-13, D-41: Direction change guard
                            if last_direction != Some(new_direction) {
                                last_direction = Some(new_direction);

                                // D-35: gamepad-direction with { direction: 'F' } (char only)
                                let payload =
                                    serde_json::json!({ "direction": new_direction.as_char() });
                                let _ = app_handle.emit("gamepad-direction", payload);
                            }
                        }
                    }
                    EventType::ButtonChanged(button, _, _)
                    | EventType::ButtonPressed(button, _)
                    | EventType::ButtonReleased(button, _) => {
                        if button.is_dpad() && connected_gamepad_id.is_some() {
                            let id = connected_gamepad_id.unwrap();
                            let new_direction = compute_direction(&gilrs.gamepad(id));

                            if last_direction != Some(new_direction) {
                                last_direction = Some(new_direction);

                                let payload =
                                    serde_json::json!({ "direction": new_direction.as_char() });
                                let _ = app_handle.emit("gamepad-direction", payload);
                            }
                        }
                    }
                    _ => {}
                }
            }

            std::thread::sleep(std::time::Duration::from_millis(8));
        }
    });

    // D-34: Spawn in setup() hook, no lifecycle management
    Ok(())
}

// ── Unit Tests ─────────────────────────────────────────────────────

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_deadzone_returns_stop() {
        // Both axes below deadzone (0.15) should return S
        assert_eq!(get_direction_from_axes(0.0, 0.0), Direction::S);
        assert_eq!(get_direction_from_axes(0.1, 0.1), Direction::S);
        assert_eq!(get_direction_from_axes(-0.14, 0.14), Direction::S);
    }

    #[test]
    fn test_up_is_forward() {
        // Negative Y = forward (standard gamepad convention)
        assert_eq!(get_direction_from_axes(0.0, -1.0), Direction::F);
        assert_eq!(get_direction_from_axes(-0.3, -0.8), Direction::F);
    }

    #[test]
    fn test_down_is_backward() {
        // Positive Y = backward
        assert_eq!(get_direction_from_axes(0.0, 1.0), Direction::B);
        assert_eq!(get_direction_from_axes(0.3, 0.8), Direction::B);
    }

    #[test]
    fn test_left_is_left() {
        // Negative X = left (dominant over small Y)
        assert_eq!(get_direction_from_axes(-1.0, 0.0), Direction::L);
        assert_eq!(get_direction_from_axes(-1.0, 0.2), Direction::L);
    }

    #[test]
    fn test_right_is_right() {
        // Positive X = right (dominant over small Y)
        assert_eq!(get_direction_from_axes(1.0, 0.0), Direction::R);
        assert_eq!(get_direction_from_axes(1.0, -0.2), Direction::R);
    }

    #[test]
    fn test_deadzone_edge_cases() {
        // Exactly at deadzone boundary should still be S
        assert_eq!(get_direction_from_axes(0.149, 0.0), Direction::S);
        assert_eq!(get_direction_from_axes(0.0, -0.149), Direction::S);
    }

    #[test]
    fn test_strong_x_overrides_weak_y() {
        // Large X with small Y → direction should be X-based
        assert_eq!(get_direction_from_axes(0.8, 0.1), Direction::R);
        assert_eq!(get_direction_from_axes(-0.8, -0.1), Direction::L);
    }

    #[test]
    fn test_strong_y_overrides_weak_x() {
        // Large Y with small X → direction should be Y-based
        assert_eq!(get_direction_from_axes(0.1, -0.8), Direction::F);
        assert_eq!(get_direction_from_axes(-0.1, 0.8), Direction::B);
    }
}

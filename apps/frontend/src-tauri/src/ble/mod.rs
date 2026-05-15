pub mod state;
use crate::domain::invert::INVERTED;
use regex::Regex;
pub use state::BleState;
use std::sync::atomic::Ordering;
use std::sync::LazyLock;
use tauri::{AppHandle, Emitter};

/// Accept-set for `ble_send` payloads:
/// - `^[FBLR]\d{2,3}\n$` — directional PWM (numeric range enforced separately)
/// - `^S\n$`             — stop
///
/// `.expect(...)` is acceptable here: the pattern is a compile-time constant,
/// so any panic at module load is a developer typo we want surfaced loudly.
static BLE_COMMAND_RE: LazyLock<Regex> =
    LazyLock::new(|| Regex::new(r"^[FBLR]\d{2,3}\n$|^S\n$").expect("static regex compiles"));

/// Pure validator for BLE wire payloads. Extracted so unit tests can hit the
/// validation branches without constructing a `tauri::State<BleState>`.
fn validate_ble_payload(command: &str) -> Result<(), String> {
    if !BLE_COMMAND_RE.is_match(command) {
        return Err(format!(
            "Invalid BLE payload {:?}: expected '<dir><pwm>\\n' with dir in F|B|L|R and pwm in 80..=255, or 'S\\n'",
            command
        ));
    }

    // Stop is fully validated by the regex; no numeric range to check.
    if command.starts_with('S') {
        return Ok(());
    }

    // Drop the leading direction char and the trailing newline; what remains
    // is the pwm digit substring, already constrained to 2–3 ASCII digits by
    // the regex. Use u16 so 999 doesn't overflow before the range check fires.
    let pwm_str = &command[1..command.len() - 1];
    let pwm: u16 = pwm_str.parse().map_err(|_| {
        format!(
            "Invalid BLE payload {:?}: pwm digits failed to parse (expected 80..=255)",
            command
        )
    })?;

    if !(80..=255).contains(&pwm) {
        return Err(format!(
            "Invalid BLE payload {:?}: pwm {} out of range (expected 80..=255)",
            command, pwm
        ));
    }

    Ok(())
}

#[tauri::command]
pub async fn ble_connect(app: AppHandle, state: tauri::State<'_, BleState>) -> Result<(), String> {
    app.emit("ble-state-changed", "connecting")
        .map_err(|e| format!("Failed to emit connecting state: {}", e))?;

    state.port().connect().await?;

    app.emit("ble-state-changed", "connected")
        .map_err(|e| format!("Failed to emit connected: {}", e))?;
    Ok(())
}

#[tauri::command]
pub async fn ble_send(
    _app: AppHandle,
    state: tauri::State<'_, BleState>,
    command: String,
) -> Result<(), String> {
    validate_ble_payload(&command)?;
    state.port().write(command.as_bytes()).await
}

#[tauri::command]
pub fn get_invert_state() -> bool {
    INVERTED.load(Ordering::Relaxed)
}

#[tauri::command]
pub fn toggle_invert(app: AppHandle) -> Result<bool, String> {
    let new_val = INVERTED.fetch_xor(true, Ordering::SeqCst) ^ true;
    app.emit("invert-changed", new_val)
        .map_err(|e| format!("Failed to emit invert-changed: {}", e))?;
    Ok(new_val)
}

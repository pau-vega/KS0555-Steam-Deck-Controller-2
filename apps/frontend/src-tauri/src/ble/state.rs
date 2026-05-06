use btleplug::platform::Peripheral;
use std::sync::{Arc, Mutex};

pub struct BleState {
    pub peripheral: Arc<Mutex<Option<Peripheral>>>,
}

impl BleState {
    pub fn new() -> Self {
        Self {
            peripheral: Arc::new(Mutex::new(None)),
        }
    }

    pub fn set(&self, peripheral: Option<Peripheral>) {
        let mut guard = self.peripheral.lock().unwrap();
        *guard = peripheral;
    }

    pub fn get(&self) -> Option<Peripheral> {
        let guard = self.peripheral.lock().unwrap();
        guard.clone()
    }
}

impl Clone for BleState {
    fn clone(&self) -> Self {
        Self {
            peripheral: Arc::clone(&self.peripheral),
        }
    }
}

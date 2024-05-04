// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::api::process::Command;
use yubihsm::connector::usb::Devices;

#[tauri::command]
fn detect_devices() -> Result<Vec<String>, String> {
    let serial_numbers = match Devices::serial_numbers() {
        Ok(serial_numbers) => serial_numbers,
        Err(e) => return Err(format!("Failed to detect devices: {}", e)),
    };
    let serial_numbers_str = serial_numbers.iter().map(|sn| sn.to_string()).collect();

    Ok(serial_numbers_str)
}

#[tauri::command]
fn list_asymmetric_keys() -> Result<Vec<String>, String> {
    todo!()
}

#[tauri::command]
fn create_signature() -> Result<Vec<u8>, String> {
    todo!()
}

#[tauri::command]
fn generate_asymmetric_keys() -> Result<(), String> {
    todo!()
}

fn main() {
    tauri::Builder::default()
        .setup(|_app| {
            let _ = Command::new_sidecar("server")
                .expect("failed to create `my-sidecar` binary command")
                .spawn()
                .expect("Failed to spawn sidecar");

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![detect_devices])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

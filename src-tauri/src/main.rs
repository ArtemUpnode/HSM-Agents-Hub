// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod commands;
mod handlers;

use axum::{routing::post, Router};
use commands::{detect_devices, list_keys, sign_message};
use handlers::{detect_devices_handler, list_keys_handler, sign_message_handler};
use tauri::api::process::Command;

#[tokio::main]
async fn main() {
    tracing_subscriber::fmt::init();

    let app = Router::new()
        .route("/get_user_devices", post(detect_devices_handler))
        .route("/get_user_keys", post(list_keys_handler))
        .route("/sign_user_message", post(sign_message_handler));

    let listener = tokio::net::TcpListener::bind("0.0.0.0:3000").await.unwrap();

    tokio::spawn(async move {
        axum::serve(listener, app.into_make_service())
            .await
            .unwrap();
    });

    tauri::Builder::default()
        .setup(|_app| {
            let _ = Command::new_sidecar("server")
                .expect("failed to create `my-sidecar` binary command")
                .spawn()
                .expect("Failed to spawn sidecar");

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            detect_devices,
            list_keys,
            sign_message,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

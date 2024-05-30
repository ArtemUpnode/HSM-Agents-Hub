use crate::commands::{detect_devices, list_keys, sign_message};
use axum::{extract::Json, response::IntoResponse};
use serde::Deserialize;

#[derive(Deserialize)]
pub struct DetectDevicesArgs {}

#[derive(Deserialize)]
pub struct ListAsymmetricKeysArgs {
    device_serial_id: String,
    auth_key_id: u16,
    password: String,
}

#[derive(Deserialize)]
pub struct CreateSignatureArgs {
    device_serial_id: String,
    auth_key_id: u16,
    password: String,
    signing_key_id: u16,
    message: String,
}

pub async fn detect_devices_handler(Json(_args): Json<DetectDevicesArgs>) -> impl IntoResponse {
    match detect_devices() {
        Ok(devices) => Json(devices).into_response(),
        Err(e) => (axum::http::StatusCode::INTERNAL_SERVER_ERROR, e).into_response(),
    }
}

pub async fn list_keys_handler(Json(args): Json<ListAsymmetricKeysArgs>) -> impl IntoResponse {
    match list_keys(args.device_serial_id, args.auth_key_id, args.password) {
        Ok(keys) => Json(keys).into_response(),
        Err(e) => (axum::http::StatusCode::INTERNAL_SERVER_ERROR, Json(e)).into_response(),
    }
}

pub async fn sign_message_handler(Json(args): Json<CreateSignatureArgs>) -> impl IntoResponse {
    match sign_message(
        args.device_serial_id,
        args.auth_key_id,
        args.password,
        args.signing_key_id,
        args.message,
    )
    .await
    {
        Ok(signature) => Json(signature).into_response(),
        Err(e) => (axum::http::StatusCode::INTERNAL_SERVER_ERROR, Json(e)).into_response(),
    }
}

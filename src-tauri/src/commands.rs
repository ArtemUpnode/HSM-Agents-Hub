use ethers_core::types::H160;
use ethers_signers::{Signer as S, YubiWallet};
use serde::Serialize;
use std::str::FromStr;
use yubihsm::{
    asymmetric::Algorithm::EcK256,
    client::ErrorKind,
    connector::usb::{Devices, UsbTimeout},
    device::SerialNumber,
    ecdsa::{Secp256k1, Signer},
    object::{Entry, Filter, Type},
    Algorithm, Capability, Client, Connector, Credentials, UsbConfig,
};

// * Helpers

fn try_open_client(
    serial: Option<SerialNumber>,
    auth_key_id: u16,
    password: &str,
    max_attempts: u32,
) -> Result<Client, String> {
    let connector = Connector::usb(&UsbConfig {
        serial,
        timeout_ms: 15_000,
    });
    let credentials = Credentials::from_password(auth_key_id, password.as_bytes());

    let mut attempts = 0;
    let mut last_error = None;
    while attempts < max_attempts {
        match Client::open(connector.clone(), credentials.clone(), true) {
            Ok(client) => return Ok(client),
            Err(e) => {
                if *e.kind() == ErrorKind::ProtocolError {
                    attempts += 1;
                    last_error = Some(e);
                    continue;
                }

                return Err(format!("Failed to connect to the HSM: {}", e));
            }
        }
    }

    Err(format!(
        "Failed to connect to the HSM after {} attempts due to protocol errors. Last error: {}",
        max_attempts,
        last_error.map_or("None".to_string(), |e| e.to_string())
    ))
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct YubiKey {
    key_id: u16,
    address: H160,
}

fn convert_entries_to_array(entries: &Vec<Entry>, client: &Client) -> Result<Vec<YubiKey>, String> {
    let mut arr = Vec::with_capacity(entries.len());

    for i in entries {
        let signer = match Signer::<Secp256k1>::create(client.clone(), i.object_id) {
            Ok(signer) => signer,
            Err(e) => return Err(format!("Failed to create signer: {}", e)),
        };

        // TODO: `.unwrap` is present, it’s better to add own wallet implementation instead `YubiWallet::from`
        let wallet = YubiWallet::from(signer);
        let address = wallet.address();

        arr.push(YubiKey {
            key_id: i.object_id,
            address,
        });
    }

    Ok(arr)
}

// * Tauri commands

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Device {
    serial_id: String,
    product_name: String,
}

#[tauri::command]
pub fn detect_devices() -> Result<Vec<Device>, String> {
    let devices = match Devices::detect(UsbTimeout::default()) {
        Ok(devices) => devices,
        Err(e) => return Err(format!("Failed to detect devices: {}", e)),
    };

    let devices = devices.iter().map(|d| Device {
        serial_id: d.serial_number.to_string(),
        product_name: d.product_name.to_owned(),
    }).collect();

    Ok(devices)
}

// TODO: Extend support to include Cosmos, and implement Ed25519 for Solana, Aptos, and Sui for `list_keys` and `sign_message` commands
#[tauri::command]
pub fn list_keys(
    device_serial_id: String,
    auth_key_id: u16,
    password: String,
) -> Result<Vec<YubiKey>, String> {
    let serial = match SerialNumber::from_str(&device_serial_id) {
        Ok(number) => Some(number),
        Err(e) => return Err(format!("Failed to parse serial number: {}", e)),
    };

    let client = match try_open_client(serial, auth_key_id, &password, 3) {
        Ok(client) => client,
        Err(e) => return Err(e),
    };

    let objects = match client.list_objects(&[
        Filter::Type(Type::AsymmetricKey),
        Filter::Capabilities(Capability::SIGN_ECDSA),
        Filter::Algorithm(Algorithm::Asymmetric(EcK256)),
    ]) {
        Ok(objects) => objects,
        Err(e) => return Err(format!("Failed to list objects: {}", e)),
    };

    let keys = convert_entries_to_array(&objects, &client)?;

    Ok(keys)
}

#[tauri::command]
pub async fn sign_message(
    device_serial_id: String,
    auth_key_id: u16,
    password: String,
    signing_key_id: u16,
    message: String,
) -> Result<String, String> {
    let serial = match SerialNumber::from_str(&device_serial_id) {
        Ok(number) => Some(number),
        Err(e) => return Err(format!("Failed to parse serial number: {}", e)),
    };

    let client = match try_open_client(serial, auth_key_id, &password, 3) {
        Ok(client) => client,
        Err(e) => return Err(e),
    };

    let signer = match Signer::create(client, signing_key_id) {
        Ok(signer) => signer,
        Err(e) => return Err(format!("Failed to create signer: {}", e)),
    };

    let wallet = YubiWallet::from(signer);

    match wallet.sign_message(message).await {
        Ok(signature) => Ok(format!("0x{}", signature.to_string())),
        Err(e) => Err(format!("Failed to sign message: {}", e)),
    }
}

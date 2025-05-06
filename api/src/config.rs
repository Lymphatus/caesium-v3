use serde_json::json;
use std::env;
use std::path::PathBuf;
use tauri::App;
use tauri_plugin_store::StoreExt;
use uuid::Uuid;

pub fn set_app_id(app: &App) -> Result<(), Box<dyn std::error::Error>> {
    let store_path = get_exe_dir().unwrap().join("settings.json"); //TODO
    let store = app.store(store_path.to_str().unwrap()).unwrap(); //TODO
    match store.get("app") {
        None => {
            store.set("app", json!({ "uuid": Uuid::new_v4()}));
        }
        Some(v) => {
            let app_preferences = json!(v);
            let stored_uuid = app_preferences
                .get("uuid")
                .unwrap_or(&serde_json::value::Value::Null)
                .as_str()
                .unwrap_or("");
            match Uuid::parse_str(stored_uuid) {
                Ok(uuid) => {
                    let version = uuid.get_version();
                    if version.is_none() || version.unwrap() != uuid::Version::Random {
                        store.set("app", json!({ "uuid": Uuid::new_v4()}));
                    }
                }
                Err(_) => {
                    store.set("app", json!({ "uuid": Uuid::new_v4()}));
                }
            }
        }
    };

    store.save()?;
    store.close_resource();

    Ok(())
}

fn get_exe_dir() -> Option<PathBuf> {
    env::current_exe()
        .ok()
        .and_then(|path| path.parent().map(|p| p.to_path_buf()))
}

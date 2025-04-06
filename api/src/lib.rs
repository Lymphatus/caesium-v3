use crate::commands::{clear_list, open_import_files_dialog, open_import_folder_dialog, change_page};
use indexmap::IndexSet;
use std::path::PathBuf;
use std::sync::Mutex;
use tauri::Manager;

mod commands;
mod scan_files;

#[derive(Default)]
pub struct AppData {
    file_list: IndexSet<CImage>,
    base_path: PathBuf,
    current_page: usize,
}

#[derive(serde::Serialize, serde::Deserialize, Clone, Debug, Default, Hash, Eq, PartialEq)]
pub struct CImage {
    pub id: String,
    pub name: String,
    pub path: String,
    pub directory: String,
    pub mime_type: String,
    pub size: u64,
    pub width: usize,
    pub height: usize,
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_store::Builder::new().build())
        .setup(|app| {
            #[cfg(debug_assertions)] // only include this code on debug builds
            {
                let window = app.get_webview_window("main").unwrap();
                window.open_devtools();
                window.close_devtools();
            }
            app.manage(Mutex::new(initialize_store()));
            Ok(())
        })
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_window_state::Builder::default().build())
        .invoke_handler(tauri::generate_handler![
            open_import_files_dialog,
            open_import_folder_dialog,
            clear_list,
            change_page
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

fn initialize_store() -> AppData {
    AppData {
        file_list: IndexSet::default(),
        base_path: PathBuf::default(),
        current_page: 1,
    }
}

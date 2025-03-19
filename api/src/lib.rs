use std::path::PathBuf;
use std::sync::Mutex;
use indexmap::IndexSet;
use tauri::Manager;
use crate::commands::{open_import_files_dialog, open_import_folder_dialog, clear_list};

mod commands;
mod scan_files;

#[derive(Default)]
pub struct AppData {
    file_list: IndexSet<CImage>,
    base_path: PathBuf,
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
        .setup(|app| {
            app.manage(Mutex::new(AppData::default()));
            Ok(())
        })
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![open_import_files_dialog, open_import_folder_dialog, clear_list])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

use std::path::PathBuf;
use std::sync::Mutex;
use tauri::Manager;

mod commands;
mod scan_files;

#[derive(Default)]
pub struct AppData {
    file_list: Vec<PathBuf>,
    base_path: PathBuf,
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
        .invoke_handler(tauri::generate_handler![commands::greet])
        .invoke_handler(tauri::generate_handler![commands::open_import_files_dialog])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

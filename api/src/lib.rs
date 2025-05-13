use crate::commands::{
    change_page, clear_list, compress, get_executable_dir, open_import_files_dialog,
    open_import_folder_dialog, remove_items_from_list, get_max_threads
};
use crate::commands::post_compression_actions::exec_post_compression_action;
use crate::config::set_app_id;
use indexmap::IndexSet;
use serde_repr::*;
use std::borrow::Borrow;
use std::env;
use std::hash::{Hash, Hasher};
use std::path::PathBuf;
use std::sync::Mutex;
use tauri::Manager;

mod commands;
mod compressor;
mod config;
mod scan_files;

#[derive(Default)]
pub struct AppData {
    file_list: IndexSet<CImage>,
    base_path: PathBuf,
    current_page: usize,
}

#[derive(serde::Serialize, serde::Deserialize, Clone, Debug, Default)]
pub struct CImage {
    pub id: String,
    pub name: String,
    pub path: String,
    pub directory: String,
    pub mime_type: String,
    pub size: u64,
    pub width: usize,
    pub height: usize,

    pub compressed_width: usize,
    pub compressed_height: usize,
    pub compressed_size: u64,
    pub compressed_file_path: String,
    pub info: String,
    pub status: ImageStatus,
}

#[derive(Serialize_repr, Deserialize_repr, Clone, Debug, Default)]
#[repr(u8)]
pub enum ImageStatus {
    #[default]
    New = 0,
    Success = 1,
    Warning = 2,
    Error = 3,
}

// Equality and hashing only based on `id`
impl PartialEq for CImage {
    fn eq(&self, other: &Self) -> bool {
        self.id == other.id
    }
}
impl Eq for CImage {}

impl Hash for CImage {
    fn hash<H: Hasher>(&self, state: &mut H) {
        self.id.hash(state);
    }
}

impl Borrow<str> for CImage {
    fn borrow(&self) -> &str {
        &self.id
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_os::init())
        .plugin(tauri_plugin_store::Builder::new().build())
        .setup(|app| {
            #[cfg(debug_assertions)] // only include this code on debug builds
            {
                let window = app.get_webview_window("main").unwrap();
                window.open_devtools();
                window.close_devtools();
            }
            app.manage(Mutex::new(initialize_store()));
            set_app_id(app)?;
            Ok(())
        })
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_window_state::Builder::default().build())
        .invoke_handler(tauri::generate_handler![
            open_import_files_dialog,
            open_import_folder_dialog,
            clear_list,
            change_page,
            remove_items_from_list,
            compress,
            get_executable_dir,
            get_max_threads,
            exec_post_compression_action
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

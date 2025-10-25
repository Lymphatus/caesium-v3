use crate::app_data::AppData;
use crate::commands::compression::{compress, preview};
use crate::commands::list::{
    add_from_drop, change_page, clear_list, filter_list, remove_items_from_list, sort_list,
};
use crate::commands::post_compression_actions::exec_post_compression_action;
use crate::commands::{
    get_executable_dir, get_max_threads, open_import_files_dialog, open_import_folder_dialog,
};
use serde_repr::*;
use std::borrow::Borrow;
use std::env;
use std::hash::{Hash, Hasher};
use std::sync::Mutex;
use tauri::Manager;
use tauri_plugin_log::{Target, TargetKind};

mod app_data;
mod commands;
mod compressor;
mod errors;
mod scan_files;

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
#[repr(i8)]
pub enum ImageStatus {
    #[default]
    New = 0,
    Success = 1,
    Warning = 2,
    Error = 3,
    Compressing = -1,
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
        .plugin(
            tauri_plugin_log::Builder::new()
                .level(log::LevelFilter::Info)
                .clear_targets()
                .targets([
                    Target::new(TargetKind::Webview),
                    Target::new(TargetKind::LogDir {
                        file_name: Some("caesium-image-compressor".into()),
                    }),
                    Target::new(TargetKind::Stdout),
                ])
                .max_file_size(10_000_000)
                .rotation_strategy(tauri_plugin_log::RotationStrategy::KeepAll)
                .build(),
        )
        .plugin(tauri_plugin_process::init())
        .plugin(tauri_plugin_updater::Builder::new().build())
        .plugin(tauri_plugin_os::init())
        .plugin(tauri_plugin_store::Builder::new().build())
        .setup(|app| {
            #[cfg(debug_assertions)] // only include this code on debug builds
            {
                let window = app.get_webview_window("main").unwrap();
                window.open_devtools();
                window.close_devtools();
            }
            app.manage(Mutex::new(AppData::new()));
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
            preview,
            get_executable_dir,
            get_max_threads,
            exec_post_compression_action,
            sort_list,
            filter_list,
            add_from_drop
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

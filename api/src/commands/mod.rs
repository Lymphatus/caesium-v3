pub(crate) mod compression;
pub(crate) mod list;
pub(crate) mod post_compression_actions;

use crate::scan_files::process_files;
use std::env;
use tauri_plugin_dialog::DialogExt;

#[tauri::command]
pub fn open_import_folder_dialog(app: tauri::AppHandle, recursive: bool) {
    app.dialog().file().pick_folder(move |f| {
        let folders = match f {
            Some(a) => vec![a],
            None => return,
        };

        process_files(&app, folders, recursive);
    })
}
#[tauri::command]
pub fn open_import_files_dialog(app: tauri::AppHandle) {
    let mut dialog = app.dialog().file();

    #[cfg(any(target_os = "windows", target_os = "macos"))]
    {
        dialog = dialog.add_filter(
            "Supported Images",
            &["jpg", "jpeg", "png", "gif", "webp", "tif", "tiff"],
        );
    }
    dialog.pick_files(move |f| {
        let files = match f {
            Some(a) => a,
            None => return,
        };
        process_files(&app, files, false);
    });
}

#[tauri::command]
pub fn get_executable_dir() -> Option<String> {
    env::current_exe()
        .ok()
        .and_then(|p| p.parent().map(|dir| dir.to_string_lossy().to_string()))
}

#[tauri::command]
pub fn get_max_threads() -> usize {
    match std::thread::available_parallelism().ok() {
        None => 1,
        Some(v) => v.into(),
    }
}

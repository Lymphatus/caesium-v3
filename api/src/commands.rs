use crate::scan_files::{process_files, FileList};
use crate::AppData;
use std::sync::Mutex;
use tauri::{Emitter, Manager};
use tauri_plugin_dialog::DialogExt;

#[tauri::command]
pub fn open_import_folder_dialog(app: tauri::AppHandle) {
    app.dialog().file().pick_folder(move |f| {
        let folders = match f {
            Some(a) => vec![a],
            None => return,
        };

        process_files(&app, folders);
    })
}
#[tauri::command]
pub fn open_import_files_dialog(app: tauri::AppHandle) {
    app.dialog().file().pick_files(move |f| {
        let files = match f {
            Some(a) => a,
            None => return,
        };
        process_files(&app, files);
    });
}

#[tauri::command]
pub fn clear_list(app: tauri::AppHandle) {
    let state = app.state::<Mutex<AppData>>();
    let mut state = state.lock().unwrap(); //TODO
    state.file_list.clear();

    app.emit(
        "fileList:getList",
        FileList {
            files: vec![],
            total_files: 0,
            base_folder: "".to_string(),
        },
    )
    .unwrap(); //TODO
}

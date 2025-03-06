use crate::scan_files::scan_files;
use crate::AppData;
use std::path::absolute;
use std::sync::Mutex;
use serde::Serialize;
use tauri::{Emitter, Manager};
use tauri_plugin_dialog::DialogExt;

#[derive(Serialize, Clone)]
struct Finished {
    files: Vec<String>,
    base_folder: String,
}

#[tauri::command]
pub fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
pub fn open_import_files_dialog(app: tauri::AppHandle) {
    let files = match app.dialog().file().blocking_pick_files() {
        None => return,
        Some(f) => f,
    };

    app.emit("fileImporter:importStarted", ()).unwrap(); //TODO
    let state = app.state::<Mutex<AppData>>();
    let mut state = state.lock().unwrap();
    let (base_folder, imported_files) = scan_files(&files, &state.base_path, false);

    state.base_path = base_folder;
    for imported_file in imported_files.iter() {
        state.file_list.push(imported_file.clone());
    }
    // let total = files.len();
    // for (index, file) in files.iter().enumerate() {
    //     app.emit(
    //         "fileImporter:importProgress",
    //         FileImportProgress {
    //             progress: index + 1,
    //             total,
    //         },
    //     )
    //         .unwrap_or_default(); //TODO What is default doing here?

    //TODO

    // let cimage = match map_file(&file.clone().into_path().unwrap()).await {
    //     Some(c) => c,
    //     _ => continue,
    // };
    // app.emit("fileImporter:resultReady", cimage).unwrap(); // TODO handle error

    let full_list: Vec<String> = state
        .file_list
        .iter()
        .map(|i| absolute(i).unwrap().to_str().unwrap().to_string())
        .collect();
    app.emit(
        "fileImporter:importFinished",
        Finished {
            files: full_list,
            base_folder: absolute(&state.base_path).unwrap().to_str().unwrap().to_string(),
        },
    )
    .unwrap(); //TODO
}

use std::cmp::min;
use std::path::{absolute, PathBuf};
use crate::scan_files::{compute_base_path, process_files, FileList};
use crate::{AppData};
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
    state.base_path = PathBuf::default();
    state.current_page = 1;

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

#[tauri::command]
pub fn remove_items_from_list(app: tauri::AppHandle, keys: Vec<String>) {
    let state = app.state::<Mutex<AppData>>();
    let mut state = state.lock().unwrap(); //TODO

    for k in &keys {
        state.file_list.shift_remove(k.as_str());
    }

    let mut base_path = PathBuf::default();
    for c in state.file_list.iter() {
        base_path = compute_base_path(c.path.as_ref(), &base_path).unwrap();
    }
    state.base_path = base_path;
    let files_per_page = 50; //TODO this should be configurable
    let offset = (state.current_page - 1) * files_per_page;
    let paged_list = state
        .file_list
        .get_range(offset..min(state.file_list.len(),offset + files_per_page)) //TODO check out of range
        .unwrap() //TODO
        .iter()
        .cloned()
        .collect();


    app.emit(
        "fileList:getList",
        FileList {
            files: paged_list,
            total_files: state.file_list.len(),
            base_folder: absolute(&state.base_path)
                .unwrap_or_default()
                .to_str()
                .unwrap() //TODO
                .to_string(),
        },
    )
        .unwrap(); //TODO
}

#[tauri::command]
pub fn change_page(app: tauri::AppHandle, page: usize) {
    let state = app.state::<Mutex<AppData>>();
    let mut state = state.lock().unwrap(); //TODO

    let files_per_page = 50; //TODO this should be configurable
    state.current_page = page;

    let offset = (state.current_page - 1) * files_per_page;
    let paged_list = state
        .file_list
        .get_range(offset..min(state.file_list.len(),offset + files_per_page)) //TODO check out of range
        .unwrap() //TODO
        .iter()
        .cloned()
        .collect();
    app.emit(
        "fileList:getList",
        FileList {
            files: paged_list,
            total_files: state.file_list.len(),
            base_folder: absolute(&state.base_path)
                .unwrap_or_default()
                .to_str()
                .unwrap() //TODO
                .to_string(),
        },
    )
        .unwrap(); //TODO
}


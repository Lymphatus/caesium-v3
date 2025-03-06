use crate::scan_files::{map_file, scan_files, FileImportProgress};
use crate::AppData;
use serde::Serialize;
use std::path::absolute;
use std::sync::Mutex;
use tauri::{Emitter, Manager};
use tauri_plugin_dialog::DialogExt;

#[derive(Serialize, Clone)]
struct Finished {
    files: Vec<String>,
    base_folder: String,
}

#[tauri::command]
pub async fn open_import_files_dialog(app: tauri::AppHandle) {
    app.dialog().file().pick_files(move |f| {
        let files = match f {
            Some(a) => a,
            None => return,
        };
        app.emit("fileImporter:importStarted", ()).unwrap(); //TODO
        let state = app.state::<Mutex<AppData>>();
        let mut state = state.lock().unwrap();
        let (base_folder, imported_files) = scan_files(&files, &state.base_path, false);

        state.base_path = base_folder;

        let total = imported_files.len();
        for (index, f) in imported_files.iter().enumerate() {
            app.emit(
                "fileImporter:importProgress",
                FileImportProgress {
                    progress: index + 1,
                    total,
                },
            )
            .unwrap_or_default(); //TODO What is default doing here?

            let cimage = match map_file(f) {
                Some(c) => c,
                _ => continue,
            };

            state.file_list.insert(cimage);
        }

        state
            .file_list
            .sort_by(|a, b| a.path.partial_cmp(&b.path).unwrap());

        //TODO
        let full_list: Vec<String> = state.file_list.iter().map(|i| i.path.clone()).collect();
        app.emit(
            "fileImporter:importFinished",
            Finished {
                files: full_list,
                base_folder: absolute(&state.base_path)
                    .unwrap()
                    .to_str()
                    .unwrap()
                    .to_string(),
            },
        )
        .unwrap(); //TODO
    });
}

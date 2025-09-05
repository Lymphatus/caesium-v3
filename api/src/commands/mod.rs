pub(crate) mod compression;
pub(crate) mod post_compression_actions;

use crate::errors::CommandError;
use crate::scan_files::{compute_base_path, process_files, FileList};
use crate::{AppData, CImage};
use std::cmp::{min, Ordering};
use std::env;
use std::ops::Div;
use std::path::{absolute, PathBuf};
use std::sync::{Mutex, MutexGuard};
use tauri::{Emitter, Manager};
use tauri_plugin_dialog::DialogExt;

#[derive(Debug, Clone, PartialEq)]
enum FileListColumn {
    Filename,
    Size,
    Resolution,
    Saved,
}

impl FileListColumn {
    fn from_str(s: &str) -> Option<Self> {
        match s {
            "filename" => Some(FileListColumn::Filename),
            "size" => Some(FileListColumn::Size),
            "resolution" => Some(FileListColumn::Resolution),
            "saved" => Some(FileListColumn::Saved),
            _ => None,
        }
    }
}

#[derive(Debug, Clone, PartialEq)]
enum SortOrder {
    Ascending,
    Descending,
}

impl SortOrder {
    fn from_str(s: &str) -> Option<Self> {
        match s {
            "ascending" => Some(SortOrder::Ascending),
            "descending" => Some(SortOrder::Descending),
            _ => None,
        }
    }
}

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
    app.dialog().file().pick_files(move |f| {
        let files = match f {
            Some(a) => a,
            None => return,
        };
        process_files(&app, files, false);
    });
}

#[tauri::command]
pub fn clear_list(app: tauri::AppHandle) -> Result<FileList, CommandError> {
    let state = app.state::<Mutex<AppData>>();
    let mut state = state.lock()?;
    state.file_list.truncate(0);
    state.base_path = PathBuf::default();
    state.current_page = 1;

    Ok(FileList {
        files: vec![],
        total_files: 0,
        base_folder: "".to_string(),
    })
}

#[tauri::command]
pub fn remove_items_from_list(
    app: tauri::AppHandle,
    keys: Vec<String>,
) -> Result<FileList, CommandError> {
    let state = app.state::<Mutex<AppData>>();
    let mut state = state.lock()?; //TODO

    for k in &keys {
        state.file_list.shift_remove(k.as_str());
    }

    let mut base_path = PathBuf::default();
    for c in state.file_list.iter() {
        base_path = match compute_base_path(c.path.as_ref(), &base_path) {
            Some(p) => p,
            None => {
                return Err(CommandError::from(std::io::Error::other(format!(
                    "Could not compute base path for file {0}",
                    c.path
                ))))
            }
        };
    }
    state.base_path = base_path;
    let page = state.current_page;
    let paged_list = get_paged_list(&mut state, page);

    Ok(FileList {
        files: paged_list,
        total_files: state.file_list.len(),
        base_folder: absolute(&state.base_path)
            .unwrap_or_default()
            .display()
            .to_string(),
    })
}

#[tauri::command]
pub fn change_page(app: tauri::AppHandle, page: usize) -> Result<FileList, CommandError> {
    let state = app.state::<Mutex<AppData>>();
    let mut state = state.lock()?;

    let paged_list = get_paged_list(&mut state, page);

    Ok(FileList {
        files: paged_list,
        total_files: state.file_list.len(),
        base_folder: absolute(&state.base_path)
            .unwrap_or_default()
            .display()
            .to_string(),
    })
}

#[tauri::command]
pub fn sort_list(
    app: tauri::AppHandle,
    column: String,
    order: String,
) -> Result<FileList, CommandError> {
    let state = app.state::<Mutex<AppData>>();
    let mut state = state.lock()?;

    let file_list_column = FileListColumn::from_str(&column)
        .ok_or_else(|| CommandError::Generic(Box::from(format!("Unknown column: {column}"))))?;
    let order = SortOrder::from_str(order.as_str())
        .ok_or_else(|| CommandError::Generic(Box::from(format!("Unknown ordering: {order}"))))?;

    state.file_list.par_sort_by(|a, b| {
        let comparison = match file_list_column {
            FileListColumn::Filename => a.name.cmp(&b.name),
            FileListColumn::Size => a.size.cmp(&b.size),
            FileListColumn::Resolution => (a.width * a.height).cmp(&(b.width * b.height)),
            FileListColumn::Saved => get_saved_size(a.size, a.compressed_size)
                .partial_cmp(&(get_saved_size(b.size, b.compressed_size)))
                .unwrap_or(Ordering::Equal), // TODO Don't know if this is the best way to handle this
        };

        // Apply the order after getting the comparison
        match order {
            SortOrder::Ascending => comparison,
            SortOrder::Descending => comparison.reverse(),
        }
    });

    let page = state.current_page;
    let paged_list = get_paged_list(&mut state, page);

    Ok(FileList {
        files: paged_list,
        total_files: state.file_list.len(),
        base_folder: absolute(&state.base_path)
            .unwrap_or_default()
            .display()
            .to_string(),
    })
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

fn get_saved_size(old_size: u64, new_size: u64) -> f64 {
    if old_size == 0 {
        return 0.0;
    }
    (old_size.saturating_sub(new_size) as f64).div(old_size as f64)
}

fn get_paged_list(state: &mut MutexGuard<AppData>, page: usize) -> Vec<CImage> {
    let files_per_page = 50; //TODO this should be configurable
    state.current_page = page;

    let offset = (state.current_page - 1) * files_per_page;
    state
        .file_list
        .get_range(offset..min(state.file_list.len(), offset + files_per_page)) //TODO check out of range
        .unwrap() //TODO
        .iter()
        .cloned()
        .collect()
}

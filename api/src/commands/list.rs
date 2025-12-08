use crate::app_data::AppData;
use crate::errors::CommandError;
use crate::scan_files::{get_file_mime_type, process_files, FileList};
use regex::Regex;
use std::fs::File;
use std::io::{BufRead, BufReader};
use std::path::{absolute, Path, PathBuf};
use std::sync::Mutex;
use tauri::{Emitter, Manager};
use tauri_plugin_dialog::FilePath;

#[derive(serde::Serialize, serde::Deserialize, Clone, Debug, Default)]
pub struct AdvancedImportDialogSizeFilter {
    enabled: bool,
    value: i32,
    unit: i32,
    pattern: String,
}

#[derive(serde::Serialize, serde::Deserialize, Clone, Debug, Default)]
pub struct AdvancedImportDialogFilter {
    pattern: String,
    size: AdvancedImportDialogSizeFilter,
}

#[tauri::command]
pub fn clear_list(app: tauri::AppHandle) -> Result<FileList, CommandError> {
    let state = app.state::<Mutex<AppData>>();
    let mut state = state.lock()?;
    remove_all_items_from_list(&mut state)
}

#[tauri::command]
pub fn add_from_drop(app: tauri::AppHandle, files_or_folders: Vec<String>, recursive: bool) {
    let entries = files_or_folders
        .iter()
        .map(|f| FilePath::from(PathBuf::from(f)))
        .collect();
    process_files(&app, entries, recursive)
}

#[tauri::command]
pub fn remove_items_from_list(
    app: tauri::AppHandle,
    keys: Vec<String>,
) -> Result<FileList, CommandError> {
    let state = app.state::<Mutex<AppData>>();
    let mut state = state.lock()?;

    if keys.len() == state.file_list.full_len() {
        return remove_all_items_from_list(&mut state);
    }

    state.file_list.remove_ids(&keys);
    state.compute_base_path()?;

    Ok(FileList {
        files: state.file_list.paged_list.clone(),
        total_files: state.file_list.len(),
        base_folder: absolute(state.base_path.clone().unwrap_or(PathBuf::new())) //TODO
            .unwrap_or_default()
            .display()
            .to_string(),
    })
}

fn remove_all_items_from_list(state: &mut AppData) -> Result<FileList, CommandError> {
    state.file_list.clear();
    state.base_path = None;

    Ok(FileList {
        files: vec![],
        total_files: 0,
        base_folder: "".to_string(),
    })
}

#[tauri::command]
pub fn change_page(app: tauri::AppHandle, page: usize) -> Result<FileList, CommandError> {
    let state = app.state::<Mutex<AppData>>();
    let mut state = state.lock()?;

    state.file_list.change_page(page);

    Ok(FileList {
        files: state.file_list.paged_list.clone(),
        total_files: state.file_list.len(),
        base_folder: absolute(state.base_path.clone().unwrap_or(PathBuf::new())) //TODO
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

    let file_list_column = crate::app_data::FileListColumn::from_str(&column)
        .ok_or_else(|| CommandError::Generic(Box::from(format!("Unknown column: {column}"))))?;
    let order = crate::app_data::SortOrder::from_str(order.as_str())
        .ok_or_else(|| CommandError::Generic(Box::from(format!("Unknown ordering: {order}"))))?;

    state.file_list.sort_list_by(file_list_column, order);

    Ok(FileList {
        files: state.file_list.paged_list.clone(),
        total_files: state.file_list.len(),
        base_folder: absolute(state.base_path.clone().unwrap_or(PathBuf::new())) //TODO
            .unwrap_or_default()
            .display()
            .to_string(),
    })
}

#[tauri::command]
pub fn filter_list(app: tauri::AppHandle, query: String) -> Result<FileList, CommandError> {
    let state = app.state::<Mutex<AppData>>();
    let mut state = state.lock()?;

    state.file_list.filter_list(&query);

    Ok(FileList {
        files: state.file_list.paged_list.clone(),
        total_files: state.file_list.len(),
        base_folder: absolute(state.base_path.clone().unwrap_or(PathBuf::new())) //TODO
            .unwrap_or_default()
            .display()
            .to_string(),
    })
}

#[tauri::command]
pub fn add_from_advanced_import(
    app: tauri::AppHandle,
    files: Vec<String>,
    recursive: bool,
    filter: AdvancedImportDialogFilter,
) -> Result<(), CommandError> {
    let mut validated_file_list = Vec::new();
    files.iter().for_each(|f| {
        let path = PathBuf::from(f);
        if !path.exists() {
            return;
        }
        if path.is_file() {
            let file_format = get_file_mime_type(&path);
            if file_format.media_type() == "text/plain"
                || file_format.media_type() == "application/octet-stream"
            {
                if let Ok(file) = File::open(&path) {
                    let reader = BufReader::new(file);
                    for line in reader.lines().map_while(Result::ok) {
                        let line_path = PathBuf::from(line.trim())
                            .canonicalize()
                            .unwrap_or_default();
                        if line_path.exists() && is_valid_for_advanced_import(&line_path, &filter) {
                            validated_file_list.push(FilePath::from(line_path));
                        }
                    }
                }
                return;
            }
        }

        if is_valid_for_advanced_import(&path, &filter) {
            validated_file_list.push(FilePath::from(path));
        }
    });

    app.emit("advancedImport:listValidationFinished", ())?; //TODO

    if validated_file_list.is_empty() {
        return Ok(());
    }
    process_files(&app, validated_file_list, recursive);

    Ok(())
}

fn is_valid_for_advanced_import(path: &Path, filter: &AdvancedImportDialogFilter) -> bool {
    let mut is_valid = false;
    if !filter.pattern.is_empty() {
        let regex = Regex::new(filter.pattern.as_ref()).unwrap(); //TODO
        let filename = path.file_name().unwrap_or("".as_ref());
        is_valid = regex.is_match(filename.to_str().unwrap_or(""));
    }

    if filter.size.enabled {
        if let Ok(metadata) = path.metadata() {
            let file_size = metadata.len() as i64;
            let size_limit = (filter.size.value * filter.size.unit) as i64;
            let has_valid_size = match filter.size.pattern.as_ref() {
                "greater_than" => file_size > size_limit,
                "equal_to" => file_size == size_limit,
                "less_than" => file_size < size_limit,
                _ => false,
            };
            is_valid = is_valid && has_valid_size;
        }
    }
    is_valid
}

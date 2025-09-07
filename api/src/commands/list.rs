use crate::app_data::AppData;
use crate::errors::CommandError;
use crate::scan_files::FileList;
use std::path::absolute;
use std::sync::Mutex;
use tauri::Manager;

#[tauri::command]
pub fn clear_list(app: tauri::AppHandle) -> Result<FileList, CommandError> {
    let state = app.state::<Mutex<AppData>>();
    let mut state = state.lock()?;
    state.file_list.clear();

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

    state.file_list.remove_ids(&keys);

    state.compute_base_path()?;

    Ok(FileList {
        files: state.file_list.paged_list.clone(),
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

    state.file_list.change_page(page);

    Ok(FileList {
        files: state.file_list.paged_list.clone(),
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

    let file_list_column = crate::app_data::FileListColumn::from_str(&column)
        .ok_or_else(|| CommandError::Generic(Box::from(format!("Unknown column: {column}"))))?;
    let order = crate::app_data::SortOrder::from_str(order.as_str())
        .ok_or_else(|| CommandError::Generic(Box::from(format!("Unknown ordering: {order}"))))?;

    state.file_list.sort_list_by(file_list_column, order);

    Ok(FileList {
        files: state.file_list.paged_list.clone(),
        total_files: state.file_list.len(),
        base_folder: absolute(&state.base_path)
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
        base_folder: absolute(&state.base_path)
            .unwrap_or_default()
            .display()
            .to_string(),
    })
}

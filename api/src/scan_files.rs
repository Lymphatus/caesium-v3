use std::path::{absolute, Path, PathBuf};
use tauri_plugin_dialog::FilePath;
use walkdir::WalkDir;

#[derive(serde::Serialize, Clone)]
pub struct FileImportProgress {
    pub(crate) progress: usize,
    pub(crate) total: usize,
}

fn is_filetype_supported(path: &Path) -> bool {
    match get_file_mime_type(path) {
        Some(mime_type) => {
            matches!(
                mime_type.as_str(),
                "image/jpeg" | "image/png" | "image/webp" | "image/gif" // TODO TIFF
            )
        }
        None => false,
    }
}

pub fn get_file_mime_type(path: &Path) -> Option<String> {
    match infer::get_from_path(path) {
        Ok(v) => v.map(|ft| ft.mime_type().to_string()),
        Err(_) => None,
    }
}

fn is_valid(entry: &Path) -> bool {
    entry.exists() && entry.is_file() && is_filetype_supported(entry)
}

pub fn scan_files(args: &Vec<FilePath>, initial_base_path: &PathBuf, recursive: bool) -> (PathBuf, Vec<PathBuf>) {
    if args.is_empty() {
        return (initial_base_path.clone(), vec![]);
    }
    let mut files: Vec<PathBuf> = vec![];
    let mut base_path = initial_base_path.clone();

    for path in args.iter() {
        let input = PathBuf::from(path.as_path().unwrap()); //TODO
        if input.exists() && input.is_dir() {
            let mut walk_dir = WalkDir::new(input);
            if !recursive {
                walk_dir = walk_dir.max_depth(1);
            }
            for entry in walk_dir.into_iter().filter_map(|e| e.ok()) {
                let path = entry.into_path();
                if is_valid(&path) {
                    base_path = match compute_base_path(&path, &base_path) {
                        Some(p) => p,
                        None => continue,
                    };
                    files.push(path);
                }
            }
        } else if is_valid(&input) {
            base_path = match compute_base_path(&input, &base_path) {
                Some(p) => p,
                None => continue,
            };
            files.push(input);
        }
    }

    (base_path, files)
}

fn compute_base_path(path: &Path, base_path: &Path) -> Option<PathBuf> {
    if let Ok(ap) = absolute(path) {
        let bp = compute_base_folder(base_path, &ap)?;
        return Some(bp);
    }

    None
}

fn compute_base_folder(base_folder: &Path, new_path: &Path) -> Option<PathBuf> {
    if base_folder.as_os_str().is_empty() && new_path.parent().is_some() {
        return Some(new_path.parent()?.to_path_buf());
    }

    if base_folder.parent().is_none() {
        return Some(base_folder.to_path_buf());
    }

    let mut folder = PathBuf::new();
    let mut new_path_folder = new_path.to_path_buf();
    if new_path.is_file() {
        new_path_folder = new_path.parent().unwrap_or(&*PathBuf::from("/")).to_path_buf();
    }
    for (i, component) in base_folder.iter().enumerate() {
        if let Some(new_path_component) = new_path_folder.iter().nth(i) {
            if new_path_component == component {
                folder.push(component);
            } else {
                break;
            }
        } else {
            break;
        }
    }

    if folder.parent().is_none() {
        return Some(folder);
    }

    Some(folder)
}
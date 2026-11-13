use crate::compressor::{
    compress_cimage, preview_cimage, resolve_output_path, CompressionProgress, CompressionResult,
    CompressionStatus, CompressionSummary, OptionsPayload,
};
use crate::errors::CommandError;
use crate::{AppData, CImage, ImageStatus};
use rayon::iter::{IntoParallelRefIterator, ParallelIterator};
use std::cmp::max;
use std::collections::HashSet;
use std::sync::atomic::{AtomicUsize, Ordering};
use std::sync::Arc;
use std::sync::Mutex;
use std::thread;
use std::time::{Duration, Instant};
use tauri::{Emitter, Manager};

#[tauri::command]
pub fn pause_compression(app: tauri::AppHandle) -> Result<(), CommandError> {
    let state = app.state::<Mutex<AppData>>();
    let state = state.lock()?;
    state
        .compression_status
        .is_compression_paused
        .store(true, Ordering::Relaxed);
    Ok(())
}

#[tauri::command]
pub fn resume_compression(app: tauri::AppHandle) -> Result<(), CommandError> {
    let state = app.state::<Mutex<AppData>>();
    let state = state.lock()?;
    state
        .compression_status
        .is_compression_paused
        .store(false, Ordering::Relaxed);
    app.emit("fileList:compressionResumed", true)?;
    Ok(())
}

#[tauri::command]
pub fn cancel_compression(app: tauri::AppHandle) -> Result<(), CommandError> {
    let state = app.state::<Mutex<AppData>>();
    let state = state.lock()?;
    state
        .compression_status
        .is_compression_cancelled
        .store(true, Ordering::Relaxed);
    state
        .compression_status
        .is_compression_paused
        .store(false, Ordering::Relaxed);
    Ok(())
}

#[tauri::command]
pub async fn compress(
    app: tauri::AppHandle,
    options: OptionsPayload,
    threads: usize,
    base_folder: String,
) -> Result<(), CommandError> {
    let start_time = Instant::now();
    let total_images = Arc::new(AtomicUsize::new(0));
    let total_success = Arc::new(AtomicUsize::new(0));
    let total_errors = Arc::new(AtomicUsize::new(0));
    let total_warnings = Arc::new(AtomicUsize::new(0));
    let original_size = Arc::new(AtomicUsize::new(0));
    let compressed_size = Arc::new(AtomicUsize::new(0));
    let files_on_pause = Arc::new(Mutex::new(HashSet::<String>::new()));
    let max_threads = max(threads, 1);

    //TODO avoid cloning everything if performance will suffer
    // SNAPSHOT what's needed to work on, then release the lock before any work
    let (status, images) = {
        let state = app.state::<Mutex<AppData>>();
        let state = state.lock()?;
        (
            Arc::clone(&state.compression_status),
            state.file_list.iter().cloned().collect::<Vec<CImage>>(),
        )
    };

    // Named binding on purpose: the guard clears is_compressing when it drops,
    // so every exit below resets the flag without touching it by hand.
    let Some(_compressing) = status.begin() else {
        return Ok(()); // a run is already in flight
    };

    match has_output_conflicts(&images, &options, &base_folder) {
        Some(false) => {}
        Some(true) => return Err(CommandError::Generic("Output conflicts not allowed".into())),
        None => {
            return Err(CommandError::Generic(
                "Unable to check output conflicts".into(),
            ))
        }
    }

    app.emit(
        "fileList:compressionProgress",
        CompressionProgress {
            current: 0,
            total: 0,
        },
    )?;

    total_images.store(images.len(), Ordering::Relaxed);

    let progress = AtomicUsize::new(0);

    let thread_pool = rayon::ThreadPoolBuilder::new()
        .num_threads(max_threads)
        .build()?;

    thread_pool.install(|| {
        let _ = images.par_iter().try_for_each(|cimage| {
            loop {
                // Lock-free: the flags live behind an Arc, so polling them does
                // not take the AppData mutex the UI also needs.
                let is_cancelled = status.is_compression_cancelled.load(Ordering::Relaxed);
                let is_paused = status.is_compression_paused.load(Ordering::Relaxed);

                if is_cancelled {
                    return Err(()); // Stop iteration
                }

                if is_paused {
                    if files_on_pause.lock().unwrap().len() < max_threads {
                        files_on_pause.lock().unwrap().insert(cimage.id.clone());
                    }

                    if files_on_pause.lock().unwrap().len() == max_threads {
                        app.emit("fileList:compressionPaused", ()).unwrap(); //TODO
                        files_on_pause.lock().unwrap().insert(String::from(""));
                        // This will cause the event not to trigger at every loop
                    }

                    thread::sleep(Duration::from_millis(500)); // Sleep while paused
                    continue;
                } else {
                    files_on_pause.lock().unwrap().clear();
                    break; // Continue processing
                }
            }
            original_size.fetch_add(cimage.size as usize, Ordering::Relaxed);
            let r = CompressionResult {
                status: CompressionStatus::Warning,
                cimage: CImage {
                    status: ImageStatus::Compressing,
                    ..cimage.clone()
                },
            };
            app.emit("fileList:updateCImage", r).unwrap(); //TODO
            let result = compress_cimage(&app, cimage, &options, &base_folder);

            // Count results
            match result.status {
                CompressionStatus::Success => total_success.fetch_add(1, Ordering::Relaxed),
                CompressionStatus::Warning => total_warnings.fetch_add(1, Ordering::Relaxed),
                CompressionStatus::Error => total_errors.fetch_add(1, Ordering::Relaxed),
            };

            compressed_size.fetch_add(result.cimage.compressed_size as usize, Ordering::Relaxed);

            let state = app.state::<Mutex<AppData>>();
            let mut state = state.lock().unwrap(); //TODO
            state.file_list.replace(result.clone().cimage);
            app.emit("fileList:updateCImage", result).unwrap(); //TODO
            progress.fetch_add(1, Ordering::Relaxed);

            app.emit(
                "fileList:compressionProgress",
                CompressionProgress {
                    current: progress.load(Ordering::Relaxed),
                    total: total_images.load(Ordering::Relaxed),
                },
            )
            .unwrap(); //TODO

            Ok(())
        });
    });

    let elapsed_time = start_time.elapsed();
    let summary = CompressionSummary {
        total_images: total_images.load(Ordering::Relaxed),
        total_success: total_success.load(Ordering::Relaxed),
        total_skipped: total_warnings.load(Ordering::Relaxed),
        total_errors: total_errors.load(Ordering::Relaxed),
        original_size: original_size.load(Ordering::Relaxed),
        compressed_size: compressed_size.load(Ordering::Relaxed),
        total_time: elapsed_time.as_millis() as u64,
    };

    app.emit("fileList:compressionFinished", summary)?;

    Ok(()) // _compressing drops here and clears is_compressing
}

fn has_output_conflicts(
    images: &[CImage],
    options: &OptionsPayload,
    base_folder: &str,
) -> Option<bool> {
    let mut map: HashSet<String> = HashSet::new();
    for cimage in images {
        let (folder, filename) =
            match resolve_output_path(cimage.path.as_ref(), options, base_folder) {
                Some((folder, filename)) => (folder, filename),
                None => return None,
            };
        let mut key = folder.join(filename).display().to_string();
        #[cfg(any(windows, target_os = "macos"))]
        {
            key = key.to_lowercase();
        }
        if !map.insert(key) {
            return Some(true);
        }
    }

    Some(false)
}

#[tauri::command]
pub async fn preview(
    app: tauri::AppHandle,
    ids: Vec<String>,
    options: OptionsPayload,
    threads: usize,
) {
    rayon::ThreadPoolBuilder::new().num_threads(max(threads, 1));
    let state = app.state::<Mutex<AppData>>();
    let state = state.lock().unwrap(); //TODO

    let images: Vec<CImage> = ids
        .iter()
        .map(|id| state.file_list.get(id.as_str()).cloned().unwrap())
        .collect();

    drop(state);

    images.par_iter().for_each(|cimage| {
        let result = preview_cimage(&app, cimage, &options);
        let state = app.state::<Mutex<AppData>>();
        let mut state = state.lock().unwrap(); //TODO
        state.file_list.replace(result.clone().cimage);
        app.emit("fileList:updateCImage", result).unwrap(); //TODO
    });
}

#[cfg(test)]
mod tests;

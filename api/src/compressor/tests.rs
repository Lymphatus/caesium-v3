use super::*;
use std::time::{Duration, SystemTime};

fn options(keep_modified: bool) -> OptionsPayload {
    serde_json::from_value(serde_json::json!({
        "compression_options": {
            "jpeg": { "quality": 80, "chroma_subsampling": "auto", "progressive": true, "optimize": false, "preserve_icc": true },
            "png": { "quality": 80, "optimization_level": 3, "optimize": false },
            "gif": { "quality": 80 },
            "webp": { "quality": 80, "lossless": false },
            "tiff": { "method": "deflate", "deflate_level": 1 },
            "compression_mode": 0,
            "keep_metadata": true,
            "max_size_value": 500,
            "max_size_unit": 1024
        },
        "resize_options": {
            "resize_enabled": false, "resize_mode": "none", "keep_aspect_ratio": true, "do_not_enlarge": true,
            "width": 0, "height": 0, "width_percentage": 100, "height_percentage": 100, "long_edge": 0, "short_edge": 0
        },
        "output_options": {
            "output_folder": "", "same_folder_as_input": false, "keep_folder_structure": false,
            "skip_if_output_is_bigger": true, "move_original_file_enabled": false, "move_original_file_mode": "trash",
            "keep_file_dates_enabled": keep_modified, "keep_creation_date": false,
            "keep_last_modified_date": keep_modified, "keep_last_access_date": false,
            "output_format": "original", "suffix": ""
        }
    }))
    .expect("valid options payload")
}

fn dir_entries(dir: &Path) -> Vec<OsString> {
    let mut names: Vec<OsString> = fs::read_dir(dir)
        .unwrap()
        .map(|e| e.unwrap().file_name())
        .collect();
    names.sort();
    names
}

#[test]
fn write_output_file_creates_new_file() {
    let dir = tempfile::tempdir().unwrap();
    let out = dir.path().join("out.jpg");

    write_output_file(&out, b"compressed", None, &options(false)).unwrap();

    assert_eq!(fs::read(&out).unwrap(), b"compressed");
}

#[test]
fn write_output_file_replaces_existing_file() {
    let dir = tempfile::tempdir().unwrap();
    let out = dir.path().join("same.jpg");
    fs::write(&out, b"original content that is longer").unwrap();

    write_output_file(&out, b"new", None, &options(false)).unwrap();

    assert_eq!(fs::read(&out).unwrap(), b"new");
}

#[test]
fn write_output_file_errors_when_parent_dir_is_missing() {
    let dir = tempfile::tempdir().unwrap();
    let out = dir.path().join("missing").join("out.jpg");

    let result = write_output_file(&out, b"data", None, &options(false));

    assert!(result.is_err());
    assert!(!out.exists());
}

#[test]
fn write_output_file_leaves_no_temp_files_on_success() {
    let dir = tempfile::tempdir().unwrap();
    let out = dir.path().join("out.jpg");

    write_output_file(&out, b"data", None, &options(false)).unwrap();

    assert_eq!(dir_entries(dir.path()), vec![OsString::from("out.jpg")]);
}

#[test]
fn write_output_file_leaves_no_temp_files_when_persist_fails() {
    let dir = tempfile::tempdir().unwrap();
    // A directory as destination makes the final rename fail on every platform.
    let out = dir.path().join("occupied");
    fs::create_dir(&out).unwrap();

    let result = write_output_file(&out, b"data", None, &options(false));

    assert!(result.is_err());
    assert!(out.is_dir());
    assert_eq!(dir_entries(dir.path()), vec![OsString::from("occupied")]);
}

#[test]
fn write_output_file_preserves_modified_time_when_requested() {
    let dir = tempfile::tempdir().unwrap();
    let input = dir.path().join("input.jpg");
    fs::write(&input, b"input").unwrap();
    let past = SystemTime::UNIX_EPOCH + Duration::from_secs(1_000_000_000);
    File::options()
        .write(true)
        .open(&input)
        .unwrap()
        .set_modified(past)
        .unwrap();
    let input_metadata = input.metadata().unwrap();
    let out = dir.path().join("out.jpg");

    write_output_file(&out, b"data", Some(&input_metadata), &options(true)).unwrap();

    assert_eq!(out.metadata().unwrap().modified().unwrap(), past);
}

#[test]
fn write_output_file_does_not_touch_times_when_not_requested() {
    let dir = tempfile::tempdir().unwrap();
    let input = dir.path().join("input.jpg");
    fs::write(&input, b"input").unwrap();
    let past = SystemTime::UNIX_EPOCH + Duration::from_secs(1_000_000_000);
    File::options()
        .write(true)
        .open(&input)
        .unwrap()
        .set_modified(past)
        .unwrap();
    let out = dir.path().join("out.jpg");

    write_output_file(&out, b"data", None, &options(true)).unwrap();

    assert_ne!(out.metadata().unwrap().modified().unwrap(), past);
}

// tempfile creates files with mode 0o600; outputs should stay readable like File::create did.
#[cfg(unix)]
#[test]
fn write_output_file_output_is_readable_by_others() {
    use std::os::unix::fs::PermissionsExt;
    let dir = tempfile::tempdir().unwrap();
    let out = dir.path().join("out.jpg");

    write_output_file(&out, b"data", None, &options(false)).unwrap();

    let mode = out.metadata().unwrap().permissions().mode();
    assert_ne!(mode & 0o044, 0, "output mode is {:o}", mode & 0o777);
}

// --- output_overwrites_input -------------------------------------------------
// The guard that decides whether the output path is the input file itself, and
// therefore whether deleting "the original" would delete the only copy.
// The output file normally does not exist yet when this runs.

#[test]
fn overwrites_input_for_the_very_same_path() {
    let dir = tempfile::tempdir().unwrap();
    let input = dir.path().join("foto.jpg");
    fs::write(&input, b"image").unwrap();

    assert!(output_overwrites_input(&input, &input));
}

#[test]
fn does_not_overwrite_input_for_two_distinct_files() {
    let dir = tempfile::tempdir().unwrap();
    let input = dir.path().join("foto.jpg");
    let output = dir.path().join("foto_compressed.jpg");
    fs::write(&input, b"image").unwrap();
    fs::write(&output, b"other").unwrap();

    assert!(!output_overwrites_input(&input, &output));
}

#[test]
fn does_not_overwrite_input_when_the_output_does_not_exist_yet() {
    let dir = tempfile::tempdir().unwrap();
    let input = dir.path().join("foto.jpg");
    fs::write(&input, b"image").unwrap();

    let output = dir.path().join("out.jpg");

    assert!(!output_overwrites_input(&input, &output));
}

// The review's own example: `foto.PNG` compressed to PNG into its own folder
// with no suffix. On NTFS and APFS the output path *is* the input file.
#[test]
fn overwrites_input_on_a_case_mismatch_when_the_filesystem_is_case_insensitive() {
    let dir = tempfile::tempdir().unwrap();
    let input = dir.path().join("foto.PNG");
    fs::write(&input, b"image").unwrap();
    let output = dir.path().join("foto.png");

    let case_insensitive = output.exists();
    assert_eq!(
        output_overwrites_input(&input, &output),
        case_insensitive,
        "filesystem reports case_insensitive = {case_insensitive}"
    );
}

#[test]
fn overwrites_input_for_a_non_normalized_path_to_the_same_file() {
    let dir = tempfile::tempdir().unwrap();
    let nested = dir.path().join("sub");
    fs::create_dir(&nested).unwrap();
    let input = nested.join("foto.jpg");
    fs::write(&input, b"image").unwrap();
    let output = nested.join("..").join("sub").join("foto.jpg");

    assert!(output_overwrites_input(&input, &output));
}

// Two names, one inode: writing through either one is still a write to the
// user's only copy of those bytes, so the original must not be deleted.
#[test]
fn overwrites_input_for_a_hard_link_to_the_same_file() {
    let dir = tempfile::tempdir().unwrap();
    let input = dir.path().join("foto.jpg");
    fs::write(&input, b"image").unwrap();
    let output = dir.path().join("linked.jpg");
    if fs::hard_link(&input, &output).is_err() {
        return; // filesystem without hard links
    }

    assert!(output_overwrites_input(&input, &output));
}

#[cfg(unix)]
#[test]
fn overwrites_input_when_the_output_is_a_symlink_to_the_input() {
    let dir = tempfile::tempdir().unwrap();
    let input = dir.path().join("foto.jpg");
    fs::write(&input, b"image").unwrap();
    let output = dir.path().join("link.jpg");
    std::os::unix::fs::symlink(&input, &output).unwrap();

    assert!(output_overwrites_input(&input, &output));
}

// An input that vanished between import and compression: not the same file as
// the output, and the failure is left to the compression step to report.
#[test]
fn does_not_overwrite_input_when_the_input_is_gone() {
    let dir = tempfile::tempdir().unwrap();
    let output = dir.path().join("out.jpg");
    fs::write(&output, b"image").unwrap();

    let input = dir.path().join("gone.jpg");

    assert!(!output_overwrites_input(&input, &output));
}

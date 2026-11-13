use super::*;
use serde_json::json;
use std::path::PathBuf;

// `has_output_conflicts` answers: would any two images in this list be written
// to the same output file? Only the output options matter here, so every test
// starts from a neutral payload and overrides the output options it cares about.
fn options(output_overrides: serde_json::Value) -> OptionsPayload {
    let mut payload = json!({
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
            "output_folder": "/out", "same_folder_as_input": false, "keep_folder_structure": false,
            "skip_if_output_is_bigger": true, "move_original_file_enabled": false, "move_original_file_mode": "trash",
            "keep_file_dates_enabled": false, "keep_creation_date": false,
            "keep_last_modified_date": false, "keep_last_access_date": false,
            "output_format": "original", "suffix": ""
        }
    });

    let output_options = payload["output_options"].as_object_mut().expect("object");
    for (key, value) in output_overrides.as_object().expect("object") {
        output_options.insert(key.clone(), value.clone());
    }

    serde_json::from_value(payload).expect("valid options payload")
}

fn image(path: impl Into<PathBuf>) -> CImage {
    let path = path.into().display().to_string();
    CImage {
        id: format!("id-{path}"),
        path,
        ..CImage::default()
    }
}

// An absolute path under the current directory, so that `keep_folder_structure`
// can strip a base folder that really is a prefix on every platform.
fn under_cwd(relative: &str) -> PathBuf {
    std::env::current_dir().expect("cwd").join(relative)
}

#[test]
fn no_conflict_when_every_output_name_is_distinct() {
    let images = [image("/in/a/one.jpg"), image("/in/b/two.jpg")];

    assert_eq!(
        has_output_conflicts(&images, &options(json!({})), ""),
        Some(false)
    );
}

#[test]
fn no_conflict_for_a_single_image() {
    let images = [image("/in/a/img.jpg")];

    assert_eq!(
        has_output_conflicts(&images, &options(json!({})), ""),
        Some(false)
    );
}

// Same basename in two folders, flattened into one output folder.
#[test]
fn conflict_when_two_folders_are_flattened_onto_the_same_name() {
    let images = [image("/in/a/img.jpg"), image("/in/b/img.jpg")];

    assert_eq!(
        has_output_conflicts(&images, &options(json!({})), ""),
        Some(true)
    );
}

// Same folder, two extensions, one target format: both become img.webp.
// This collides whatever the folder options are.
#[test]
fn conflict_when_a_format_conversion_collapses_two_names() {
    let images = [image("/in/a/img.jpg"), image("/in/a/img.png")];
    let options = options(json!({ "same_folder_as_input": true, "output_format": "webp" }));

    assert_eq!(has_output_conflicts(&images, &options, ""), Some(true));
}

// The way out the UI should be suggesting for the flattening case.
#[test]
fn no_conflict_when_keeping_the_folder_structure() {
    let base = under_cwd("in");
    let images = [image(base.join("a/img.jpg")), image(base.join("b/img.jpg"))];
    let options = options(json!({ "keep_folder_structure": true }));

    assert_eq!(
        has_output_conflicts(&images, &options, &base.display().to_string()),
        Some(false)
    );
}

// On NTFS and APFS these two land on the same file, so this must be a conflict.
#[cfg(any(windows, target_os = "macos"))]
#[test]
fn conflict_when_two_output_names_differ_only_by_case() {
    let images = [image("/in/a/IMG.jpg"), image("/in/b/img.jpg")];

    assert_eq!(
        has_output_conflicts(&images, &options(json!({})), ""),
        Some(true)
    );
}

// On a case-sensitive filesystem the same two names are two different files,
// so refusing to compress would be a false positive.
#[cfg(unix)]
#[test]
fn no_conflict_when_output_names_differ_only_by_case_on_a_case_sensitive_fs() {
    let images = [image("/in/a/IMG.jpg"), image("/in/b/img.jpg")];

    assert_eq!(
        has_output_conflicts(&images, &options(json!({})), ""),
        Some(false)
    );
}

// `resolve_output_path` cannot answer when the base folder is not a prefix of
// the input, which happens with a stale base_path or inputs from several roots.
// The check reports None rather than guessing, and the caller refuses the run.
#[test]
fn no_answer_when_the_base_folder_is_not_a_prefix_of_the_input() {
    let images = [image(under_cwd("in/a/img.jpg"))];
    let options = options(json!({ "keep_folder_structure": true }));

    assert_eq!(
        has_output_conflicts(&images, &options, "/not/a/prefix"),
        None
    );
}

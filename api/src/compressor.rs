use crate::scan_files::get_real_resolution;
use crate::{CImage, ImageStatus};
use caesium::parameters::{CSParameters, ChromaSubsampling, TiffCompression, TiffDeflateLevel};
use caesium::{compress, compress_to_size};
use serde_json::to_string;
use sha2::{Digest, Sha256};
use std::fs;
use std::path::Path;
use tauri::path::BaseDirectory;
use tauri::Manager;

#[derive(serde::Serialize, serde::Deserialize, Clone, Debug)]
struct JPEGOptions {
    quality: u32,
    chroma_subsampling: String, //TODO Create type
    progressive: bool,
}
#[derive(serde::Serialize, serde::Deserialize, Clone, Debug)]
struct PNGOptions {
    quality: u32,
    optimization_level: u32,
}
#[derive(serde::Serialize, serde::Deserialize, Clone, Debug)]
struct WebPOptions {
    quality: u32,
}
#[derive(serde::Serialize, serde::Deserialize, Clone, Debug)]
struct TIFFOptions {
    method: String, //TODO Create type
    deflate_level: u32,
}

#[derive(serde::Serialize, serde::Deserialize, Clone, Debug)]
struct CompressionOptions {
    jpeg: JPEGOptions,
    png: PNGOptions,
    webp: WebPOptions,
    tiff: TIFFOptions,
    compression_mode: u32, //TODO Create type
    keep_metadata: bool,
    lossless: bool,
    max_size_value: usize,
    max_size_unit: usize,
}

#[derive(serde::Serialize, serde::Deserialize, Clone, Debug)]
struct ResizeOptions {
    resize_enabled: bool,
    resize_mode: String, //TODO Create type
    keep_aspect_ratio: bool,
    do_not_enlarge: bool,
    width: u32,
    height: u32,
    width_percentage: u32,
    height_percentage: u32,
    long_edge: u32,
    short_edge: u32,
}

#[derive(serde::Serialize, serde::Deserialize, Clone, Debug)]
struct OutputOptions {
    output_folder: String,
    same_folder_as_input: bool,
    keep_folder_structure: bool,
    skip_if_output_is_bigger: bool,
    move_original_file_enabled: bool,
    move_original_file_mode: String, // TODO Create type
    keep_file_dates_enabled: bool,
    keep_creation_date: bool,
    keep_last_modified_date: bool,
    keep_last_access_date: bool,
    output_format: String, //TODO Create type
    suffix: String,
}

#[derive(serde::Serialize, serde::Deserialize, Clone, Debug)]
pub struct OptionsPayload {
    compression_options: CompressionOptions,
    resize_options: ResizeOptions,
    output_options: OutputOptions,
}

#[derive(serde::Serialize, serde::Deserialize, Clone, Debug)]
pub struct CompressionResult {
    status: CompressionStatus,
    pub cimage: CImage,
}

#[derive(serde::Serialize, serde::Deserialize, Clone, Debug)]
enum CompressionStatus {
    Success,
    Warning,
    Error,
}

#[derive()]
enum ResizeMode {
    None,
    Dimensions,
    Width,
    Height,
    LongEdge,
    ShortEdge,
    Percentage,
}

// TODO I don't like using the payload here
pub fn preview_cimage(
    app: &tauri::AppHandle,
    cimage: &CImage,
    options: &OptionsPayload,
) -> CompressionResult {
    let filename = options_payload_to_sha256(&cimage.id, options);
    let mut parameters = parse_compression_options(options, &cimage);
    let output_path = app.path().resolve(filename, BaseDirectory::Temp).unwrap(); //TODO

    println!("Preview in: {:?}", output_path);

    let result = if options.compression_options.compression_mode == 1 {
        let output_size =
            options.compression_options.max_size_value * options.compression_options.max_size_unit;
        compress_to_size(
            cimage.path.clone(),
            output_path.display().to_string(),
            &mut parameters,
            output_size,
            true,
        )
        .is_ok()
    } else {
        compress(
            cimage.path.clone(),
            output_path.display().to_string(),
            &parameters,
        )
        .is_ok()
    };
    println!("Compression finished");

    if !result {
        return CompressionResult {
            status: CompressionStatus::Error,
            cimage: CImage {
                status: ImageStatus::Error,
                ..cimage.clone()
            },
        };
    }
    let output_path = Path::new(&output_path);
    let size = fs::metadata(output_path).unwrap().len(); //TODO
    let mut new_width = cimage.width;
    let mut new_height = cimage.height;
    if options.resize_options.resize_enabled {
        (new_width, new_height) = get_real_resolution(output_path, cimage.mime_type.as_str());
    }

    CompressionResult {
        status: CompressionStatus::Success,
        cimage: CImage {
            compressed_width: new_width,
            compressed_height: new_height,
            compressed_size: size,
            compressed_file_path: output_path.display().to_string(),
            info: String::new(),
            status: ImageStatus::Success,
            ..cimage.clone()
        },
    }
}

fn parse_compression_options(options: &OptionsPayload, cimage: &CImage) -> CSParameters {
    let mut parameters = CSParameters::new();

    parameters.keep_metadata = options.compression_options.keep_metadata;
    parameters.optimize = options.compression_options.lossless;

    // TODO use an enum or a match
    if options.resize_options.resize_enabled {
        let resize_mode = match options.resize_options.resize_mode.as_str() {
            "none" => ResizeMode::None,
            "dimensions" => ResizeMode::Dimensions,
            "width" => ResizeMode::Width,
            "height" => ResizeMode::Height,
            "long_edge" => ResizeMode::LongEdge,
            "short_edge" => ResizeMode::ShortEdge,
            "percentage" => ResizeMode::Percentage,
            _ => ResizeMode::None,
        };
        if matches!(resize_mode, ResizeMode::Dimensions) {
            parameters.width = options.resize_options.width;
            parameters.height = options.resize_options.height;
        } else if matches!(resize_mode, ResizeMode::Percentage) {
            parameters.width =
                f64::from(options.resize_options.width_percentage * cimage.width as u32 / 100)
                    .round() as u32;
            parameters.height =
                f64::from(options.resize_options.height_percentage * cimage.height as u32 / 100)
                    .round() as u32;
        } else if matches!(resize_mode, ResizeMode::ShortEdge) {
            if cimage.width > cimage.height {
                parameters.height = options.resize_options.short_edge;
                parameters.width = 0;
            } else {
                parameters.width = options.resize_options.short_edge;
                parameters.height = 0;
            }
        } else if matches!(resize_mode, ResizeMode::LongEdge) {
            if cimage.width > cimage.height {
                parameters.width = options.resize_options.long_edge;
                parameters.height = 0;
            } else {
                parameters.height = options.resize_options.long_edge;
                parameters.width = 0;
            }
        } else if matches!(resize_mode, ResizeMode::Width) {
            parameters.width = options.resize_options.width;
            parameters.height = 0;
        } else if matches!(resize_mode, ResizeMode::Height) {
            parameters.width = 0;
            parameters.height = options.resize_options.height;
        }
    }

    // -- JPEG --
    parameters.jpeg.quality = options.compression_options.jpeg.quality;
    parameters.jpeg.chroma_subsampling =
        match options.compression_options.jpeg.chroma_subsampling.as_str() {
            "4:4:4" => ChromaSubsampling::CS444,
            "4:2:2" => ChromaSubsampling::CS422,
            "4:2:0" => ChromaSubsampling::CS420,
            "4:1:1" => ChromaSubsampling::CS411,
            _ => ChromaSubsampling::Auto,
        };

    // -- PNG --
    parameters.png.quality = options.compression_options.png.quality;
    parameters.png.optimization_level = options.compression_options.png.optimization_level as u8;
    parameters.png.force_zopfli = false;

    // -- WEBP --
    parameters.webp.quality = options.compression_options.webp.quality;

    // -- TIFF --
    parameters.tiff.algorithm = match options.compression_options.tiff.method.as_str() {
        "lzw" => TiffCompression::Lzw,
        "deflate" => TiffCompression::Deflate,
        "packbits" => TiffCompression::Packbits,
        _ => TiffCompression::Uncompressed,
    };
    parameters.tiff.deflate_level = match options.compression_options.tiff.deflate_level {
        1 => TiffDeflateLevel::Fast,
        9 => TiffDeflateLevel::Best,
        _ => TiffDeflateLevel::Balanced,
    };

    parameters
}

fn options_payload_to_sha256(id: &String, options: &OptionsPayload) -> String {
    // Serialize the struct to a JSON string
    let json_string = to_string(options).unwrap();

    // Compute the SHA256 hash
    let mut hasher = Sha256::new();
    hasher.update(id);
    hasher.update("|");
    hasher.update(json_string);
    let result = hasher.finalize();

    // Convert the hash to a hexadecimal string
    format!("{:x}", result)
}

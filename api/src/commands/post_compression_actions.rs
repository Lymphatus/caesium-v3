use serde_repr::*;
#[derive(Serialize_repr, Deserialize_repr, Clone, Debug, Default)]
#[repr(u8)]
pub enum PostCompressionAction {
    #[default]
    None = 0,
    CloseApp = 1,
    Shutdown = 2,
    Sleep = 3,
    OpenOutputFolder = 4,
}
#[tauri::command]
pub fn exec_post_compression_action(post_compression_action: PostCompressionAction) {
    match post_compression_action {
        PostCompressionAction::Shutdown => shutdown(),
        PostCompressionAction::Sleep => sleep(),
        PostCompressionAction::OpenOutputFolder => open_output_folder(),
        _ => (), // Others are handled by either frontend or ignored
    }
}

fn shutdown() {
    println!("Shutting down...")
}

fn sleep() {
    println!("Sleeping...")
}

fn open_output_folder() {
    println!("Opening output folder...")
}

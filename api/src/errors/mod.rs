#[derive(Debug, thiserror::Error)]
pub enum CommandError {
    #[error(transparent)]
    Io(#[from] std::io::Error),
    #[error(transparent)]
    Tauri(#[from] tauri::Error),
    #[error("Mutex or RwLock was poisoned")]
    Poisoned,
    #[error(transparent)]
    ThreadPool(#[from] rayon::ThreadPoolBuildError),
    #[error("{0}")]
    Generic(#[from] Box<dyn std::error::Error + Send + Sync>),
}

impl serde::Serialize for CommandError {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: serde::ser::Serializer,
    {
        serializer.serialize_str(self.to_string().as_ref())
    }
}

impl<T> From<std::sync::PoisonError<T>> for CommandError {
    fn from(_: std::sync::PoisonError<T>) -> Self {
        CommandError::Poisoned
    }
}

use serde::Serialize;
use thiserror::Error;

#[derive(Debug, Error, Serialize)]
#[serde(tag = "kind", content = "message")]
pub enum AppError {
    #[error("IO error: {0}")]
    Io(String),

    #[error("FFmpeg not found. Please ensure the app was installed correctly.")]
    FfmpegNotFound,

    #[error("FFmpeg error: {0}")]
    Ffmpeg(String),

    #[error("Unsupported format: {0}")]
    UnsupportedFormat(String),

    #[error("DRM protected file: {0}")]
    DrmProtected(String),

    #[error("Plugin not installed: {0}")]
    PluginNotInstalled(String),

    #[error("Plugin error: {0}")]
    Plugin(String),

    #[error("Settings error: {0}")]
    Settings(String),

    #[error("Conversion cancelled")]
    Cancelled,
}

impl From<std::io::Error> for AppError {
    fn from(e: std::io::Error) -> Self {
        AppError::Io(e.to_string())
    }
}

impl From<anyhow::Error> for AppError {
    fn from(e: anyhow::Error) -> Self {
        AppError::Ffmpeg(e.to_string())
    }
}

// Tauri 2 serialises Result<T, E> automatically when E: Serialize+Error,
// so no manual InvokeError impl is needed.

pub type Result<T> = std::result::Result<T, AppError>;

use serde::{Deserialize, Serialize};

/// Metadata probed from a file via ffprobe
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AudioMeta {
    pub path: String,
    pub filename: String,
    pub format: String,        // e.g. "mp3", "flac"
    pub codec: String,         // e.g. "libmp3lame"
    pub bitrate_kbps: Option<u32>,
    pub sample_rate: Option<u32>,
    pub channels: Option<u8>,
    pub duration_secs: Option<f64>,
    pub file_size_bytes: u64,
    pub needs_plugin: bool,    // true if file is an encrypted container
    pub is_drm: bool,          // true if DRM protected
}

/// Quality level chosen by the user via the slider
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "lowercase")]
pub enum Quality {
    Low,
    Standard,
    High,
    Lossless,
}

impl Quality {
    /// Map quality + target format to FFmpeg bitrate/quality args
    pub fn to_ffmpeg_args(&self, format: &str) -> Vec<String> {
        match (self, format) {
            (Quality::Lossless, _) => vec![],  // handled per-format elsewhere
            (Quality::Low,      "mp3")  => vec!["-b:a".into(), "128k".into()],
            (Quality::Standard, "mp3")  => vec!["-b:a".into(), "192k".into()],
            (Quality::High,     "mp3")  => vec!["-b:a".into(), "320k".into()],
            (Quality::Low,      "aac")  => vec!["-b:a".into(), "96k".into()],
            (Quality::Standard, "aac")  => vec!["-b:a".into(), "160k".into()],
            (Quality::High,     "aac")  => vec!["-b:a".into(), "256k".into()],
            (Quality::Low,      "ogg")  => vec!["-q:a".into(), "2".into()],
            (Quality::Standard, "ogg")  => vec!["-q:a".into(), "5".into()],
            (Quality::High,     "ogg")  => vec!["-q:a".into(), "8".into()],
            (Quality::Low,      "opus") => vec!["-b:a".into(), "64k".into()],
            (Quality::Standard, "opus") => vec!["-b:a".into(), "128k".into()],
            (Quality::High,     "opus") => vec!["-b:a".into(), "192k".into()],
            _ => vec!["-b:a".into(), "192k".into()],  // fallback
        }
    }
}

/// A single conversion job
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ConvertJob {
    pub id: String,
    pub input_path: String,
    pub output_path: String,
    pub target_format: String,
    pub quality: Quality,
    pub needs_plugin: bool,
}

/// Progress event emitted during conversion
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProgressEvent {
    pub job_id: String,
    pub percent: f32,   // 0.0 – 100.0
    pub elapsed_secs: f64,
}

/// Final result for a single job
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct JobResult {
    pub job_id: String,
    pub success: bool,
    pub error: Option<String>,
    pub output_path: Option<String>,
    pub output_size_bytes: Option<u64>,
}

/// Installed plugin descriptor
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PluginInfo {
    pub id: String,
    pub name: String,
    pub version: String,
    pub supported_extensions: Vec<String>,
    pub installed: bool,
    pub binary_path: Option<String>,
}

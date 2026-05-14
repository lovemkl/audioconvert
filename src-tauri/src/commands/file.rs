use crate::error::{AppError, Result};
use crate::ffmpeg;
use crate::models::AudioMeta;
use std::path::Path;
use tauri::AppHandle;
use walkdir::WalkDir;

const AUDIO_EXTENSIONS: &[&str] = &[
    // Tier 1
    "mp3", "aac", "m4a", "ogg", "opus", "wav", "flac", "alac", "aiff", "aif",
    "wma", "ape", "dsf", "dff", "dsd",
    // Tier 2
    "oma", "at3", "at9", "wv", "tta", "spx", "amr", "ac3", "dts", "mp2",
    "mpc", "caf", "gsm", "ra", "rm",
    // Tier 3 (plugin)
    "mgg", "mgg1", "mggl", "mflac", "mflac0",
    "qmc0", "qmc2", "qmc3", "qmcflac", "qmcogg", "tkm",
    "ncm", "kgg",
];

/// Recursively scan paths (files or directories) and return all audio file paths
#[tauri::command]
pub async fn scan_files(paths: Vec<String>) -> Result<Vec<String>> {
    let mut results: Vec<String> = Vec::new();

    for path_str in &paths {
        let path = Path::new(path_str);
        if path.is_file() {
            if is_audio_file(path) {
                results.push(path_str.clone());
            }
        } else if path.is_dir() {
            for entry in WalkDir::new(path)
                .follow_links(true)
                .into_iter()
                .filter_map(|e| e.ok())
                .filter(|e| e.file_type().is_file())
            {
                if is_audio_file(entry.path()) {
                    results.push(entry.path().to_string_lossy().into_owned());
                }
            }
        }
    }

    Ok(results)
}

/// Probe a single file's metadata via ffprobe
#[tauri::command]
pub async fn probe_file(app: AppHandle, path: String) -> Result<AudioMeta> {
    let p = Path::new(&path);
    if !p.exists() {
        return Err(AppError::Io(format!("File not found: {path}")));
    }
    ffmpeg::probe(&app, p).await
}

fn is_audio_file(path: &Path) -> bool {
    path.extension()
        .and_then(|e| e.to_str())
        .map(|e| AUDIO_EXTENSIONS.contains(&e.to_lowercase().as_str()))
        .unwrap_or(false)
}

use crate::error::{AppError, Result};
use crate::ffmpeg;
use crate::models::{ConvertJob, JobResult, Quality};
use crate::settings;
use std::collections::HashMap;
use std::path::{Path, PathBuf};
use std::sync::{Arc, Mutex};
use tauri::{AppHandle, Emitter};
use tokio_util::sync::CancellationToken;
use uuid::Uuid;
use once_cell::sync::Lazy;

// Track active conversion tasks so we can cancel them
static ACTIVE_TASKS: Lazy<Mutex<HashMap<String, Arc<CancellationToken>>>> =
    Lazy::new(|| Mutex::new(HashMap::new()));

#[derive(serde::Deserialize)]
pub struct ConvertRequest {
    pub files: Vec<FileEntry>,
    pub target_format: String,
    pub quality: Quality,
}

#[derive(serde::Deserialize)]
pub struct FileEntry {
    pub path: String,
    pub duration_secs: Option<f64>,
    pub needs_plugin: bool,
}

/// Start batch conversion; results are emitted as events, not returned directly
#[tauri::command]
pub async fn start_conversion(
    app: AppHandle,
    request: ConvertRequest,
) -> Result<Vec<String>> {
    let settings = settings::get();
    let output_dir = settings
        .output_dir
        .ok_or_else(|| AppError::Settings("Output directory not configured".into()))?;

    let thread_count = settings.thread_count;
    let semaphore = Arc::new(tokio::sync::Semaphore::new(thread_count));
    let mut job_ids: Vec<String> = Vec::new();

    for entry in request.files {
        let job_id = Uuid::new_v4().to_string();
        job_ids.push(job_id.clone());

        let output_path = build_output_path(&entry.path, &output_dir, &request.target_format);

        let job = ConvertJob {
            id: job_id.clone(),
            input_path: entry.path.clone(),
            output_path: output_path.to_string_lossy().into_owned(),
            target_format: request.target_format.clone(),
            quality: request.quality.clone(),
            needs_plugin: entry.needs_plugin,
        };

        let app_clone = app.clone();
        let sem_clone = semaphore.clone();
        let token = Arc::new(CancellationToken::new());
        let token_clone = token.clone();

        {
            let mut tasks = ACTIVE_TASKS.lock().unwrap();
            tasks.insert(job_id.clone(), token);
        }

        tokio::spawn(async move {
            let _permit = sem_clone.acquire().await.unwrap();

            // Check for cancellation before starting
            if token_clone.is_cancelled() {
                emit_result(&app_clone, &job.id, false, Some("Cancelled".into()), None, None);
                return;
            }

            // Ensure output directory exists
            if let Some(parent) = Path::new(&job.output_path).parent() {
                let _ = std::fs::create_dir_all(parent);
            }

            let result = tokio::select! {
                res = ffmpeg::convert(&app_clone, &job, entry.duration_secs) => res,
                _ = token_clone.cancelled() => Err(AppError::Cancelled),
            };

            match result {
                Ok(size) => emit_result(
                    &app_clone, &job.id, true, None,
                    Some(job.output_path.clone()), Some(size),
                ),
                Err(AppError::Cancelled) => emit_result(
                    &app_clone, &job.id, false, Some("Cancelled".into()), None, None,
                ),
                Err(e) => emit_result(
                    &app_clone, &job.id, false,
                    Some(localize_error(&e.to_string())), None, None,
                ),
            }

            // Clean up token
            let mut tasks = ACTIVE_TASKS.lock().unwrap();
            tasks.remove(&job.id);
        });
    }

    Ok(job_ids)
}

/// Cancel all active conversions
#[tauri::command]
pub async fn cancel_conversion() -> Result<()> {
    let tasks = ACTIVE_TASKS.lock().unwrap();
    for token in tasks.values() {
        token.cancel();
    }
    Ok(())
}

// ── helpers ─────────────────────────────────────────────────────────────────

fn emit_result(
    app: &AppHandle,
    job_id: &str,
    success: bool,
    error: Option<String>,
    output_path: Option<String>,
    output_size: Option<u64>,
) {
    let _ = app.emit("conversion:result", JobResult {
        job_id: job_id.to_string(),
        success,
        error,
        output_path,
        output_size_bytes: output_size,
    });
}

/// Map format id → actual file extension.
/// Some codecs must live in a specific container (e.g. ALAC → M4A).
fn format_ext(format: &str) -> &str {
    match format {
        "alac" => "m4a",  // Apple Lossless needs an M4A/MP4 container
        "aac"  => "m4a",  // AAC also lives in M4A for better compatibility
        other  => other,
    }
}

fn build_output_path(input: &str, output_dir: &str, format: &str) -> PathBuf {
    let stem = Path::new(input)
        .file_stem()
        .and_then(|s| s.to_str())
        .unwrap_or("output");
    let ext = format_ext(format);
    let filename = format!("{stem}.{ext}");
    let candidate = PathBuf::from(output_dir).join(&filename);

    // Auto-rename if file exists
    if !candidate.exists() {
        return candidate;
    }
    let mut i = 1u32;
    loop {
        let name = format!("{stem}_{i}.{ext}");
        let p = PathBuf::from(output_dir).join(&name);
        if !p.exists() {
            return p;
        }
        i += 1;
    }
}

/// Map internal FFmpeg errors to user-friendly messages
fn localize_error(raw: &str) -> String {
    if raw.contains("Invalid data found") || raw.contains("could not find codec") {
        "文件已损坏或格式不受支持".into()
    } else if raw.contains("No such file") {
        "文件已被移动或删除".into()
    } else if raw.contains("Encoder not found") {
        "此格式的编码器不可用".into()
    } else if raw.contains("Permission denied") {
        "无权限读取此文件".into()
    } else {
        raw.to_string()
    }
}

use crate::error::{AppError, Result};
use crate::models::{AudioMeta, ConvertJob, ProgressEvent};
use regex::Regex;
use std::path::{Path, PathBuf};
use std::process::Stdio;
use std::time::Instant;
use tauri::{AppHandle, Emitter};
use tokio::io::{AsyncBufReadExt, BufReader};
use tokio::process::Command;

// Extensions that require the umcrypt plugin
const ENCRYPTED_EXTENSIONS: &[&str] = &[
    "mgg", "mgg1", "mggl", "mflac", "mflac0",
    "qmc0", "qmc2", "qmc3", "qmcflac", "qmcogg",
    "tkm", "ncm", "kgg",
];

// Known DRM-protected extensions (cannot be converted)
const DRM_EXTENSIONS: &[&str] = &["m4p"];

/// Resolve a sidecar binary by name.
/// Strategy (mirrors Tauri shell-plugin logic):
///   1. Look next to the main executable for `<name>-<target-triple>[.exe]`
///   2. Fallback: look for plain `<name>[.exe]` next to the executable
/// This works in both `tauri dev` (target/debug/) and production bundles.
fn sidecar_path(name: &str) -> Result<PathBuf> {
    let exe = std::env::current_exe()
        .map_err(|_| AppError::FfmpegNotFound)?;
    let dir = exe.parent().ok_or(AppError::FfmpegNotFound)?;

    // target triple is embedded at compile time via build.rs
    let triple = env!("TARGET_TRIPLE");

    let (triple_name, plain_name) = if cfg!(windows) {
        (format!("{name}-{triple}.exe"), format!("{name}.exe"))
    } else {
        (format!("{name}-{triple}"), name.to_string())
    };

    let triple_path = dir.join(&triple_name);
    if triple_path.exists() {
        return Ok(triple_path);
    }

    let plain_path = dir.join(&plain_name);
    if plain_path.exists() {
        return Ok(plain_path);
    }

    Err(AppError::FfmpegNotFound)
}

pub fn ffmpeg_path(_app: &AppHandle) -> Result<PathBuf> {
    sidecar_path("ffmpeg")
}

pub fn ffprobe_path(_app: &AppHandle) -> Result<PathBuf> {
    sidecar_path("ffprobe")
}

/// Detect if a file needs the decryption plugin or is DRM-protected
pub fn classify_file(path: &Path) -> (bool, bool) {
    let ext = path
        .extension()
        .and_then(|e| e.to_str())
        .unwrap_or("")
        .to_lowercase();
    let needs_plugin = ENCRYPTED_EXTENSIONS.contains(&ext.as_str());
    let is_drm = DRM_EXTENSIONS.contains(&ext.as_str())
        || ext == "wma" && is_wma_drm(path); // basic DRM check
    (needs_plugin, is_drm)
}

fn is_wma_drm(_path: &Path) -> bool {
    // TODO: parse WMA header to check DRM flag
    // For now, conservatively assume non-DRM
    false
}

/// Run ffprobe on a file and return AudioMeta
pub async fn probe(app: &AppHandle, path: &Path) -> Result<AudioMeta> {
    let ffprobe = ffprobe_path(app)?;
    let (needs_plugin, is_drm) = classify_file(path);

    let output = Command::new(&ffprobe)
        .args([
            "-v", "quiet",
            "-print_format", "json",
            "-show_streams",
            "-show_format",
            path.to_str().unwrap_or(""),
        ])
        .output()
        .await
        .map_err(|e| AppError::Ffmpeg(e.to_string()))?;

    let json: serde_json::Value =
        serde_json::from_slice(&output.stdout).unwrap_or_default();

    let format_name = json["format"]["format_name"]
        .as_str()
        .unwrap_or("unknown")
        .split(',')
        .next()
        .unwrap_or("unknown")
        .to_string();

    let stream = &json["streams"][0];
    let codec = stream["codec_name"]
        .as_str()
        .unwrap_or("unknown")
        .to_string();
    let bitrate_kbps = json["format"]["bit_rate"]
        .as_str()
        .and_then(|s| s.parse::<u32>().ok())
        .map(|b| b / 1000);
    let sample_rate = stream["sample_rate"]
        .as_str()
        .and_then(|s| s.parse::<u32>().ok());
    let channels = stream["channels"].as_u64().map(|c| c as u8);
    let duration_secs = json["format"]["duration"]
        .as_str()
        .and_then(|s| s.parse::<f64>().ok());
    let file_size_bytes = std::fs::metadata(path)
        .map(|m| m.len())
        .unwrap_or(0);
    let filename = path
        .file_name()
        .and_then(|n| n.to_str())
        .unwrap_or("")
        .to_string();

    Ok(AudioMeta {
        path: path.to_string_lossy().into_owned(),
        filename,
        format: format_name,
        codec,
        bitrate_kbps,
        sample_rate,
        channels,
        duration_secs,
        file_size_bytes,
        needs_plugin,
        is_drm,
    })
}

/// Run a conversion job, emitting progress events via Tauri
pub async fn convert(
    app: &AppHandle,
    job: &ConvertJob,
    duration_secs: Option<f64>,
) -> Result<u64> {
    let ffmpeg = ffmpeg_path(app)?;
    let start = Instant::now();

    // Build output format flags
    let codec_args = format_codec_args(&job.target_format);
    let quality_args = job.quality.to_ffmpeg_args(&job.target_format);

    let mut cmd = Command::new(&ffmpeg);
    cmd.args(["-y", "-i", &job.input_path])
        .args(&codec_args)
        .args(&quality_args)
        .arg(&job.output_path)
        .stdout(Stdio::null())
        .stderr(Stdio::piped());

    let mut child = cmd.spawn().map_err(|e| AppError::Ffmpeg(e.to_string()))?;

    let stderr = child.stderr.take().expect("stderr handle");
    let mut reader = BufReader::new(stderr).lines();
    let time_re = Regex::new(r"time=(\d+):(\d+):(\d+)\.(\d+)").unwrap();

    while let Some(line) = reader.next_line().await.map_err(|e| AppError::Ffmpeg(e.to_string()))? {
        if let Some(caps) = time_re.captures(&line) {
            let h: f64 = caps[1].parse().unwrap_or(0.0);
            let m: f64 = caps[2].parse().unwrap_or(0.0);
            let s: f64 = caps[3].parse().unwrap_or(0.0);
            let cs: f64 = caps[4].parse::<f64>().unwrap_or(0.0) / 100.0;
            let current = h * 3600.0 + m * 60.0 + s + cs;
            let percent = duration_secs
                .filter(|&d| d > 0.0)
                .map(|d| ((current / d) * 100.0).min(99.0) as f32)
                .unwrap_or(0.0);

            let _ = app.emit("conversion:progress", ProgressEvent {
                job_id: job.id.clone(),
                percent,
                elapsed_secs: start.elapsed().as_secs_f64(),
            });
        }
    }

    let status = child.wait().await.map_err(|e| AppError::Ffmpeg(e.to_string()))?;
    if !status.success() {
        return Err(AppError::Ffmpeg(format!(
            "FFmpeg exited with status {}",
            status.code().unwrap_or(-1)
        )));
    }

    // Emit 100%
    let _ = app.emit("conversion:progress", ProgressEvent {
        job_id: job.id.clone(),
        percent: 100.0,
        elapsed_secs: start.elapsed().as_secs_f64(),
    });

    let output_size = std::fs::metadata(&job.output_path)
        .map(|m| m.len())
        .unwrap_or(0);
    Ok(output_size)
}

fn format_codec_args(format: &str) -> Vec<String> {
    match format {
        "mp3"  => vec!["-c:a".into(), "libmp3lame".into()],
        "aac"  | "m4a" => vec!["-c:a".into(), "aac".into()],
        "ogg"  => vec!["-c:a".into(), "libvorbis".into()],
        "opus" => vec!["-c:a".into(), "libopus".into()],
        "flac" => vec!["-c:a".into(), "flac".into(), "-compression_level".into(), "8".into()],
        "wav"  => vec!["-c:a".into(), "pcm_s16le".into()],
        "alac" => vec!["-c:a".into(), "alac".into()],
        "aiff" => vec!["-c:a".into(), "pcm_s16be".into()],
        "wma"  => vec!["-c:a".into(), "wmav2".into()],
        "wavpack" | "wv" => vec!["-c:a".into(), "wavpack".into()],
        _      => vec![],  // let FFmpeg decide
    }
}

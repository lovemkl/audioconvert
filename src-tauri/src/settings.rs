use crate::error::{AppError, Result};
use dirs::config_dir;
use once_cell::sync::OnceCell;
use serde::{Deserialize, Serialize};
use std::{
    fs,
    path::PathBuf,
    sync::Mutex,
};
use tauri::AppHandle;

static SETTINGS: OnceCell<Mutex<Settings>> = OnceCell::new();

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Settings {
    /// Where converted files are saved. None = not set yet (first-run dialog)
    pub output_dir: Option<String>,
    /// Default quality level index: 0=low 1=standard 2=high 3=lossless
    pub default_quality: u8,
    /// Number of concurrent conversion threads
    pub thread_count: usize,
    /// "zh" | "en" | "auto"
    pub language: String,
    /// "light" | "dark" | "system"
    pub theme: String,
    /// Whether this is the first launch
    pub first_run: bool,
}

impl Default for Settings {
    fn default() -> Self {
        Self {
            output_dir: None,
            default_quality: 2, // high
            thread_count: (num_cpus() / 2).max(1),
            language: "auto".into(),
            theme: "system".into(),
            first_run: true,
        }
    }
}

fn num_cpus() -> usize {
    std::thread::available_parallelism()
        .map(|n| n.get())
        .unwrap_or(4)
}

fn settings_path() -> PathBuf {
    config_dir()
        .unwrap_or_else(|| PathBuf::from("."))
        .join("AudioConvert")
        .join("settings.json")
}

pub fn init(_app: &AppHandle) -> Result<()> {
    let path = settings_path();
    let settings = if path.exists() {
        let raw = fs::read_to_string(&path)
            .map_err(|e| AppError::Settings(e.to_string()))?;
        serde_json::from_str(&raw).unwrap_or_default()
    } else {
        Settings::default()
    };
    SETTINGS.set(Mutex::new(settings)).ok();
    Ok(())
}

pub fn get() -> Settings {
    SETTINGS
        .get()
        .and_then(|m| m.lock().ok())
        .map(|g| g.clone())
        .unwrap_or_default()
}

pub fn save(settings: Settings) -> Result<()> {
    let path = settings_path();
    if let Some(parent) = path.parent() {
        fs::create_dir_all(parent).map_err(|e| AppError::Settings(e.to_string()))?;
    }
    let raw = serde_json::to_string_pretty(&settings)
        .map_err(|e| AppError::Settings(e.to_string()))?;
    fs::write(&path, raw).map_err(|e| AppError::Settings(e.to_string()))?;
    if let Some(mutex) = SETTINGS.get() {
        if let Ok(mut guard) = mutex.lock() {
            *guard = settings;
        }
    }
    Ok(())
}

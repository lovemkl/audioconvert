use crate::error::Result;
use crate::settings::{self, Settings};

#[tauri::command]
pub async fn get_settings() -> Result<Settings> {
    Ok(settings::get())
}

#[tauri::command]
pub async fn save_settings(new_settings: Settings) -> Result<()> {
    settings::save(new_settings)
}

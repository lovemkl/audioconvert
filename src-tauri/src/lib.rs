mod commands;
mod error;
mod ffmpeg;
mod models;
mod settings;

use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};

pub fn run() {
    tracing_subscriber::registry()
        .with(tracing_subscriber::EnvFilter::new(
            std::env::var("RUST_LOG").unwrap_or_else(|_| "audioconvert=debug".into()),
        ))
        .with(tracing_subscriber::fmt::layer())
        .init();

    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_notification::init())
        .plugin(tauri_plugin_shell::init())
        .setup(|app| {
            // Initialize settings store
            settings::init(app.handle())?;
            tracing::info!("AudioConvert started");
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            commands::file::scan_files,
            commands::file::probe_file,
            commands::convert::start_conversion,
            commands::convert::cancel_conversion,
            commands::settings::get_settings,
            commands::settings::save_settings,
            commands::plugin::list_plugins,
            commands::plugin::install_plugin,
        ])
        .run(tauri::generate_context!())
        .expect("error while running AudioConvert");
}

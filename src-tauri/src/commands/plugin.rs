use crate::error::{AppError, Result};
use crate::models::PluginInfo;
use dirs::config_dir;
use std::path::PathBuf;

/// Known plugins and the extensions they handle
const KNOWN_PLUGINS: &[(&str, &str, &[&str])] = &[
    (
        "umcrypt",
        "解密插件 — QQ音乐 / 网易云音乐",
        &[
            "mgg", "mgg1", "mggl", "mflac", "mflac0",
            "qmc0", "qmc2", "qmc3", "qmcflac", "qmcogg",
            "tkm", "ncm", "kgg",
        ],
    ),
];

fn plugins_dir() -> PathBuf {
    config_dir()
        .unwrap_or_else(|| PathBuf::from("."))
        .join("AudioConvert")
        .join("plugins")
}

fn plugin_binary_name(id: &str) -> String {
    if cfg!(target_os = "windows") {
        format!("audioconvert-plugin-{id}.exe")
    } else {
        format!("audioconvert-plugin-{id}")
    }
}

/// List all known plugins with their installation status
#[tauri::command]
pub async fn list_plugins() -> Result<Vec<PluginInfo>> {
    let dir = plugins_dir();
    let infos = KNOWN_PLUGINS
        .iter()
        .map(|(id, name, exts)| {
            let bin_name = plugin_binary_name(id);
            let bin_path = dir.join(&bin_name);
            let installed = bin_path.exists();
            PluginInfo {
                id: id.to_string(),
                name: name.to_string(),
                version: "1.0.0".into(),
                supported_extensions: exts.iter().map(|s| s.to_string()).collect(),
                installed,
                binary_path: if installed {
                    Some(bin_path.to_string_lossy().into_owned())
                } else {
                    None
                },
            }
        })
        .collect();
    Ok(infos)
}

/// Install a plugin by downloading its binary from GitHub Releases.
/// In the future this could verify checksums.
#[tauri::command]
pub async fn install_plugin(plugin_id: String) -> Result<PluginInfo> {
    // Validate plugin id
    let (id, name, exts) = KNOWN_PLUGINS
        .iter()
        .find(|(pid, _, _)| *pid == plugin_id)
        .ok_or_else(|| AppError::Plugin(format!("Unknown plugin: {plugin_id}")))?;

    let dir = plugins_dir();
    std::fs::create_dir_all(&dir)
        .map_err(|e| AppError::Plugin(format!("Cannot create plugins dir: {e}")))?;

    // Download URL pattern – replace with actual release URL
    let platform = if cfg!(target_os = "windows") {
        "x86_64-windows"
    } else if cfg!(target_arch = "aarch64") {
        "aarch64-macos"
    } else {
        "x86_64-macos"
    };
    let filename = plugin_binary_name(id);
    let url = format!(
        "https://github.com/your-username/audioconvert-plugin-{id}/releases/latest/download/audioconvert-plugin-{id}-{platform}"
    );

    // Download the binary
    let response = reqwest::get(&url)
        .await
        .map_err(|e| AppError::Plugin(format!("Download failed: {e}")))?;
    if !response.status().is_success() {
        return Err(AppError::Plugin(format!(
            "Download failed with status: {}",
            response.status()
        )));
    }
    let bytes = response.bytes().await
        .map_err(|e| AppError::Plugin(format!("Read error: {e}")))?;

    let bin_path = dir.join(&filename);
    std::fs::write(&bin_path, &bytes)
        .map_err(|e| AppError::Plugin(format!("Write error: {e}")))?;

    // Make executable on Unix
    #[cfg(unix)]
    {
        use std::os::unix::fs::PermissionsExt;
        std::fs::set_permissions(&bin_path, std::fs::Permissions::from_mode(0o755))
            .map_err(|e| AppError::Plugin(format!("chmod error: {e}")))?;
    }

    Ok(PluginInfo {
        id: id.to_string(),
        name: name.to_string(),
        version: "1.0.0".into(),
        supported_extensions: exts.iter().map(|s| s.to_string()).collect(),
        installed: true,
        binary_path: Some(bin_path.to_string_lossy().into_owned()),
    })
}

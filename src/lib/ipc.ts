import { invoke } from "@tauri-apps/api/core";
import { listen, type UnlistenFn } from "@tauri-apps/api/event";
import type {
  AppSettings,
  AudioMeta,
  JobResult,
  PluginInfo,
  ProgressEvent,
  Quality,
} from "../types";

export const ipc = {
  // File scanning
  scanFiles: (paths: string[]) =>
    invoke<string[]>("scan_files", { paths }),

  probeFile: (path: string) =>
    invoke<AudioMeta>("probe_file", { path }),

  // Conversion
  startConversion: (
    files: { path: string; duration_secs?: number; needs_plugin: boolean }[],
    targetFormat: string,
    quality: Quality
  ) =>
    invoke<string[]>("start_conversion", {
      request: { files, target_format: targetFormat, quality },
    }),

  cancelConversion: () =>
    invoke<void>("cancel_conversion"),

  // Settings
  getSettings: () =>
    invoke<AppSettings>("get_settings"),

  saveSettings: (settings: AppSettings) =>
    invoke<void>("save_settings", { newSettings: settings }),

  // Plugins
  listPlugins: () =>
    invoke<PluginInfo[]>("list_plugins"),

  installPlugin: (pluginId: string) =>
    invoke<PluginInfo>("install_plugin", { pluginId }),
};

// Event listeners
export function onProgress(cb: (e: ProgressEvent) => void): Promise<UnlistenFn> {
  return listen<ProgressEvent>("conversion:progress", (event) => cb(event.payload));
}

export function onResult(cb: (e: JobResult) => void): Promise<UnlistenFn> {
  return listen<JobResult>("conversion:result", (event) => cb(event.payload));
}

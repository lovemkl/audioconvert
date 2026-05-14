export interface AudioMeta {
  path: string;
  filename: string;
  format: string;
  codec: string;
  bitrate_kbps?: number;
  sample_rate?: number;
  channels?: number;
  duration_secs?: number;
  file_size_bytes: number;
  needs_plugin: boolean;
  is_drm: boolean;
}

export type Quality = "low" | "standard" | "high" | "lossless";

export type FileStatus =
  | "pending"
  | "queued"
  | "converting"
  | "done"
  | "failed"
  | "skipped"
  | "needs_plugin"
  | "drm";

export interface FileItem {
  id: string;
  meta: AudioMeta;
  status: FileStatus;
  progress: number;       // 0–100
  errorMsg?: string;
  outputPath?: string;
  outputSize?: number;
}

export interface ConvertSettings {
  targetFormat: string;
  quality: Quality;
}

export type WizardStep = 1 | 2 | 3 | "result";

export interface AppSettings {
  output_dir?: string;
  default_quality: number;
  thread_count: number;
  language: string;
  theme: string;
  first_run: boolean;
}

export interface PluginInfo {
  id: string;
  name: string;
  version: string;
  supported_extensions: string[];
  installed: boolean;
  binary_path?: string;
}

export interface ProgressEvent {
  job_id: string;
  percent: number;
  elapsed_secs: number;
}

export interface JobResult {
  job_id: string;
  success: boolean;
  error?: string;
  output_path?: string;
  output_size_bytes?: number;
}

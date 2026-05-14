export interface FormatDef {
  id: string;
  label: string;
  ext: string;
  descKey: string;       // i18n key for subtitle
  lossless: boolean;     // if true, quality slider must be "lossless"
  tier: 1 | 2;
}

export const FORMATS: FormatDef[] = [
  // Tier 1 — pinned top
  { id: "mp3",  label: "MP3",  ext: "mp3",  descKey: "formatMp3",  lossless: false, tier: 1 },
  { id: "flac", label: "FLAC", ext: "flac", descKey: "formatFlac", lossless: true,  tier: 1 },
  { id: "wav",  label: "WAV",  ext: "wav",  descKey: "formatWav",  lossless: true,  tier: 1 },
  { id: "aac",  label: "AAC",  ext: "m4a",  descKey: "formatAac",  lossless: false, tier: 1 },
  { id: "ogg",  label: "OGG",  ext: "ogg",  descKey: "formatOgg",  lossless: false, tier: 1 },
  { id: "opus", label: "Opus", ext: "opus", descKey: "formatOpus", lossless: false, tier: 1 },
  { id: "alac", label: "ALAC", ext: "m4a",  descKey: "formatAlac", lossless: true,  tier: 1 },
  { id: "aiff", label: "AIFF", ext: "aiff", descKey: "formatAiff", lossless: true,  tier: 1 },
  { id: "wma",  label: "WMA",  ext: "wma",  descKey: "formatWma",  lossless: false, tier: 1 },
  // Tier 2
  { id: "wv",   label: "WavPack", ext: "wv",  descKey: "formatWv", lossless: true, tier: 2 },
];

export const QUALITY_LABELS: Record<string, string> = {
  low:      "qualityLow",
  standard: "qualityStandard",
  high:     "qualityHigh",
  lossless: "qualityLossless",
};

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function formatDuration(secs?: number): string {
  if (!secs) return "--:--";
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

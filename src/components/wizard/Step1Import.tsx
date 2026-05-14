import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { useTranslation } from "react-i18next";
import { open } from "@tauri-apps/plugin-dialog";
import { ipc } from "../../lib/ipc";
import { formatDuration, formatFileSize } from "../../lib/formats";
import type { FileItem } from "../../types";
import { v4 as uuid } from "uuid";

interface Props {
  files: FileItem[];
  onFilesChange: (files: FileItem[]) => void;
  onNext: () => void;
}

export default function Step1Import({ files, onFilesChange, onNext }: Props) {
  const { t } = useTranslation();
  const [probing, setProbing] = useState(false);

  const addPaths = useCallback(
    async (paths: string[]) => {
      setProbing(true);
      try {
        const scanned = await ipc.scanFiles(paths);
        const newPaths = scanned.filter(
          (p) => !files.some((f) => f.meta.path === p)
        );
        const probed = await Promise.all(
          newPaths.map(async (p) => {
            try {
              const meta = await ipc.probeFile(p);
              const status = meta.is_drm
                ? "drm"
                : meta.needs_plugin
                ? "needs_plugin"
                : "pending";
              return { id: uuid(), meta, status, progress: 0 } as FileItem;
            } catch {
              return null;
            }
          })
        );
        onFilesChange([...files, ...(probed.filter(Boolean) as FileItem[])]);
      } finally {
        setProbing(false);
      }
    },
    [files, onFilesChange]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    noClick: true,
    onDrop: (accepted) => addPaths(accepted.map((f) => f.path)),
  });

  const handleSelectFiles = async () => {
    const selected = await open({ multiple: true, directory: false });
    if (selected) {
      const paths = Array.isArray(selected) ? selected : [selected];
      await addPaths(paths);
    }
  };

  const handleSelectFolder = async () => {
    const selected = await open({ multiple: false, directory: true });
    if (selected) await addPaths([selected as string]);
  };

  const removeFile = (id: string) =>
    onFilesChange(files.filter((f) => f.id !== id));

  return (
    <div className="h-full flex flex-col gap-4">
      {/* Drop zone */}
      <div
        {...getRootProps()}
        className={`flex-1 border-2 border-dashed rounded-2xl flex flex-col items-center
          justify-center gap-3 transition-colors duration-150 cursor-default min-h-[180px]
          ${isDragActive
            ? "border-brand-500 bg-brand-50/30 dark:bg-brand-500/10"
            : "border-[var(--border)] hover:border-brand-500/50"
          }`}
      >
        <input {...getInputProps()} />
        {probing ? (
          <div className="flex flex-col items-center gap-2 text-[var(--text-muted)]">
            <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-sm">正在读取文件信息…</span>
          </div>
        ) : files.length === 0 ? (
          <>
            <MusicIcon />
            <p className="text-[var(--text-muted)] text-sm text-center px-4">
              {isDragActive ? "松开以添加文件" : t("dropHere")}
            </p>
            <div className="flex gap-2 mt-1">
              <button className="btn-primary text-sm py-2 px-4" onClick={handleSelectFiles}>
                {t("selectFiles")}
              </button>
              <button className="btn-secondary text-sm py-2 px-4" onClick={handleSelectFolder}>
                {t("selectFolder")}
              </button>
            </div>
          </>
        ) : (
          <div className="w-full h-full overflow-y-auto p-3">
            <FileList files={files} onRemove={removeFile} />
          </div>
        )}
      </div>

      {/* Bottom bar */}
      {files.length > 0 && (
        <div className="flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <button className="btn-secondary text-sm py-2 px-4" onClick={handleSelectFiles}>
              {t("selectFiles")}
            </button>
            <button className="btn-secondary text-sm py-2 px-4" onClick={handleSelectFolder}>
              {t("selectFolder")}
            </button>
            <span className="text-sm text-[var(--text-muted)]">
              {t("filesAdded", { count: files.length })}
            </span>
          </div>
          <button
            className="btn-primary"
            disabled={files.every((f) => f.status === "drm")}
            onClick={onNext}
          >
            {t("next")} →
          </button>
        </div>
      )}
    </div>
  );
}

function FileList({ files, onRemove }: { files: FileItem[]; onRemove: (id: string) => void }) {
  return (
    <div className="flex flex-col gap-1">
      {files.map((f) => (
        <div
          key={f.id}
          className="flex items-center gap-3 px-3 py-2 rounded-xl
                     hover:bg-[var(--bg-secondary)] group transition-colors"
        >
          <FileIcon ext={f.meta.format} />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{f.meta.filename}</p>
            <p className="text-xs text-[var(--text-muted)]">
              {f.meta.format.toUpperCase()}
              {f.meta.bitrate_kbps && ` · ${f.meta.bitrate_kbps} kbps`}
              {f.meta.duration_secs && ` · ${formatDuration(f.meta.duration_secs)}`}
              {` · ${formatFileSize(f.meta.file_size_bytes)}`}
            </p>
          </div>
          {/* Status badge */}
          {f.status === "drm" && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-600 dark:bg-red-900/30">
              受版权保护
            </span>
          )}
          {f.status === "needs_plugin" && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-orange-100 text-orange-600 dark:bg-orange-900/30">
              需要插件
            </span>
          )}
          <button
            onClick={() => onRemove(f.id)}
            className="opacity-0 group-hover:opacity-100 w-6 h-6 flex items-center
                       justify-center rounded text-[var(--text-muted)] hover:text-red-500
                       transition-opacity"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}

function FileIcon({ ext }: { ext: string }) {
  const colors: Record<string, string> = {
    mp3: "bg-yellow-100 text-yellow-700",
    flac: "bg-blue-100 text-blue-700",
    wav: "bg-green-100 text-green-700",
    aac: "bg-purple-100 text-purple-700",
    ogg: "bg-teal-100 text-teal-700",
  };
  const cls = colors[ext] ?? "bg-gray-100 text-gray-600";
  return (
    <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${cls}`}>
      {ext.slice(0, 3).toUpperCase()}
    </div>
  );
}

function MusicIcon() {
  return (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.5" className="text-[var(--border)]">
      <path d="M9 18V5l12-2v13" />
      <circle cx="6" cy="18" r="3" />
      <circle cx="18" cy="16" r="3" />
    </svg>
  );
}

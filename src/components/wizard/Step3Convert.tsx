import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { ipc, onProgress, onResult } from "../../lib/ipc";
import { formatFileSize } from "../../lib/formats";
import type { ConvertSettings, FileItem, FileStatus } from "../../types";

interface Props {
  files: FileItem[];
  convertSettings: ConvertSettings;
  onFilesChange: (files: FileItem[]) => void;
  onDone: () => void;
  onCancel: () => void;
}

export default function Step3Convert({ files, convertSettings, onFilesChange, onDone, onCancel }: Props) {
  const { t } = useTranslation();
  const [started, setStarted] = useState(false);
  const [cancelled, setCancelled] = useState(false);
  const jobMap = useRef<Map<string, string>>(new Map()); // jobId -> fileId
  const fileRef = useRef<FileItem[]>(files);
  fileRef.current = files;

  const convertable = files.filter((f) => f.status !== "drm");
  const totalProgress = convertable.length === 0 ? 0
    : convertable.reduce((sum, f) => sum + f.progress, 0) / convertable.length;
  const doneCount = files.filter((f) => f.status === "done").length;
  const failCount = files.filter((f) => f.status === "failed").length;

  const updateFile = (id: string, patch: Partial<FileItem>) => {
    onFilesChange(fileRef.current.map((f) => f.id === id ? { ...f, ...patch } : f));
  };

  useEffect(() => {
    let unlistenProgress: (() => void) | null = null;
    let unlistenResult: (() => void) | null = null;

    const start = async () => {
      setStarted(true);

      // Mark all convertable as queued
      onFilesChange(files.map((f) =>
        f.status === "drm" ? f : { ...f, status: "queued" as FileStatus, progress: 0 }
      ));

      // Subscribe to events
      unlistenProgress = await onProgress((e) => {
        const fileId = jobMap.current.get(e.job_id);
        if (fileId) updateFile(fileId, { status: "converting", progress: e.percent });
      });
      unlistenResult = await onResult((e) => {
        const fileId = jobMap.current.get(e.job_id);
        if (!fileId) return;
        if (e.success) {
          updateFile(fileId, { status: "done", progress: 100, outputPath: e.output_path, outputSize: e.output_size_bytes });
        } else {
          updateFile(fileId, { status: "failed", errorMsg: e.error });
        }
      });

      // Build job list
      const jobFiles = files
        .filter((f) => f.status !== "drm")
        .map((f) => ({
          path: f.meta.path,
          duration_secs: f.meta.duration_secs,
          needs_plugin: f.meta.needs_plugin,
        }));

      const jobIds = await ipc.startConversion(
        jobFiles,
        convertSettings.targetFormat,
        convertSettings.quality
      );

      // Map jobId -> fileId
      files
        .filter((f) => f.status !== "drm")
        .forEach((f, i) => {
          if (jobIds[i]) jobMap.current.set(jobIds[i], f.id);
        });
    };

    start().catch(console.error);

    return () => {
      unlistenProgress?.();
      unlistenResult?.();
    };
  }, []);

  // Auto-advance to result when all done
  useEffect(() => {
    if (!started) return;
    const active = files.filter((f) => f.status !== "drm");
    const allSettled = active.every((f) => f.status === "done" || f.status === "failed");
    if (allSettled && active.length > 0) {
      setTimeout(onDone, 600);
    }
  }, [files, started]);

  const handleCancel = async () => {
    setCancelled(true);
    await ipc.cancelConversion();
    onCancel();
  };

  return (
    <div className="h-full flex flex-col gap-4">
      {/* Total progress */}
      <div className="card p-4 shrink-0">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold">{t("total")}</span>
          <span className="text-sm text-[var(--text-muted)]">
            {doneCount + failCount} / {convertable.length}
          </span>
        </div>
        <div className="h-2 bg-[var(--bg-secondary)] rounded-full overflow-hidden">
          <div
            className="h-full bg-brand-500 rounded-full transition-all duration-300"
            style={{ width: `${totalProgress}%` }}
          />
        </div>
        <p className="text-xs text-[var(--text-muted)] mt-2">{t("minimizeToTray")}</p>
      </div>

      {/* File list */}
      <div className="flex-1 overflow-y-auto flex flex-col gap-1">
        {files.map((f) => (
          <FileRow key={f.id} file={f} />
        ))}
      </div>

      {/* Cancel */}
      <div className="shrink-0 flex justify-end">
        <button className="btn-secondary text-sm" onClick={handleCancel} disabled={cancelled}>
          {t("cancel")}
        </button>
      </div>
    </div>
  );
}

function FileRow({ file }: { file: FileItem }) {
  const { t } = useTranslation();
  const statusColors: Record<FileItem["status"], string> = {
    pending: "text-[var(--text-muted)]",
    queued: "text-blue-400",
    converting: "text-brand-500",
    done: "text-green-500",
    failed: "text-red-500",
    skipped: "text-orange-400",
    needs_plugin: "text-orange-400",
    drm: "text-red-400",
  };
  const statusLabel: Record<FileItem["status"], string> = {
    pending: t("statusPending"),
    queued: t("statusQueued"),
    converting: `${Math.round(file.progress)}%`,
    done: file.outputSize ? formatFileSize(file.outputSize) : t("statusDone"),
    failed: t("statusFailed"),
    skipped: t("statusSkipped"),
    needs_plugin: t("statusNeedsPlugin"),
    drm: t("statusDrm"),
  };

  return (
    <div className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-[var(--bg-secondary)]">
      {/* Progress ring / icon */}
      <StatusIcon status={file.status} progress={file.progress} />
      <div className="flex-1 min-w-0">
        <p className="text-sm truncate">{file.meta.filename}</p>
        {file.status === "converting" && (
          <div className="h-1 bg-[var(--bg-secondary)] rounded-full mt-1 overflow-hidden">
            <div
              className="h-full bg-brand-500 rounded-full transition-all duration-200"
              style={{ width: `${file.progress}%` }}
            />
          </div>
        )}
        {file.status === "failed" && file.errorMsg && (
          <p className="text-xs text-red-400 truncate">{file.errorMsg}</p>
        )}
      </div>
      <span className={`text-xs font-medium shrink-0 ${statusColors[file.status]}`}>
        {statusLabel[file.status]}
      </span>
    </div>
  );
}

function StatusIcon({ status, progress }: { status: FileItem["status"]; progress: number }) {
  if (status === "converting") {
    return (
      <div className="w-8 h-8 shrink-0 relative">
        <svg className="w-8 h-8 -rotate-90" viewBox="0 0 32 32">
          <circle cx="16" cy="16" r="12" fill="none" stroke="var(--border)" strokeWidth="3" />
          <circle
            cx="16" cy="16" r="12" fill="none" stroke="#1a73e8" strokeWidth="3"
            strokeDasharray={`${2 * Math.PI * 12}`}
            strokeDashoffset={`${2 * Math.PI * 12 * (1 - progress / 100)}`}
            className="transition-all duration-200"
          />
        </svg>
      </div>
    );
  }
  const icons: Partial<Record<FileItem["status"], string>> = {
    pending: "○", queued: "◌", done: "✓", failed: "✕", skipped: "—",
    needs_plugin: "⚡", drm: "🔒",
  };
  const colors: Partial<Record<FileItem["status"], string>> = {
    done: "text-green-500", failed: "text-red-500",
    needs_plugin: "text-orange-400", drm: "text-red-400",
  };
  return (
    <div className={`w-8 h-8 shrink-0 flex items-center justify-center text-base
      ${colors[status] ?? "text-[var(--text-muted)]"}`}>
      {icons[status] ?? "○"}
    </div>
  );
}

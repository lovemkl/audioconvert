import { useTranslation } from "react-i18next";
import { open as shellOpen } from "@tauri-apps/plugin-shell";
import type { FileItem } from "../../types";
import { formatFileSize } from "../../lib/formats";

interface Props {
  files: FileItem[];
  onReset: () => void;
}

export default function ResultPage({ files, onReset }: Props) {
  const { t } = useTranslation();
  const succeeded = files.filter((f) => f.status === "done");
  const failed = files.filter((f) => f.status === "failed");

  // Works on both macOS (/) and Windows (\)
  const outputDir = (() => {
    const p = succeeded[0]?.outputPath;
    if (!p) return null;
    const lastSlash = Math.max(p.lastIndexOf("/"), p.lastIndexOf("\\"));
    return lastSlash > 0 ? p.slice(0, lastSlash) : null;
  })();

  const openDir = async () => {
    if (outputDir) {
      await shellOpen(outputDir).catch(console.error);
    }
  };

  return (
    <div className="h-full flex flex-col items-center justify-center gap-6 py-8">
      {/* Big status */}
      <div className="text-center">
        <div className={`text-6xl mb-3 ${failed.length === 0 ? "" : ""}`}>
          {failed.length === 0 ? "✅" : "⚠️"}
        </div>
        <h2 className="text-2xl font-bold">{t("done")}</h2>
        <p className="text-[var(--text-muted)] mt-1">
          <span className="text-green-500 font-semibold">{succeeded.length} {t("success")}</span>
          {failed.length > 0 && (
            <> · <span className="text-red-500 font-semibold">{failed.length} {t("failed")}</span></>
          )}
        </p>
      </div>

      {/* Failed list */}
      {failed.length > 0 && (
        <div className="w-full max-w-lg card p-4">
          <p className="text-sm font-semibold text-red-500 mb-2">{t("failedFiles")}</p>
          <div className="flex flex-col gap-1 max-h-40 overflow-y-auto">
            {failed.map((f) => (
              <div key={f.id} className="flex items-start gap-2 text-sm">
                <span className="text-red-400 shrink-0">✕</span>
                <div className="min-w-0">
                  <p className="truncate">{f.meta.filename}</p>
                  {f.errorMsg && <p className="text-xs text-[var(--text-muted)]">{f.errorMsg}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Succeeded summary */}
      {succeeded.length > 0 && (
        <div className="w-full max-w-lg">
          <div className="flex flex-col gap-1 max-h-48 overflow-y-auto">
            {succeeded.map((f) => (
              <div key={f.id} className="flex items-center gap-3 px-3 py-1.5 rounded-lg
                                         hover:bg-[var(--bg-secondary)] transition-colors">
                <span className="text-green-500 shrink-0">✓</span>
                <p className="flex-1 text-sm truncate">{f.meta.filename}</p>
                {f.outputSize && (
                  <span className="text-xs text-[var(--text-muted)] shrink-0">
                    {formatFileSize(f.outputSize)}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        {outputDir && (
          <button className="btn-secondary" onClick={openDir}>
            📁 {t("openOutputDir")}
          </button>
        )}
        <button className="btn-primary" onClick={onReset}>
          {t("convertMore")}
        </button>
      </div>
    </div>
  );
}

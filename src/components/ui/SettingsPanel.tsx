import { useState } from "react";
import { useTranslation } from "react-i18next";
import { open } from "@tauri-apps/plugin-dialog";
import type { AppSettings } from "../../types";

interface Props {
  settings: AppSettings;
  onSave: (s: AppSettings) => void;
  onClose: () => void;
}

export default function SettingsPanel({ settings, onSave, onClose }: Props) {
  const { t } = useTranslation();
  const [draft, setDraft] = useState<AppSettings>({ ...settings });

  const pickDir = async () => {
    try {
      const selected = await open({ directory: true, multiple: false });
      if (typeof selected === "string" && selected.length > 0) {
        setDraft({ ...draft, output_dir: selected });
      } else if (Array.isArray(selected) && selected.length > 0) {
        setDraft({ ...draft, output_dir: selected[0] });
      }
    } catch (e) {
      console.error("Failed to open directory picker:", e);
      alert("无法打开文件夹选择器，请检查应用权限。\nFailed to open folder picker.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-end sm:items-center justify-center z-50 p-4">
      <div className="card w-full max-w-md p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold">{t("settings")}</h2>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg
                       text-[var(--text-muted)] hover:bg-[var(--bg-secondary)] transition-colors"
          >✕</button>
        </div>

        <div className="flex flex-col gap-5">
          {/* Output dir */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
              {t("outputDir")}
            </label>
            <p className="text-xs text-[var(--text-muted)] mb-2">{t("outputDirHint")}</p>
            <div className="flex gap-2">
              <div className="flex-1 px-3 py-2 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border)]
                              text-sm text-[var(--text)] truncate">
                {draft.output_dir || t("statusPending")}
              </div>
              <button className="btn-secondary text-sm shrink-0" onClick={pickDir}>
                {t("chooseDir")}
              </button>
            </div>
          </div>

          {/* Thread count */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
              {t("threadCount")}: {draft.thread_count}
            </label>
            <input
              type="range" min={1} max={16} value={draft.thread_count}
              onChange={(e) => setDraft({ ...draft, thread_count: +e.target.value })}
              className="w-full mt-2 accent-brand-500"
            />
          </div>

          {/* Language */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
              {t("language")}
            </label>
            <select
              value={draft.language}
              onChange={(e) => setDraft({ ...draft, language: e.target.value })}
              className="mt-2 w-full px-3 py-2 rounded-xl bg-[var(--bg-secondary)]
                         border border-[var(--border)] text-sm text-[var(--text)]"
            >
              <option value="auto">自动 / Auto</option>
              <option value="zh">中文</option>
              <option value="en">English</option>
            </select>
          </div>

          {/* Theme */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
              {t("theme")}
            </label>
            <div className="flex gap-2 mt-2">
              {(["system", "light", "dark"] as const).map((th) => (
                <button
                  key={th}
                  onClick={() => setDraft({ ...draft, theme: th })}
                  className={`flex-1 py-2 rounded-xl text-sm font-medium transition-colors
                    ${draft.theme === th
                      ? "bg-brand-500 text-white"
                      : "bg-[var(--bg-secondary)] text-[var(--text)]"
                    }`}
                >
                  {t(`theme${th.charAt(0).toUpperCase() + th.slice(1)}`)}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-2 mt-6">
          <button className="btn-secondary flex-1" onClick={onClose}>{t("cancel")}</button>
          <button className="btn-primary flex-1" onClick={() => onSave(draft)}>{t("save")}</button>
        </div>
      </div>
    </div>
  );
}

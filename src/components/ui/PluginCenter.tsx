import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { ipc } from "../../lib/ipc";
import type { PluginInfo } from "../../types";

interface Props {
  onClose: () => void;
}

export default function PluginCenter({ onClose }: Props) {
  const { t } = useTranslation();
  const [plugins, setPlugins] = useState<PluginInfo[]>([]);
  const [installing, setInstalling] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    ipc.listPlugins().then(setPlugins);
  }, []);

  const handleInstall = async (id: string) => {
    setInstalling(id);
    setConfirmId(null);
    setError(null);
    try {
      const updated = await ipc.installPlugin(id);
      setPlugins((prev) => prev.map((p) => (p.id === id ? updated : p)));
    } catch (e: unknown) {
      // Tauri AppError is serialised as {kind, message}; plain errors have .message
      const err = e as Record<string, string> | string | undefined;
      const msg: string =
        typeof err === "string" ? err
        : (err?.message ?? (err?.kind ? `${err.kind}: ${JSON.stringify(err)}` : JSON.stringify(err)));
      setError(msg);
    } finally {
      setInstalling(null);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="card w-full max-w-md p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold">{t("plugins")}</h2>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg
                       text-[var(--text-muted)] hover:bg-[var(--bg-secondary)] transition-colors"
          >✕</button>
        </div>

        <div className="flex flex-col gap-3">
          {plugins.map((plugin) => (
            <div key={plugin.id} className="border border-[var(--border)] rounded-xl p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm">{plugin.name}</p>
                  <p className="text-xs text-[var(--text-muted)] mt-0.5">
                    {t("supports")}{plugin.supported_extensions.slice(0, 6).join(", ")}
                    {plugin.supported_extensions.length > 6 && " …"}
                  </p>
                </div>
                {plugin.installed ? (
                  <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-600
                                   dark:bg-green-900/30 shrink-0">
                    {t("pluginInstalled")} v{plugin.version}
                  </span>
                ) : (
                  <button
                    className="btn-primary text-xs py-1.5 px-3 shrink-0"
                    onClick={() => setConfirmId(plugin.id)}
                    disabled={installing === plugin.id}
                  >
                    {installing === plugin.id ? (
                      <span className="flex items-center gap-1">
                        <span className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
                        {t("installing")}
                      </span>
                    ) : t("install")}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {error && (
          <p className="mt-3 text-sm text-red-500 bg-red-50 dark:bg-red-900/20 rounded-lg p-3">
            {error}
          </p>
        )}

        {/* Disclaimer dialog */}
        {confirmId && (
          <div className="mt-4 bg-[var(--bg-secondary)] rounded-xl p-4 border border-[var(--border)]">
            <p className="text-sm text-[var(--text)] mb-3">{t("pluginDisclaimer")}</p>
            <div className="flex gap-2">
              <button className="btn-secondary flex-1 text-sm" onClick={() => setConfirmId(null)}>
                {t("cancel")}
              </button>
              <button className="btn-primary flex-1 text-sm" onClick={() => handleInstall(confirmId)}>
                {t("iUnderstand")}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

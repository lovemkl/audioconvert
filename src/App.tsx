import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { ipc } from "./lib/ipc";
import type { AppSettings } from "./types";
import WizardShell from "./components/wizard/WizardShell";
import FirstRunDialog from "./components/ui/FirstRunDialog";
import SettingsPanel from "./components/ui/SettingsPanel";
import PluginCenter from "./components/ui/PluginCenter";

type Modal = "none" | "settings" | "plugins";

export default function App() {
  const { i18n } = useTranslation();
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [modal, setModal] = useState<Modal>("none");
  const [showFirstRun, setShowFirstRun] = useState(false);

  // Load settings on mount
  useEffect(() => {
    ipc.getSettings().then((s) => {
      setSettings(s);
      if (s.first_run || !s.output_dir) setShowFirstRun(true);
      // Apply language
      const lang = s.language === "auto"
        ? (navigator.language.startsWith("zh") ? "zh" : "en")
        : s.language;
      i18n.changeLanguage(lang);
      // Apply theme
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      const isDark = s.theme === "dark" || (s.theme === "system" && prefersDark);
      document.documentElement.classList.toggle("dark", isDark);
    });
  }, []);

  const handleFirstRunConfirm = async (outputDir: string) => {
    if (!settings) return;
    const updated: AppSettings = { ...settings, output_dir: outputDir, first_run: false };
    await ipc.saveSettings(updated);
    setSettings(updated);
    setShowFirstRun(false);
  };

  const handleSaveSettings = async (updated: AppSettings) => {
    await ipc.saveSettings(updated);
    setSettings(updated);
    const lang = updated.language === "auto"
      ? (navigator.language.startsWith("zh") ? "zh" : "en")
      : updated.language;
    i18n.changeLanguage(lang);
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const isDark = updated.theme === "dark" || (updated.theme === "system" && prefersDark);
    document.documentElement.classList.toggle("dark", isDark);
    setModal("none");
  };

  if (!settings) {
    return (
      <div className="h-full flex items-center justify-center text-[var(--text-muted)]">
        <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Top bar */}
      <header
        className="flex items-center justify-between px-4 h-11 border-b border-[var(--border)] shrink-0"
        data-tauri-drag-region
      >
        <span className="font-bold text-brand-500 text-sm tracking-wide select-none">
          AudioConvert
        </span>
        <div className="flex items-center gap-1">
          <IconBtn title="Plugin Center" onClick={() => setModal("plugins")}>
            <PuzzleIcon />
          </IconBtn>
          <IconBtn title="Settings" onClick={() => setModal("settings")}>
            <GearIcon />
          </IconBtn>
        </div>
      </header>

      {/* Main wizard */}
      <main className="flex-1 overflow-hidden">
        <WizardShell settings={settings} onNeedFirstRun={() => setShowFirstRun(true)} />
      </main>

      {/* Modals */}
      {showFirstRun && (
        <FirstRunDialog onConfirm={handleFirstRunConfirm} />
      )}
      {modal === "settings" && (
        <SettingsPanel
          settings={settings}
          onSave={handleSaveSettings}
          onClose={() => setModal("none")}
        />
      )}
      {modal === "plugins" && (
        <PluginCenter onClose={() => setModal("none")} />
      )}
    </div>
  );
}

function IconBtn({
  children, onClick, title,
}: { children: React.ReactNode; onClick: () => void; title?: string }) {
  return (
    <button
      title={title}
      onClick={onClick}
      className="w-8 h-8 flex items-center justify-center rounded-lg
                 text-[var(--text-muted)] hover:text-[var(--text)]
                 hover:bg-[var(--bg-secondary)] transition-colors"
    >
      {children}
    </button>
  );
}

function GearIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}

function PuzzleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5z" />
      <line x1="16" y1="8" x2="2" y2="22" />
      <line x1="17.5" y1="15" x2="9" y2="15" />
    </svg>
  );
}

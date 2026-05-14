import { useState } from "react";
import { useTranslation } from "react-i18next";
import { open } from "@tauri-apps/plugin-dialog";

interface Props {
  onConfirm: (dir: string) => void;
}

export default function FirstRunDialog({ onConfirm }: Props) {
  const { t } = useTranslation();
  const [dir, setDir] = useState("");

  const pickDir = async () => {
    const selected = await open({ directory: true, multiple: false });
    if (selected) setDir(selected as string);
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="card w-full max-w-md p-6 shadow-2xl">
        <h2 className="text-lg font-bold mb-1">{t("firstRunTitle")}</h2>
        <p className="text-sm text-[var(--text-muted)] mb-5">{t("firstRunDesc")}</p>
        <div className="flex gap-2 mb-6">
          <div className="flex-1 px-3 py-2 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border)]
                          text-sm text-[var(--text-muted)] truncate">
            {dir || "未选择"}
          </div>
          <button className="btn-secondary text-sm shrink-0" onClick={pickDir}>
            {t("chooseDir")}
          </button>
        </div>
        <button
          className="btn-primary w-full"
          disabled={!dir}
          onClick={() => onConfirm(dir)}
        >
          {t("confirm")}
        </button>
      </div>
    </div>
  );
}

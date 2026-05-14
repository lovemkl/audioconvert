import { useTranslation } from "react-i18next";
import { FORMATS, QUALITY_LABELS, formatFileSize } from "../../lib/formats";
import type { ConvertSettings, FileItem, Quality } from "../../types";

interface Props {
  files: FileItem[];
  convertSettings: ConvertSettings;
  onSettingsChange: (s: ConvertSettings) => void;
  onBack: () => void;
  onNext: () => void;
}

const QUALITY_LEVELS: Quality[] = ["low", "standard", "high", "lossless"];

export default function Step2Settings({
  files, convertSettings, onSettingsChange, onBack, onNext,
}: Props) {
  const { t } = useTranslation();
  const selectedFmt = FORMATS.find((f) => f.id === convertSettings.targetFormat);

  const handleFormat = (id: string) => {
    const fmt = FORMATS.find((f) => f.id === id)!;
    onSettingsChange({
      ...convertSettings,
      targetFormat: id,
      quality: fmt.lossless ? "lossless" : convertSettings.quality === "lossless" ? "high" : convertSettings.quality,
    });
  };

  const handleQuality = (q: Quality) => {
    if (selectedFmt?.lossless && q !== "lossless") return;
    onSettingsChange({ ...convertSettings, quality: q });
  };

  // Rough estimated output size
  const totalInput = files.reduce((a, f) => a + f.meta.file_size_bytes, 0);
  const ratio: Record<Quality, number> = { low: 0.15, standard: 0.25, high: 0.4, lossless: 1.0 };
  const estimated = selectedFmt?.lossless
    ? totalInput
    : Math.round(totalInput * ratio[convertSettings.quality]);

  const tier1 = FORMATS.filter((f) => f.tier === 1);
  const tier2 = FORMATS.filter((f) => f.tier === 2);

  return (
    <div className="h-full flex flex-col gap-5">
      {/* Format grid */}
      <div className="flex-1 overflow-y-auto">
        <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-2">
          {t("chooseFormat")}
        </p>
        <div className="grid grid-cols-5 gap-2 mb-4">
          {tier1.map((fmt) => (
            <FormatCard
              key={fmt.id}
              fmt={fmt}
              selected={convertSettings.targetFormat === fmt.id}
              onClick={() => handleFormat(fmt.id)}
              desc={t(fmt.descKey)}
            />
          ))}
        </div>
        {/* Tier 2 collapsible */}
        <details className="group">
          <summary className="cursor-pointer text-xs text-[var(--text-muted)] hover:text-[var(--text)] mb-2 select-none">
            更多格式 ▸
          </summary>
          <div className="grid grid-cols-5 gap-2">
            {tier2.map((fmt) => (
              <FormatCard
                key={fmt.id}
                fmt={fmt}
                selected={convertSettings.targetFormat === fmt.id}
                onClick={() => handleFormat(fmt.id)}
                desc={t(fmt.descKey)}
              />
            ))}
          </div>
        </details>
      </div>

      {/* Quality slider */}
      <div className="card p-4 shrink-0">
        <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-3">
          {t("quality")}
        </p>
        <div className="flex gap-2">
          {QUALITY_LEVELS.map((q) => {
            const disabled = selectedFmt?.lossless && q !== "lossless";
            const active = convertSettings.quality === q;
            return (
              <button
                key={q}
                disabled={!!disabled}
                onClick={() => handleQuality(q)}
                className={`flex-1 py-2.5 px-2 rounded-xl text-xs font-medium transition-colors
                  ${active
                    ? "bg-brand-500 text-white shadow"
                    : disabled
                    ? "opacity-30 cursor-not-allowed bg-[var(--bg-secondary)]"
                    : "bg-[var(--bg-secondary)] hover:bg-[var(--border)] text-[var(--text)]"
                  }`}
              >
                {t(QUALITY_LABELS[q])}
              </button>
            );
          })}
        </div>
        <p className="text-xs text-[var(--text-muted)] mt-2">
          {t("estimatedSize")}：<span className="font-medium text-[var(--text)]">{formatFileSize(estimated)}</span>
        </p>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between shrink-0">
        <button className="btn-secondary" onClick={onBack}>← {t("back")}</button>
        <button className="btn-primary" onClick={onNext}>{t("startConvert")} →</button>
      </div>
    </div>
  );
}

function FormatCard({ fmt, selected, onClick, desc }: {
  fmt: (typeof FORMATS)[0]; selected: boolean; onClick: () => void; desc: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all
        ${selected
          ? "border-brand-500 bg-brand-50 dark:bg-brand-500/10 shadow-sm"
          : "border-[var(--border)] hover:border-brand-500/40 bg-[var(--bg)]"
        }`}
    >
      <span className="text-base font-bold text-[var(--text)]">{fmt.label}</span>
      <span className="text-[10px] text-[var(--text-muted)] leading-tight text-center">{desc}</span>
    </button>
  );
}

import { useState } from "react";
import { useTranslation } from "react-i18next";
import type { AppSettings, ConvertSettings, FileItem, WizardStep } from "../../types";
import Step1Import from "./Step1Import";
import Step2Settings from "./Step2Settings";
import Step3Convert from "./Step3Convert";
import ResultPage from "./ResultPage";

interface Props {
  settings: AppSettings;
  onNeedFirstRun: () => void;
}

export default function WizardShell({ settings, onNeedFirstRun }: Props) {
  const { t } = useTranslation();
  const [step, setStep] = useState<WizardStep>(1);
  const [files, setFiles] = useState<FileItem[]>([]);
  const [convertSettings, setConvertSettings] = useState<ConvertSettings>({
    targetFormat: "mp3",
    quality: "high",
  });

  const steps = [
    { n: 1, label: t("step1") },
    { n: 2, label: t("step2") },
    { n: 3, label: t("step3") },
  ];

  return (
    <div className="h-full flex flex-col">
      {/* Step indicator — hidden on result page */}
      {step !== "result" && (
        <div className="flex items-center justify-center gap-0 py-5 shrink-0">
          {steps.map((s, i) => (
            <div key={s.n} className="flex items-center">
              {/* Circle */}
              <div className="flex flex-col items-center gap-1">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
                    transition-colors duration-200
                    ${step === s.n
                      ? "bg-brand-500 text-white shadow-md"
                      : (step as number) > s.n
                      ? "bg-green-500 text-white"
                      : "bg-[var(--bg-secondary)] text-[var(--text-muted)] border border-[var(--border)]"
                    }`}
                >
                  {(step as number) > s.n ? "✓" : s.n}
                </div>
                <span
                  className={`text-xs whitespace-nowrap
                    ${step === s.n ? "text-brand-500 font-semibold" : "text-[var(--text-muted)]"}`}
                >
                  {s.label}
                </span>
              </div>
              {/* Connector line */}
              {i < steps.length - 1 && (
                <div
                  className={`w-16 h-0.5 mx-2 mb-4 transition-colors duration-200
                    ${(step as number) > s.n ? "bg-green-400" : "bg-[var(--border)]"}`}
                />
              )}
            </div>
          ))}
        </div>
      )}

      {/* Page content */}
      <div className="flex-1 overflow-hidden px-6 pb-6">
        {step === 1 && (
          <Step1Import
            files={files}
            onFilesChange={setFiles}
            onNext={() => setStep(2)}
          />
        )}
        {step === 2 && (
          <Step2Settings
            files={files}
            convertSettings={convertSettings}
            onSettingsChange={setConvertSettings}
            onBack={() => setStep(1)}
            onNext={() => {
              if (!settings.output_dir) {
                onNeedFirstRun();
              } else {
                setStep(3);
              }
            }}
          />
        )}
        {step === 3 && (
          <Step3Convert
            files={files}
            convertSettings={convertSettings}
            onFilesChange={setFiles}
            onDone={() => setStep("result")}
            onCancel={() => setStep(2)}
          />
        )}
        {step === "result" && (
          <ResultPage
            files={files}
            onReset={() => {
              setFiles([]);
              setStep(1);
            }}
          />
        )}
      </div>
    </div>
  );
}

import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import zh from "./zh";
import en from "./en";

const systemLang = navigator.language.startsWith("zh") ? "zh" : "en";

i18n.use(initReactI18next).init({
  resources: { zh, en },
  lng: systemLang,
  fallbackLng: "en",
  interpolation: { escapeValue: false },
});

export default i18n;

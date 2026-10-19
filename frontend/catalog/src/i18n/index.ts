import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "@/src/locales/en.json";
import hu from "@/src/locales/hu.json";
import { DEFAULT_LANG, SUPPORTED_LANGS } from "./config";

// Translations are bundled (no network fetch), so the server render, the
// prerendered HTML and hydration all have them synchronously. The active
// language comes from the URL via <I18nProvider>, never from detection.
if (!i18n.isInitialized) {
  void i18n.use(initReactI18next).init({
    resources: { en: { translation: en }, hu: { translation: hu } },
    lng: DEFAULT_LANG,
    fallbackLng: DEFAULT_LANG,
    supportedLngs: SUPPORTED_LANGS,
    interpolation: { escapeValue: false },
    initAsync: false,
  });
}

export default i18n;

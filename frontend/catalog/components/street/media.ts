import { DATE_LOCALES, DEFAULT_LANG, type SupportedLang } from "@/src/i18n/config";

// Backend defaults for missing avatars (core/models.py).
export const OVERLORD_PLACEHOLDER = "/media/placeholders/overlord_placeholder.png";

const formatters = new Map<SupportedLang, Intl.DateTimeFormat>();

// Date and time in the UI language (en-GB / hu-HU).
export function formatPostDate(iso: string, lang: SupportedLang = DEFAULT_LANG): string {
  let format = formatters.get(lang);
  if (!format) {
    format = new Intl.DateTimeFormat(DATE_LOCALES[lang], {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
    formatters.set(lang, format);
  }
  return format.format(new Date(iso));
}

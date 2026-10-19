// Pure constants and URL helpers, safe to import from Vike hooks (no React,
// no browser APIs). Adapted from the hydration-starter-kit's i18n branch.

export const SUPPORTED_LANGS = ["en", "hu"] as const;
export type SupportedLang = (typeof SUPPORTED_LANGS)[number];
export const DEFAULT_LANG: SupportedLang = "en";

export const isSupportedLang = (value: string | undefined): value is SupportedLang =>
  (SUPPORTED_LANGS as readonly string[]).includes(value ?? "");

// English lives at the plain paths (/street); other languages get a prefix
// (/hu/street). `path` may carry a query string (/overlord?id=3).
export function langPath(path: string, lang: SupportedLang): string {
  if (lang === DEFAULT_LANG) return path;
  return path === "/" ? `/${lang}/` : `/${lang}${path}`;
}

// The reverse: "/hu/street?x=1" → { lang: "hu", path: "/street?x=1" }.
// A leading /en/ is accepted too and means English.
export function splitLangPrefix(url: string): { lang: SupportedLang; path: string } {
  const match = /^\/([a-z]{2})(?=\/|$|\?|#)(.*)$/.exec(url);
  if (match && isSupportedLang(match[1])) {
    const rest = match[2];
    return { lang: match[1], path: rest.startsWith("/") ? rest : `/${rest}` };
  }
  return { lang: DEFAULT_LANG, path: url };
}

// Every page is prerendered once per language (see the pages'
// +onBeforePrerenderStart.ts hooks).
export function prerenderUrls(path: string): string[] {
  return SUPPORTED_LANGS.map((lang) => langPath(path, lang));
}

// Dates follow the UI language.
export const DATE_LOCALES: Record<SupportedLang, string> = { en: "en-GB", hu: "hu-HU" };

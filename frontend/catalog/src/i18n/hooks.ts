import { useCallback } from "react";
import { usePageContext } from "vike-react/usePageContext";
import { DEFAULT_LANG, langPath, type SupportedLang } from "./config";

// The page's language, as resolved from the URL by pages/+onBeforeRoute.ts.
// Outside a Vike page (e.g. component tests) it's the default language.
export function useLang(): SupportedLang {
  const pageContext = usePageContext() as { lang?: SupportedLang } | undefined;
  return pageContext?.lang ?? DEFAULT_LANG;
}

// Turns an app path ("/street") into one in the current language
// ("/hu/street"). Use it for every internal link and navigate() call so the
// language sticks while moving around. Stable per language, so it's safe in
// effect dependencies.
export function useLocalePath() {
  const lang = useLang();
  return useCallback((path: string) => langPath(path, lang), [lang]);
}

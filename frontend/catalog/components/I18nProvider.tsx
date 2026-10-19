import { type ReactNode, useEffect, useState } from "react";
import { I18nextProvider } from "react-i18next";
import i18n from "@/src/i18n";
import { useLang } from "@/src/i18n/hooks";

// From the hydration-starter-kit: applies the URL's language to i18next
// synchronously for the server render and the hydration render, so the HTML
// and the first client render match. Later client-side navigations switch
// it in an effect, since other mounted components already subscribe to
// i18next and changing it mid-render would update them during render.
export function I18nProvider({ children }: { children: ReactNode }) {
  const lang = useLang();
  const [isFirstRender, setIsFirstRender] = useState(true);

  if ((typeof window === "undefined" || isFirstRender) && i18n.language !== lang) {
    void i18n.changeLanguage(lang);
  }

  useEffect(() => {
    // Intentional: flips the "first render" flag once per mount (see above).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsFirstRender(false);
    if (i18n.language !== lang) void i18n.changeLanguage(lang);
    document.documentElement.lang = lang;
  }, [lang]);

  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}

import { useTranslation } from "react-i18next";
import { navigate } from "vike/client/router";
import { usePageContext } from "vike-react/usePageContext";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { langPath, SUPPORTED_LANGS, type SupportedLang } from "@/src/i18n/config";
import { useLang } from "@/src/i18n/hooks";

// Stays on the same page (and query string) in the other language.
export function LanguageSwitcher({ className }: { className?: string }) {
  const { t } = useTranslation();
  const lang = useLang();
  const { urlPathname, urlParsed } = usePageContext();

  const switchTo = (target: SupportedLang) => {
    if (target === lang) return;
    void navigate(langPath(urlPathname + (urlParsed.searchOriginal ?? ""), target));
  };

  return (
    <div
      role="group"
      aria-label={t("language.label")}
      className={cn("flex items-center", className)}
    >
      {SUPPORTED_LANGS.map((code) => (
        <Button
          key={code}
          variant="ghost"
          size="sm"
          lang={code}
          aria-pressed={code === lang}
          aria-label={t(`language.${code}`)}
          onClick={() => switchTo(code)}
          className={cn(
            "px-2 text-xs",
            code === lang
              ? "font-bold text-(--brand-on-surface)"
              : "text-(--brand-on-surface)/60 hover:text-(--brand-on-surface)"
          )}
        >
          {code.toUpperCase()}
        </Button>
      ))}
    </div>
  );
}

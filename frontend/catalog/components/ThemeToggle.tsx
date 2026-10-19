import { useState } from "react";
import { MoonIcon, SunIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMounted } from "@/src/hooks/use-mounted";
import { applyTheme, type Theme } from "@/src/theme";
import { useTranslation } from "react-i18next";

function readCurrentTheme(): Theme {
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

export function ThemeToggle() {
  const mounted = useMounted();
  const { t } = useTranslation();
  const [override, setOverride] = useState<Theme | null>(null);

  if (!mounted) {
    return (
      <Button
        variant="ghost"
        size="icon"
        aria-label={t("theme.toggle")}
        disabled
        className="text-(--brand-on-surface) hover:bg-(--brand-on-surface)/10 hover:text-(--brand-on-surface)"
      >
        <SunIcon className="size-5" />
      </Button>
    );
  }

  // `override` reflects a user click; absent that, read whatever the +Head.tsx
  // bootstrap script already applied to <html> before hydration.
  const theme: Theme = override ?? readCurrentTheme();

  const toggle = () => {
    const next: Theme = theme === "dark" ? "light" : "dark";
    applyTheme(next);
    setOverride(next);
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label={t("theme.toggle")}
      onClick={toggle}
      className="text-(--brand-on-surface) hover:bg-(--brand-on-surface)/10 hover:text-(--brand-on-surface)"
    >
      {theme === "dark" ? <SunIcon className="size-5" /> : <MoonIcon className="size-5" />}
    </Button>
  );
}

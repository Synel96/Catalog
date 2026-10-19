import { BRAND_NAME } from "./site";
import { useNavLinks } from "./useNavLinks";
import { useTranslation } from "react-i18next";
import { useLocalePath } from "@/src/i18n/hooks";

type FooterProps = {
  brandName?: string;
};

export function Footer({ brandName = BRAND_NAME }: FooterProps) {
  const year = new Date().getFullYear();
  const links = useNavLinks();
  const { t } = useTranslation();
  const localePath = useLocalePath();

  return (
    <footer className="border-t border-(--brand-on-surface)/10 bg-(--brand-surface) text-(--brand-on-surface)">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-3 px-6 py-4 text-sm text-(--brand-on-surface)/80">
        <nav
          aria-label={t("footer.links")}
          className="flex flex-wrap items-center justify-center gap-4"
        >
          {links.map((item) => (
            <a
              key={item.href}
              href={localePath(item.href)}
              className="text-(--brand-on-surface)/85 transition-colors hover:text-(--brand-on-surface)"
            >
              {t(item.labelKey)}
            </a>
          ))}
        </nav>
        <span>{t("footer.copyright", { year, brand: brandName })}</span>
      </div>
    </footer>
  );
}

import { BRAND_NAME } from "./site";
import { useNavLinks } from "./useNavLinks";

type FooterProps = {
  brandName?: string;
};

export function Footer({ brandName = BRAND_NAME }: FooterProps) {
  const year = new Date().getFullYear();
  const links = useNavLinks();

  return (
    <footer className="border-t border-(--brand-on-surface)/10 bg-(--brand-surface) text-(--brand-on-surface)">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-3 px-6 py-4 text-sm text-(--brand-on-surface)/80">
        <nav aria-label="Footer links" className="flex flex-wrap items-center justify-center gap-4">
          {links.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="text-(--brand-on-surface)/85 transition-colors hover:text-(--brand-on-surface)"
            >
              {item.label}
            </a>
          ))}
        </nav>
        <span>
          {year} {brandName}. All rights reserved.
        </span>
      </div>
    </footer>
  );
}

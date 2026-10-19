import { BRAND_NAME, SITE_URL, OG_IMAGE_PATH, SITE_DESCRIPTION } from "../components/site";
import i18n from "./i18n";
import { DEFAULT_LANG, langPath, SUPPORTED_LANGS, type SupportedLang } from "./i18n/config";

type BuildMetaInput = {
  // Logical path, without a language prefix ("/street").
  pathname: string;
  lang?: SupportedLang;
  title?: string | null;
  description?: string | null;
};

// <title> and description per page, in the page's language. Kept here
// (keyed by route) instead of in each page's +config.ts: a static `title`
// config would override the translated one on client-side navigation.
const ROUTE_META: Record<string, string> = {
  "/": "login",
  "/login": "login",
  "/register": "register",
  "/my-slave": "mySlave",
  "/street": "street",
  "/overlord": "overlord",
  "/mews": "mews",
};

export function pageMeta(
  lang: SupportedLang,
  pathname: string
): { title: string; description: string } {
  const t = i18n.getFixedT(lang);
  const key = ROUTE_META[pathname];
  return {
    title: key ? t(`meta.${key}.title`) : BRAND_NAME,
    description: t(key ? `meta.${key}.description` : "meta.default.description"),
  };
}

export function buildMeta({ pathname, lang = DEFAULT_LANG, title, description }: BuildMetaInput) {
  const canonicalUrl = new URL(langPath(pathname, lang), SITE_URL).toString();
  const resolvedTitle =
    title && title.trim().length > 0 && title !== BRAND_NAME
      ? `${title} | ${BRAND_NAME}`
      : BRAND_NAME;
  const resolvedDescription =
    description && description.trim().length > 0 ? description : SITE_DESCRIPTION;

  // hreflang alternates for every language, plus x-default (English).
  const alternates = [
    ...SUPPORTED_LANGS.map((l) => ({
      hreflang: l,
      href: new URL(langPath(pathname, l), SITE_URL).toString(),
    })),
    { hreflang: "x-default", href: new URL(pathname, SITE_URL).toString() },
  ];

  return {
    canonicalUrl,
    title: resolvedTitle,
    description: resolvedDescription,
    image: new URL(OG_IMAGE_PATH, SITE_URL).toString(),
    alternates,
  };
}

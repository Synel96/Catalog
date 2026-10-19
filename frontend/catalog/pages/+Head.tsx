// https://vike.dev/Head

import geistFontUrl from "@fontsource-variable/geist/files/geist-latin-wght-normal.woff2?url";
import { usePageContext } from "vike-react/usePageContext";
import { SITE_URL, BRAND_NAME, SITE_DESCRIPTION } from "../components/site";
import { DEFAULT_LANG, type SupportedLang } from "../src/i18n/config";
import { buildMeta, pageMeta } from "../src/seo";
import { THEME_BOOTSTRAP_SCRIPT } from "../src/theme";

export function Head() {
  const pageContext = usePageContext() as {
    urlPathname: string;
    lang?: SupportedLang;
  };
  const lang = pageContext.lang ?? DEFAULT_LANG;
  const meta = buildMeta({
    pathname: pageContext.urlPathname,
    lang,
    ...pageMeta(lang, pageContext.urlPathname),
  });

  return (
    <>
      {/* Sets the dark/light class before hydration to avoid a flash of the wrong theme */}
      <script dangerouslySetInnerHTML={{ __html: THEME_BOOTSTRAP_SCRIPT }} />

      <meta name="author" content="Szilveszter Németh" />
      <meta name="keywords" content="cats, social network, blog, community, Catalog" />
      <link rel="icon" type="image/png" href="/catalog.png" />

      {/* Installable app (PWA): public/manifest.webmanifest, public/sw.js */}
      <link rel="manifest" href="/manifest.webmanifest" />
      <meta name="theme-color" content="#ffe6e6" media="(prefers-color-scheme: light)" />
      <meta name="theme-color" content="#2a1d20" media="(prefers-color-scheme: dark)" />
      <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
      <meta name="apple-mobile-web-app-title" content={BRAND_NAME} />
      <meta name="mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      <link rel="canonical" href={meta.canonicalUrl} />
      {meta.alternates.map((alt) => (
        <link key={alt.hreflang} rel="alternate" hrefLang={alt.hreflang} href={alt.href} />
      ))}

      {/* Open Graph / Social Media */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={meta.canonicalUrl} />
      <meta property="og:title" content={meta.title} />
      <meta property="og:description" content={meta.description} />
      <meta property="og:image" content={meta.image} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={meta.canonicalUrl} />
      <meta name="twitter:title" content={meta.title} />
      <meta name="twitter:description" content={meta.description} />
      <meta name="twitter:image" content={meta.image} />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: BRAND_NAME,
            url: SITE_URL,
            description: SITE_DESCRIPTION,
          }),
        }}
      />

      {/* Preload the primary (Latin) font so it starts downloading early */}
      <link rel="preload" href={geistFontUrl} as="font" type="font/woff2" crossOrigin="anonymous" />
    </>
  );
}

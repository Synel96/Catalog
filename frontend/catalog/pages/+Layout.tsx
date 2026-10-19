import "./Layout.css";
import { useState } from "react";
import { usePageContext } from "vike-react/usePageContext";
import { I18nProvider } from "../components/I18nProvider";
import { StoreHydrator } from "../components/StoreHydrator";
import { Footer } from "../components/Footer";
import { MockModeBanner } from "../components/MockModeBanner";
import { Navbar } from "../components/Navbar";
import { PageLoading } from "../components/PageLoading";
import { PushDrawerBody } from "../components/ui/push-drawer";
import { Toaster } from "../components/ui/sonner";
import { useTranslation } from "react-i18next";
import { useConfig } from "vike-react/useConfig";
import { useLang } from "../src/i18n/hooks";
import { pageMeta } from "../src/seo";
import { setUpPwa } from "../src/pwa";

// Install prompt + service worker, set up as soon as this module loads in
// the browser (before hydration). Not a +client.ts: that makes Vike start
// the app with an inline script, which the CSP (vercel.json) blocks.
if (typeof window !== "undefined") setUpPwa();

// The provider must sit above everything that translates, so it applies
// the URL's language before they render.
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <I18nProvider>
      <LayoutInner>{children}</LayoutInner>
    </I18nProvider>
  );
}

function LayoutInner({ children }: { children: React.ReactNode }) {
  const { t } = useTranslation();
  const { urlPathname } = usePageContext();
  const lang = useLang();
  // <title> and the meta description in the page's language.
  useConfig()(pageMeta(lang, urlPathname));
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuPathname, setMenuPathname] = useState(urlPathname);

  // Client-side navigation doesn't remount the layout, so make sure the page
  // never stays pushed aside by the mobile drawer after a route change.
  // (Adjusting state during render rather than in an effect avoids an extra
  // render pass: https://react.dev/learn/you-might-not-need-an-effect)
  if (menuPathname !== urlPathname) {
    setMenuPathname(urlPathname);
    setMenuOpen(false);
  }

  return (
    <div className="flex min-h-screen flex-col">
      <a href="#page-content" className="skip-link">
        {t("a11y.skipToContent")}
      </a>
      <StoreHydrator />
      <MockModeBanner />
      <PageLoading />
      {/* Kept outside <PushDrawerBody> so the navbar stays put while the rest
          of the page slides aside. Anything `position: fixed` (e.g. a full-page
          background) should live out here too: the body's transform while the
          drawer is open would otherwise pin it to the page instead of the
          viewport. */}
      <Navbar menuOpen={menuOpen} onMenuOpenChange={setMenuOpen} />
      <PushDrawerBody open={menuOpen} className="flex flex-1 flex-col">
        <main id="page-content" className="flex-1">
          {children}
        </main>
        <Footer />
      </PushDrawerBody>
      {/* Outside <PushDrawerBody> so toasts stay pinned to the viewport. */}
      <Toaster />
    </div>
  );
}

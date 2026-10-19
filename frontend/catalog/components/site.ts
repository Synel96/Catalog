import { env } from "@/src/env";

export const BRAND_NAME = env.VITE_BRAND_NAME;
export const SITE_URL = env.VITE_SITE_URL;
export const API_MOCKS = env.VITE_API_MOCKS;
// With mocks on, requests stay on the site's own origin (`/api/...`) so the
// mock service worker can answer them and the CSP's connect-src 'self'
// already allows them.
export const API_URL = API_MOCKS ? "/api/" : env.VITE_API_URL;

// Django Channels feed socket (backend/catalog/feed/routing.py). It lives on
// the API's origin, outside the /api prefix. Browser-only: in mock mode it
// resolves against the page's own origin.
// Mock mode has no socket: the mock backend announces feed updates with a
// window event of this name instead (see src/hooks/use-feed-socket.ts).
export const MOCK_FEED_EVENT = "catalog:mock-feed";

export function feedSocketUrl(): string {
  const base = API_MOCKS ? window.location.origin : env.VITE_API_URL;
  const url = new URL("/ws/feed/", base);
  url.protocol = url.protocol === "https:" ? "wss:" : "ws:";
  return url.toString();
}

export const SITE_DESCRIPTION = "Catalog – The social network where cats rule and humans follow.";

// Placeholder Open Graph image — replace public/og-image.png with real artwork.
export const OG_IMAGE_PATH = "/og-image.png";

// `labelKey` is a translation key (src/locales/*.json).
export type NavLink = { href: string; labelKey: string };

export const PUBLIC_NAV_LINKS: readonly NavLink[] = [
  { href: "/mews", labelKey: "nav.mews" },
  { href: "/login", labelKey: "nav.login" },
  { href: "/register", labelKey: "nav.register" },
];

export const AUTH_NAV_LINKS: readonly NavLink[] = [
  { href: "/mews", labelKey: "nav.mews" },
  { href: "/webshop", labelKey: "nav.webshop" },
  { href: "/my-slave", labelKey: "nav.mySlave" },
  { href: "/street", labelKey: "nav.street" },
];

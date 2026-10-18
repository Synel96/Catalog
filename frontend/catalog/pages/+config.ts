import type { Config } from "vike/types";
import vikeReact from "vike-react/config";

// Default config (can be overridden by pages)
// https://vike.dev/config

const config: Config = {
  // No default `title` here: +config.ts files run outside Vite's env
  // replacement, so they can't import BRAND_NAME from components/site.ts.
  // Leaving `title` unset lets pages/+Head.tsx's buildMeta() fall back to
  // BRAND_NAME instead (see src/seo.ts).
  description: "Catalog – The social network where cats rule and humans follow.",

  // Every page is prerendered to static HTML at build time. User-specific
  // data (profile, overlords) is fetched in the browser with the auth
  // cookies, so nothing per-request is needed on the server.
  // https://vike.dev/prerender
  prerender: true,

  extends: [vikeReact],
};

export default config;

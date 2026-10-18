import type { Config } from "vike/types";

// Page-specific titles are combined with BRAND_NAME by buildMeta() (see
// src/seo.ts) — don't hardcode the brand name here, since +config.ts files
// can't import it (they run outside Vite's env replacement).
const config: Config = {
  title: "Login",
};

export default config;

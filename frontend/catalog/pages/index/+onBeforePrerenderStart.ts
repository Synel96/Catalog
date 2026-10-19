import { prerenderUrls } from "../../src/i18n/config";

// Prerender this page in every language (see src/i18n/config.ts).
export const onBeforePrerenderStart = () => prerenderUrls("/");

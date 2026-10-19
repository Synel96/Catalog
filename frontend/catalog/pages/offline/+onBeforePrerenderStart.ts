import { prerenderUrls } from "../../src/i18n/config";

// Precached by the service worker in every language.
export const onBeforePrerenderStart = () => prerenderUrls("/offline");

// https://vike.dev/lang: `<html lang>` per URL (set by +onBeforeRoute.ts).

import { DEFAULT_LANG, type SupportedLang } from "../src/i18n/config";

export default (pageContext: { lang?: SupportedLang }) => pageContext.lang ?? DEFAULT_LANG;

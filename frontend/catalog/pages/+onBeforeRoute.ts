// https://vike.dev/onBeforeRoute
//
// Takes the language prefix off the URL (/hu/street → /street) so routing
// works on plain paths, and puts the language on pageContext.lang. No prefix
// means English, without a redirect.

import { splitLangPrefix } from "../src/i18n/config";

export function onBeforeRoute(pageContext: { urlOriginal: string }) {
  const { lang, path } = splitLangPrefix(pageContext.urlOriginal);
  return { pageContext: { lang, urlLogical: path } };
}

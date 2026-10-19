import type { SupportedLang } from "./config";

// pageContext.lang is set by pages/+onBeforeRoute.ts.
declare global {
  namespace Vike {
    interface PageContext {
      lang?: SupportedLang;
    }
  }
}

export {};

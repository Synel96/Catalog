import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { expect, test } from "@playwright/test";

// The preview server doesn't send vercel.json's headers, so a script the
// production CSP would block can't show up as a failing page here. Instead:
// every inline script the pages ship must match a hash the CSP allows
// (a +client.ts once made Vike add one, and production stopped hydrating).
const vercel = JSON.parse(readFileSync(new URL("../vercel.json", import.meta.url), "utf8")) as {
  headers: { headers: { key: string; value: string }[] }[];
};
const csp = vercel.headers
  .flatMap((rule) => rule.headers)
  .find((header) => header.key === "Content-Security-Policy")!.value;
const scriptSrc = csp
  .split(";")
  .map((directive) => directive.trim())
  .find((directive) => directive.startsWith("script-src"))!;
const allowedHashes = [...scriptSrc.matchAll(/'sha256-([^']+)'/g)].map((m) => m[1]);

const PAGES = ["/", "/hu/", "/register", "/my-slave", "/street", "/overlord", "/mews", "/offline"];

test("every inline script is allowed by the production CSP", async ({ request }) => {
  expect(scriptSrc).not.toContain("'unsafe-inline'");
  for (const path of PAGES) {
    const html = await (await request.get(path)).text();
    for (const [, attrs, body] of html.matchAll(/<script([^>]*)>([\s\S]*?)<\/script>/g)) {
      // External files are covered by 'self'; JSON data blocks don't run.
      if (/\ssrc=/.test(attrs!) || /type="application\/(ld\+)?json"/.test(attrs!)) continue;
      const hash = createHash("sha256").update(body!).digest("base64");
      expect(allowedHashes, `inline script on ${path}: ${body!.slice(0, 80)}`).toContain(hash);
    }
  }
});

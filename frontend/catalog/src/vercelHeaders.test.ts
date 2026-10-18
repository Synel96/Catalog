import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { THEME_BOOTSTRAP_SCRIPT } from "./theme";

type HeaderRule = { source: string; headers: { key: string; value: string }[] };

const vercelConfig = JSON.parse(readFileSync(resolve(__dirname, "..", "vercel.json"), "utf8")) as {
  headers: HeaderRule[];
};

function headerValue(source: string, key: string) {
  return vercelConfig.headers
    .find((rule) => rule.source === source)
    ?.headers.find((header) => header.key === key)?.value;
}

describe("vercel.json headers", () => {
  // The CSP allows the inline theme bootstrap <script> (pages/+Head.tsx) by
  // hash, so editing THEME_BOOTSTRAP_SCRIPT without updating the hash would
  // silently break dark mode in production.
  it("whitelists the current hash of the inline theme bootstrap script", () => {
    const hash = createHash("sha256").update(THEME_BOOTSTRAP_SCRIPT).digest("base64");
    expect(headerValue("/(.*)", "Content-Security-Policy")).toContain(`'sha256-${hash}'`);
  });

  it("caches hashed build output forever but keeps HTML revalidating", () => {
    expect(headerValue("/assets/(.*)", "Cache-Control")).toContain("immutable");
    expect(headerValue("/chunks/(.*)", "Cache-Control")).toContain("immutable");
    expect(headerValue("/((?!assets/|chunks/).*)", "Cache-Control")).toContain("max-age=0");
  });
});

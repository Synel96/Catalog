import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, resolve } from "node:path";
import { describe, expect, it } from "vitest";
import en from "@/src/locales/en.json";
import hu from "@/src/locales/hu.json";
import { langPath, prerenderUrls, splitLangPrefix } from "./config";

type Tree = { [key: string]: string | Tree };

function flatten(tree: Tree, prefix = ""): string[] {
  return Object.entries(tree).flatMap(([key, value]) =>
    typeof value === "string" ? [prefix + key] : flatten(value, `${prefix}${key}.`)
  );
}

// i18next plural forms: "comments.count" is stored as count_one/count_other.
const baseKey = (key: string) => key.replace(/_(one|other)$/, "");

function sourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return sourceFiles(path);
    return /\.tsx?$/.test(name) && !/\.test\.tsx?$/.test(name) ? [path] : [];
  });
}

describe("translations", () => {
  const enKeys = flatten(en as Tree);
  const huKeys = flatten(hu as Tree);

  it("has the same keys in every language", () => {
    expect(huKeys.sort()).toEqual(enKeys.sort());
  });

  it("has no empty strings", () => {
    for (const [lang, tree] of Object.entries({ en, hu })) {
      for (const key of flatten(tree as Tree)) {
        expect(
          key.split(".").reduce<unknown>((node, k) => (node as Tree)[k], tree),
          `${lang}: ${key}`
        ).not.toBe("");
      }
    }
  });

  it("defines every literal key the code uses", () => {
    const root = resolve(__dirname, "../..");
    const known = new Set(enKeys.map(baseKey));
    const used = new Set<string>();
    for (const file of ["components", "pages", "src"].flatMap((d) => sourceFiles(join(root, d)))) {
      const code = readFileSync(file, "utf8");
      for (const match of code.matchAll(
        /\bt\("([\w.]+)"|i18nKey="([\w.]+)"|labelKey: "([\w.]+)"/g
      )) {
        used.add(match[1] ?? match[2] ?? match[3]);
      }
    }
    expect(used.size).toBeGreaterThan(100);
    expect([...used].filter((key) => !known.has(key))).toEqual([]);
  });
});

describe("language URLs", () => {
  it("keeps English on plain paths and prefixes Hungarian", () => {
    expect(langPath("/street", "en")).toBe("/street");
    expect(langPath("/street", "hu")).toBe("/hu/street");
    expect(langPath("/", "hu")).toBe("/hu/");
    expect(langPath("/overlord?id=3", "hu")).toBe("/hu/overlord?id=3");
  });

  it("splits a language prefix back off", () => {
    expect(splitLangPrefix("/hu/street")).toEqual({ lang: "hu", path: "/street" });
    expect(splitLangPrefix("/hu")).toEqual({ lang: "hu", path: "/" });
    expect(splitLangPrefix("/hu?x=1")).toEqual({ lang: "hu", path: "/?x=1" });
    expect(splitLangPrefix("/hu/overlord?id=3")).toEqual({ lang: "hu", path: "/overlord?id=3" });
    expect(splitLangPrefix("/en/mews")).toEqual({ lang: "en", path: "/mews" });
    expect(splitLangPrefix("/street")).toEqual({ lang: "en", path: "/street" });
    // Not a language: a page that merely starts with two letters.
    expect(splitLangPrefix("/huge")).toEqual({ lang: "en", path: "/huge" });
  });

  it("prerenders every page in every language", () => {
    expect(prerenderUrls("/mews")).toEqual(["/mews", "/hu/mews"]);
  });
});

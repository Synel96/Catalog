import { describe, expect, it } from "vitest";
import { buildMeta } from "./seo";

describe("buildMeta", () => {
  it("falls back to the brand name and default description", () => {
    const meta = buildMeta({ pathname: "/about" });

    expect(meta.canonicalUrl).toBe("http://localhost:5173/about");
    expect(meta.title).toBe("Catalog");
    expect(meta.description).toContain("cats rule");
    expect(meta.image).toBe("http://localhost:5173/og-image.png");
  });

  it("combines a page-provided title with the brand name, and uses the page description when present", () => {
    const meta = buildMeta({
      pathname: "/",
      title: "Home",
      description: "Custom description",
    });

    expect(meta.title).toBe("Home | Catalog");
    expect(meta.description).toBe("Custom description");
  });
});

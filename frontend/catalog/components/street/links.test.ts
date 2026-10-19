import { describe, expect, it } from "vitest";
import { overlordHref } from "./links";
import { formatPostDate } from "./media";

describe("street helpers", () => {
  it("links overlord profiles by query parameter", () => {
    expect(overlordHref(42)).toBe("/overlord?id=42");
  });

  it("formats post dates in the UI language", () => {
    expect(formatPostDate("2026-10-18T10:05:00Z", "hu")).toMatch(/^2026\. október 18\./);
    expect(formatPostDate("2026-10-18T10:05:00Z", "en")).toMatch(/^18 October 2026/);
  });
});

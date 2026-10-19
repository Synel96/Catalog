// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { formValues } from "./formValues";

describe("formValues", () => {
  it("reads the named fields straight from the DOM", () => {
    const form = document.createElement("form");
    form.innerHTML = `
      <input name="username" value="mirci" />
      <input name="password" type="password" value="tuna" />
      <input name="ignored" value="x" />`;

    expect(formValues(form, ["username", "password"])).toEqual({
      username: "mirci",
      password: "tuna",
    });
  });

  it("returns an empty string for missing fields", () => {
    expect(formValues(document.createElement("form"), ["email"])).toEqual({ email: "" });
  });
});

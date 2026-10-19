// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { db } from "@/src/mocks/db";
import { useMockBackend } from "@/src/test/mock-server";
import { ReactionBar } from "./ReactionBar";

// Seed post 1 (Garfield's) has Ekekekek, Hisss and Overnap: one each.
describe("ReactionBar", () => {
  useMockBackend();

  it("shows the counts it's given", () => {
    render(<ReactionBar postId={1} summary={{ ekekekek: 1, hisss: 1 }} overlordId={2} />);
    expect(screen.getByRole("button", { name: "Ekekekek (1)" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Purrfect" })).toBeInTheDocument();
  });

  it("toggles a reaction and shows the server's fresh counts", async () => {
    render(<ReactionBar postId={1} summary={{}} overlordId={2} />);

    await userEvent.click(screen.getByRole("button", { name: "Purrfect" }));
    expect(await screen.findByRole("button", { name: "Purrfect (1)" })).toBeInTheDocument();
    expect(db.reactions).toContainEqual({ overlord: 2, post: 1, type: "purrfect" });

    // Same reaction again takes it back.
    await userEvent.click(screen.getByRole("button", { name: "Purrfect (1)" }));
    expect(await screen.findByRole("button", { name: "Purrfect" })).toBeInTheDocument();
  });

  it("is disabled without a street overlord", () => {
    render(<ReactionBar postId={1} summary={{}} overlordId={null} />);
    for (const button of screen.getAllByRole("button")) expect(button).toBeDisabled();
  });
});

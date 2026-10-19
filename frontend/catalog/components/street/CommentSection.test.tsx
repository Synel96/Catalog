// @vitest-environment jsdom
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { db } from "@/src/mocks/db";
import { useMockBackend } from "@/src/test/mock-server";
import { CommentSection } from "./CommentSection";

// Seed post 2 is Mirci's sunbeam post with a Garfield / Luna / Mirci thread.
describe("CommentSection", () => {
  useMockBackend();

  const renderSection = (onCountChange = vi.fn()) =>
    render(
      <CommentSection
        postId={2}
        overlordId={1}
        overlordName="Mirci"
        serverCount={3}
        onCountChange={onCountChange}
      />
    );

  it("loads everyone's comments, oldest first", async () => {
    renderSection();
    const items = await screen.findAllByRole("listitem");
    expect(items.map((li) => within(li).getByRole("link").textContent)).toEqual([
      "Garfield",
      "Luna",
      "Mirci",
    ]);
  });

  it("only offers edit and delete on the user's own comments", async () => {
    renderSection();
    const [garfield, , mirci] = await screen.findAllByRole("listitem");
    expect(within(garfield).queryByRole("button", { name: "Edit comment" })).toBeNull();
    expect(within(mirci).getByRole("button", { name: "Edit comment" })).toBeInTheDocument();
  });

  it("hearts a comment as the street overlord and takes it back", async () => {
    renderSection();
    const [garfield, , mirci] = await screen.findAllByRole("listitem");
    // Seeded: Garfield and Luna hearted Mirci's reply.
    expect(within(mirci).getByRole("button", { name: "Heart (2)" })).toHaveAttribute(
      "aria-pressed",
      "false"
    );

    await userEvent.click(within(garfield).getByRole("button", { name: "Heart" }));
    const hearted = await within(garfield).findByRole("button", { name: "Heart (1)" });
    expect(hearted).toHaveAttribute("aria-pressed", "true");
    expect(db.hearts).toContainEqual({ overlord: 1, comment: 4 });

    await userEvent.click(hearted);
    expect(await within(garfield).findByRole("button", { name: "Heart" })).toHaveAttribute(
      "aria-pressed",
      "false"
    );
    expect(db.hearts).not.toContainEqual({ overlord: 1, comment: 4 });
  });

  it("posts a comment as the street overlord", async () => {
    const onCountChange = vi.fn();
    renderSection(onCountChange);
    await screen.findAllByRole("listitem");

    await userEvent.type(screen.getByLabelText("Comment as Mirci"), "Tuna first, then talk.");
    await userEvent.click(screen.getByRole("button", { name: "Send comment" }));

    expect(await screen.findByText("Tuna first, then talk.")).toBeInTheDocument();
    expect(onCountChange).toHaveBeenCalledWith(1);
  });

  it("posts a picture-only comment", async () => {
    URL.createObjectURL = vi.fn(() => "blob:paw");
    URL.revokeObjectURL = vi.fn();
    renderSection();
    await screen.findAllByRole("listitem");
    const send = screen.getByRole("button", { name: "Send comment" });
    expect(send).toBeDisabled();

    await userEvent.upload(
      screen.getByLabelText("Add a picture"),
      new File(["meow"], "paw.png", { type: "image/png" })
    );
    expect(screen.getByText("paw.png")).toBeInTheDocument();
    await userEvent.click(send);

    expect(await screen.findByRole("img", { name: "Picture from Mirci" })).toBeInTheDocument();
    expect(db.comments.at(-1)).toMatchObject({ overlord: 1, post: 2, content: "" });
    expect(db.comments.at(-1)?.image).toMatch(/^data:image\/png/);
    expect(screen.queryByText("paw.png")).toBeNull();
  });

  it("edits and deletes an own comment", async () => {
    const onCountChange = vi.fn();
    renderSection(onCountChange);
    const mirci = (await screen.findAllByRole("listitem"))[2];

    await userEvent.click(within(mirci).getByRole("button", { name: "Edit comment" }));
    const box = within(mirci).getByRole("textbox", { name: "Edit comment" });
    await userEvent.clear(box);
    await userEvent.type(box, "Coordinates: the sofa.");
    await userEvent.click(within(mirci).getByRole("button", { name: "Save comment" }));
    // `selector: "p"`: while the edit box is still mounted it carries the
    // same text (React mirrors a textarea's value into its content).
    expect(await screen.findByText("Coordinates: the sofa.", { selector: "p" })).toBeVisible();

    await userEvent.click(screen.getByRole("button", { name: "Delete comment" }));
    await vi.waitFor(() => expect(screen.queryByText("Coordinates: the sofa.")).toBeNull());
    expect(onCountChange).toHaveBeenCalledWith(-1);
  });

  it("asks for a street overlord before commenting", async () => {
    render(
      <CommentSection
        postId={2}
        overlordId={null}
        overlordName={null}
        serverCount={3}
        onCountChange={vi.fn()}
      />
    );
    expect(
      await screen.findByText("Go to the Street with an overlord to comment.")
    ).toBeInTheDocument();
    expect(screen.queryByRole("textbox")).toBeNull();
  });
});

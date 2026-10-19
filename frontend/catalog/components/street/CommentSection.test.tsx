// @vitest-environment jsdom
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
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

  it("posts a comment as the street overlord", async () => {
    const onCountChange = vi.fn();
    renderSection(onCountChange);
    await screen.findAllByRole("listitem");

    await userEvent.type(screen.getByLabelText("Comment as Mirci"), "Tuna first, then talk.");
    await userEvent.click(screen.getByRole("button", { name: "Send comment" }));

    expect(await screen.findByText("Tuna first, then talk.")).toBeInTheDocument();
    expect(onCountChange).toHaveBeenCalledWith(1);
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
    expect(await screen.findByText("Coordinates: the sofa.")).toBeInTheDocument();

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

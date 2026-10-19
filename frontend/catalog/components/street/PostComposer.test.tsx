// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { db } from "@/src/mocks/db";
import { useUploadStore } from "@/src/store/useUploadStore";
import { useMockBackend } from "@/src/test/mock-server";
import type { Overlord } from "@/src/types/api";
import { PostComposer } from "./PostComposer";

const mirci: Overlord = {
  id: 1,
  name: "Mirci",
  avatar: null,
  bio: "",
  breed: "Tabby",
  slave: 1,
};

describe("PostComposer", () => {
  useMockBackend({ streetOverlordId: 1 });

  it("can't post nothing", () => {
    render(<PostComposer overlord={mirci} onPosted={vi.fn()} />);
    expect(screen.getByRole("button", { name: /Post/ })).toBeDisabled();
  });

  it("posts a picture without text", async () => {
    URL.createObjectURL = vi.fn(() => "blob:dot");
    URL.revokeObjectURL = vi.fn();
    const onPosted = vi.fn();
    render(<PostComposer overlord={mirci} onPosted={onPosted} />);
    await userEvent.upload(
      screen.getByLabelText("Attach image"),
      new File(["meow"], "dot.png", { type: "image/png" })
    );
    await userEvent.click(screen.getByRole("button", { name: /Post/ }));

    await vi.waitFor(() => expect(onPosted).toHaveBeenCalledOnce());
    expect(db.posts.at(-1)).toMatchObject({ overlord: 1, content: "" });
    expect(db.posts.at(-1)?.image).toMatch(/^data:image\/png/);
  });

  it("posts as the overlord and clears itself", async () => {
    const onPosted = vi.fn();
    render(<PostComposer overlord={mirci} onPosted={onPosted} />);

    const box = screen.getByLabelText("Post as Mirci");
    await userEvent.type(box, "The red dot is back.");
    await userEvent.upload(
      screen.getByLabelText("Attach image"),
      new File(["meow"], "dot.png", { type: "image/png" })
    );
    expect(screen.getByText("dot.png")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: /Post/ }));

    await vi.waitFor(() => expect(onPosted).toHaveBeenCalledOnce());
    // The cleared state renders right after the callback.
    await vi.waitFor(() => expect(box).toHaveValue(""));
    expect(db.posts.at(-1)).toMatchObject({ overlord: 1, content: "The red dot is back." });
    expect(db.posts.at(-1)?.image).toMatch(/^data:image\/png/);
    // The upload reported its progress all the way.
    expect(useUploadStore.getState().progress).toBe(1);
  });
});

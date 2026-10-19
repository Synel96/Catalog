// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { addComment, counterComment, notify, reactToNewPost, toggleHeart } from "./chatter";
import { db, resetMockDb } from "./db";

// Seed: Mirci (1) and Cirmi (2) are the user's; Garfield (3) is jon's.
describe("mock notifications follow the backend's rules", () => {
  beforeEach(() => resetMockDb());

  const count = () => db.notifications.length;

  it("notifies the user's overlord about someone else's activity", () => {
    const before = count();
    notify(3, 1, "Garfield did a thing.", 3);
    expect(count()).toBe(before + 1);
    expect(db.notifications.at(-1)).toMatchObject({
      overlord: 1,
      link: "/overlord?id=3",
      is_read: false,
    });
  });

  it("skips activity between the same slave's overlords", () => {
    const before = count();
    notify(2, 1, "Cirmi did a thing.", 2);
    expect(count()).toBe(before);
  });

  it("only notifies the post owner about comments", () => {
    const before = count();
    addComment(3, 2, "Garfield on Mirci's post"); // post 2 is Mirci's
    addComment(1, 1, "Mirci on Garfield's post"); // post 1 is Garfield's
    expect(count()).toBe(before + 1);
    expect(db.notifications.at(-1)?.message).toContain("Garfield commented on your post");
  });
});

describe("mock chatter", () => {
  beforeEach(() => {
    resetMockDb();
    vi.useFakeTimers();
  });
  afterEach(() => vi.useRealTimers());

  it("answers a new post with a comment, then a reaction and a counter-comment", () => {
    const broadcast = vi.fn();
    db.posts.push({ id: 500, overlord: 1, content: "hi", image: null, created_at: "" });

    reactToNewPost(500, 1, broadcast);
    expect(db.comments.filter((c) => c.post === 500)).toHaveLength(0);

    vi.advanceTimersByTime(2500);
    expect(db.comments.filter((c) => c.post === 500)).toHaveLength(1);

    vi.advanceTimersByTime(2500);
    const comments = db.comments.filter((c) => c.post === 500);
    expect(comments).toHaveLength(2);
    expect(comments[1].content).toMatch(/^@/);
    expect(db.reactions.some((r) => r.post === 500)).toBe(true);
    expect(broadcast).toHaveBeenCalledTimes(2);
  });

  it("has a post's owner fire back at the user's comment, but not on their own posts", () => {
    const broadcast = vi.fn();
    counterComment(1, 1, broadcast); // Garfield's post
    counterComment(2, 1, broadcast); // Mirci's own post: nobody to argue with
    vi.advanceTimersByTime(2500);

    const counter = db.comments.at(-1);
    expect(counter).toMatchObject({ overlord: 3, post: 1 });
    expect(counter?.content.startsWith("@Mirci ")).toBe(true);
    expect(broadcast).toHaveBeenCalledOnce();
  });

  it("has the post's owner heart the user's comment, which notifies", () => {
    const mine = addComment(1, 1, "Mondays fear ME.");
    const before = db.notifications.length;
    counterComment(1, 1, vi.fn(), mine.id);
    vi.advanceTimersByTime(2500);

    expect(db.hearts).toContainEqual({ overlord: 3, comment: mine.id });
    expect(db.notifications.slice(before).map((n) => n.message)).toContainEqual(
      "Garfield hearted your comment: “Mondays fear ME.”"
    );
  });

  it("toggles hearts", () => {
    expect(toggleHeart(1, 4)).toEqual({ hearted: true, heart_count: 1 });
    expect(toggleHeart(1, 4)).toEqual({ hearted: false, heart_count: 0 });
  });
});

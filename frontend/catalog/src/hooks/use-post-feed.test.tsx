// @vitest-environment jsdom
import { act, renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { db, nextId } from "@/src/mocks/db";
import { getStreetPosts } from "@/src/services/postService";
import { useMockBackend } from "@/src/test/mock-server";
import { usePostFeed, type PageFetcher } from "./use-post-feed";

// Mirci (1) is out on the Street; the mock serves pages of 8.
const streetAsMirci: PageFetcher = (cursor) => getStreetPosts(1, cursor);

const addPost = (overlord: number, content: string) => {
  const post = {
    id: nextId(),
    overlord,
    content,
    image: null,
    created_at: new Date().toISOString(),
  };
  db.posts.push(post);
  return post;
};

describe("usePostFeed", () => {
  useMockBackend({ streetOverlordId: 1 });

  const renderFeed = async () => {
    const hook = renderHook(() => usePostFeed(streetAsMirci));
    await waitFor(() => expect(hook.result.current.isLoading).toBe(false));
    return hook;
  };

  it("pages through the whole feed without repeats", async () => {
    const { result } = await renderFeed();
    expect(result.current.posts).toHaveLength(8);
    expect(result.current.hasMore).toBe(true);

    while (result.current.hasMore) {
      const before = result.current.posts.length;
      act(() => result.current.loadMore());
      await waitFor(() => expect(result.current.posts.length).toBeGreaterThan(before));
    }

    const ids = result.current.posts.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
    const dates = result.current.posts.map((p) => p.created_at);
    expect(dates).toEqual([...dates].sort().reverse());
    // Nothing from Snowball (4), whom neither of the user's cats whiskers.
    expect(result.current.posts.some((p) => p.overlord === 4)).toBe(false);
  });

  it("queues newer posts until shown, and updates shown ones in place", async () => {
    const { result } = await renderFeed();
    const top = result.current.posts[0]!;
    db.reactions.push({ overlord: 3, post: top.id, type: "nap" });
    const fresh = addPost(3, "Lasagna incoming.");

    await act(() => result.current.refresh());
    expect(result.current.incomingCount).toBe(1);
    expect(result.current.posts[0]?.id).toBe(top.id);
    expect(result.current.posts[0]?.reaction_summary.nap).toBe((top.reaction_summary.nap ?? 0) + 1);

    act(() => result.current.showIncoming());
    expect(result.current.incomingCount).toBe(0);
    expect(result.current.posts[0]?.id).toBe(fresh.id);
  });

  it("shows the user's own new post right away", async () => {
    const { result } = await renderFeed();
    const mine = addPost(1, "Mine, posted just now.");
    await act(() => result.current.refresh({ show: true }));
    expect(result.current.posts[0]?.id).toBe(mine.id);
    expect(result.current.incomingCount).toBe(0);
  });

  it("starts over from the newest page when more arrived than a page holds", async () => {
    const { result } = await renderFeed();
    for (let i = 0; i < 10; i++) addPost(3, `Flood ${i}`);
    await act(() => result.current.refresh());
    expect(result.current.incomingCount).toBe(8);

    act(() => result.current.showIncoming());
    expect(result.current.posts.map((p) => p.content)).toEqual(
      Array.from({ length: 8 }, (_, i) => `Flood ${9 - i}`)
    );
    expect(result.current.hasMore).toBe(true);
  });
});

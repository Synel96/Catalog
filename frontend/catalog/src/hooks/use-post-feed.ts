import { useCallback, useEffect, useRef, useState } from "react";
import type { PostPage } from "@/src/services/postService";
import type { ApiError, Post } from "@/src/types/api";

// Loads one page of a feed: the first with `null`, then each page's `next`.
export type PageFetcher = (cursor: string | null) => Promise<PostPage>;

type FeedState = {
  // The fetcher these posts came from; a new one (another overlord, the
  // acting overlord changed) starts over.
  fetcher: PageFetcher;
  posts: Post[];
  next: string | null;
  isLoading: boolean;
  isLoadingMore: boolean;
  error: string | null;
  // Newer posts found by `refresh` and not shown yet ("3 new posts").
  incoming: Post[];
  // The first page `incoming` came from, when none of it overlaps the
  // shown posts: showing them then restarts from that page.
  gapPage: PostPage | null;
};

const fresh = (fetcher: PageFetcher): FeedState => ({
  fetcher,
  posts: [],
  next: null,
  isLoading: true,
  isLoadingMore: false,
  error: null,
  incoming: [],
  gapPage: null,
});

// An infinitely scrolling, newest-first feed of posts (the Street, an
// overlord's profile). Pages continue from a cursor, so posts arriving in
// between never shift them. New posts from elsewhere wait in `incoming`
// until shown, instead of reloading the list under the reader.
export function usePostFeed(fetchPage: PageFetcher) {
  const [state, setState] = useState(() => fresh(fetchPage));
  const loadingMore = useRef(false);

  // Another feed: start over (during render, like adopting new props:
  // https://react.dev/learn/you-might-not-need-an-effect).
  if (state.fetcher !== fetchPage) setState(fresh(fetchPage));

  useEffect(() => {
    let cancelled = false;
    fetchPage(null)
      .then(
        (page) =>
          !cancelled &&
          setState((s) => ({ ...s, posts: page.posts, next: page.next, isLoading: false }))
      )
      .catch(
        (error: ApiError) =>
          !cancelled && setState((s) => ({ ...s, error: error.detail, isLoading: false }))
      );
    return () => {
      cancelled = true;
    };
  }, [fetchPage]);

  const loadMore = useCallback(() => {
    if (loadingMore.current || !state.next) return;
    loadingMore.current = true;
    const cursor = state.next;
    setState((s) => ({ ...s, isLoadingMore: true }));
    fetchPage(cursor)
      .then((page) =>
        setState((s) => {
          if (s.fetcher !== fetchPage) return s;
          const known = new Set(s.posts.map((p) => p.id));
          return {
            ...s,
            posts: [...s.posts, ...page.posts.filter((p) => !known.has(p.id))],
            next: page.next,
            isLoadingMore: false,
          };
        })
      )
      .catch((error: ApiError) =>
        setState((s) => ({
          ...s,
          isLoadingMore: false,
          error: s.posts.length ? s.error : error.detail,
        }))
      )
      .finally(() => {
        loadingMore.current = false;
      });
  }, [fetchPage, state.next]);

  // Checks the first page: shown posts get their fresh counts in place,
  // new ones are queued in `incoming`, or shown right away with `show`
  // (e.g. after the user's own post).
  const refresh = useCallback(
    async ({ show = false }: { show?: boolean } = {}) => {
      let page: PostPage;
      try {
        page = await fetchPage(null);
      } catch (error) {
        console.error("Failed to refresh the feed:", error);
        return;
      }
      setState((s) => {
        if (s.fetcher !== fetchPage) return s;
        const latest = new Map(page.posts.map((p) => [p.id, p]));
        const posts = s.posts.map((p) => latest.get(p.id) ?? p);
        const shown = new Set(posts.map((p) => p.id));
        const newer = page.posts.filter((p) => !shown.has(p.id));
        const gap = posts.length > 0 && newer.length === page.posts.length;
        const next: FeedState = {
          ...s,
          posts,
          incoming: newer,
          gapPage: gap ? page : null,
        };
        return show ? showIncomingIn(next) : next;
      });
    },
    [fetchPage]
  );

  const showIncoming = useCallback(() => setState(showIncomingIn), []);

  const replacePost = useCallback(
    (post: Post) =>
      setState((s) => ({ ...s, posts: s.posts.map((p) => (p.id === post.id ? post : p)) })),
    []
  );

  const removePost = useCallback(
    (postId: number) => setState((s) => ({ ...s, posts: s.posts.filter((p) => p.id !== postId) })),
    []
  );

  return {
    posts: state.posts,
    isLoading: state.isLoading,
    isLoadingMore: state.isLoadingMore,
    error: state.error,
    hasMore: state.next !== null,
    incomingCount: state.incoming.length,
    loadMore,
    refresh,
    showIncoming,
    replacePost,
    removePost,
  };
}

function showIncomingIn(s: FeedState): FeedState {
  if (s.gapPage) {
    // More arrived than one page holds: restart from the newest page.
    return { ...s, posts: s.gapPage.posts, next: s.gapPage.next, incoming: [], gapPage: null };
  }
  return { ...s, posts: [...s.incoming, ...s.posts], incoming: [] };
}

// store/useOverlordPostsStore.js
import { create } from "zustand";
import { fetchPostsByOverlordId } from "../services/posts/postService";

export const useOverlordPostsStore = create((set) => ({
  posts: [],
  loading: false,
  error: null,

  fetchPosts: async (overlordId) => {
    set({ loading: true, error: null });
    try {
      const data = await fetchPostsByOverlordId(overlordId);
      set({ posts: data });
    } catch (err) {
      console.error("Failed to fetch posts:", err);
      set({ error: err });
    } finally {
      set({ loading: false });
    }
  },

  refetchPosts: async (overlordId) => {
    try {
      const data = await fetchPostsByOverlordId(overlordId);
      set({ posts: data });
    } catch (err) {
      console.error("Refetch error:", err);
    }
  },
}));

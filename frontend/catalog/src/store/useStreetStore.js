import { create } from "zustand";
import { persist } from "zustand/middleware";
import { fetchStreetPosts } from "../services/posts/postService";

export const useStreetStore = create(
  persist(
    (set) => ({
      selectedOverlord: null,
      isOnStreet: false,
      streetPosts: [],
      loading: false,
      error: null,

      // Macska kivitele utcára
      setSelectedOverlord: (overlord) =>
        set({ selectedOverlord: overlord, isOnStreet: true }),

      // Hazamenetel
      clearSelectedOverlord: () =>
        set({ selectedOverlord: null, isOnStreet: false }),

      // 🔁 Utcai posztok lekérése
      fetchStreetPosts: async () => {
        set({ loading: true, error: null });
        try {
          const data = await fetchStreetPosts(); // pl. fetchStreetPosts vagy fetchWhiskeredPosts
          set({ streetPosts: data });
        } catch (err) {
          console.error("Street fetch error:", err);
          set({ error: err });
        } finally {
          set({ loading: false });
        }
      },
    }),
    {
      name: "street-overlord-storage",
      partialize: (state) => ({
        selectedOverlord: state.selectedOverlord,
        isOnStreet: state.isOnStreet,
      }),
    }
  )
);

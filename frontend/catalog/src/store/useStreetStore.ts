import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { getStreetPosts } from "@/src/services/postService";
import type { ApiError, Overlord, Post, User } from "@/src/types/api";

type StreetState = {
  // The overlord the user is "out on the Street" with: posts, reactions and
  // whiskers are done in its name.
  selectedOverlord: Overlord | null;
  posts: Post[];
  isLoading: boolean;
  error: string | null;
  goToStreet: (overlord: Overlord) => void;
  goHome: () => void;
  fetchPosts: () => Promise<void>;
  replacePost: (post: Post) => void;
  removePost: (postId: number) => void;
};

// Keeps the persisted street overlord in line with who is logged in: it
// goes when nobody is, or when it isn't one of the user's overlords (any
// more), and otherwise picks up its latest data (e.g. a rename). Without
// this a stale overlord from an earlier session (or, in mock mode, from a
// mock database that has since been reset) lingers in the navbar.
export function reconcileStreetOverlord(user: User | null) {
  const { selectedOverlord, goHome, goToStreet } = useStreetStore.getState();
  if (!selectedOverlord) return;
  const current = user?.overlords.find((o) => o.id === selectedOverlord.id);
  if (!current) goHome();
  else if (current !== selectedOverlord) goToStreet(current);
}

export const useStreetStore = create<StreetState>()(
  persist(
    (set, get) => ({
      selectedOverlord: null,
      posts: [],
      isLoading: false,
      error: null,

      goToStreet: (overlord) => set({ selectedOverlord: overlord }),
      goHome: () => set({ selectedOverlord: null }),

      fetchPosts: async () => {
        set({ isLoading: true, error: null });
        try {
          const posts = await getStreetPosts(get().selectedOverlord?.id);
          set({ posts, isLoading: false });
        } catch (error) {
          set({ error: (error as ApiError).detail, isLoading: false });
        }
      },

      replacePost: (post) =>
        set((state) => ({ posts: state.posts.map((p) => (p.id === post.id ? post : p)) })),
      removePost: (postId) =>
        set((state) => ({ posts: state.posts.filter((p) => p.id !== postId) })),
    }),
    {
      name: "street-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: ({ selectedOverlord }) => ({ selectedOverlord }),
      // Rehydrated after mount by <StoreHydrator>, like the auth store.
      skipHydration: true,
    }
  )
);

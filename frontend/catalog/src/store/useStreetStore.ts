import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { Overlord, User } from "@/src/types/api";

type StreetState = {
  // The overlord the user is "out on the Street" with: posts, reactions and
  // whiskers are done in its name.
  selectedOverlord: Overlord | null;
  goToStreet: (overlord: Overlord) => void;
  goHome: () => void;
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
    (set) => ({
      selectedOverlord: null,

      goToStreet: (overlord) => set({ selectedOverlord: overlord }),
      goHome: () => set({ selectedOverlord: null }),
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

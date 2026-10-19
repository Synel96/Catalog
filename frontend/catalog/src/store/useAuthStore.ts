import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { getCurrentUser } from "@/src/services/userService";
import { reconcileStreetOverlord, useStreetStore } from "@/src/store/useStreetStore";
import type { User } from "@/src/types/api";

type AuthState = {
  user: User | null;
  isAuthenticated: boolean;
  login: (user: User) => void;
  logout: () => void;
  refetchUser: () => Promise<User | null>;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,

      // A new session starts at home, not out on the Street with whatever
      // overlord an earlier session left selected.
      login: (user) => {
        useStreetStore.getState().goHome();
        set({ user, isAuthenticated: true });
      },

      logout: () => {
        useStreetStore.getState().goHome();
        set({ user: null, isAuthenticated: false });
      },

      refetchUser: async () => {
        try {
          const user = await getCurrentUser();
          set({ user, isAuthenticated: true });
          reconcileStreetOverlord(user);
          return user;
        } catch (error) {
          console.error("Failed to refetch user:", error);
          set({ user: null, isAuthenticated: false });
          reconcileStreetOverlord(null);
          return null;
        }
      },
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: ({ user, isAuthenticated }) => ({ user, isAuthenticated }),
      // The server render (and the prerendered HTML) never sees localStorage,
      // so rehydrating at store creation would make the first client render
      // differ from the HTML. <StoreHydrator> rehydrates after mount instead.
      skipHydration: true,
    }
  )
);

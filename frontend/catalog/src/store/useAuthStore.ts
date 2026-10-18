import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { getCurrentUser } from "@/src/services/userService";
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

      login: (user) => set({ user, isAuthenticated: true }),

      logout: () => set({ user: null, isAuthenticated: false }),

      refetchUser: async () => {
        try {
          const user = await getCurrentUser();
          set({ user, isAuthenticated: true });
          return user;
        } catch (error) {
          console.error("Failed to refetch user:", error);
          set({ user: null, isAuthenticated: false });
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

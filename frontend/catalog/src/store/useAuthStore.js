// src/store/useAuthStore.js
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { getCurrentUser } from "../services/auth/userService";

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,

      login: ({ user }) => {
        console.log("Zustand login called with user:", user);
        set({
          user,
          isAuthenticated: true,
        });
      },

      logout: () => {
        set({
          user: null,
          isAuthenticated: false,
        });
      },

      refetchUser: async () => {
        try {
          const user = await getCurrentUser();
          set({
            user,
            isAuthenticated: true,
          });
        } catch (err) {
          console.error("Failed to refetch user:", err);
          set({
            user: null,
            isAuthenticated: false,
          });
        }
      },
    }),
    {
      name: "auth-storage", // a localStorage key neve
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

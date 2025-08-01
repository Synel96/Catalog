// src/store/useAuthStore.js
import { create } from "zustand";

export const useAuthStore = create((set) => ({
  user: null,
  isAuthenticated: false,

  login: ({ user }) => {
    console.log("Zustand login called with user:", user);
    set({
      user,
      isAuthenticated: true,
    });
  },

  logout: () =>
    set({
      user: null,
      isAuthenticated: false,
    }),
}));

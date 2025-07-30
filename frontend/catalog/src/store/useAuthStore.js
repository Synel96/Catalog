import { create } from "zustand";

export const useAuthStore = create((set) => ({
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,

  login: ({ user, access, refresh }) => {
    console.log("Zustand login called with user:", user);
    set({
      user,
      accessToken: access,
      refreshToken: refresh,
      isAuthenticated: true,
    });
  },
  logout: () =>
    set({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
    }),
}));

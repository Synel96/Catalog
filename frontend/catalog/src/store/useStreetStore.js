import { create } from "zustand";

export const useStreetStore = create((set) => ({
  selectedOverlord: null,
  setSelectedOverlord: (overlord) => set({ selectedOverlord: overlord }),
  clearSelectedOverlord: () => set({ selectedOverlord: null }),
}));

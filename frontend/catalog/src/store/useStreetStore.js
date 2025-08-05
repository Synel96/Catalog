import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useStreetStore = create(
  persist(
    (set) => ({
      selectedOverlord: null,
      isOnStreet: false,

      // Amikor kiviszed a macskát az utcára
      setSelectedOverlord: (overlord) =>
        set({ selectedOverlord: overlord, isOnStreet: true }),

      // Amikor hazamész (visszaállítjuk az állapotot)
      clearSelectedOverlord: () =>
        set({ selectedOverlord: null, isOnStreet: false }),
    }),
    {
      name: "street-overlord-storage", // localStorage kulcs neve
      partialize: (state) => ({
        selectedOverlord: state.selectedOverlord,
        isOnStreet: state.isOnStreet,
      }),
    }
  )
);

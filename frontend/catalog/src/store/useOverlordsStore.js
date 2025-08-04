// src/store/useOverlordStore.js
import { create } from "zustand";
import {
  getMyOverlords,
  createOverlord,
  updateOverlord,
  deleteOverlord,
} from "../services/overlords/overlordsService";

export const useOverlordStore = create((set) => ({
  overlords: [],
  isLoading: false,
  error: null,

  fetchOverlords: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await getMyOverlords();
      console.log("Fetched overlords raw:", data);

      let list = [];
      if (Array.isArray(data)) {
        list = data;
      } else if (Array.isArray(data.overlords)) {
        list = data.overlords;
      } else if (Array.isArray(data.results)) {
        list = data.results;
      } else if (data && typeof data === "object") {
        const firstArray = Object.values(data).find((v) => Array.isArray(v));
        if (Array.isArray(firstArray)) {
          list = firstArray;
          console.warn(
            "Overlords lista nem a várt helyen volt; első tömböt használjuk:",
            list
          );
        } else {
          console.warn("Nem találtunk overlords tömböt a válaszban:", data);
        }
      } else {
        console.warn("Váratlan válasz típus overlords lekérésnél:", data);
      }

      if (!Array.isArray(list)) list = [];
      set({ overlords: list, isLoading: false });
    } catch (err) {
      console.error("Hiba overlordok lekérésekor:", err);
      set({
        error: err?.detail || "Failed to fetch overlords",
        isLoading: false,
      });
    }
  },

  addOverlord: async (formData) => {
    try {
      const newOverlord = await createOverlord(formData);
      set((state) => ({ overlords: [...state.overlords, newOverlord] }));
    } catch (err) {
      console.error("Failed to add overlord:", err);
    }
  },

  updateOverlord: async (id, formData) => {
    try {
      const updated = await updateOverlord(id, formData);
      set((state) => ({
        overlords: state.overlords.map((o) => (o.id === id ? updated : o)),
      }));
    } catch (err) {
      console.error("Failed to update overlord:", err);
    }
  },

  deleteOverlord: async (id) => {
    try {
      await deleteOverlord(id);
      set((state) => ({
        overlords: state.overlords.filter((o) => o.id !== id),
      }));
    } catch (err) {
      console.error("Failed to delete overlord:", err);
    }
  },
}));

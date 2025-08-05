import { create } from "zustand";
import {
  createWhisker,
  deleteWhisker,
  checkWhiskerStatus,
} from "../services/overlords/whiskersService";

export const useWhiskerStore = create((set, get) => ({
  whiskerMap: {},

  // Lekérdezi, hogy van-e whisker kapcsolat két overlord között
  isWhiskered: (fromId, toId) => {
    const key = `${fromId}_${toId}`;
    return !!get().whiskerMap[key];
  },

  // Állapot frissítése backend alapján
  fetchWhiskerStatus: async (fromId, toId) => {
    const key = `${fromId}_${toId}`;
    try {
      const result = await checkWhiskerStatus(fromId, toId);
      set((state) => ({
        whiskerMap: {
          ...state.whiskerMap,
          [key]: result?.isWhiskered || false,
        },
      }));
    } catch (err) {
      console.error("Whisker status fetch error:", err);
    }
  },

  // Külön gombhoz: Whisker létrehozása
  createWhiskerAction: async (fromId, toId) => {
    const key = `${fromId}_${toId}`;
    try {
      await createWhisker(fromId, toId);
      set((state) => ({
        whiskerMap: {
          ...state.whiskerMap,
          [key]: true,
        },
      }));
    } catch (err) {
      console.error("Whisker creation error:", err);
    }
  },

  // Külön gombhoz: Whisker törlése
  deleteWhiskerAction: async (fromId, toId) => {
    const key = `${fromId}_${toId}`;
    try {
      await deleteWhisker(fromId, toId);
      set((state) => {
        const updated = { ...state.whiskerMap };
        delete updated[key];
        return { whiskerMap: updated };
      });
    } catch (err) {
      console.error("Whisker deletion error:", err);
    }
  },
}));

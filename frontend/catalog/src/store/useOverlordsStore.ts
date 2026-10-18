import { create } from "zustand";
import {
  createOverlord,
  deleteOverlord,
  getMyOverlords,
  updateOverlord,
} from "@/src/services/overlordsService";
import type { ApiError, Overlord } from "@/src/types/api";

type OverlordsState = {
  overlords: Overlord[];
  isLoading: boolean;
  error: string | null;
  fetchOverlords: () => Promise<void>;
  addOverlord: (formData: FormData) => Promise<void>;
  updateOverlord: (id: number, formData: FormData) => Promise<void>;
  deleteOverlord: (id: number) => Promise<void>;
};

// Mutations rethrow so the calling modal can show the error message.
export const useOverlordsStore = create<OverlordsState>()((set) => ({
  overlords: [],
  isLoading: false,
  error: null,

  fetchOverlords: async () => {
    set({ isLoading: true, error: null });
    try {
      const overlords = await getMyOverlords();
      set({ overlords, isLoading: false });
    } catch (error) {
      console.error("Failed to fetch overlords:", error);
      set({ error: (error as ApiError).detail, isLoading: false });
    }
  },

  addOverlord: async (formData) => {
    const created = await createOverlord(formData);
    set((state) => ({ overlords: [...state.overlords, created] }));
  },

  updateOverlord: async (id, formData) => {
    const updated = await updateOverlord(id, formData);
    set((state) => ({
      overlords: state.overlords.map((o) => (o.id === id ? updated : o)),
    }));
  },

  deleteOverlord: async (id) => {
    await deleteOverlord(id);
    set((state) => ({ overlords: state.overlords.filter((o) => o.id !== id) }));
  },
}));

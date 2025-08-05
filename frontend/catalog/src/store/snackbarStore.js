// src/store/snackbarStore.js
import { create } from "zustand";

export const useSnackbarStore = create((set) => ({
  open: false,
  message: "",
  color: "success",
  showSnackbar: (message, color = "success") =>
    set({ open: true, message, color }),
  closeSnackbar: () => set({ open: false }),
}));

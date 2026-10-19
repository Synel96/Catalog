import { create } from "zustand";

type UploadState = {
  // 0..1 while a multipart request is being sent, null when unknown.
  progress: number | null;
  setProgress: (progress: number | null) => void;
};

// Fed by the axios upload-progress hook in src/services/api.ts and shown by
// UploadPreview. One upload runs at a time, so one value is enough.
export const useUploadStore = create<UploadState>()((set) => ({
  progress: null,
  setProgress: (progress) => set({ progress }),
}));

export const resetUploadProgress = () => useUploadStore.getState().setProgress(null);

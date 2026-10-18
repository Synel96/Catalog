import { create } from "zustand";
import {
  getPostReactions,
  toggleReaction,
} from "../services/reactions/reactionService";

export const useReactionStore = create((set, get) => ({
  reactions: {},

  fetchReactions: async (postId) => {
    console.log("🔄 Fetching reactions for post:", postId); // LOG
    if (!postId) {
      console.warn("⚠️ postId missing when fetching reactions");
      return;
    }

    try {
      const data = await getPostReactions(postId);
      set((state) => ({
        reactions: {
          ...state.reactions,
          [postId]: data,
        },
      }));
    } catch (error) {
      console.error("❌ Failed to fetch reactions", error);
    }
  },

  react: async (postId, overlordId, type) => {
    try {
      await toggleReaction(postId, overlordId, type);
      await get().fetchReactions(postId); // újratölti a friss countokat
    } catch (error) {
      console.error("❌ Failed to toggle reaction", error);
    }
  },
}));

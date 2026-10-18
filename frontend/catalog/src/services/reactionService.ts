import { api, toApiError } from "./api";
import type { ReactionSummary, ReactionType, ToggleReactionResult } from "@/src/types/api";

// Same type again removes the reaction, a different one replaces it.
export async function toggleReaction(
  postId: number,
  overlordId: number,
  type: ReactionType
): Promise<ToggleReactionResult> {
  try {
    const response = await api.post<ToggleReactionResult>("feed/reactions/toggle/", {
      post_id: postId,
      overlord_id: overlordId,
      type,
    });
    return response.data;
  } catch (error) {
    throw toApiError(error, "Failed to react.");
  }
}

export async function getPostReactions(postId: number): Promise<ReactionSummary> {
  try {
    const response = await api.get<ReactionSummary>("feed/reactions/by-post/", {
      params: { post_id: postId },
    });
    return response.data;
  } catch (error) {
    throw toApiError(error, "Failed to fetch reactions.");
  }
}

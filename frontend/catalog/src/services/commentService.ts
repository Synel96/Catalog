import i18n from "@/src/i18n";
import { api, toApiError } from "./api";
import type { Comment, ToggleHeartResult } from "@/src/types/api";

// `actingOverlordId` (the overlord out on the Street) fills in `hearted`.
export async function getPostComments(
  postId: number,
  actingOverlordId?: number | null
): Promise<Comment[]> {
  try {
    const response = await api.get<Comment[]>("feed/comments/", {
      params: actingOverlordId ? { post: postId, overlord: actingOverlordId } : { post: postId },
    });
    return response.data;
  } catch (error) {
    throw toApiError(error, i18n.t("errors.loadComments"));
  }
}

export async function createComment(
  postId: number,
  overlordId: number,
  content: string
): Promise<Comment> {
  try {
    const response = await api.post<Comment>("feed/comments/", {
      post: postId,
      overlord: overlordId,
      content,
    });
    return response.data;
  } catch (error) {
    throw toApiError(error, i18n.t("errors.postComment"));
  }
}

export async function updateComment(commentId: number, content: string): Promise<Comment> {
  try {
    const response = await api.patch<Comment>(`feed/comments/${commentId}/`, { content });
    return response.data;
  } catch (error) {
    throw toApiError(error, i18n.t("errors.updateComment"));
  }
}

// Gives or takes back `overlordId`'s heart on the comment.
export async function toggleCommentHeart(
  commentId: number,
  overlordId: number
): Promise<ToggleHeartResult> {
  try {
    const response = await api.post<ToggleHeartResult>(`feed/comments/${commentId}/heart/`, {
      overlord_id: overlordId,
    });
    return response.data;
  } catch (error) {
    throw toApiError(error, i18n.t("errors.heartComment"));
  }
}

export async function deleteComment(commentId: number): Promise<void> {
  try {
    await api.delete(`feed/comments/${commentId}/`);
  } catch (error) {
    throw toApiError(error, i18n.t("errors.deleteComment"));
  }
}

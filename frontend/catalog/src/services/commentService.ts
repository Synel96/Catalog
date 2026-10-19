import i18n from "@/src/i18n";
import { api, toApiError } from "./api";
import type { Comment } from "@/src/types/api";

export async function getPostComments(postId: number): Promise<Comment[]> {
  try {
    const response = await api.get<Comment[]>("feed/comments/", { params: { post: postId } });
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

export async function deleteComment(commentId: number): Promise<void> {
  try {
    await api.delete(`feed/comments/${commentId}/`);
  } catch (error) {
    throw toApiError(error, i18n.t("errors.deleteComment"));
  }
}

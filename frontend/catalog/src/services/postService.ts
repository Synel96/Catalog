import { api, toApiError } from "./api";
import type { Post } from "@/src/types/api";

// Street feed: posts of the user's own overlords and the ones they whisker.
export async function getStreetPosts(): Promise<Post[]> {
  try {
    const response = await api.get<Post[]>("feed/posts/");
    return response.data;
  } catch (error) {
    throw toApiError(error, "Failed to fetch street posts.");
  }
}

export async function getPostsByOverlord(overlordId: number): Promise<Post[]> {
  try {
    const response = await api.get<Post[]>(`feed/posts/by-overlord/${overlordId}/`);
    return response.data;
  } catch (error) {
    throw toApiError(error, "Failed to fetch posts.");
  }
}

// `formData` carries `overlord`, `content` and optionally `image`.
export async function createPost(formData: FormData): Promise<Post> {
  try {
    const response = await api.post<Post>("feed/posts/", formData);
    return response.data;
  } catch (error) {
    throw toApiError(error, "Failed to create post.");
  }
}

export async function updatePost(postId: number, formData: FormData): Promise<Post> {
  try {
    const response = await api.patch<Post>(`feed/posts/${postId}/`, formData);
    return response.data;
  } catch (error) {
    throw toApiError(error, "Failed to update post.");
  }
}

export async function deletePost(postId: number): Promise<void> {
  try {
    await api.delete(`feed/posts/${postId}/`);
  } catch (error) {
    throw toApiError(error, "Failed to delete post.");
  }
}

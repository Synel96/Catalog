import i18n from "@/src/i18n";
import { api, toApiError } from "./api";
import type { CursorPage, Post } from "@/src/types/api";

// One page of a feed; `next` is the cursor of the following page.
export type PostPage = { posts: Post[]; next: string | null };

function toPostPage(page: CursorPage<Post>): PostPage {
  const next = page.next ? new URL(page.next, "http://x").searchParams.get("cursor") : null;
  return { posts: page.results, next };
}

// `actingOverlordId`: the overlord out on the Street, whose own reaction
// comes back as `my_reaction`. `cursor`: a page's `next`, null for the first.
const feedParams = (actingOverlordId: number | null, cursor: string | null) => ({
  ...(actingOverlordId ? { overlord: actingOverlordId } : {}),
  ...(cursor ? { cursor } : {}),
});

// Street feed: posts of the user's own overlords and the ones they whisker.
export async function getStreetPosts(
  actingOverlordId: number | null,
  cursor: string | null = null
): Promise<PostPage> {
  try {
    const response = await api.get<CursorPage<Post>>("feed/posts/", {
      params: feedParams(actingOverlordId, cursor),
    });
    return toPostPage(response.data);
  } catch (error) {
    throw toApiError(error, i18n.t("errors.fetchStreetPosts"));
  }
}

export async function getPostsByOverlord(
  overlordId: number,
  actingOverlordId: number | null,
  cursor: string | null = null
): Promise<PostPage> {
  try {
    const response = await api.get<CursorPage<Post>>(`feed/posts/by-overlord/${overlordId}/`, {
      params: feedParams(actingOverlordId, cursor),
    });
    return toPostPage(response.data);
  } catch (error) {
    throw toApiError(error, i18n.t("errors.fetchPosts"));
  }
}

// `formData` carries `overlord`, `content` and optionally `image`.
export async function createPost(formData: FormData): Promise<Post> {
  try {
    const response = await api.post<Post>("feed/posts/", formData);
    return response.data;
  } catch (error) {
    throw toApiError(error, i18n.t("errors.createPost"));
  }
}

export async function updatePost(postId: number, formData: FormData): Promise<Post> {
  try {
    const response = await api.patch<Post>(`feed/posts/${postId}/`, formData);
    return response.data;
  } catch (error) {
    throw toApiError(error, i18n.t("errors.updatePost"));
  }
}

export async function deletePost(postId: number): Promise<void> {
  try {
    await api.delete(`feed/posts/${postId}/`);
  } catch (error) {
    throw toApiError(error, i18n.t("errors.deletePost"));
  }
}

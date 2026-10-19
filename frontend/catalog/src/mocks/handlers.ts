import { delay, http, HttpResponse } from "msw";
import { MOCK_FEED_EVENT } from "@/components/site";
import type { ReactionType } from "@/src/types/api";
import { readForm } from "./forms";
import { addComment, counterComment, notify, reactToNewPost } from "./chatter";
import {
  currentUser,
  db,
  ME,
  nextId,
  persist,
  reactionSummary,
  toComment,
  toNotification,
  toOverlord,
  toPost,
} from "./db";

// Mirrors the Django endpoints the app calls (see src/services). Relative
// paths match against the page's own origin, where API_URL points in mock mode.
const API = "/api";
// Feels like a network in the demo; tests (Vitest's "test" mode) skip it.
const LATENCY_MS = import.meta.env.MODE === "test" ? 0 : 300;

const unauthorized = () =>
  HttpResponse.json({ detail: "Authentication credentials were not provided." }, { status: 401 });
const notFound = () => HttpResponse.json({ detail: "Not found." }, { status: 404 });
const badRequest = (detail: string) => HttpResponse.json([detail], { status: 400 });

// Tells open feeds to refetch, like the backend's Channels socket does after
// a new post (backend/catalog/feed/consumers.py). See use-feed-socket.ts.
const announce = (overlordId: number, postId: number) => {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent(MOCK_FEED_EVENT, {
      detail: {
        type: "post_update",
        message: "Feed updated",
        overlord: overlordId,
        post_id: postId,
      },
    })
  );
};

// `?overlord=<id>`: one overlord's notifications (see NotificationViewSet).
function overlordParam(request: Request): number | null {
  const value = new URL(request.url).searchParams.get("overlord");
  return value === null ? null : Number(value);
}

const isMine = (overlordId: number) =>
  db.overlords.some((o) => o.id === overlordId && o.slave === ME);

// Uploaded files become data URLs. Avoids FileReader and `instanceof
// File` so it also works under Node (component tests), where the request's
// File class isn't the page's.
async function readFile(file: Blob): Promise<string> {
  const bytes = new Uint8Array(await file.arrayBuffer());
  let binary = "";
  for (let i = 0; i < bytes.length; i += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  }
  return `data:${file.type || "application/octet-stream"};base64,${btoa(binary)}`;
}

const isFile = (value: FormDataEntryValue | null): value is File =>
  typeof value === "object" && value !== null && "arrayBuffer" in value;

// Applies multipart fields the way a DRF PATCH would: only sent keys change.
async function applyForm<T extends object>(
  target: T,
  form: FormData,
  keys: (keyof T & string)[],
  fileKey: "avatar" | "image"
) {
  for (const key of keys) {
    const value = form.get(key);
    if (typeof value === "string") Object.assign(target, { [key]: value });
  }
  const file = form.get(fileKey);
  if (isFile(file) && file.size > 0) {
    Object.assign(target, { [fileKey]: await readFile(file) });
  }
}

const authHandlers = [
  http.post(`${API}/auth/login/`, async ({ request }) => {
    const { username, password } = (await request.json()) as {
      username?: string;
      password?: string;
    };
    if (!username || !password) {
      return HttpResponse.json(
        { detail: "No active account found with the given credentials" },
        { status: 401 }
      );
    }
    // Any credentials work; the demo user takes on the entered name.
    db.loggedIn = true;
    db.user.username = username;
    persist();
    return HttpResponse.json({ detail: "Login successful" });
  }),

  http.post(`${API}/auth/register/`, async ({ request }) => {
    const { username, email } = (await request.json()) as { username: string; email: string };
    db.user.username = username;
    db.user.email = email;
    persist();
    return HttpResponse.json({ username, email }, { status: 201 });
  }),

  http.post(`${API}/auth/logout/`, () => {
    db.loggedIn = false;
    persist();
    return HttpResponse.json({ detail: "Logged out" });
  }),

  http.post(`${API}/auth/refresh/`, () =>
    db.loggedIn ? HttpResponse.json({ detail: "Token refreshed" }) : unauthorized()
  ),
];

const profileHandlers = [
  http.get(`${API}/profiles/me/`, () =>
    db.loggedIn ? HttpResponse.json(currentUser()) : unauthorized()
  ),

  http.patch(`${API}/profiles/me/`, async ({ request }) => {
    if (!db.loggedIn) return unauthorized();
    await applyForm(
      db.user,
      await readForm(request),
      ["username", "email", "first_name", "last_name", "bio"],
      "avatar"
    );
    persist();
    return HttpResponse.json(currentUser());
  }),

  // Without `search` only the user's own overlords; with it, everyone's.
  http.get(`${API}/profiles/overlords/`, ({ request }) => {
    if (!db.loggedIn) return unauthorized();
    const search = new URL(request.url).searchParams.get("search")?.toLowerCase();
    const overlords = db.overlords
      .map(toOverlord)
      .filter((o) =>
        search
          ? [o.name, o.breed, o.slave_name ?? ""].some((v) => v.toLowerCase().includes(search))
          : o.slave === ME
      );
    return HttpResponse.json(overlords);
  }),

  http.get(`${API}/profiles/overlords/:id/`, ({ params }) => {
    if (!db.loggedIn) return unauthorized();
    const overlord = db.overlords.find((o) => o.id === Number(params.id));
    return overlord ? HttpResponse.json(toOverlord(overlord)) : notFound();
  }),

  http.post(`${API}/profiles/overlords/`, async ({ request }) => {
    if (!db.loggedIn) return unauthorized();
    const overlord = { id: nextId(), name: "", avatar: null, bio: "", breed: "", slave: ME };
    await applyForm(overlord, await readForm(request), ["name", "bio", "breed"], "avatar");
    if (!overlord.name) {
      return HttpResponse.json({ name: ["This field is required."] }, { status: 400 });
    }
    db.overlords.push(overlord);
    persist();
    return HttpResponse.json(toOverlord(overlord), { status: 201 });
  }),

  http.patch(`${API}/profiles/overlords/:id/`, async ({ request, params }) => {
    if (!db.loggedIn) return unauthorized();
    const overlord = db.overlords.find((o) => o.id === Number(params.id) && o.slave === ME);
    if (!overlord) return notFound();
    await applyForm(overlord, await readForm(request), ["name", "bio", "breed"], "avatar");
    persist();
    return HttpResponse.json(toOverlord(overlord));
  }),

  http.delete(`${API}/profiles/overlords/:id/`, ({ params }) => {
    if (!db.loggedIn) return unauthorized();
    db.overlords = db.overlords.filter((o) => !(o.id === Number(params.id) && o.slave === ME));
    persist();
    return new HttpResponse(null, { status: 204 });
  }),
];

const byNewest = (a: { created_at: string }, b: { created_at: string }) =>
  b.created_at.localeCompare(a.created_at);

const postHandlers = [
  // feed/views.py PostViewSet.get_queryset: own overlords + whiskered ones.
  http.get(`${API}/feed/posts/`, () => {
    if (!db.loggedIn) return unauthorized();
    const own = db.overlords.filter((o) => o.slave === ME).map((o) => o.id);
    const whiskered = db.whiskers.filter((w) => own.includes(w.from)).map((w) => w.to);
    const visible = new Set([...own, ...whiskered]);
    return HttpResponse.json(
      db.posts
        .filter((p) => visible.has(p.overlord))
        .sort(byNewest)
        .map(toPost)
    );
  }),

  http.get(`${API}/feed/posts/by-overlord/:id/`, ({ params }) => {
    if (!db.loggedIn) return unauthorized();
    return HttpResponse.json(
      db.posts
        .filter((p) => p.overlord === Number(params.id))
        .sort(byNewest)
        .map(toPost)
    );
  }),

  http.post(`${API}/feed/posts/`, async ({ request }) => {
    if (!db.loggedIn) return unauthorized();
    const form = await readForm(request);
    const overlordId = Number(form.get("overlord"));
    if (!isMine(overlordId)) return badRequest("You can only post as your own overlords.");
    const post = {
      id: nextId(),
      overlord: overlordId,
      content: String(form.get("content") ?? ""),
      image: null as string | null,
      created_at: new Date().toISOString(),
    };
    await applyForm(post, form, [], "image");
    db.posts.push(post);
    persist();
    announce(overlordId, post.id);
    reactToNewPost(post.id, overlordId, announce);
    return HttpResponse.json(toPost(post), { status: 201 });
  }),

  http.patch(`${API}/feed/posts/:id/`, async ({ request, params }) => {
    if (!db.loggedIn) return unauthorized();
    const post = db.posts.find((p) => p.id === Number(params.id));
    if (!post) return notFound();
    if (!isMine(post.overlord))
      return badRequest("You can only edit posts from your own overlords.");
    await applyForm(post, await readForm(request), ["content"], "image");
    persist();
    return HttpResponse.json(toPost(post));
  }),

  http.delete(`${API}/feed/posts/:id/`, ({ params }) => {
    if (!db.loggedIn) return unauthorized();
    const post = db.posts.find((p) => p.id === Number(params.id));
    if (!post) return notFound();
    if (!isMine(post.overlord))
      return badRequest("You can only delete posts from your own overlords.");
    db.posts = db.posts.filter((p) => p !== post);
    db.reactions = db.reactions.filter((r) => r.post !== post.id);
    db.comments = db.comments.filter((c) => c.post !== post.id);
    persist();
    return new HttpResponse(null, { status: 204 });
  }),
];

const reactionHandlers = [
  // feed/views.py ToggleReactionAPIView
  http.post(`${API}/feed/reactions/toggle/`, async ({ request }) => {
    if (!db.loggedIn) return unauthorized();
    const { post_id, overlord_id, type } = (await request.json()) as {
      post_id: number;
      overlord_id: number;
      type: ReactionType;
    };
    if (!isMine(overlord_id))
      return HttpResponse.json({ error: "Invalid overlord" }, { status: 403 });
    const existing = db.reactions.find((r) => r.post === post_id && r.overlord === overlord_id);
    let status: "reacted" | "updated" | "unreacted";
    if (!existing) {
      db.reactions.push({ post: post_id, overlord: overlord_id, type });
      status = "reacted";
      const post = db.posts.find((p) => p.id === post_id);
      const label = { purrfect: "Purrfect", hisss: "Hisss", ekekekek: "Ekekekek", nap: "Overnap" }[
        type
      ];
      if (post) {
        const name = db.overlords.find((o) => o.id === overlord_id)?.name;
        notify(overlord_id, post.overlord, `${name} reacted ${label} to your post.`, post.overlord);
      }
    } else if (existing.type === type) {
      db.reactions = db.reactions.filter((r) => r !== existing);
      status = "unreacted";
    } else {
      existing.type = type;
      status = "updated";
    }
    persist();
    return HttpResponse.json({ status });
  }),

  http.get(`${API}/feed/reactions/by-post/`, ({ request }) => {
    if (!db.loggedIn) return unauthorized();
    const postId = Number(new URL(request.url).searchParams.get("post_id"));
    return HttpResponse.json(reactionSummary(postId));
  }),
];

const whiskerHandlers = [
  http.post(`${API}/feed/whiskers/`, async ({ request }) => {
    if (!db.loggedIn) return unauthorized();
    const { from_overlord: from, to_overlord: to } = (await request.json()) as {
      from_overlord: number;
      to_overlord: number;
    };
    if (!isMine(from)) return badRequest("You can only whisker from your own overlords.");
    if (from === to) return badRequest("An overlord cannot whisker itself.");
    if (db.whiskers.some((w) => w.from === from && w.to === to)) {
      return badRequest("This whiskering already exists.");
    }
    db.whiskers.push({ from, to });
    notify(
      from,
      to,
      `${db.overlords.find((o) => o.id === from)?.name} started whiskering ${db.overlords.find((o) => o.id === to)?.name}.`,
      from
    );
    persist();
    return HttpResponse.json({ from_overlord: from, to_overlord: to }, { status: 201 });
  }),

  http.get(`${API}/feed/whiskers/status/`, ({ request }) => {
    if (!db.loggedIn) return unauthorized();
    const params = new URL(request.url).searchParams;
    const from = Number(params.get("from"));
    const to = Number(params.get("to"));
    return HttpResponse.json({ exists: db.whiskers.some((w) => w.from === from && w.to === to) });
  }),

  http.delete(`${API}/feed/whiskers/remove/`, ({ request }) => {
    if (!db.loggedIn) return unauthorized();
    const params = new URL(request.url).searchParams;
    const from = Number(params.get("from"));
    const to = Number(params.get("to"));
    const before = db.whiskers.length;
    db.whiskers = db.whiskers.filter((w) => !(w.from === from && w.to === to && isMine(w.from)));
    if (db.whiskers.length === before) {
      return HttpResponse.json({ detail: "Whisker not found." }, { status: 404 });
    }
    persist();
    return new HttpResponse(null, { status: 204 });
  }),
];

const commentHandlers = [
  // ?post= lists everyone's comments under a post; otherwise only the user's.
  http.get(`${API}/feed/comments/`, ({ request }) => {
    if (!db.loggedIn) return unauthorized();
    const postId = Number(new URL(request.url).searchParams.get("post"));
    const comments = postId
      ? db.comments.filter((c) => c.post === postId)
      : db.comments.filter((c) => isMine(c.overlord));
    return HttpResponse.json(
      [...comments].sort((a, b) => a.created_at.localeCompare(b.created_at)).map(toComment)
    );
  }),

  http.post(`${API}/feed/comments/`, async ({ request }) => {
    if (!db.loggedIn) return unauthorized();
    const { post, overlord, content } = (await request.json()) as {
      post: number;
      overlord: number;
      content: string;
    };
    if (!isMine(overlord)) return badRequest("You can only comment with your own overlords.");
    if (!content?.trim()) {
      return HttpResponse.json({ content: ["This field may not be blank."] }, { status: 400 });
    }
    const comment = addComment(overlord, post, content);
    persist();
    counterComment(post, overlord, announce);
    return HttpResponse.json(toComment(comment), { status: 201 });
  }),

  http.patch(`${API}/feed/comments/:id/`, async ({ request, params }) => {
    if (!db.loggedIn) return unauthorized();
    const comment = db.comments.find((c) => c.id === Number(params.id) && isMine(c.overlord));
    if (!comment) return notFound();
    const { content } = (await request.json()) as { content?: string };
    if (content) comment.content = content;
    persist();
    return HttpResponse.json(toComment(comment));
  }),

  http.delete(`${API}/feed/comments/:id/`, ({ params }) => {
    if (!db.loggedIn) return unauthorized();
    const comment = db.comments.find((c) => c.id === Number(params.id) && isMine(c.overlord));
    if (!comment) return notFound();
    db.comments = db.comments.filter((c) => c !== comment);
    persist();
    return new HttpResponse(null, { status: 204 });
  }),
];

const notificationHandlers = [
  http.get(`${API}/feed/notifications/`, ({ request }) => {
    if (!db.loggedIn) return unauthorized();
    const onlyFor = overlordParam(request);
    return HttpResponse.json(
      db.notifications
        .filter((n) => isMine(n.overlord) && (onlyFor === null || n.overlord === onlyFor))
        .sort((a, b) => b.created_at.localeCompare(a.created_at))
        .map(toNotification)
    );
  }),

  http.post(`${API}/feed/notifications/mark-all-read/`, ({ request }) => {
    if (!db.loggedIn) return unauthorized();
    const onlyFor = overlordParam(request);
    let updated = 0;
    for (const n of db.notifications) {
      if (isMine(n.overlord) && (onlyFor === null || n.overlord === onlyFor) && !n.is_read) {
        n.is_read = true;
        updated++;
      }
    }
    persist();
    return HttpResponse.json({ updated });
  }),

  http.patch(`${API}/feed/notifications/:id/`, async ({ request, params }) => {
    if (!db.loggedIn) return unauthorized();
    const notification = db.notifications.find(
      (n) => n.id === Number(params.id) && isMine(n.overlord)
    );
    if (!notification) return notFound();
    const { is_read } = (await request.json()) as { is_read?: boolean };
    if (typeof is_read === "boolean") notification.is_read = is_read;
    persist();
    return HttpResponse.json(toNotification(notification));
  }),
];

export const handlers = [
  http.all(`${API}/*`, async () => {
    await delay(LATENCY_MS);
  }),
  ...authHandlers,
  ...profileHandlers,
  ...postHandlers,
  ...reactionHandlers,
  ...whiskerHandlers,
  ...commentHandlers,
  ...notificationHandlers,
];

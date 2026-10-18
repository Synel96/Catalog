import { delay, http, HttpResponse } from "msw";
import type { Overlord, User } from "@/src/types/api";
import { currentUser, db, persist } from "./db";

// Mirrors the Django endpoints the app calls (see src/services). Relative
// paths match against the page's own origin, where API_URL points in mock mode.
const API = "/api";
const LATENCY_MS = 300;

const unauthorized = () =>
  HttpResponse.json({ detail: "Authentication credentials were not provided." }, { status: 401 });

function readFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

// Applies multipart fields the same way a DRF PATCH would: only sent keys change.
async function applyForm<T extends object>(target: T, form: FormData, keys: (keyof T & string)[]) {
  for (const key of keys) {
    const value = form.get(key);
    if (typeof value === "string") Object.assign(target, { [key]: value });
  }
  const avatar = form.get("avatar");
  if (avatar instanceof File && avatar.size > 0) {
    Object.assign(target, { avatar: await readFile(avatar) });
  }
}

export const handlers = [
  http.all(`${API}/*`, async () => {
    await delay(LATENCY_MS);
  }),

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

  http.get(`${API}/profiles/me/`, () =>
    db.loggedIn ? HttpResponse.json<User>(currentUser()) : unauthorized()
  ),

  http.patch(`${API}/profiles/me/`, async ({ request }) => {
    if (!db.loggedIn) return unauthorized();
    await applyForm(db.user, await request.formData(), [
      "username",
      "email",
      "first_name",
      "last_name",
      "bio",
    ]);
    persist();
    return HttpResponse.json<User>(currentUser());
  }),

  http.get(`${API}/profiles/overlords/`, () =>
    db.loggedIn ? HttpResponse.json<Overlord[]>(db.overlords) : unauthorized()
  ),

  http.post(`${API}/profiles/overlords/`, async ({ request }) => {
    if (!db.loggedIn) return unauthorized();
    const overlord: Overlord = {
      id: db.nextOverlordId++,
      name: "",
      avatar: null,
      bio: "",
      breed: "",
      slave: db.user.id,
    };
    await applyForm(overlord, await request.formData(), ["name", "bio", "breed"]);
    if (!overlord.name) {
      return HttpResponse.json({ name: ["This field is required."] }, { status: 400 });
    }
    db.overlords.push(overlord);
    persist();
    return HttpResponse.json<Overlord>(overlord, { status: 201 });
  }),

  http.patch(`${API}/profiles/overlords/:id/`, async ({ request, params }) => {
    if (!db.loggedIn) return unauthorized();
    const overlord = db.overlords.find((o) => o.id === Number(params.id));
    if (!overlord) return HttpResponse.json({ detail: "Not found." }, { status: 404 });
    await applyForm(overlord, await request.formData(), ["name", "bio", "breed"]);
    persist();
    return HttpResponse.json<Overlord>(overlord);
  }),

  http.delete(`${API}/profiles/overlords/:id/`, ({ params }) => {
    if (!db.loggedIn) return unauthorized();
    db.overlords = db.overlords.filter((o) => o.id !== Number(params.id));
    persist();
    return new HttpResponse(null, { status: 204 });
  }),
];

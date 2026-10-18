import type { Overlord, Post, ReactionType, User } from "@/src/types/api";

// In-memory stand-in for the Django database, kept in sessionStorage so
// created/edited data survives reloads within a tab. Bump the key when the
// shape changes so stale tabs start from the new seed.
const STORAGE_KEY = "catalog-mock-db-v3";

export const ME = 1;

type StoredOverlord = Omit<
  Overlord,
  | "slave_name"
  | "whiskered_by_count"
  | "whiskering_count"
  | "whiskered_by_names"
  | "whiskering_names"
>;
type StoredPost = Omit<Post, "overlord_name" | "overlord_avatar" | "reaction_summary">;
type StoredReaction = { overlord: number; post: number; type: ReactionType };
type StoredWhisker = { from: number; to: number };

export type MockDb = {
  loggedIn: boolean;
  user: Omit<User, "overlords">;
  // Other slaves, only needed for `slave_name`.
  slaves: Record<number, string>;
  overlords: StoredOverlord[];
  posts: StoredPost[];
  reactions: StoredReaction[];
  whiskers: StoredWhisker[];
  nextId: number;
};

const hoursAgo = (h: number) => new Date(Date.now() - h * 3_600_000).toISOString();

function seed(): MockDb {
  return {
    loggedIn: false,
    user: {
      id: ME,
      username: "demo",
      email: "demo@catalog.dev",
      first_name: "Demo",
      last_name: "Slave",
      bio: "Professional can opener. Available 24/7.",
      // Empty avatars fall back to the backend's placeholders, which mock
      // mode serves from public/media/placeholders/.
      avatar: null,
      date_joined: "2025-07-01T10:00:00Z",
    },
    slaves: { 2: "jon", 3: "marge" },
    overlords: [
      {
        id: 1,
        name: "Mirci",
        avatar: null,
        bio: "Rules the sofa with an iron paw.",
        breed: "Tabby",
        slave: ME,
      },
      {
        id: 2,
        name: "Cirmi",
        avatar: null,
        bio: "Knocks things off tables for science.",
        breed: "British Shorthair",
        slave: ME,
      },
      {
        id: 3,
        name: "Garfield",
        avatar: null,
        bio: "Hates Mondays. Loves lasagna.",
        breed: "Orange Tabby",
        slave: 2,
      },
      {
        id: 4,
        name: "Snowball",
        avatar: null,
        bio: "Professional napper.",
        breed: "Persian",
        slave: 3,
      },
    ],
    posts: [
      {
        id: 1,
        overlord: 3,
        content: "Monday again. I refuse.",
        image: null,
        created_at: hoursAgo(2),
      },
      {
        id: 2,
        overlord: 1,
        content: "Caught a sunbeam today. 10/10 would nap again.",
        image: "/slide5.png",
        created_at: hoursAgo(5),
      },
      {
        id: 3,
        overlord: 2,
        content: "The vase had it coming.",
        image: null,
        created_at: hoursAgo(26),
      },
    ],
    reactions: [
      { overlord: 2, post: 2, type: "purrfect" },
      { overlord: 3, post: 2, type: "purrfect" },
      { overlord: 1, post: 1, type: "ekekekek" },
    ],
    whiskers: [
      { from: 1, to: 3 },
      { from: 3, to: 1 },
    ],
    nextId: 100,
  };
}

function load(): MockDb {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as MockDb;
  } catch {
    // Unavailable or corrupt storage: start from the seed.
  }
  return seed();
}

export const db: MockDb = load();

export function persist() {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(db));
  } catch {
    // Quota exceeded (large uploaded images): keep the data in memory only.
  }
}

export const nextId = () => db.nextId++;

// The serializers' computed fields (profiles/serializers.py, feed/serializers.py).

export function toOverlord(o: StoredOverlord): Overlord {
  const name = (id: number) => db.overlords.find((x) => x.id === id)?.name ?? "?";
  const whiskeredBy = db.whiskers.filter((w) => w.to === o.id);
  const whiskering = db.whiskers.filter((w) => w.from === o.id);
  return {
    ...o,
    slave_name: o.slave === ME ? db.user.username : db.slaves[o.slave],
    whiskered_by_count: whiskeredBy.length,
    whiskering_count: whiskering.length,
    whiskered_by_names: whiskeredBy.map((w) => name(w.from)),
    whiskering_names: whiskering.map((w) => name(w.to)),
  };
}

export function reactionSummary(postId: number) {
  const summary: Partial<Record<ReactionType, number>> = {};
  for (const r of db.reactions) {
    if (r.post === postId) summary[r.type] = (summary[r.type] ?? 0) + 1;
  }
  return summary;
}

export function toPost(p: StoredPost): Post {
  const overlord = db.overlords.find((o) => o.id === p.overlord);
  return {
    ...p,
    overlord_name: overlord?.name ?? "?",
    overlord_avatar: overlord?.avatar ?? null,
    reaction_summary: reactionSummary(p.id),
  };
}

export function currentUser(): User {
  return { ...db.user, overlords: db.overlords.filter((o) => o.slave === ME).map(toOverlord) };
}

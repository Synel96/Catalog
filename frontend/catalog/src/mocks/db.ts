import type { Overlord, Post, ReactionType, User } from "@/src/types/api";

// In-memory stand-in for the Django database, kept in sessionStorage so
// created/edited data survives reloads within a tab. Bump the key when the
// shape changes so stale tabs start from the new seed.
const STORAGE_KEY = "catalog-mock-db-v4";

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

// Other slaves and their overlords, so the Street, search and whiskers have
// someone besides the logged-in user to interact with.
const SLAVES: Record<number, string> = {
  2: "jon",
  3: "marge",
  4: "hermione",
  5: "sabrina",
  6: "tom_odie",
  7: "zsofi",
};

// [id, name, breed, bio, slave]; ids 1-2 belong to the logged-in user.
const OVERLORDS: [number, string, string, string, number][] = [
  [1, "Mirci", "Tabby", "Rules the sofa with an iron paw.", ME],
  [2, "Cirmi", "British Shorthair", "Knocks things off tables for science.", ME],
  [3, "Garfield", "Orange Tabby", "Hates Mondays. Loves lasagna.", 2],
  [4, "Snowball", "Persian", "Professional napper.", 3],
  [5, "Crookshanks", "Half-Kneazle", "Excellent judge of character. Suspicious of rats.", 4],
  [6, "Salem", "American Shorthair", "Former warlock. Current menace.", 5],
  [7, "Luna", "Bombay", "Moonlight enthusiast, 3 a.m. zoomies specialist.", 5],
  [8, "Tom", "Russian Blue", "Still chasing that mouse. Any day now.", 6],
  [9, "Nermal", "Exotic Shorthair", "World's cutest kitten, allegedly.", 2],
  [10, "Bundás", "Maine Coon", "Fluffier than your sofa cushion.", 7],
  [11, "Pötyi", "Calico", "Small. Loud. In charge.", 7],
  [12, "Duchess", "Turkish Angora", "Only drinks from crystal bowls.", 3],
];

// [id, overlord, content, image, hours ago]
const POSTS: [number, number, string, string | null, number][] = [
  [1, 3, "Monday again. I refuse.", null, 2],
  [2, 1, "Caught a sunbeam today. 10/10 would nap again.", "/slide5.png", 5],
  [3, 2, "The vase had it coming.", null, 26],
  [4, 5, "Found a rat in the dormitory. Nobody believes me.", null, 1],
  [5, 6, "Tried to take over the world again. Got distracted by a string.", null, 3],
  [6, 7, "It is 3 a.m. Time to run laps through the hallway.", null, 7],
  [7, 8, "Mouse: 1, me: 0. Rematch tomorrow.", null, 9],
  [8, 9, "Cute and I know it. 💅", null, 12],
  [9, 10, "My slave bought a new sofa. I have claimed it.", "/slide3.png", 15],
  [10, 11, "Screamed at the fridge for 20 minutes. It worked.", null, 20],
  [11, 12, "This water is not served in crystal. I am appalled.", null, 30],
  [12, 4, "Nap report: excellent.", null, 33],
  [13, 3, "Lasagna status: missing. Suspect: Odie.", null, 40],
  [14, 7, "Knocked a plant over. It was looking at me.", "/slide4.png", 50],
];

// [overlord, post, type]
const REACTIONS: [number, number, ReactionType][] = [
  [2, 2, "purrfect"],
  [3, 2, "purrfect"],
  [7, 2, "ekekekek"],
  [1, 1, "ekekekek"],
  [9, 1, "hisss"],
  [12, 1, "nap"],
  [6, 4, "ekekekek"],
  [7, 5, "purrfect"],
  [10, 5, "hisss"],
  [4, 6, "nap"],
  [11, 6, "ekekekek"],
  [3, 7, "nap"],
  [5, 9, "purrfect"],
  [11, 9, "purrfect"],
  [8, 10, "hisss"],
  [10, 10, "purrfect"],
  [6, 11, "hisss"],
  [3, 13, "ekekekek"],
  [6, 14, "purrfect"],
];

// [from, to]: Mirci and Cirmi whisker a few others so the Street feed has
// posts from beyond the user's own overlords; the rest add follower counts.
const WHISKERS: [number, number][] = [
  [1, 3],
  [1, 5],
  [1, 7],
  [2, 8],
  [2, 10],
  [3, 1],
  [5, 1],
  [6, 7],
  [7, 6],
  [8, 3],
  [9, 3],
  [10, 11],
  [11, 10],
  [12, 4],
  [4, 2],
];

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
    slaves: SLAVES,
    overlords: OVERLORDS.map(([id, name, breed, bio, slave]) => ({
      id,
      name,
      breed,
      bio,
      slave,
      avatar: null,
    })),
    posts: POSTS.map(([id, overlord, content, image, hours]) => ({
      id,
      overlord,
      content,
      image,
      created_at: hoursAgo(hours),
    })),
    reactions: REACTIONS.map(([overlord, post, type]) => ({ overlord, post, type })),
    whiskers: WHISKERS.map(([from, to]) => ({ from, to })),
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

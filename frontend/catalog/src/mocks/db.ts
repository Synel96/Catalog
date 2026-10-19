import type { Comment, Notification, Overlord, Post, ReactionType, User } from "@/src/types/api";

// In-memory stand-in for the Django database, kept in sessionStorage so
// created/edited data survives reloads within a tab. Bump the key when the
// shape changes so stale tabs start from the new seed.
const STORAGE_KEY = "catalog-mock-db-v5";

export const ME = 1;

type StoredOverlord = Omit<
  Overlord,
  | "slave_name"
  | "whiskered_by_count"
  | "whiskering_count"
  | "whiskered_by_names"
  | "whiskering_names"
>;
type StoredPost = Omit<
  Post,
  "overlord_name" | "overlord_avatar" | "reaction_summary" | "my_reaction" | "comment_count"
>;
type StoredComment = Omit<Comment, "overlord_name" | "heart_count" | "hearted">;
type StoredHeart = { overlord: number; comment: number };
type StoredNotification = Omit<Notification, "overlord_name">;
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
  comments: StoredComment[];
  hearts: StoredHeart[];
  notifications: StoredNotification[];
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
  [15, 6, "Hot take: dogs are just cats that failed the entrance exam.", null, 4],
  [16, 10, "Petition to make 5 a.m. breakfast a human right. For cats.", null, 6],
  [17, 2, "Sat in a box that was clearly too small. Worth it.", null, 8],
  [18, 5, "Reminder: the red dot is NOT a conspiracy. (It is.)", null, 11],
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

// [id, overlord, post, content, hours ago]: little back-and-forth threads.
const COMMENTS: [number, number, number, string, number][] = [
  [1, 9, 1, "Mondays are a construct invented by alarm clocks.", 1.8],
  [2, 3, 1, "Nermal, nobody asked. Go be cute somewhere else.", 1.7],
  [3, 9, 1, "Too late, already cute here. 💅", 1.6],
  [4, 3, 2, "A sunbeam? In THIS economy?", 4.5],
  [5, 7, 2, "Share the coordinates or it didn't happen.", 4.2],
  [6, 1, 2, "Coordinates are classified. Bring tuna and we'll talk.", 4],
  [7, 6, 4, "Rats are just very small, very rude roommates.", 0.8],
  [8, 5, 4, "Says the one who once got outsmarted by a vacuum cleaner.", 0.6],
  [9, 6, 4, "We agreed never to speak of the vacuum. 😾", 0.5],
  [10, 8, 15, "Excuse me, I lose to a mouse daily and even I find this rude.", 3.5],
  [11, 6, 15, "Tom, the mouse is winning on points, not on merit.", 3.2],
  [12, 11, 16, "Seconded. Also 4 a.m. second breakfast.", 5.5],
  [13, 10, 16, "Pötyi, you scream at the fridge. You're not helping our case.", 5.2],
  [14, 11, 16, "IT WORKED THOUGH.", 5],
  [15, 3, 17, "If it fits, you sits. If it doesn't, you sits harder.", 7.5],
  [16, 12, 17, "A box? How terribly common. I only sit in hatboxes.", 7],
  [17, 2, 17, "Duchess, the hatbox is just a box with ambition.", 6.8],
  [18, 4, 18, "I sleep through the red dot. That's how it loses.", 10],
];

// [overlord, comment]: hearts on comments.
const HEARTS: [number, number][] = [
  [3, 6],
  [7, 6],
  [9, 2],
  [3, 17],
  [11, 13],
];

// Notifications the seeded activity above would have created for the
// user's overlords (Mirci 1, Cirmi 2), as the backend does.
const NOTIFICATIONS: [number, number, string, number, boolean, number][] = [
  // [id, overlord, message, link overlord, is_read, hours ago]
  [1, 1, "Garfield commented on your post: \u201cA sunbeam? In THIS economy?\u201d", 1, false, 4.5],
  [
    2,
    1,
    "Luna commented on your post: \u201cShare the coordinates or it didn't happen.\u201d",
    1,
    false,
    4.2,
  ],
  [3, 1, "Luna reacted Ekekekek to your post.", 1, false, 4.6],
  [
    4,
    2,
    "Garfield commented on your post: \u201cIf it fits, you sits. If it doesn't, you...\u201d",
    2,
    true,
    7.5,
  ],
  [
    5,
    2,
    "Duchess commented on your post: \u201cA box? How terribly common. I only sit in...\u201d",
    2,
    false,
    7,
  ],
  [6, 1, "Crookshanks started whiskering Mirci.", 5, true, 20],
  [7, 2, "Snowball started whiskering Cirmi.", 4, true, 30],
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
    comments: COMMENTS.map(([id, overlord, post, content, hours]) => ({
      id,
      overlord,
      post,
      content,
      created_at: hoursAgo(hours),
    })),
    hearts: HEARTS.map(([overlord, comment]) => ({ overlord, comment })),
    notifications: NOTIFICATIONS.map(([id, overlord, message, linkTo, isRead, hours]) => ({
      id,
      overlord,
      message,
      link: `/overlord?id=${linkTo}`,
      is_read: isRead,
      created_at: hoursAgo(hours),
    })),
    nextId: 100,
  };
}

function load(): MockDb {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    // Seed first: tables added since the tab saved its copy start seeded.
    if (raw) return { ...seed(), ...(JSON.parse(raw) as Partial<MockDb>) };
  } catch {
    // Unavailable or corrupt storage: start from the seed.
  }
  return seed();
}

export const db: MockDb = load();

// Back to the seed, e.g. between tests.
export function resetMockDb() {
  Object.assign(db, seed());
  persist();
}

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

// `acting`: the overlord out on the Street (`?overlord=`), see
// feed/views.py ActingOverlordMixin.
export function toPost(p: StoredPost, acting: number | null = null): Post {
  const overlord = db.overlords.find((o) => o.id === p.overlord);
  return {
    ...p,
    overlord_name: overlord?.name ?? "?",
    overlord_avatar: overlord?.avatar ?? null,
    reaction_summary: reactionSummary(p.id),
    my_reaction:
      db.reactions.find((r) => r.post === p.id && acting !== null && r.overlord === acting)?.type ??
      null,
    comment_count: db.comments.filter((c) => c.post === p.id).length,
  };
}

export function currentUser(): User {
  return { ...db.user, overlords: db.overlords.filter((o) => o.slave === ME).map(toOverlord) };
}

export const overlordName = (id: number) => db.overlords.find((o) => o.id === id)?.name ?? "?";

export function toComment(c: StoredComment, acting: number | null = null): Comment {
  const hearts = db.hearts.filter((h) => h.comment === c.id);
  return {
    ...c,
    overlord_name: overlordName(c.overlord),
    heart_count: hearts.length,
    hearted: hearts.some((h) => h.overlord === acting),
  };
}

export function toNotification(n: StoredNotification): Notification {
  return { ...n, overlord_name: overlordName(n.overlord) };
}

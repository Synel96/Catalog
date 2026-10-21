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
// Titles some of the seeded overlords wear (core.models.Overlord).
const SEED_TITLES: Record<number, string> = {
  1: "sofa_lord",
  2: "catastrophe_manager",
  3: "tuna_connoisseur",
  4: "professional_napper",
  5: "paw_enforcement",
  6: "pawlitician",
  7: "zoomie_champion",
  8: "catthlete",
  9: "moms_favourite",
  10: "furniture_inspector",
  11: "meowsician",
  12: "meowketing_director",
};

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
  // Older posts (2 days to 2 weeks), enough for several pages of the feeds
  // while the first page stays the hand-written ones above.
  [19, 3, "Diet starts Monday. Which Monday is still under review.", null, 52],
  [20, 5, "Inspected the laundry basket. Found three socks and a conspiracy.", null, 60],
  [21, 7, "Moon was round tonight. I yelled at it. It did not answer.", null, 68],
  [
    22,
    8,
    "Trained all morning for the mouse rematch. Napped all afternoon to recover.",
    "/slide4.png",
    70,
  ],
  [23, 10, "The new cushion has been tested. It passes. Barely.", null, 78],
  [24, 1, "Sunbeam moved 30 cm to the left. I moved with it. Teamwork.", null, 86],
  [25, 2, "Gravity check: the remote still falls. Science is consistent.", null, 88],
  [26, 3, "Someone said 'diet' in the kitchen. I have filed a complaint.", null, 96],
  [27, 5, "Patrolled the hallway at 4 a.m. All quiet. Suspiciously quiet.", null, 104],
  [28, 7, "Ran through the flat 14 times. New personal record.", null, 106],
  [29, 8, "Mouse sighted. Mouse escaped. Mouse will remember me.", "/slide1.png", 114],
  [30, 10, "Shed exactly one sofa's worth of fur today. Productive.", null, 122],
  [31, 1, "My slave tried to sit in MY spot. We had a talk.", null, 124],
  [32, 2, "Unrolled the entire toilet paper roll. Art is never finished.", null, 132],
  [33, 3, "Lasagna found. Lasagna gone. Case closed.", null, 140],
  [34, 5, "The new neighbour's dog looks at me funny. I have opened a file.", null, 142],
  [35, 7, "Stared at a wall for an hour. Saw things you wouldn't believe.", null, 150],
  [36, 8, "Did a backflip off the bed. Nobody filmed it. Tragic.", "/slide3.png", 158],
  [37, 10, "Sat on the laptop. The email got sent. You're welcome.", null, 160],
  [38, 1, "Knead, nap, repeat. A simple life.", null, 168],
  [39, 2, "Box arrived. Contents irrelevant. Box is mine.", null, 176],
  [40, 3, "Hate Mondays. Tolerate Tuesdays. Love lasagna.", null, 178],
  [41, 5, "Caught a spider. Released it into my stomach.", null, 186],
  [42, 7, "New hiding spot: inside the duvet cover. They'll never find me.", null, 194],
  [43, 8, "Sprinted down the hallway at full speed for no reason. Felt right.", "/slide5.png", 196],
  [44, 10, "Brushing session today. I allowed exactly 11 strokes.", null, 204],
  [45, 1, "The vacuum is out. I am not. Goodbye.", null, 212],
  [46, 2, "Pushed a glass to the edge. Waited. Made eye contact. Pushed.", null, 214],
  [47, 3, "Woke up. Ate. Slept. Ate again. Living the dream.", null, 222],
  [48, 5, "The postman came again. I warned everyone. Nobody listened.", null, 230],
  [49, 7, "Hissed at my own reflection. It hissed back. Respect.", null, 232],
  [
    50,
    8,
    "Jumped onto the fridge. Couldn't get down. Pretended it was the plan.",
    "/slide2.png",
    240,
  ],
  [51, 10, "Fur on the black trousers: placed with love.", null, 248],
  [52, 1, "Rainy day. Window watch shift: 6 hours. Overtime unpaid.", null, 250],
  [53, 2, "Tested the curtains for climbability. They passed. The curtain rod did not.", null, 258],
  [54, 3, "If it fits, I sits. If it doesn't, I sits harder.", null, 266],
  [55, 5, "Rat count this week: 0. Coincidence? I think not.", null, 268],
  [56, 7, "3 a.m. concert went well. The neighbours applauded with the wall.", null, 276],
  [57, 8, "The mouse left a note. I can't read. War continues.", "/slide4.png", 284],
  [58, 10, "Demanded breakfast at 5. Got it at 5:01. Unacceptable.", null, 286],
  [59, 4, "Napped through an earthquake drill. Champion.", null, 294],
  [60, 6, "Campaign promise: more tuna. Delivered: a nap.", null, 302],
  [61, 9, "Got called cute 47 times today. Below average.", null, 304],
  [62, 11, "Sang the song of my people at 4 a.m. Encore requested by no one.", null, 312],
  [63, 12, "The water bowl was not crystal. Again. I am writing to the management.", null, 320],
  [64, 1, "Today's mood: loaf.", "/slide1.png", 322],
  [65, 2, "Discovered the top of the wardrobe. New headquarters.", null, 330],
  [66, 3, "Odie ate my dinner. Odie will be dealt with.", null, 338],
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
  [12, 10, "bury"],
  [9, 13, "bury"],
  // On the older posts.
  [7, 20, "hisss"],
  [10, 21, "ekekekek"],
  [5, 21, "nap"],
  [3, 22, "nap"],
  [9, 22, "bury"],
  [4, 22, "purrfect"],
  [9, 24, "purrfect"],
  [3, 25, "hisss"],
  [8, 25, "ekekekek"],
  [7, 26, "ekekekek"],
  [12, 26, "nap"],
  [8, 26, "bury"],
  [3, 28, "bury"],
  [6, 29, "purrfect"],
  [12, 29, "hisss"],
  [9, 30, "hisss"],
  [5, 30, "ekekekek"],
  [11, 30, "nap"],
  [6, 32, "nap"],
  [10, 33, "bury"],
  [6, 33, "purrfect"],
  [3, 34, "purrfect"],
  [9, 34, "hisss"],
  [4, 34, "ekekekek"],
  [10, 36, "ekekekek"],
  [3, 37, "nap"],
  [8, 37, "bury"],
  [6, 38, "bury"],
  [11, 38, "purrfect"],
  [7, 38, "hisss"],
  [4, 40, "hisss"],
  [7, 41, "ekekekek"],
  [12, 41, "nap"],
  [10, 42, "nap"],
  [5, 42, "bury"],
  [11, 42, "purrfect"],
  [6, 44, "purrfect"],
  [9, 45, "hisss"],
  [5, 45, "ekekekek"],
  [3, 46, "ekekekek"],
  [8, 46, "nap"],
  [4, 46, "bury"],
  [10, 48, "bury"],
  [3, 49, "purrfect"],
  [9, 49, "hisss"],
  [6, 50, "hisss"],
  [12, 50, "ekekekek"],
  [7, 50, "nap"],
  [3, 52, "nap"],
  [6, 53, "bury"],
  [11, 53, "purrfect"],
  [10, 54, "purrfect"],
  [6, 54, "hisss"],
  [11, 54, "ekekekek"],
  [6, 56, "ekekekek"],
  [10, 57, "nap"],
  [5, 57, "bury"],
  [3, 58, "bury"],
  [8, 58, "purrfect"],
  [4, 58, "hisss"],
  [10, 60, "hisss"],
  [3, 61, "ekekekek"],
  [8, 61, "nap"],
  [6, 62, "nap"],
  [12, 62, "bury"],
  [7, 62, "purrfect"],
  [3, 64, "purrfect"],
  [6, 65, "hisss"],
  [11, 65, "ekekekek"],
  [10, 66, "ekekekek"],
  [6, 66, "nap"],
  [11, 66, "bury"],
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
  // On the older posts.
  [19, 11, 20, "I approve of this message.", 59],
  [20, 11, 24, "My slave would never allow this.", 85],
  [21, 3, 28, "I approve of this message.", 105],
  [22, 4, 32, "My slave would never allow this.", 131],
  [23, 5, 36, "I approve of this message.", 157],
  [24, 7, 40, "My slave would never allow this.", 177],
  [25, 7, 44, "I approve of this message.", 203],
  [26, 9, 48, "My slave would never allow this.", 229],
  [27, 9, 52, "I approve of this message.", 249],
  [28, 11, 56, "My slave would never allow this.", 275],
  [29, 12, 60, "I approve of this message.", 301],
  [30, 3, 64, "My slave would never allow this.", 321],
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
      title: SEED_TITLES[id] ?? "",
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
      image: null,
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
    overlord_title: overlord?.title ?? "",
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

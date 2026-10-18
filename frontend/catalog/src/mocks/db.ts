import type { Overlord, User } from "@/src/types/api";

// In-memory stand-in for the Django database, kept in sessionStorage so
// created/edited data survives reloads within a tab.
const STORAGE_KEY = "catalog-mock-db";

export type MockDb = {
  loggedIn: boolean;
  user: Omit<User, "overlords">;
  overlords: Overlord[];
  nextOverlordId: number;
};

function seed(): MockDb {
  return {
    loggedIn: false,
    user: {
      id: 1,
      username: "demo",
      email: "demo@catalog.dev",
      first_name: "Demo",
      last_name: "Slave",
      bio: "Professional can opener. Available 24/7.",
      avatar: "/whisker.png",
      date_joined: "2025-07-01T10:00:00Z",
    },
    overlords: [
      {
        id: 1,
        name: "Mirci",
        avatar: "/slide1.png",
        bio: "Rules the sofa with an iron paw.",
        breed: "Tabby",
        slave: 1,
      },
      {
        id: 2,
        name: "Cirmi",
        avatar: "/slide2.png",
        bio: "Knocks things off tables for science.",
        breed: "British Shorthair",
        slave: 1,
      },
    ],
    nextOverlordId: 3,
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
    // Quota exceeded (large uploaded avatars): keep the data in memory only.
  }
}

export function currentUser(): User {
  return { ...db.user, overlords: db.overlords };
}

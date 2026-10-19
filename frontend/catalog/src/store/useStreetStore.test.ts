// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from "vitest";
import type { Overlord, User } from "@/src/types/api";
import { useAuthStore } from "./useAuthStore";
import { reconcileStreetOverlord, useStreetStore } from "./useStreetStore";

const overlord = (id: number, name: string): Overlord => ({
  id,
  name,
  avatar: null,
  bio: "",
  breed: "",
  slave: 1,
});

const user = (overlords: Overlord[]): User => ({
  id: 1,
  username: "t",
  email: "t@example.com",
  first_name: "",
  last_name: "",
  bio: "",
  avatar: null,
  date_joined: "2025-01-01T00:00:00Z",
  overlords,
});

const selected = () => useStreetStore.getState().selectedOverlord;

describe("street overlord vs. the logged-in user", () => {
  beforeEach(() => useStreetStore.setState({ selectedOverlord: overlord(1, "Mirci") }));

  it("goes home when the overlord isn't the user's (any more)", () => {
    reconcileStreetOverlord(user([overlord(2, "Cirmi")]));
    expect(selected()).toBeNull();
  });

  it("goes home when nobody is logged in", () => {
    reconcileStreetOverlord(null);
    expect(selected()).toBeNull();
  });

  it("picks up the overlord's latest data", () => {
    reconcileStreetOverlord(user([overlord(1, "Mirci the Great")]));
    expect(selected()?.name).toBe("Mirci the Great");
  });

  it("starts every login and logout at home", () => {
    useAuthStore.getState().login(user([overlord(1, "Mirci")]));
    expect(selected()).toBeNull();

    useStreetStore.setState({ selectedOverlord: overlord(1, "Mirci") });
    useAuthStore.getState().logout();
    expect(selected()).toBeNull();
  });
});

import { setupServer } from "msw/node";
import { afterAll, afterEach, beforeAll, beforeEach } from "vitest";
import { db, resetMockDb } from "@/src/mocks/db";
import { handlers } from "@/src/mocks/handlers";
import { useAuthStore } from "@/src/store/useAuthStore";
import { useStreetStore } from "@/src/store/useStreetStore";
import { currentUser } from "@/src/mocks/db";

// The same handlers the demo uses, served in Node for component tests.
export const server = setupServer(...handlers);

type Options = {
  // Log in as the mock user and put an overlord out on the Street.
  loggedIn?: boolean;
  streetOverlordId?: number;
};

export function useMockBackend({ loggedIn = true, streetOverlordId }: Options = {}) {
  beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  beforeEach(() => {
    resetMockDb();
    db.loggedIn = loggedIn;
    const user = loggedIn ? currentUser() : null;
    useAuthStore.setState({ user, isAuthenticated: loggedIn });
    useStreetStore.setState({
      selectedOverlord: user?.overlords.find((o) => o.id === streetOverlordId) ?? null,
      posts: [],
    });
  });
}

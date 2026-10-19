import { beforeEach } from "vitest";
import { currentUser, db, resetMockDb } from "@/src/mocks/db";
import { useAuthStore } from "@/src/store/useAuthStore";
import { useStreetStore } from "@/src/store/useStreetStore";

// Component tests run in mock mode (vitest.config.ts), so the API client
// already talks to the in-page mock backend (src/mocks/adapter.ts). This
// resets its data and the stores before each test.

type Options = {
  // Log in as the mock user and put an overlord out on the Street.
  loggedIn?: boolean;
  streetOverlordId?: number;
};

export function useMockBackend({ loggedIn = true, streetOverlordId }: Options = {}) {
  beforeEach(() => {
    resetMockDb();
    db.loggedIn = loggedIn;
    const user = loggedIn ? currentUser() : null;
    useAuthStore.setState({ user, isAuthenticated: loggedIn });
    useStreetStore.setState({
      selectedOverlord: user?.overlords.find((o) => o.id === streetOverlordId) ?? null,
    });
  });
}

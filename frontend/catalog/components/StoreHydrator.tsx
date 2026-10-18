import { useEffect } from "react";
import { useAuthStore } from "@/src/store/useAuthStore";

// The auth store is created with `skipHydration` (see src/store/useAuthStore.ts)
// so the first client render matches the server-rendered HTML. Once React has
// taken over, pull the persisted session back out of localStorage.
export function AuthHydrator() {
  useEffect(() => {
    void useAuthStore.persist.rehydrate();
  }, []);

  return null;
}

import { useEffect } from "react";
import { useAuthStore } from "@/src/store/useAuthStore";
import { reconcileStreetOverlord, useStreetStore } from "@/src/store/useStreetStore";

// The persisted stores are created with `skipHydration` so the first client
// render matches the server-rendered HTML. Once React has taken over, pull
// their persisted state back out of localStorage.
export function StoreHydrator() {
  useEffect(() => {
    void Promise.all([useAuthStore.persist.rehydrate(), useStreetStore.persist.rehydrate()]).then(
      () => reconcileStreetOverlord(useAuthStore.getState().user)
    );
  }, []);

  return null;
}

import { useEffect } from "react";
import { useAuthStore } from "@/src/store/useAuthStore";
import { useStreetStore } from "@/src/store/useStreetStore";

// The persisted stores are created with `skipHydration` so the first client
// render matches the server-rendered HTML. Once React has taken over, pull
// their persisted state back out of localStorage.
export function StoreHydrator() {
  useEffect(() => {
    void useAuthStore.persist.rehydrate();
    void useStreetStore.persist.rehydrate();
  }, []);

  return null;
}

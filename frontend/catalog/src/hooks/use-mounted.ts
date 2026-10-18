import { useEffect, useState } from "react";

export function useMounted() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Intentional: this is the SSR/hydration-safe "mounted" flag itself, so the
    // effect exists solely to flip it after the client takes over.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  return mounted;
}

import { useAuthStore } from "@/src/store/useAuthStore";
import { AUTH_NAV_LINKS, PUBLIC_NAV_LINKS } from "./site";

export function useNavLinks() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  return isAuthenticated ? AUTH_NAV_LINKS : PUBLIC_NAV_LINKS;
}

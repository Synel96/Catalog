import { BellIcon, LogOutIcon, MenuIcon, XIcon } from "lucide-react";
import { useState } from "react";
import { navigate } from "vike/client/router";
import { usePageContext } from "vike-react/usePageContext";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useMounted } from "@/src/hooks/use-mounted";
import { logoutUser } from "@/src/services/authService";
import { useAuthStore } from "@/src/store/useAuthStore";
import { useStreetStore } from "@/src/store/useStreetStore";
import { StreetBar } from "@/components/street/StreetBar";
import {
  PushDrawer,
  PushDrawerClose,
  PushDrawerContent,
  PushDrawerTitle,
  PushDrawerTrigger,
} from "@/components/ui/push-drawer";
import { BRAND_NAME } from "./site";
import { useNavLinks } from "./useNavLinks";

type NavbarProps = {
  // Optional so the navbar still works standalone; the layout passes these
  // in so it can push the rest of the page aside while the drawer is open.
  menuOpen?: boolean;
  onMenuOpenChange?: (open: boolean) => void;
};

const iconButtonClass =
  "text-(--brand-on-surface) hover:bg-(--brand-on-surface)/10 hover:text-(--brand-on-surface)";

export function Navbar({ menuOpen, onMenuOpenChange }: NavbarProps = {}) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const open = menuOpen ?? uncontrolledOpen;
  const setOpen = (next: boolean) => {
    if (menuOpen === undefined) setUncontrolledOpen(next);
    onMenuOpenChange?.(next);
  };
  const mounted = useMounted();
  const { urlPathname } = usePageContext();
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const logout = useAuthStore((state) => state.logout);
  // Out on the Street the centre of the bar is the street controls, and the
  // page links move into the menu (on every screen size).
  const onStreet = useStreetStore((state) => state.selectedOverlord !== null) && isAuthenticated;
  const goHome = useStreetStore((state) => state.goHome);
  const links = useNavLinks();

  const isActive = (href: string) =>
    href === "/" ? urlPathname === href : urlPathname.startsWith(href);

  const navLinkClass = (href: string) =>
    isActive(href)
      ? "font-medium text-(--brand-on-surface)"
      : "text-(--brand-on-surface)/70 transition-colors hover:text-(--brand-on-surface)";

  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch (error) {
      console.error("Logout error:", error);
    }
    logout();
    goHome();
    setOpen(false);
    await navigate("/login");
  };

  return (
    <header className="sticky top-0 z-40 border-b border-(--brand-on-surface)/10 bg-(--brand-surface) text-(--brand-on-surface) backdrop-blur supports-backdrop-filter:bg-[color-mix(in_oklch,var(--brand-surface),transparent_5%)]">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-4 sm:h-20 sm:px-6">
        <a href="/" className="shrink-0" aria-label={`${BRAND_NAME} home`}>
          <img
            src="/brand.png"
            alt={`${BRAND_NAME} logo`}
            className="h-10 w-[110px] rounded-md bg-[#ffe6e6] object-contain shadow-sm transition-transform duration-200 hover:scale-105 hover:shadow-md sm:h-[60px] sm:w-[200px]"
          />
        </a>

        {onStreet ? (
          <StreetBar />
        ) : (
          <nav aria-label="Main" className="hidden items-center gap-6 md:flex">
            {links.map((item) => (
              <a key={item.href} href={item.href} className={navLinkClass(item.href)}>
                {item.label}
              </a>
            ))}
          </nav>
        )}

        <div className="flex items-center gap-1">
          {isAuthenticated && (
            <>
              <span className={onStreet ? "hidden" : "mr-2 hidden text-sm font-medium lg:inline"}>
                Welcome, {user?.username}!
              </span>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Notifications"
                className={`${onStreet ? "hidden sm:inline-flex" : ""} ${iconButtonClass}`}
              >
                <BellIcon className="size-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Logout"
                onClick={handleLogout}
                className={`hidden ${onStreet ? "" : "md:inline-flex"} ${iconButtonClass}`}
              >
                <LogOutIcon className="size-5" />
              </Button>
            </>
          )}
          <ThemeToggle />
          <div className={onStreet ? undefined : "md:hidden"}>
            {mounted ? (
              <PushDrawer open={open} onOpenChange={setOpen}>
                <PushDrawerTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Open menu"
                    className={iconButtonClass}
                  >
                    <span className="relative size-5">
                      <MenuIcon
                        className={`absolute inset-0 size-5 transition-all duration-300 ${
                          open ? "scale-0 rotate-90 opacity-0" : "scale-100 rotate-0 opacity-100"
                        }`}
                      />
                      <XIcon
                        className={`absolute inset-0 size-5 transition-all duration-300 ${
                          open ? "scale-100 rotate-0 opacity-100" : "scale-0 -rotate-90 opacity-0"
                        }`}
                      />
                    </span>
                  </Button>
                </PushDrawerTrigger>
                <PushDrawerContent
                  open={open}
                  closeLabel="Close menu"
                  aria-describedby={undefined}
                  className="border-l-(--brand-on-surface)/10 bg-(--brand-surface) text-(--brand-on-surface)"
                >
                  {/* Kept for screen readers (Radix requires an accessible dialog title) but not shown visually. */}
                  <PushDrawerTitle className="sr-only">Navigation menu</PushDrawerTitle>

                  <nav className="mt-12 flex flex-col gap-1 px-4 pb-6">
                    {isAuthenticated && (
                      <p className="px-3 pb-2 text-sm font-medium">Welcome, {user?.username}!</p>
                    )}
                    {links.map((item) => (
                      <PushDrawerClose asChild key={item.href}>
                        <a
                          href={item.href}
                          className={`rounded-md px-3 py-2 text-sm ${
                            isActive(item.href)
                              ? "bg-(--brand-on-surface)/15 font-medium text-(--brand-on-surface)"
                              : "text-(--brand-on-surface)/75 hover:bg-(--brand-on-surface)/10 hover:text-(--brand-on-surface)"
                          }`}
                        >
                          {item.label}
                        </a>
                      </PushDrawerClose>
                    ))}
                    {isAuthenticated && (
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="rounded-md px-3 py-2 text-left text-sm text-(--brand-on-surface)/75 hover:bg-(--brand-on-surface)/10 hover:text-(--brand-on-surface)"
                      >
                        Logout
                      </button>
                    )}
                  </nav>
                </PushDrawerContent>
              </PushDrawer>
            ) : (
              <Button
                variant="ghost"
                size="icon"
                aria-label="Open menu"
                disabled
                className={iconButtonClass}
              >
                <MenuIcon className="size-5" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

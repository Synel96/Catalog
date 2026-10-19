import { LogOutIcon, MenuIcon, XIcon } from "lucide-react";
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
import { NotificationBell } from "@/components/NotificationBell";
import { useNotificationsStore } from "@/src/store/useNotificationsStore";
import {
  PushDrawer,
  PushDrawerClose,
  PushDrawerContent,
  PushDrawerTitle,
  PushDrawerTrigger,
} from "@/components/ui/push-drawer";
import { BRAND_NAME } from "./site";
import { useNavLinks } from "./useNavLinks";
import { useTranslation } from "react-i18next";
import { useLocalePath } from "@/src/i18n/hooks";
import { LanguageSwitcher } from "./LanguageSwitcher";

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
  const streetOverlord = useStreetStore((state) => state.selectedOverlord);
  const onStreet = streetOverlord !== null && isAuthenticated;
  const clearNotifications = useNotificationsStore((state) => state.clear);
  const links = useNavLinks();
  const { t } = useTranslation();
  const localePath = useLocalePath();

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
    // Also clears the street overlord (see useAuthStore).
    logout();
    clearNotifications();
    setOpen(false);
    await navigate(localePath("/login"));
  };

  return (
    <header className="sticky top-0 z-40 border-b border-(--brand-on-surface)/10 bg-(--brand-surface) text-(--brand-on-surface) backdrop-blur supports-backdrop-filter:bg-[color-mix(in_oklch,var(--brand-surface),transparent_5%)]">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-2 px-4 sm:h-20 sm:gap-4 sm:px-6">
        <a
          href={localePath("/")}
          className="shrink-0"
          aria-label={t("nav.home", { brand: BRAND_NAME })}
        >
          <img
            src="/brand.png"
            alt={t("nav.logo", { brand: BRAND_NAME })}
            className="h-10 w-24 rounded-md bg-[#ffe6e6] object-contain shadow-sm transition-transform duration-200 hover:scale-105 hover:shadow-md min-[400px]:w-[110px] sm:h-[60px] sm:w-[200px]"
          />
        </a>

        {onStreet ? (
          <StreetBar />
        ) : (
          <nav aria-label={t("nav.main")} className="hidden items-center gap-6 md:flex">
            {links.map((item) => (
              <a key={item.href} href={localePath(item.href)} className={navLinkClass(item.href)}>
                {t(item.labelKey)}
              </a>
            ))}
          </nav>
        )}

        <div className="flex items-center gap-1">
          {isAuthenticated && (
            <>
              <span className={onStreet ? "hidden" : "mr-2 hidden text-sm font-medium lg:inline"}>
                {t("nav.welcome", { name: user?.username })}
              </span>
              {onStreet && <NotificationBell overlord={streetOverlord} />}
              <Button
                variant="ghost"
                size="icon"
                aria-label={t("nav.logout")}
                onClick={handleLogout}
                className={`hidden ${onStreet ? "" : "md:inline-flex"} ${iconButtonClass}`}
              >
                <LogOutIcon className="size-5" />
              </Button>
            </>
          )}
          <LanguageSwitcher className="hidden md:flex" />
          {/* The narrowest phones need the room for the Street controls. */}
          <div className={onStreet ? "contents max-[359px]:hidden" : "contents"}>
            <ThemeToggle />
          </div>
          <div className={onStreet ? undefined : "md:hidden"}>
            {mounted ? (
              <PushDrawer open={open} onOpenChange={setOpen}>
                <PushDrawerTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={t("nav.openMenu")}
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
                  closeLabel={t("nav.closeMenu")}
                  aria-describedby={undefined}
                  className="border-l-(--brand-on-surface)/10 bg-(--brand-surface) text-(--brand-on-surface)"
                >
                  {/* Kept for screen readers (Radix requires an accessible dialog title) but not shown visually. */}
                  <PushDrawerTitle className="sr-only">{t("nav.navigationMenu")}</PushDrawerTitle>

                  <nav className="mt-12 flex flex-col gap-1 px-4 pb-6">
                    {isAuthenticated && (
                      <p className="px-3 pb-2 text-sm font-medium">
                        {t("nav.welcome", { name: user?.username })}
                      </p>
                    )}
                    {links.map((item) => (
                      <PushDrawerClose asChild key={item.href}>
                        <a
                          href={localePath(item.href)}
                          className={`rounded-md px-3 py-2 text-sm ${
                            isActive(item.href)
                              ? "bg-(--brand-on-surface)/15 font-medium text-(--brand-on-surface)"
                              : "text-(--brand-on-surface)/75 hover:bg-(--brand-on-surface)/10 hover:text-(--brand-on-surface)"
                          }`}
                        >
                          {t(item.labelKey)}
                        </a>
                      </PushDrawerClose>
                    ))}
                    {isAuthenticated && (
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="rounded-md px-3 py-2 text-left text-sm text-(--brand-on-surface)/75 hover:bg-(--brand-on-surface)/10 hover:text-(--brand-on-surface)"
                      >
                        {t("nav.logout")}
                      </button>
                    )}
                  </nav>
                  <LanguageSwitcher className="mx-4 border-t border-(--brand-on-surface)/10 pt-4" />
                </PushDrawerContent>
              </PushDrawer>
            ) : (
              <Button
                variant="ghost"
                size="icon"
                aria-label={t("nav.openMenu")}
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

import { CheckIcon, ChevronDownIcon, HomeIcon, UserRoundIcon } from "lucide-react";
import { DropdownMenu } from "radix-ui";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { mediaUrl } from "@/src/services/api";
import { useAuthStore } from "@/src/store/useAuthStore";
import { useOverlordsStore } from "@/src/store/useOverlordsStore";
import { useStreetStore } from "@/src/store/useStreetStore";
import type { Overlord } from "@/src/types/api";
import { overlordHref } from "./links";
import { OVERLORD_PLACEHOLDER } from "./media";
import { OverlordSearch } from "./OverlordSearch";
import { useTranslation } from "react-i18next";
import { useLocalePath } from "@/src/i18n/hooks";

const itemClass =
  "flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm outline-none select-none data-highlighted:bg-accent data-highlighted:text-accent-foreground";

function OverlordAvatar({ overlord, className }: { overlord: Overlord; className: string }) {
  return (
    <Avatar className={className}>
      <AvatarImage src={mediaUrl(overlord.avatar, OVERLORD_PLACEHOLDER)} alt="" />
      <AvatarFallback>{overlord.name.slice(0, 2).toUpperCase()}</AvatarFallback>
    </Avatar>
  );
}

// Navbar section shown while the user is out on the Street with an overlord.
// Tapping the overlord opens a menu to send another of the user's cats out
// instead, or to open the current one's profile.
export function StreetBar() {
  const { t } = useTranslation();
  const localePath = useLocalePath();
  const overlord = useStreetStore((state) => state.selectedOverlord);
  const goToStreet = useStreetStore((state) => state.goToStreet);
  const goHome = useStreetStore((state) => state.goHome);
  const user = useAuthStore((state) => state.user);
  const loadedOverlords = useOverlordsStore((state) => state.overlords);
  const fetchOverlords = useOverlordsStore((state) => state.fetchOverlords);

  if (!overlord) return null;

  // The overlords store is the fresher list (e.g. right after creating one
  // on My Slave); the logged-in user's own list covers the rest.
  const overlords = loadedOverlords.length > 0 ? loadedOverlords : (user?.overlords ?? []);

  const switchTo = (next: Overlord) => {
    if (next.id === overlord.id) return;
    goToStreet(next);
    toast.success(t("street.switched", { name: next.name }));
  };

  return (
    <div className="flex min-w-0 flex-1 items-center justify-center gap-2 sm:gap-3">
      <OverlordSearch />
      <DropdownMenu.Root onOpenChange={(open) => open && void fetchOverlords()}>
        <DropdownMenu.Trigger
          className="group flex min-w-0 items-center gap-1.5 rounded-full outline-none focus-visible:ring-3 focus-visible:ring-(--brand-on-surface)/30"
          aria-label={t("street.switchLabel", { name: overlord.name })}
          title={t("street.onStreetWith", { name: overlord.name })}
        >
          <OverlordAvatar
            overlord={overlord}
            className="ring-primary size-9 shrink-0 ring-2 transition-transform group-hover:scale-110"
          />
          <span className="hidden truncate text-sm font-semibold xl:inline">
            {t("street.onStreetWith", { name: overlord.name })}
          </span>
          <ChevronDownIcon className="hidden size-4 shrink-0 opacity-70 sm:block" aria-hidden />
        </DropdownMenu.Trigger>

        <DropdownMenu.Portal>
          <DropdownMenu.Content
            align="center"
            sideOffset={8}
            className="bg-popover text-popover-foreground ring-foreground/10 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 z-50 max-h-[70vh] min-w-56 overflow-y-auto rounded-xl p-1 shadow-lg ring-1"
          >
            <DropdownMenu.Label className="text-muted-foreground px-2 py-1.5 text-xs font-medium">
              {t("street.switchTitle")}
            </DropdownMenu.Label>
            <DropdownMenu.RadioGroup
              value={String(overlord.id)}
              onValueChange={(id) => {
                const next = overlords.find((o) => String(o.id) === id);
                if (next) switchTo(next);
              }}
            >
              {overlords.map((o) => (
                <DropdownMenu.RadioItem key={o.id} value={String(o.id)} className={itemClass}>
                  <OverlordAvatar overlord={o} className="size-7 shrink-0" />
                  <span className="min-w-0 flex-1 truncate">{o.name}</span>
                  <DropdownMenu.ItemIndicator>
                    <CheckIcon className="text-primary-foreground dark:text-primary size-4" />
                  </DropdownMenu.ItemIndicator>
                </DropdownMenu.RadioItem>
              ))}
            </DropdownMenu.RadioGroup>
            <DropdownMenu.Separator className="bg-border my-1 h-px" />
            <DropdownMenu.Item asChild className={itemClass}>
              <a href={localePath(overlordHref(overlord.id))}>
                <UserRoundIcon className="size-4" aria-hidden />
                {t("street.viewProfile", { name: overlord.name })}
              </a>
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>
      {/* A real link, like "Go to the Street" (see MyOverlordsCarousel). */}
      <Button variant="outline" size="sm" asChild>
        <a
          href={localePath("/my-slave")}
          onClick={goHome}
          // The label text is hidden on phones, leaving only the icon.
          aria-label={t("street.goHome")}
        >
          <HomeIcon /> <span className="hidden sm:inline">{t("street.goHome")}</span>
        </a>
      </Button>
    </div>
  );
}

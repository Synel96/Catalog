import { HomeIcon } from "lucide-react";
import { navigate } from "vike/client/router";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { mediaUrl } from "@/src/services/api";
import { useStreetStore } from "@/src/store/useStreetStore";
import { overlordHref } from "./links";
import { OVERLORD_PLACEHOLDER } from "./media";
import { OverlordSearch } from "./OverlordSearch";

// Navbar section shown while the user is out on the Street with an overlord.
export function StreetBar() {
  const overlord = useStreetStore((state) => state.selectedOverlord);
  const goHome = useStreetStore((state) => state.goHome);

  if (!overlord) return null;

  return (
    <div className="flex min-w-0 flex-1 items-center justify-center gap-2 sm:gap-3">
      <OverlordSearch />
      <a
        href={overlordHref(overlord.id)}
        className="flex min-w-0 items-center gap-2"
        title={`On the Street with ${overlord.name}`}
      >
        <Avatar className="ring-primary size-9 shrink-0 ring-2 transition-transform hover:scale-110">
          <AvatarImage src={mediaUrl(overlord.avatar, OVERLORD_PLACEHOLDER)} alt="" />
          <AvatarFallback>{overlord.name.slice(0, 2).toUpperCase()}</AvatarFallback>
        </Avatar>
        <span className="hidden truncate text-sm font-semibold xl:inline">
          On the Street with: {overlord.name}
        </span>
      </a>
      <Button
        variant="outline"
        size="sm"
        // The label text is hidden on phones, leaving only the icon.
        aria-label="Go Home"
        onClick={() => {
          goHome();
          void navigate("/my-slave");
        }}
      >
        <HomeIcon /> <span className="hidden sm:inline">Go Home</span>
      </Button>
    </div>
  );
}

import {
  BellIcon,
  CatIcon,
  CrownIcon,
  FlaskConicalIcon,
  HandHeartIcon,
  KeyRoundIcon,
  MapIcon,
  MessageCircleIcon,
  SearchIcon,
} from "lucide-react";
import { API_MOCKS } from "@/components/site";
import { Tutorial } from "./Tutorial";

// Shown on the home (login) page of the demo build: any login works, but
// nobody should type their real credentials into it.
export function WelcomeTutorial() {
  if (!API_MOCKS) return null;
  return (
    <Tutorial
      id="welcome"
      steps={[
        { icon: FlaskConicalIcon, key: "demo" },
        { icon: KeyRoundIcon, key: "login" },
      ]}
    />
  );
}

// My Slave: the slave/overlord split and how to get to the Street.
export function MySlaveTutorial({ className }: { className?: string }) {
  return (
    <Tutorial
      id="mySlave"
      helpButton
      className={className}
      steps={[
        { icon: HandHeartIcon, key: "slave" },
        { icon: CrownIcon, key: "overlords" },
        { icon: MapIcon, key: "street" },
      ]}
    />
  );
}

export function StreetTutorial({ className }: { className?: string }) {
  return (
    <Tutorial
      id="street"
      helpButton
      className={className}
      steps={[
        { icon: CatIcon, key: "feed" },
        { icon: MessageCircleIcon, key: "post" },
        { icon: SearchIcon, key: "whisker" },
        { icon: BellIcon, key: "notifications" },
      ]}
    />
  );
}

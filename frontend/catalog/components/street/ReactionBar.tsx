import "./reaction-bar.css";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { getPostReactions, toggleReaction } from "@/src/services/reactionService";
import type { ApiError, ReactionSummary, ReactionType } from "@/src/types/api";
import { useTranslation } from "react-i18next";

const REACTIONS: { type: ReactionType; label: string; icon: string }[] = [
  { type: "purrfect", label: "Purrfect", icon: "/reactions/purrfect.webp" },
  { type: "hisss", label: "Hisss", icon: "/reactions/hiss.webp" },
  { type: "ekekekek", label: "Ekekekek", icon: "/reactions/ekekek.webp" },
  { type: "nap", label: "Overnap", icon: "/reactions/overnap.webp" },
  // A paw burying it in the litter box.
  { type: "bury", label: "Bury", icon: "/reactions/bury.webp" },
];

type ReactionBarProps = {
  postId: number;
  summary: ReactionSummary;
  // The reacting overlord's own reaction, highlighted.
  myReaction: ReactionType | null;
  // The overlord reacting; reactions are disabled without one.
  overlordId: number | null;
};

const BURST_MS = 900;

export function ReactionBar({ postId, summary, myReaction, overlordId }: ReactionBarProps) {
  const { t } = useTranslation();
  const [counts, setCounts] = useState(summary);
  const [mine, setMine] = useState(myReaction);
  const [synced, setSynced] = useState({ summary, myReaction });
  const [pending, setPending] = useState(false);
  // The button just pressed: plays its animation once (`burst`), then
  // stays still until the pointer leaves it (`calm`).
  const [burst, setBurst] = useState<ReactionType | null>(null);
  const [calm, setCalm] = useState<ReactionType | null>(null);
  const burstTimer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(burstTimer.current), []);

  // A feed refetch hands in fresh data; adopt it (during render rather
  // than in an effect: https://react.dev/learn/you-might-not-need-an-effect).
  if (summary !== synced.summary || myReaction !== synced.myReaction) {
    setSynced({ summary, myReaction });
    setCounts(summary);
    setMine(myReaction);
  }

  const react = async (type: ReactionType) => {
    if (!overlordId || pending) return;
    setCalm(type);
    setBurst(type);
    window.clearTimeout(burstTimer.current);
    burstTimer.current = window.setTimeout(() => setBurst(null), BURST_MS);

    setPending(true);
    try {
      const { status } = await toggleReaction(postId, overlordId, type);
      setMine(status === "unreacted" ? null : type);
      setCounts(await getPostReactions(postId));
    } catch (error) {
      toast.error((error as ApiError).detail);
    } finally {
      setPending(false);
    }
  };

  return (
    <div
      className="flex gap-1 overflow-x-auto pt-7 pb-1 sm:gap-3"
      role="group"
      aria-label={t("reactions.label")}
      title={overlordId ? undefined : t("reactions.needOverlord")}
    >
      {REACTIONS.map(({ type, label, icon }) => {
        const count = counts[type] ?? 0;
        const selected = mine === type;
        return (
          <button
            key={type}
            type="button"
            onClick={() => react(type)}
            onPointerLeave={() => calm === type && setCalm(null)}
            disabled={!overlordId || pending}
            aria-pressed={selected}
            aria-label={`${label}${count ? ` (${count})` : ""}`}
            className={cn(
              "reaction-btn relative flex h-12 min-w-[50px] shrink-0 items-center justify-center rounded-xl px-1 transition-colors disabled:cursor-not-allowed disabled:opacity-60 sm:h-[72px] sm:min-w-[100px] sm:px-2",
              "focus-visible:ring-ring/50 outline-none focus-visible:ring-3",
              selected
                ? "bg-primary/15 ring-primary/60 dark:bg-primary/20 ring-2"
                : "[@media(hover:hover)]:hover:bg-accent/60",
              type,
              burst === type && "burst",
              calm === type && "calm"
            )}
          >
            <img
              src={icon}
              alt=""
              className="h-7 w-11 object-contain sm:h-14 sm:w-[88px] dark:invert"
            />
            {count > 0 && (
              <span className="bg-primary text-primary-foreground absolute top-0.5 right-0.5 min-w-[18px] rounded-full px-1.5 text-center text-[10px] leading-[1.4] font-bold">
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

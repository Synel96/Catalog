import "./reaction-bar.css";
import { useState } from "react";
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
];

type ReactionBarProps = {
  postId: number;
  summary: ReactionSummary;
  // The overlord reacting; reactions are disabled without one.
  overlordId: number | null;
};

export function ReactionBar({ postId, summary, overlordId }: ReactionBarProps) {
  const { t } = useTranslation();
  const [counts, setCounts] = useState(summary);
  const [syncedSummary, setSyncedSummary] = useState(summary);
  const [pending, setPending] = useState(false);

  // A feed refetch hands in a fresh summary; adopt it (during render rather
  // than in an effect: https://react.dev/learn/you-might-not-need-an-effect).
  if (summary !== syncedSummary) {
    setSyncedSummary(summary);
    setCounts(summary);
  }

  const react = async (type: ReactionType) => {
    if (!overlordId || pending) return;
    setPending(true);
    try {
      await toggleReaction(postId, overlordId, type);
      setCounts(await getPostReactions(postId));
    } catch (error) {
      toast.error((error as ApiError).detail);
    } finally {
      setPending(false);
    }
  };

  return (
    <div
      className="flex gap-2 overflow-x-auto pt-7 pb-1 sm:gap-3"
      role="group"
      aria-label={t("reactions.label")}
      title={overlordId ? undefined : t("reactions.needOverlord")}
    >
      {REACTIONS.map(({ type, label, icon }) => {
        const count = counts[type] ?? 0;
        return (
          <button
            key={type}
            type="button"
            onClick={() => react(type)}
            disabled={!overlordId || pending}
            aria-label={`${label}${count ? ` (${count})` : ""}`}
            className={cn(
              "reaction-btn bg-secondary hover:bg-accent relative flex h-[60px] min-w-[72px] shrink-0 items-center justify-center rounded-lg px-2 transition-colors disabled:cursor-not-allowed disabled:opacity-60 sm:h-[79px] sm:min-w-[112px]",
              type
            )}
          >
            <img
              src={icon}
              alt=""
              className="h-[37px] w-14 object-contain sm:h-[63px] sm:w-24 dark:invert"
            />
            {count > 0 && (
              <span className="bg-primary text-primary-foreground absolute top-1 right-1 min-w-[18px] rounded-full px-1.5 text-center text-[10px] leading-[1.4] font-bold">
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

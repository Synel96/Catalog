import { CircleHelpIcon, type LucideIcon } from "lucide-react";
import { useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { useMounted } from "@/src/hooks/use-mounted";

export type TutorialStep = {
  icon: LucideIcon;
  // Texts live under `tutorial.<id>.<key>.{title,body}`.
  key: string;
};

type TutorialProps = {
  id: string;
  steps: TutorialStep[];
  // Adds a "How does this work?" button that opens the tutorial again.
  helpButton?: boolean;
  className?: string;
};

const storageKey = (id: string) => `catalog:tutorial:${id}`;

function hasSeen(id: string) {
  try {
    return localStorage.getItem(storageKey(id)) === "seen";
  } catch {
    return false;
  }
}

function markSeen(id: string) {
  try {
    localStorage.setItem(storageKey(id), "seen");
  } catch {
    // Private mode etc.: it just shows up again next time.
  }
}

// A few steps of explanation that pop up the first time a page is visited
// (remembered per browser) and can be reopened with the help button.
export function Tutorial({ id, steps, helpButton = false, className }: TutorialProps) {
  const { t } = useTranslation();
  const mounted = useMounted();
  const [mode, setMode] = useState<"auto" | "open" | "closed">("auto");
  const [index, setIndex] = useState(0);

  // localStorage is only readable after hydration.
  const open = mode === "open" || (mode === "auto" && mounted && !hasSeen(id));
  const step = steps[index];
  const isLast = index === steps.length - 1;
  const Icon = step.icon;

  const close = () => {
    markSeen(id);
    setMode("closed");
  };
  const reopen = () => {
    setIndex(0);
    setMode("open");
  };

  return (
    <>
      {helpButton && (
        <Button variant="outline" size="sm" onClick={reopen} className={className}>
          <CircleHelpIcon /> {t("tutorial.help")}
        </Button>
      )}
      <Dialog open={open} onOpenChange={(next) => !next && close()}>
        <DialogContent className="sm:max-w-lg">
          <div className="bg-primary/15 text-primary-foreground dark:text-primary mx-auto grid size-14 place-items-center rounded-full">
            <Icon className="size-7" aria-hidden />
          </div>
          <DialogHeader className="text-center">
            <DialogTitle className="text-xl">{t(`tutorial.${id}.${step.key}.title`)}</DialogTitle>
            <DialogDescription className="text-foreground/80 text-base leading-relaxed">
              <Trans
                i18nKey={`tutorial.${id}.${step.key}.body`}
                components={{ b: <strong className="text-foreground" /> }}
              />
            </DialogDescription>
          </DialogHeader>

          {steps.length > 1 && (
            <div className="flex justify-center gap-1.5" aria-hidden>
              {steps.map((s, i) => (
                <span
                  key={s.key}
                  className={cn(
                    "h-1.5 rounded-full transition-all",
                    i === index ? "bg-primary w-5" : "bg-muted-foreground/30 w-1.5"
                  )}
                />
              ))}
            </div>
          )}

          <div className="flex items-center justify-between gap-2">
            <span className="text-muted-foreground text-xs">
              {steps.length > 1 && t("tutorial.progress", { step: index + 1, total: steps.length })}
            </span>
            <div className="flex gap-2">
              {index > 0 && (
                <Button variant="ghost" onClick={() => setIndex(index - 1)}>
                  {t("tutorial.back")}
                </Button>
              )}
              <Button onClick={isLast ? close : () => setIndex(index + 1)}>
                {isLast ? t("tutorial.done") : t("tutorial.next")}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

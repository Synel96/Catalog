import "@/components/street/street.css";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { createWhisker, deleteWhisker, getWhiskerStatus } from "@/src/services/whiskerService";
import type { ApiError } from "@/src/types/api";

type WhiskerButtonProps = {
  fromId: number;
  toId: number;
  // Called after a change so the page can refresh the whisker counts.
  onChange: () => void;
};

// Whisker (follow) toggle between the user's street overlord and another one.
// Shows the action that applies, instead of the old Whisker + Unwhisker pair.
export function WhiskerButton({ fromId, toId, onChange }: WhiskerButtonProps) {
  const [whiskered, setWhiskered] = useState<boolean | null>(null);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getWhiskerStatus(fromId, toId)
      .then((exists) => !cancelled && setWhiskered(exists))
      .catch(() => !cancelled && setWhiskered(false));
    return () => {
      cancelled = true;
    };
  }, [fromId, toId]);

  const toggle = async () => {
    setPending(true);
    try {
      if (whiskered) {
        await deleteWhisker(fromId, toId);
        toast.success("Unwhiskered this overlord.");
      } else {
        await createWhisker(fromId, toId);
        toast.success("Whiskered this overlord successfully!");
      }
      setWhiskered(!whiskered);
      onChange();
    } catch (error) {
      toast.error((error as ApiError).detail);
    } finally {
      setPending(false);
    }
  };

  return (
    <Button
      size="sm"
      variant={whiskered ? "outline" : "default"}
      onClick={toggle}
      disabled={whiskered === null || pending}
      className={whiskered ? undefined : "post-pulse"}
    >
      <img src="/whisker-icon.webp" alt="" className="size-[18px] dark:invert" />
      {whiskered ? "Unwhisker" : "Whisker"}
    </Button>
  );
}

import { useEffect, useState } from "react";
import { useOverlordsStore } from "@/src/store/useOverlordsStore";
import type { Overlord } from "@/src/types/api";
import { MyOverlordsCarousel } from "./MyOverlordsCarousel";
import { OverlordFormDialog } from "./OverlordFormDialog";
import { OverlordsSkeleton } from "./OverlordsSkeleton";

// The overlord is kept while closing so the title doesn't flip mid-animation.
type DialogState = { open: boolean; overlord: Overlord | null };

export function MyOverlordsSection() {
  const fetchOverlords = useOverlordsStore((state) => state.fetchOverlords);
  const overlords = useOverlordsStore((state) => state.overlords);
  const isLoading = useOverlordsStore((state) => state.isLoading);
  const [dialog, setDialog] = useState<DialogState>({ open: false, overlord: null });

  useEffect(() => {
    void fetchOverlords();
  }, [fetchOverlords]);

  if (isLoading) return <OverlordsSkeleton />;

  return (
    <div className="mt-4">
      <MyOverlordsCarousel
        overlords={overlords}
        onEdit={(overlord) => setDialog({ open: true, overlord })}
        onCreate={() => setDialog({ open: true, overlord: null })}
      />

      <OverlordFormDialog
        open={dialog.open}
        onOpenChange={(open) => setDialog((prev) => ({ ...prev, open }))}
        overlord={dialog.overlord}
      />
    </div>
  );
}

import { useState } from "react";
import { FormField } from "@/components/common/FormField";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useOverlordsStore } from "@/src/store/useOverlordsStore";
import type { ApiError, Overlord } from "@/src/types/api";

type OverlordFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  // Edit mode when given, create mode otherwise.
  overlord?: Overlord | null;
};

// One dialog for both creating and editing (the old Create/EditOverlordModal
// were identical apart from the title, button label and store action).
export function OverlordFormDialog({ open, onOpenChange, overlord }: OverlordFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>{overlord ? "Edit Overlord" : "Create New Overlord"}</DialogTitle>
        </DialogHeader>
        <OverlordForm overlord={overlord} onDone={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  );
}

type OverlordFields = Pick<Overlord, "name" | "bio" | "breed">;

function OverlordForm({ overlord, onDone }: { overlord?: Overlord | null; onDone: () => void }) {
  const addOverlord = useOverlordsStore((state) => state.addOverlord);
  const updateOverlord = useOverlordsStore((state) => state.updateOverlord);

  const [fields, setFields] = useState<OverlordFields>({
    name: overlord?.name ?? "",
    bio: overlord?.bio ?? "",
    breed: overlord?.breed ?? "",
  });
  const [avatar, setAvatar] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFields((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    const payload = new FormData();
    for (const [key, value] of Object.entries(fields)) {
      const trimmed = value.trim();
      if (trimmed) payload.append(key, trimmed);
    }
    if (avatar) payload.append("avatar", avatar);

    try {
      if (overlord) {
        await updateOverlord(overlord.id, payload);
      } else {
        await addOverlord(payload);
      }
      onDone();
    } catch (err) {
      const fallback = overlord ? "Failed to update overlord." : "Failed to create overlord.";
      setError((err as ApiError).detail || fallback);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-4">
      <FormField
        label="Name"
        name="name"
        value={fields.name}
        onChange={handleChange}
        autoFocus
        disabled={isSubmitting}
        required
      />
      <FormField
        label="Bio"
        name="bio"
        value={fields.bio}
        onChange={handleChange}
        disabled={isSubmitting}
      />
      <FormField
        label="Breed"
        name="breed"
        value={fields.breed}
        onChange={handleChange}
        disabled={isSubmitting}
      />
      <FormField
        label="Avatar"
        type="file"
        name="avatar"
        accept="image/*"
        onChange={(e) => setAvatar(e.target.files?.[0] ?? null)}
        disabled={isSubmitting}
      />

      {error && (
        <p role="alert" className="text-destructive text-sm">
          {error}
        </p>
      )}

      <Button type="submit" size="lg" disabled={!fields.name.trim() || isSubmitting}>
        {isSubmitting ? "Saving…" : overlord ? "Save Changes" : "Create"}
      </Button>
    </form>
  );
}

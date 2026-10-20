import { useId, useState } from "react";
import { FormField } from "@/components/common/FormField";
import { UploadPreview } from "@/components/common/UploadPreview";
import { OVERLORD_TITLES } from "@/components/overlord/titles";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useOverlordsStore } from "@/src/store/useOverlordsStore";
import type { ApiError, Overlord } from "@/src/types/api";
import { useTranslation } from "react-i18next";
import { shrinkImage } from "@/lib/image";
import { resetUploadProgress } from "@/src/store/useUploadStore";

type OverlordFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  // Edit mode when given, create mode otherwise.
  overlord?: Overlord | null;
};

// One dialog for both creating and editing (the old Create/EditOverlordModal
// were identical apart from the title, button label and store action).
export function OverlordFormDialog({ open, onOpenChange, overlord }: OverlordFormDialogProps) {
  const { t } = useTranslation();
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>{overlord ? t("overlords.edit") : t("overlords.createNew")}</DialogTitle>
        </DialogHeader>
        <OverlordForm overlord={overlord} onDone={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  );
}

type OverlordFields = Pick<Overlord, "name" | "bio" | "breed">;

function OverlordForm({ overlord, onDone }: { overlord?: Overlord | null; onDone: () => void }) {
  const { t } = useTranslation();
  const addOverlord = useOverlordsStore((state) => state.addOverlord);
  const updateOverlord = useOverlordsStore((state) => state.updateOverlord);

  const [fields, setFields] = useState<OverlordFields>({
    name: overlord?.name ?? "",
    bio: overlord?.bio ?? "",
    breed: overlord?.breed ?? "",
  });
  const [title, setTitle] = useState(overlord?.title ?? "");
  const titleId = useId();
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
    resetUploadProgress();

    const payload = new FormData();
    for (const [key, value] of Object.entries(fields)) {
      const trimmed = value.trim();
      if (trimmed) payload.append(key, trimmed);
    }
    // Always sent, so choosing "No title" clears it.
    payload.append("title", title);
    try {
      if (avatar) payload.append("avatar", await shrinkImage(avatar));
      if (overlord) {
        await updateOverlord(overlord.id, payload);
      } else {
        await addOverlord(payload);
      }
      onDone();
    } catch (err) {
      const fallback = overlord ? t("overlords.updateFailed") : t("overlords.createFailed");
      setError((err as ApiError).detail || fallback);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-4">
      <FormField
        label={t("overlords.name")}
        name="name"
        value={fields.name}
        onChange={handleChange}
        autoFocus
        disabled={isSubmitting}
        required
      />
      <FormField
        label={t("profile.bio")}
        name="bio"
        value={fields.bio}
        onChange={handleChange}
        disabled={isSubmitting}
      />
      <FormField
        label={t("overlords.breedLabel")}
        name="breed"
        value={fields.breed}
        onChange={handleChange}
        disabled={isSubmitting}
      />
      <div className="grid gap-2">
        <Label htmlFor={titleId}>{t("overlords.titleLabel")}</Label>
        <select
          id={titleId}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={isSubmitting}
          className="border-input focus-visible:border-ring focus-visible:ring-ring/50 dark:bg-input/30 h-9 w-full rounded-lg border bg-transparent px-3 text-base outline-none focus-visible:ring-3 disabled:opacity-50 md:text-sm"
        >
          <option value="">{t("overlords.noTitle")}</option>
          {OVERLORD_TITLES.map((key) => (
            <option key={key} value={key}>
              {t(`titles.${key}`)}
            </option>
          ))}
        </select>
      </div>
      <FormField
        label={t("profile.avatar")}
        type="file"
        name="avatar"
        accept="image/*"
        onChange={(e) => setAvatar(e.target.files?.[0] ?? null)}
        disabled={isSubmitting}
      />
      {avatar && <UploadPreview file={avatar} uploading={isSubmitting} />}

      {error && (
        <p role="alert" className="text-destructive text-sm">
          {error}
        </p>
      )}

      <Button type="submit" size="lg" disabled={!fields.name.trim() || isSubmitting}>
        {isSubmitting
          ? t("common.saving")
          : overlord
            ? t("common.saveChanges")
            : t("common.create")}
      </Button>
    </form>
  );
}

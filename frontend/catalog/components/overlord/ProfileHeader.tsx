import { PencilIcon } from "lucide-react";
import { useState } from "react";
import { ImageViewerDialog } from "@/components/common/ImageViewerDialog";
import { OVERLORD_PLACEHOLDER } from "@/components/street/media";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { mediaUrl } from "@/src/services/api";
import type { Overlord } from "@/src/types/api";
import { useTranslation } from "react-i18next";

type ProfileHeaderProps = {
  overlord: Overlord;
  // Rendered next to the name: whisker toggle or an edit button.
  whisker?: React.ReactNode;
  onEdit?: () => void;
};

export function ProfileHeader({ overlord, whisker, onEdit }: ProfileHeaderProps) {
  const { t } = useTranslation();
  const [imageOpen, setImageOpen] = useState(false);
  const avatarUrl = mediaUrl(overlord.avatar, OVERLORD_PLACEHOLDER);

  return (
    <div className="flex w-full flex-wrap items-start gap-6">
      <button
        type="button"
        onClick={() => setImageOpen(true)}
        aria-label={t("overlords.viewAvatar", { name: overlord.name })}
        className="rounded-full transition-[transform,filter] duration-300 hover:scale-105 hover:brightness-110"
      >
        <Avatar className="ring-border size-[100px] ring-2">
          <AvatarImage src={avatarUrl} alt="" />
          <AvatarFallback className="text-2xl">
            {overlord.name.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      </button>

      <div className="min-w-0 flex-1">
        <div className="mb-2 flex flex-wrap items-center gap-3">
          <h2 className="text-3xl leading-tight font-bold">{overlord.name}</h2>
          <div className="ml-auto flex flex-wrap items-center gap-2">
            {whisker}
            {onEdit && (
              <Button variant="outline" size="sm" onClick={onEdit}>
                <PencilIcon /> {t("common.edit")}
              </Button>
            )}
          </div>
        </div>

        <dl className="mb-2 flex flex-wrap gap-x-6 gap-y-1 text-sm">
          <Stat label={t("overlords.breedLabel")} value={overlord.breed || "—"} />
          {overlord.slave_name && <Stat label={t("profile.slave")} value={overlord.slave_name} />}
          <Stat
            label={t("whisker.whiskeredBy")}
            value={overlord.whiskered_by_count ?? 0}
            title={overlord.whiskered_by_names?.join(", ")}
          />
          <Stat
            label={t("whisker.whiskering")}
            value={overlord.whiskering_count ?? 0}
            title={overlord.whiskering_names?.join(", ")}
          />
        </dl>

        {overlord.bio && <p className="whitespace-pre-line">{overlord.bio}</p>}
      </div>

      <ImageViewerDialog
        open={imageOpen}
        onOpenChange={setImageOpen}
        src={avatarUrl}
        alt={overlord.name}
      />
    </div>
  );
}

function Stat({ label, value, title }: { label: string; value: React.ReactNode; title?: string }) {
  return (
    <div className="flex gap-1" title={title || undefined}>
      <dt className="font-semibold">{label}:</dt>
      <dd>{value}</dd>
    </div>
  );
}

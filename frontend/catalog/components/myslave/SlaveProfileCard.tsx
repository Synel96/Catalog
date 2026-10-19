import { useState } from "react";
import { toast } from "sonner";
import { ImageViewerDialog } from "@/components/common/ImageViewerDialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { mediaUrl } from "@/src/services/api";
import { updateCurrentUser } from "@/src/services/userService";
import { useAuthStore } from "@/src/store/useAuthStore";
import type { User } from "@/src/types/api";
import { EditSlaveDialog } from "./EditSlaveDialog";
import { useTranslation } from "react-i18next";
import { DATE_LOCALES } from "@/src/i18n/config";
import { useLang } from "@/src/i18n/hooks";

const SLAVE_PLACEHOLDER = "/media/placeholders/slave_placeholder.png";

export function SlaveProfileCard({ user }: { user: User }) {
  const { t } = useTranslation();
  const lang = useLang();
  const refetchUser = useAuthStore((state) => state.refetchUser);
  const [editOpen, setEditOpen] = useState(false);
  const [imageOpen, setImageOpen] = useState(false);

  // Errors propagate to the dialog, which shows them inline.
  const handleSave = async (formData: FormData) => {
    await updateCurrentUser(formData);
    await refetchUser();
    setEditOpen(false);
    toast.success(t("profile.updated"));
  };

  const avatarUrl = mediaUrl(user.avatar, SLAVE_PLACEHOLDER);
  const fullName = [user.first_name, user.last_name].filter(Boolean).join(" ");

  return (
    <>
      <Card className="mx-auto mt-4 max-w-[400px] p-2">
        <CardContent className="grid gap-4">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setImageOpen(true)}
              aria-label={t("profile.viewAvatar")}
              className="rounded-full transition-[transform,box-shadow] duration-200 hover:scale-[1.08] hover:shadow-md"
            >
              <Avatar className="size-16">
                <AvatarImage src={avatarUrl} alt={user.username} />
                <AvatarFallback>{user.username.slice(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
            </button>

            <div className="min-w-0">
              <p className="truncate font-semibold">{user.username}</p>
              <p className="text-muted-foreground truncate text-sm">{user.email}</p>
              {fullName && <p className="text-muted-foreground truncate text-sm">{fullName}</p>}
            </div>
          </div>

          {user.bio && (
            <div>
              <p className="text-muted-foreground mb-1 text-sm">{t("profile.bio")}</p>
              <p>{user.bio}</p>
            </div>
          )}

          <div>
            <p className="text-muted-foreground mb-1 text-sm">{t("profile.joined")}</p>
            <p>{new Date(user.date_joined).toLocaleDateString(DATE_LOCALES[lang])}</p>
          </div>

          <Button
            variant="outline"
            size="lg"
            className="mt-2 w-full"
            onClick={() => setEditOpen(true)}
          >
            {t("profile.edit")}
          </Button>
        </CardContent>
      </Card>

      <EditSlaveDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        slave={user}
        onSave={handleSave}
      />

      <ImageViewerDialog
        open={imageOpen}
        onOpenChange={setImageOpen}
        src={avatarUrl}
        alt={t("profile.fullAvatar")}
      />
    </>
  );
}

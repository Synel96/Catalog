import "./street.css";
import { ImageIcon, PawPrintIcon } from "lucide-react";
import { useId, useState } from "react";
import { toast } from "sonner";
import { UploadPreview } from "@/components/common/UploadPreview";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { shrinkImage } from "@/lib/image";
import { mediaUrl } from "@/src/services/api";
import { createPost } from "@/src/services/postService";
import { resetUploadProgress } from "@/src/store/useUploadStore";
import type { ApiError, Overlord } from "@/src/types/api";
import { OVERLORD_PLACEHOLDER } from "./media";
import { useTranslation } from "react-i18next";

type PostComposerProps = {
  overlord: Overlord;
  onPosted: () => void;
};

// Posting form shown on the Street and on the selected overlord's own page.
export function PostComposer({ overlord, onPosted }: PostComposerProps) {
  const { t } = useTranslation();
  const [content, setContent] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputId = useId();

  const canSubmit = (content.trim() !== "" || image !== null) && !isSubmitting;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!canSubmit) return;
    setIsSubmitting(true);
    resetUploadProgress();

    try {
      const formData = new FormData();
      formData.append("overlord", String(overlord.id));
      formData.append("content", content);
      if (image) formData.append("image", await shrinkImage(image));

      await createPost(formData);
      setContent("");
      setImage(null);
      onPosted();
    } catch (error) {
      toast.error((error as ApiError).detail);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="p-2 shadow-md">
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-wrap items-start gap-4">
          <Avatar className="ring-primary size-14 ring-2">
            <AvatarImage src={mediaUrl(overlord.avatar, OVERLORD_PLACEHOLDER)} alt="" />
            <AvatarFallback>{overlord.name.slice(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>

          <div className="grid min-w-0 flex-1 gap-2">
            <p className="text-primary-foreground dark:text-primary font-bold">{overlord.name}</p>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={t("composer.placeholder")}
              aria-label={t("composer.postAs", { name: overlord.name })}
              rows={2}
              disabled={isSubmitting}
            />

            <div className="flex flex-wrap items-center gap-3">
              <input
                id={fileInputId}
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={(e) => {
                  setImage(e.target.files?.[0] ?? null);
                  // Lets the same file be picked again after removing it.
                  e.target.value = "";
                }}
                disabled={isSubmitting}
              />
              <Button variant="secondary" size="icon" asChild>
                <label
                  htmlFor={fileInputId}
                  aria-label={t("composer.attachImage")}
                  className="cursor-pointer"
                >
                  <ImageIcon />
                </label>
              </Button>
              <Button
                type="submit"
                disabled={!canSubmit}
                className="post-pulse ml-auto rounded-full px-4"
              >
                <PawPrintIcon /> {isSubmitting ? t("composer.posting") : t("composer.post")}
              </Button>
            </div>

            {image && (
              <UploadPreview
                file={image}
                uploading={isSubmitting}
                onRemove={() => setImage(null)}
              />
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

import { ImageIcon, SaveIcon } from "lucide-react";
import { useId, useState } from "react";
import { UploadPreview } from "@/components/common/UploadPreview";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { shrinkImage } from "@/lib/image";
import { updatePost } from "@/src/services/postService";
import { resetUploadProgress } from "@/src/store/useUploadStore";
import type { ApiError, Post } from "@/src/types/api";
import { useTranslation } from "react-i18next";
import { CameraButton } from "./CameraCapture";

type EditPostDialogProps = {
  post: Post | null;
  onOpenChange: (open: boolean) => void;
  onUpdated: (post: Post) => void;
};

export function EditPostDialog({ post, onOpenChange, onUpdated }: EditPostDialogProps) {
  const { t } = useTranslation();
  return (
    <Dialog open={post !== null} onOpenChange={onOpenChange}>
      <DialogContent aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>{t("posts.edit")}</DialogTitle>
        </DialogHeader>
        {post && <EditPostForm post={post} onUpdated={onUpdated} />}
      </DialogContent>
    </Dialog>
  );
}

function EditPostForm({ post, onUpdated }: { post: Post; onUpdated: (post: Post) => void }) {
  const { t } = useTranslation();
  const [content, setContent] = useState(post.content);
  const [image, setImage] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputId = useId();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);
    resetUploadProgress();

    try {
      const formData = new FormData();
      formData.append("content", content);
      if (image) formData.append("image", await shrinkImage(image));
      onUpdated(await updatePost(post.id, formData));
    } catch (err) {
      setError((err as ApiError).detail);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-4">
      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={t("posts.editPlaceholder")}
        aria-label={t("posts.content")}
        rows={3}
        autoFocus
        disabled={isSubmitting}
      />

      <div className="flex items-center gap-3">
        <input
          id={fileInputId}
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={(e) => {
            setImage(e.target.files?.[0] ?? null);
            e.target.value = "";
          }}
          disabled={isSubmitting}
        />
        <Button variant="secondary" size="icon" asChild>
          <label
            htmlFor={fileInputId}
            aria-label={t("posts.replaceImage")}
            className="cursor-pointer"
          >
            <ImageIcon />
          </label>
        </Button>
        <CameraButton onCapture={setImage} disabled={isSubmitting} />
        {image && (
          <UploadPreview
            file={image}
            uploading={isSubmitting}
            onRemove={() => setImage(null)}
            className="flex-1"
          />
        )}
      </div>

      {error && (
        <p role="alert" className="text-destructive text-sm">
          {error}
        </p>
      )}

      {/* Text, a picture, or both (the picture may be the one already there). */}
      <Button
        type="submit"
        size="lg"
        disabled={(!content.trim() && !image && !post.image) || isSubmitting}
      >
        <SaveIcon /> {isSubmitting ? t("common.saving") : t("common.saveChanges")}
      </Button>
    </form>
  );
}

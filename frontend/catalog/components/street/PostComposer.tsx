import "./street.css";
import { ImageIcon, PawPrintIcon, XIcon } from "lucide-react";
import { useId, useState } from "react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { mediaUrl } from "@/src/services/api";
import { createPost } from "@/src/services/postService";
import type { ApiError, Overlord } from "@/src/types/api";
import { OVERLORD_PLACEHOLDER } from "./media";

type PostComposerProps = {
  overlord: Overlord;
  onPosted: () => void;
};

// Posting form shown on the Street and on the selected overlord's own page.
export function PostComposer({ overlord, onPosted }: PostComposerProps) {
  const [content, setContent] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputId = useId();

  const canSubmit = (content.trim() !== "" || image !== null) && !isSubmitting;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!canSubmit) return;
    setIsSubmitting(true);

    const formData = new FormData();
    formData.append("overlord", String(overlord.id));
    formData.append("content", content);
    if (image) formData.append("image", image);

    try {
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
              placeholder="Write something mew..."
              aria-label={`Post as ${overlord.name}`}
              rows={2}
              disabled={isSubmitting}
            />

            <div className="flex flex-wrap items-center gap-3">
              <input
                id={fileInputId}
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={(e) => setImage(e.target.files?.[0] ?? null)}
                disabled={isSubmitting}
              />
              <Button variant="secondary" size="icon" asChild>
                <label htmlFor={fileInputId} aria-label="Attach image" className="cursor-pointer">
                  <ImageIcon />
                </label>
              </Button>
              {image && (
                <span className="text-muted-foreground flex min-w-0 items-center gap-1 text-sm">
                  <span className="truncate">{image.name}</span>
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    aria-label="Remove image"
                    onClick={() => setImage(null)}
                  >
                    <XIcon />
                  </Button>
                </span>
              )}

              <Button
                type="submit"
                disabled={!canSubmit}
                className="post-pulse ml-auto rounded-full px-4"
              >
                <PawPrintIcon /> {isSubmitting ? "Posting…" : "Post"}
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

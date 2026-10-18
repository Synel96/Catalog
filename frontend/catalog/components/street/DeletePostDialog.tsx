import { TriangleAlertIcon } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { deletePost } from "@/src/services/postService";
import type { ApiError, Post } from "@/src/types/api";

type DeletePostDialogProps = {
  post: Post | null;
  onOpenChange: (open: boolean) => void;
  onDeleted: (postId: number) => void;
};

export function DeletePostDialog({ post, onOpenChange, onDeleted }: DeletePostDialogProps) {
  const [error, setError] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!post) return;
    setError("");
    setIsDeleting(true);
    try {
      await deletePost(post.id);
      onDeleted(post.id);
    } catch (err) {
      setError((err as ApiError).detail);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog
      open={post !== null}
      onOpenChange={(open) => {
        if (!open) setError("");
        onOpenChange(open);
      }}
    >
      <DialogContent role="alertdialog" className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TriangleAlertIcon className="text-destructive size-5" /> Delete Post
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this post? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <p role="alert" className="text-destructive text-sm">
            {error}
          </p>
        )}

        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
            {isDeleting ? "Deleting…" : "Delete"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

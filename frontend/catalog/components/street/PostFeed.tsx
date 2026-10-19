import { useState } from "react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuthStore } from "@/src/store/useAuthStore";
import { useStreetStore } from "@/src/store/useStreetStore";
import type { Post } from "@/src/types/api";
import { DeletePostDialog } from "./DeletePostDialog";
import { EditPostDialog } from "./EditPostDialog";
import { PostCard } from "./PostCard";
import { useTranslation } from "react-i18next";

type PostFeedProps = {
  posts: Post[];
  isLoading: boolean;
  error?: string | null;
  onPostUpdated: (post: Post) => void;
  onPostDeleted: (postId: number) => void;
};

export function PostFeed({ posts, isLoading, error, onPostUpdated, onPostDeleted }: PostFeedProps) {
  const { t } = useTranslation();
  const selectedOverlord = useStreetStore((state) => state.selectedOverlord);
  const user = useAuthStore((state) => state.user);
  const [editing, setEditing] = useState<Post | null>(null);
  const [deleting, setDeleting] = useState<Post | null>(null);

  // The backend lets the user edit/delete posts of any of their overlords.
  const isOwnOverlord = (overlordId: number) =>
    selectedOverlord?.id === overlordId ||
    (user?.overlords.some((o) => o.id === overlordId) ?? false);

  if (isLoading && posts.length === 0) return <PostFeedSkeleton />;
  if (error) return <p className="text-destructive">{error}</p>;
  if (posts.length === 0) return <p className="text-muted-foreground">{t("posts.empty")}</p>;

  return (
    <div className="grid gap-6">
      {posts.map((post) => (
        <PostCard
          key={post.id}
          post={post}
          actingOverlord={selectedOverlord}
          canManage={isOwnOverlord(post.overlord)}
          onEdit={setEditing}
          onDelete={setDeleting}
        />
      ))}

      <EditPostDialog
        post={editing}
        onOpenChange={(open) => !open && setEditing(null)}
        onUpdated={(post) => {
          onPostUpdated(post);
          setEditing(null);
          toast.success(t("posts.updated"));
        }}
      />
      <DeletePostDialog
        post={deleting}
        onOpenChange={(open) => !open && setDeleting(null)}
        onDeleted={(postId) => {
          onPostDeleted(postId);
          setDeleting(null);
          toast.success(t("posts.deleted"));
        }}
      />
    </div>
  );
}

function PostFeedSkeleton() {
  const { t } = useTranslation();
  return (
    <div className="grid gap-6" aria-busy="true" aria-label={t("posts.loading")}>
      {Array.from({ length: 2 }, (_, i) => (
        <Card key={i}>
          <CardContent className="grid gap-4">
            <div className="flex items-center gap-3">
              <Skeleton className="size-11 rounded-full" />
              <div className="grid gap-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

import "./street.css";
import { ArrowUpIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
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
  // Infinite scrolling (see src/hooks/use-post-feed.ts).
  hasMore?: boolean;
  isLoadingMore?: boolean;
  onLoadMore?: () => void;
  // Newer posts waiting to be shown.
  incomingCount?: number;
  onShowIncoming?: () => void;
};

// Starts loading the next page this far before the end comes into view,
// so normal scrolling never has to wait for it.
const PRELOAD_MARGIN = "1000px 0px";

export function PostFeed({
  posts,
  isLoading,
  error,
  onPostUpdated,
  onPostDeleted,
  hasMore = false,
  isLoadingMore = false,
  onLoadMore,
  incomingCount = 0,
  onShowIncoming,
}: PostFeedProps) {
  const { t } = useTranslation();
  const selectedOverlord = useStreetStore((state) => state.selectedOverlord);
  const user = useAuthStore((state) => state.user);
  const [editing, setEditing] = useState<Post | null>(null);
  const [deleting, setDeleting] = useState<Post | null>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);

  // Re-observed after every page: if the end is still near (a short page,
  // a tall screen), the fresh observer's first callback loads the next one.
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !hasMore || isLoadingMore || !onLoadMore) return;
    if (typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(([entry]) => entry?.isIntersecting && onLoadMore(), {
      rootMargin: PRELOAD_MARGIN,
    });
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, isLoadingMore, onLoadMore, posts.length]);

  const showIncoming = () => {
    onShowIncoming?.();
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const incomingPill = incomingCount > 0 && (
    <div className="pointer-events-none sticky top-20 z-30 flex justify-center sm:top-24">
      <Button
        size="sm"
        onClick={showIncoming}
        className="post-pulse pointer-events-auto rounded-full shadow-lg"
      >
        <ArrowUpIcon /> {t("posts.newPosts", { count: incomingCount })}
      </Button>
    </div>
  );

  // The backend lets the user edit/delete posts of any of their overlords.
  const isOwnOverlord = (overlordId: number) =>
    selectedOverlord?.id === overlordId ||
    (user?.overlords.some((o) => o.id === overlordId) ?? false);

  if (isLoading && posts.length === 0) return <PostFeedSkeleton />;
  if (error) return <p className="text-destructive">{error}</p>;
  if (posts.length === 0) {
    return (
      <>
        {incomingPill}
        <p className="text-muted-foreground">{t("posts.empty")}</p>
      </>
    );
  }

  return (
    <div className="grid gap-6">
      {incomingPill}
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

      <div ref={sentinelRef} aria-hidden />
      {isLoadingMore && <PostFeedSkeleton count={1} />}
      {hasMore && !isLoadingMore && onLoadMore && (
        // Also a fallback where the observer can't fire.
        <Button variant="outline" onClick={onLoadMore} className="justify-self-center">
          {t("posts.loadMore")}
        </Button>
      )}
      {!hasMore && posts.length > 3 && (
        <p className="text-muted-foreground py-4 text-center text-sm">{t("posts.end")}</p>
      )}

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

function PostFeedSkeleton({ count = 2 }: { count?: number }) {
  const { t } = useTranslation();
  return (
    <div className="grid gap-6" aria-busy="true" aria-label={t("posts.loading")}>
      {Array.from({ length: count }, (_, i) => (
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

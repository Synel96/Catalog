import { ArrowLeftIcon } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { usePageContext } from "vike-react/usePageContext";
import { OverlordFormDialog } from "@/components/myoverlords/OverlordFormDialog";
import { ProfileHeader } from "@/components/overlord/ProfileHeader";
import { WhiskerButton } from "@/components/overlord/WhiskerButton";
import { PostComposer } from "@/components/street/PostComposer";
import { PostFeed } from "@/components/street/PostFeed";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useFeedSocket } from "@/src/hooks/use-feed-socket";
import { useMounted } from "@/src/hooks/use-mounted";
import { getOverlord } from "@/src/services/overlordsService";
import { getPostsByOverlord } from "@/src/services/postService";
import { useAuthStore } from "@/src/store/useAuthStore";
import { useStreetStore } from "@/src/store/useStreetStore";
import type { ApiError, Overlord, Post } from "@/src/types/api";
import { useTranslation } from "react-i18next";

// /overlord?id=<id> (see components/street/links.ts for why not /overlords/@id).
export default function Page() {
  const { t } = useTranslation();
  const mounted = useMounted();
  const { urlParsed } = usePageContext();
  const id = Number(urlParsed.search.id);

  // Prerendered HTML has no query string, so wait for the browser's URL.
  if (!mounted) return <OverlordSkeleton />;
  if (!Number.isInteger(id) || id <= 0) return <NotFound message={t("overlordPage.missingId")} />;
  return <OverlordProfile key={id} id={id} />;
}

function OverlordProfile({ id }: { id: number }) {
  const { t } = useTranslation();
  const user = useAuthStore((state) => state.user);
  const streetOverlord = useStreetStore((state) => state.selectedOverlord);
  const [overlord, setOverlord] = useState<Overlord | null>(null);
  const [error, setError] = useState("");
  const [posts, setPosts] = useState<Post[]>([]);
  const [postsLoading, setPostsLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);

  // Bumping a version re-runs the matching fetch below (after a whisker,
  // an edit, a new post or a feed socket event).
  const [overlordVersion, setOverlordVersion] = useState(0);
  const [postsVersion, setPostsVersion] = useState(0);
  const reloadOverlord = () => setOverlordVersion((v) => v + 1);
  const reloadPosts = useCallback(() => setPostsVersion((v) => v + 1), []);

  useEffect(() => {
    let cancelled = false;
    getOverlord(id)
      .then((data) => {
        if (cancelled) return;
        setOverlord(data);
        document.title = `${t("overlordPage.title")} • ${data.name}`;
      })
      .catch((err: ApiError) => !cancelled && setError(err.detail));
    return () => {
      cancelled = true;
    };
  }, [id, overlordVersion, t]);

  const actingId = streetOverlord?.id ?? null;
  useEffect(() => {
    let cancelled = false;
    getPostsByOverlord(id, actingId)
      .then((data) => !cancelled && setPosts(data))
      .catch((err) => console.error("Failed to load posts:", err))
      .finally(() => !cancelled && setPostsLoading(false));
    return () => {
      cancelled = true;
    };
  }, [id, postsVersion, actingId]);

  useFeedSocket(
    useCallback(
      (event) => {
        if (event.overlord === id) reloadPosts();
      },
      [id, reloadPosts]
    )
  );

  if (error) return <NotFound message={error} />;
  if (!overlord) return <OverlordSkeleton />;

  const isStreetOverlord = streetOverlord?.id === overlord.id;
  const isOwn = user?.id === overlord.slave;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-6 flex items-center gap-2">
        <h1 className="flex-1 text-3xl font-bold">{t("overlordPage.title")}</h1>
        <Button variant="outline" size="sm" onClick={() => history.back()}>
          <ArrowLeftIcon /> {t("common.back")}
        </Button>
      </div>

      <section className="mb-8 border-t pt-6">
        <ProfileHeader
          overlord={overlord}
          onEdit={isOwn ? () => setEditOpen(true) : undefined}
          whisker={
            streetOverlord && !isStreetOverlord ? (
              <WhiskerButton
                fromId={streetOverlord.id}
                toId={overlord.id}
                onChange={reloadOverlord}
              />
            ) : null
          }
        />
        {!streetOverlord && !isOwn && (
          <p className="text-muted-foreground mt-4 text-sm">
            {t("overlordPage.whiskerHint", { name: overlord.name })}
          </p>
        )}
      </section>

      {isStreetOverlord && (
        <section className="mb-8">
          <PostComposer overlord={overlord} onPosted={reloadPosts} />
        </section>
      )}

      <h2 className="mb-4 text-xl font-bold">{t("overlordPage.posts")}</h2>
      <PostFeed
        posts={posts}
        isLoading={postsLoading}
        onPostUpdated={(post) => setPosts((prev) => prev.map((p) => (p.id === post.id ? post : p)))}
        onPostDeleted={(postId) => setPosts((prev) => prev.filter((p) => p.id !== postId))}
      />

      {isOwn && (
        <OverlordFormDialog
          open={editOpen}
          onOpenChange={(open) => {
            setEditOpen(open);
            if (!open) reloadOverlord();
          }}
          overlord={overlord}
        />
      )}
    </div>
  );
}

function NotFound({ message }: { message: string }) {
  const { t } = useTranslation();
  return (
    <div className="mx-auto max-w-xl px-4 py-16">
      <h1 className="text-destructive mb-2 text-2xl font-bold">{t("overlordPage.notFound")}</h1>
      <p className="text-muted-foreground mb-6">{message}</p>
      <Button variant="outline" onClick={() => history.back()}>
        <ArrowLeftIcon /> {t("common.back")}
      </Button>
    </div>
  );
}

function OverlordSkeleton() {
  const { t } = useTranslation();
  return (
    <div
      className="mx-auto max-w-4xl px-4 py-8"
      aria-busy="true"
      aria-label={t("overlordPage.loading")}
    >
      <Skeleton className="mb-8 h-9 w-40" />
      <div className="flex gap-6">
        <Skeleton className="size-[100px] rounded-full" />
        <div className="grid flex-1 gap-3">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      </div>
    </div>
  );
}

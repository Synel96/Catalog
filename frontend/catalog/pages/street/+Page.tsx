import { useCallback } from "react";
import { PostComposer } from "@/components/street/PostComposer";
import { PostFeed } from "@/components/street/PostFeed";
import { StreetTutorial } from "@/components/tutorial/tutorials";
import { useMounted } from "@/src/hooks/use-mounted";
import { useFeedSocket } from "@/src/hooks/use-feed-socket";
import { usePostFeed } from "@/src/hooks/use-post-feed";
import { getStreetPosts } from "@/src/services/postService";
import { useStreetStore } from "@/src/store/useStreetStore";
import { Trans, useTranslation } from "react-i18next";
import { useLocalePath } from "@/src/i18n/hooks";

export default function Page() {
  const { t } = useTranslation();
  const localePath = useLocalePath();
  const mounted = useMounted();
  const overlord = useStreetStore((state) => state.selectedOverlord);

  // Starts over when another overlord goes out: `my_reaction` is theirs.
  const overlordId = overlord?.id ?? null;
  const feed = usePostFeed(
    useCallback((cursor: string | null) => getStreetPosts(overlordId, cursor), [overlordId])
  );
  const { refresh } = feed;

  // Someone posted or the chatter changed a post: counts update in place,
  // new posts wait behind the "new posts" button.
  useFeedSocket(useCallback(() => void refresh(), [refresh]));

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between gap-4">
        <h1 className="text-3xl font-bold">{t("street.title")}</h1>
        <StreetTutorial />
      </div>

      {/* The selected overlord comes from localStorage, so it's only known
          after mount; the prerendered HTML shows neither branch. */}
      {mounted &&
        (overlord ? (
          <PostComposer overlord={overlord} onPosted={() => void refresh({ show: true })} />
        ) : (
          <p className="bg-secondary text-secondary-foreground rounded-lg p-4">
            <Trans
              i18nKey="street.pickOverlord"
              components={{
                link: (
                  <a
                    href={localePath("/my-slave")}
                    className="font-semibold underline underline-offset-4"
                  />
                ),
              }}
            />
          </p>
        ))}

      <div className="mt-8">
        <PostFeed
          posts={feed.posts}
          isLoading={feed.isLoading || !mounted}
          error={feed.error}
          onPostUpdated={feed.replacePost}
          onPostDeleted={feed.removePost}
          hasMore={feed.hasMore}
          isLoadingMore={feed.isLoadingMore}
          onLoadMore={feed.loadMore}
          incomingCount={feed.incomingCount}
          onShowIncoming={feed.showIncoming}
        />
      </div>
    </div>
  );
}

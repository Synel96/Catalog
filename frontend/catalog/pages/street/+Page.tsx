import { useCallback, useEffect } from "react";
import { PostComposer } from "@/components/street/PostComposer";
import { PostFeed } from "@/components/street/PostFeed";
import { useMounted } from "@/src/hooks/use-mounted";
import { useFeedSocket } from "@/src/hooks/use-feed-socket";
import { useStreetStore } from "@/src/store/useStreetStore";

export default function Page() {
  const mounted = useMounted();
  const overlord = useStreetStore((state) => state.selectedOverlord);
  const posts = useStreetStore((state) => state.posts);
  const isLoading = useStreetStore((state) => state.isLoading);
  const error = useStreetStore((state) => state.error);
  const fetchPosts = useStreetStore((state) => state.fetchPosts);
  const replacePost = useStreetStore((state) => state.replacePost);
  const removePost = useStreetStore((state) => state.removePost);

  useEffect(() => {
    void fetchPosts();
  }, [fetchPosts]);

  // Someone posted: reload the feed.
  useFeedSocket(useCallback(() => void fetchPosts(), [fetchPosts]));

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold">Street</h1>

      {/* The selected overlord comes from localStorage, so it's only known
          after mount; the prerendered HTML shows neither branch. */}
      {mounted &&
        (overlord ? (
          <PostComposer overlord={overlord} onPosted={() => void fetchPosts()} />
        ) : (
          <p className="bg-secondary text-secondary-foreground rounded-lg p-4">
            To post, react and whisker, pick an overlord on{" "}
            <a href="/my-slave" className="font-semibold underline underline-offset-4">
              My Slave
            </a>{" "}
            and go to the Street with them.
          </p>
        ))}

      <div className="mt-8">
        <PostFeed
          posts={posts}
          isLoading={isLoading || !mounted}
          error={error}
          onPostUpdated={replacePost}
          onPostDeleted={removePost}
        />
      </div>
    </div>
  );
}

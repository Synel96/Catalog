import { MessageCircleIcon, PencilIcon, Trash2Icon } from "lucide-react";
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { mediaUrl } from "@/src/services/api";
import type { Post } from "@/src/types/api";
import { formatPostDate, OVERLORD_PLACEHOLDER } from "./media";
import { overlordHref } from "./links";
import { CommentSection } from "./CommentSection";
import { ReactionBar } from "./ReactionBar";
import { useTranslation } from "react-i18next";
import { useLang } from "@/src/i18n/hooks";
import { langPath } from "@/src/i18n/config";

type PostCardProps = {
  post: Post;
  // The user's street overlord, who reacts and comments.
  actingOverlord: { id: number; name: string } | null;
  canManage: boolean;
  onEdit: (post: Post) => void;
  onDelete: (post: Post) => void;
};

export function PostCard({ post, actingOverlord, canManage, onEdit, onDelete }: PostCardProps) {
  const { t } = useTranslation();
  const lang = useLang();
  const profileHref = langPath(overlordHref(post.overlord), lang);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [commentCount, setCommentCount] = useState(post.comment_count ?? 0);
  const [syncedCount, setSyncedCount] = useState(post.comment_count);

  // Adopt a refetched count (see ReactionBar for the pattern).
  if (post.comment_count !== syncedCount) {
    setSyncedCount(post.comment_count);
    setCommentCount(post.comment_count ?? 0);
  }

  return (
    <Card className="gap-3 overflow-hidden pb-2">
      <CardContent className="flex items-center gap-3">
        <a href={profileHref} className="rounded-full transition-transform hover:scale-105">
          <Avatar className="ring-primary size-11 ring-2">
            <AvatarImage src={mediaUrl(post.overlord_avatar, OVERLORD_PLACEHOLDER)} alt="" />
            <AvatarFallback>{post.overlord_name.slice(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
        </a>
        <div className="min-w-0 flex-1">
          <a href={profileHref} className="font-bold underline-offset-4 hover:underline">
            {post.overlord_name}
          </a>
          <p className="text-muted-foreground text-xs">
            <time dateTime={post.created_at}>{formatPostDate(post.created_at, lang)}</time>
          </p>
        </div>
        {canManage && (
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label={t("posts.editLabel")}
              onClick={() => onEdit(post)}
            >
              <PencilIcon />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label={t("posts.deleteLabel")}
              onClick={() => onDelete(post)}
              className="text-destructive hover:text-destructive"
            >
              <Trash2Icon />
            </Button>
          </div>
        )}
      </CardContent>

      {post.content && (
        <CardContent>
          <p className="whitespace-pre-wrap">{post.content}</p>
        </CardContent>
      )}

      {post.image && (
        <img
          src={mediaUrl(post.image, "")}
          alt=""
          loading="lazy"
          className="bg-muted max-h-[400px] min-h-[200px] w-full object-cover"
        />
      )}

      <CardContent className="grid gap-2 border-t pt-1">
        <ReactionBar
          postId={post.id}
          summary={post.reaction_summary}
          overlordId={actingOverlord?.id ?? null}
        />
        <div>
          <Button
            variant="ghost"
            size="sm"
            aria-expanded={commentsOpen}
            onClick={() => setCommentsOpen((open) => !open)}
          >
            <MessageCircleIcon />
            {t("comments.count", { count: commentCount })}
          </Button>
        </div>
        {commentsOpen && (
          <CommentSection
            postId={post.id}
            overlordId={actingOverlord?.id ?? null}
            overlordName={actingOverlord?.name ?? null}
            serverCount={post.comment_count ?? 0}
            onCountChange={(delta) => setCommentCount((count) => count + delta)}
          />
        )}
      </CardContent>
    </Card>
  );
}

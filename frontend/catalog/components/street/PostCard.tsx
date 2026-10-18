import { PencilIcon, Trash2Icon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { mediaUrl } from "@/src/services/api";
import type { Post } from "@/src/types/api";
import { formatPostDate, OVERLORD_PLACEHOLDER } from "./media";
import { overlordHref } from "./links";
import { ReactionBar } from "./ReactionBar";

type PostCardProps = {
  post: Post;
  reactingOverlordId: number | null;
  canManage: boolean;
  onEdit: (post: Post) => void;
  onDelete: (post: Post) => void;
};

export function PostCard({ post, reactingOverlordId, canManage, onEdit, onDelete }: PostCardProps) {
  const profileHref = overlordHref(post.overlord);

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
            <time dateTime={post.created_at}>{formatPostDate(post.created_at)}</time>
          </p>
        </div>
        {canManage && (
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="Edit post"
              onClick={() => onEdit(post)}
            >
              <PencilIcon />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="Delete post"
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

      <CardContent className="border-t pt-1">
        <ReactionBar
          postId={post.id}
          summary={post.reaction_summary}
          overlordId={reactingOverlordId}
        />
      </CardContent>
    </Card>
  );
}

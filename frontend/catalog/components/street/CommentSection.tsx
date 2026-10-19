import { CheckIcon, PencilIcon, SendIcon, Trash2Icon, XIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  createComment,
  deleteComment,
  getPostComments,
  updateComment,
} from "@/src/services/commentService";
import { useAuthStore } from "@/src/store/useAuthStore";
import type { ApiError, Comment } from "@/src/types/api";
import { overlordHref } from "./links";
import { formatPostDate } from "./media";
import { useTranslation } from "react-i18next";
import { useLang } from "@/src/i18n/hooks";
import { useLocalePath } from "@/src/i18n/hooks";

type CommentSectionProps = {
  postId: number;
  // The overlord commenting; writing is disabled without one.
  overlordId: number | null;
  overlordName: string | null;
  // The post's comment count from the last feed fetch; when a refetch
  // (e.g. after a feed socket event) changes it, the list reloads.
  serverCount: number;
  onCountChange: (delta: number) => void;
};

// Loaded when the section is opened (it's only mounted then).
export function CommentSection({
  postId,
  overlordId,
  overlordName,
  serverCount,
  onCountChange,
}: CommentSectionProps) {
  const { t } = useTranslation();
  const user = useAuthStore((state) => state.user);
  const [comments, setComments] = useState<Comment[] | null>(null);
  const [error, setError] = useState("");
  const [draft, setDraft] = useState("");
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getPostComments(postId)
      .then((data) => !cancelled && setComments(data))
      .catch((err: ApiError) => !cancelled && setError(err.detail));
    return () => {
      cancelled = true;
    };
  }, [postId, serverCount]);

  const isOwn = (comment: Comment) =>
    user?.overlords.some((o) => o.id === comment.overlord) ?? false;

  const send = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!overlordId || !draft.trim()) return;
    setIsSending(true);
    try {
      const comment = await createComment(postId, overlordId, draft.trim());
      setComments((prev) => [...(prev ?? []), comment]);
      setDraft("");
      onCountChange(1);
    } catch (err) {
      toast.error((err as ApiError).detail);
    } finally {
      setIsSending(false);
    }
  };

  const remove = async (comment: Comment) => {
    try {
      await deleteComment(comment.id);
      setComments((prev) => prev?.filter((c) => c.id !== comment.id) ?? null);
      onCountChange(-1);
    } catch (err) {
      toast.error((err as ApiError).detail);
    }
  };

  const replace = (comment: Comment) =>
    setComments((prev) => prev?.map((c) => (c.id === comment.id ? comment : c)) ?? null);

  return (
    <div className="grid gap-3 border-t pt-3">
      {error && <p className="text-destructive text-sm">{error}</p>}
      {!comments && !error && (
        <div className="grid gap-2" aria-busy="true" aria-label={t("comments.loading")}>
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      )}
      {comments?.length === 0 && (
        <p className="text-muted-foreground text-sm">{t("comments.empty")}</p>
      )}
      {comments && comments.length > 0 && (
        <ul className="grid gap-3">
          {comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              canManage={isOwn(comment)}
              onUpdated={replace}
              onDelete={() => remove(comment)}
            />
          ))}
        </ul>
      )}

      {overlordId ? (
        <form onSubmit={send} className="flex items-end gap-2">
          <Textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={t("comments.placeholder", { name: overlordName })}
            aria-label={t("comments.as", { name: overlordName })}
            rows={1}
            className="min-h-9"
            disabled={isSending}
          />
          <Button
            type="submit"
            size="icon"
            aria-label={t("comments.send")}
            disabled={!draft.trim() || isSending}
          >
            <SendIcon />
          </Button>
        </form>
      ) : (
        <p className="text-muted-foreground text-sm">{t("comments.needOverlord")}</p>
      )}
    </div>
  );
}

type CommentItemProps = {
  comment: Comment;
  canManage: boolean;
  onUpdated: (comment: Comment) => void;
  onDelete: () => void;
};

function CommentItem({ comment, canManage, onUpdated, onDelete }: CommentItemProps) {
  const { t } = useTranslation();
  const lang = useLang();
  const localePath = useLocalePath();
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(comment.content);
  const [isSaving, setIsSaving] = useState(false);

  const save = async () => {
    if (!text.trim()) return;
    setIsSaving(true);
    try {
      onUpdated(await updateComment(comment.id, text.trim()));
      setEditing(false);
    } catch (err) {
      toast.error((err as ApiError).detail);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <li className="bg-secondary text-secondary-foreground rounded-lg px-3 py-2">
      <div className="flex items-center gap-2">
        <a
          href={localePath(overlordHref(comment.overlord))}
          className="text-sm font-semibold underline-offset-4 hover:underline"
        >
          {comment.overlord_name}
        </a>
        <time dateTime={comment.created_at} className="text-muted-foreground text-xs">
          {formatPostDate(comment.created_at, lang)}
        </time>
        {canManage && !editing && (
          <div className="ml-auto flex">
            <Button
              variant="ghost"
              size="icon-xs"
              aria-label={t("comments.edit")}
              onClick={() => {
                setText(comment.content);
                setEditing(true);
              }}
            >
              <PencilIcon />
            </Button>
            <Button
              variant="ghost"
              size="icon-xs"
              aria-label={t("comments.delete")}
              onClick={onDelete}
              className="text-destructive hover:text-destructive"
            >
              <Trash2Icon />
            </Button>
          </div>
        )}
      </div>

      {editing ? (
        <div className="mt-1 flex items-end gap-1">
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            aria-label={t("comments.edit")}
            rows={1}
            className="bg-background min-h-9"
            autoFocus
          />
          <Button size="icon-sm" aria-label={t("comments.save")} onClick={save} disabled={isSaving}>
            <CheckIcon />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={t("comments.cancelEdit")}
            onClick={() => setEditing(false)}
          >
            <XIcon />
          </Button>
        </div>
      ) : (
        <p className="mt-0.5 text-sm whitespace-pre-wrap">{comment.content}</p>
      )}
    </li>
  );
}

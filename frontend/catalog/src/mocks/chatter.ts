import { db, ME, nextId, overlordName, persist } from "./db";

// Simulated activity from the other mock users, so a lone tester still gets
// comments, counter-comments and notifications. Follows the backend's rules
// (feed/views.py): only the post's owner is notified about comments and new
// reactions, and never about their slave's own overlords.

const REPLY_DELAY_MS = 2500;

const OPENERS = [
  "Bold words for someone within swatting distance.",
  "I have read this post and I am choosing to sit on it.",
  "Interesting. I will now stare at you from across the room.",
  "This is the content I woke up from my 14th nap for.",
  "Purrhaps. Purrhaps not.",
  "My slave read this out loud. I left the room.",
];

const COUNTERS = [
  "Disagree. Respectfully. Then disrespectfully.",
  "Bold of you to comment with that much fur on your face.",
  "I've coughed up hairballs with better takes.",
  "Ekekekek. That's all. Ekekekek.",
  "Agreed, but only because I'm too sleepy to argue.",
  "Noted. Ignored. Knocked off the table.",
];

const pick = <T>(items: T[]) => items[Math.floor(Math.random() * items.length)];
const isMine = (overlordId: number) =>
  db.overlords.some((o) => o.id === overlordId && o.slave === ME);
const others = (exclude: number[]) =>
  db.overlords.filter((o) => o.slave !== ME && !exclude.includes(o.id));

// A comment as quoted in notifications (feed/views.py quote()).
function quote(text: string) {
  const trimmed = text.trim();
  if (!trimmed) return "📷";
  return `“${trimmed.length <= 60 ? trimmed : `${trimmed.slice(0, 57)}...`}”`;
}

export function notify(actorId: number, targetId: number, message: string, linkTo: number) {
  const actor = db.overlords.find((o) => o.id === actorId);
  const target = db.overlords.find((o) => o.id === targetId);
  if (!actor || !target || actor.slave === target.slave || target.slave !== ME) return;
  db.notifications.push({
    id: nextId(),
    overlord: targetId,
    message: message.slice(0, 255),
    link: `/overlord?id=${linkTo}`,
    is_read: false,
    created_at: new Date().toISOString(),
  });
}

export function addComment(
  overlordId: number,
  postId: number,
  content: string,
  image: string | null = null
) {
  const comment = {
    id: nextId(),
    overlord: overlordId,
    post: postId,
    content,
    image,
    created_at: new Date().toISOString(),
  };
  db.comments.push(comment);
  const post = db.posts.find((p) => p.id === postId);
  if (post) {
    notify(
      overlordId,
      post.overlord,
      `${overlordName(overlordId)} commented on your post: ${quote(content)}`,
      post.overlord
    );
  }
  return comment;
}

// Toggles a heart like feed/views.py CommentViewSet.heart; a new heart
// notifies the comment's author.
export function toggleHeart(overlordId: number, commentId: number) {
  const existing = db.hearts.find((h) => h.overlord === overlordId && h.comment === commentId);
  if (existing) {
    db.hearts = db.hearts.filter((h) => h !== existing);
  } else {
    db.hearts.push({ overlord: overlordId, comment: commentId });
    const comment = db.comments.find((c) => c.id === commentId);
    const post = db.posts.find((p) => p.id === comment?.post);
    if (comment && post) {
      notify(
        overlordId,
        comment.overlord,
        `${overlordName(overlordId)} hearted your comment: ${quote(comment.content)}`,
        post.overlord
      );
    }
  }
  return {
    hearted: !existing,
    heart_count: db.hearts.filter((h) => h.comment === commentId).length,
  };
}

type Broadcast = (overlordId: number, postId: number) => void;

// The user posted: another overlord comments, a third one reacts and
// argues back.
export function reactToNewPost(postId: number, authorId: number, broadcast: Broadcast) {
  const [first, second] = [...others([])].sort(() => Math.random() - 0.5);
  if (!first || !second) return;

  setTimeout(() => {
    addComment(first.id, postId, pick(OPENERS));
    persist();
    broadcast(authorId, postId);
  }, REPLY_DELAY_MS);

  setTimeout(() => {
    if (!db.posts.some((p) => p.id === postId)) return;
    db.reactions.push({ overlord: second.id, post: postId, type: "purrfect" });
    notify(second.id, authorId, `${second.name} reacted Purrfect to your post.`, authorId);
    addComment(second.id, postId, `@${first.name} ${pick(COUNTERS)}`);
    persist();
    broadcast(authorId, postId);
  }, REPLY_DELAY_MS * 2);
}

// The user commented on someone else's post: its owner hearts the comment
// (which notifies the user) and fires back. (The backend notifies only the
// post owner about comments, so the reply itself brings no notification.)
export function counterComment(
  postId: number,
  commenterId: number,
  broadcast: Broadcast,
  commentId?: number
) {
  const post = db.posts.find((p) => p.id === postId);
  if (!post || isMine(post.overlord)) return;

  setTimeout(() => {
    if (!db.posts.some((p) => p.id === postId)) return;
    if (commentId !== undefined && db.comments.some((c) => c.id === commentId)) {
      toggleHeart(post.overlord, commentId);
    }
    addComment(post.overlord, postId, `@${overlordName(commenterId)} ${pick(COUNTERS)}`);
    persist();
    broadcast(post.overlord, postId);
  }, REPLY_DELAY_MS);
}

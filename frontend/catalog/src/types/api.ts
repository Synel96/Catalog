// Shapes returned by the Django REST API (see backend/catalog/profiles/serializers.py).

export type Overlord = {
  id: number;
  name: string;
  avatar: string | null;
  bio: string;
  breed: string;
  slave: number;
  slave_name?: string;
  whiskered_by_count?: number;
  whiskering_count?: number;
  whiskered_by_names?: string[];
  whiskering_names?: string[];
};

// Keys of core.models.Reaction.REACTION_CHOICES.
export type ReactionType = "purrfect" | "hisss" | "ekekekek" | "nap";

export type ReactionSummary = Partial<Record<ReactionType, number>>;

// backend/catalog/feed/serializers.py PostSerializer
export type Post = {
  id: number;
  overlord: number;
  overlord_name: string;
  overlord_avatar: string | null;
  content: string;
  image: string | null;
  created_at: string;
  reaction_summary: ReactionSummary;
  comment_count: number;
};

// feed/serializers.py CommentSerializer
export type Comment = {
  id: number;
  overlord: number;
  overlord_name: string;
  post: number;
  content: string;
  created_at: string;
};

// feed/serializers.py NotificationSerializer. `overlord` is the user's own
// overlord the notification is for; `link` is a frontend path.
export type Notification = {
  id: number;
  overlord: number;
  overlord_name: string;
  message: string;
  link: string | null;
  is_read: boolean;
  created_at: string;
};

export type ToggleReactionResult = { status: "reacted" | "updated" | "unreacted" };

export type User = {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  bio: string;
  avatar: string | null;
  date_joined: string;
  overlords: Overlord[];
};

export type LoginCredentials = {
  username: string;
  password: string;
};

export type RegisterPayload = {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
};

// DRF error bodies: `{ detail }` or field errors like `{ username: ["..."] }`.
export type ApiError = {
  detail: string;
};

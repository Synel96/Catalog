// Shapes returned by the Django REST API (see backend/catalog/profiles/serializers.py).

export type Overlord = {
  id: number;
  name: string;
  avatar: string | null;
  bio: string;
  breed: string;
  slave: number;
};

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

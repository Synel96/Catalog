// Backend defaults for missing avatars (core/models.py).
export const OVERLORD_PLACEHOLDER = "/media/placeholders/overlord_placeholder.png";

const DATE_FORMAT = new Intl.DateTimeFormat("hu-HU", {
  year: "numeric",
  month: "long",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

export function formatPostDate(iso: string): string {
  return DATE_FORMAT.format(new Date(iso));
}

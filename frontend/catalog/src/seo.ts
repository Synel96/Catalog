import { BRAND_NAME, SITE_URL, OG_IMAGE_PATH, SITE_DESCRIPTION } from "../components/site";

type BuildMetaInput = {
  pathname: string;
  title?: string | null;
  description?: string | null;
};

export function buildMeta({ pathname, title, description }: BuildMetaInput) {
  const canonicalUrl = new URL(pathname, SITE_URL).toString();
  const resolvedTitle = title && title.trim().length > 0 ? `${title} | ${BRAND_NAME}` : BRAND_NAME;
  const resolvedDescription =
    description && description.trim().length > 0 ? description : SITE_DESCRIPTION;

  return {
    canonicalUrl,
    title: resolvedTitle,
    description: resolvedDescription,
    image: new URL(OG_IMAGE_PATH, SITE_URL).toString(),
  };
}

import { z } from "zod";

const envSchema = z.object({
  // Public values exposed to the browser (Vite convention: VITE_*)
  VITE_SITE_URL: z.string().url().default("http://localhost:5173"),
  VITE_BRAND_NAME: z.string().min(1).default("Catalog"),

  // Base URL of the Django REST API, including the `/api` prefix.
  VITE_API_URL: z.string().url().default("http://localhost:8000/api"),

  // "true" swaps the backend for in-browser mocks (src/mocks), e.g. for a
  // Vercel preview without a reachable/CORS-enabled backend.
  VITE_API_MOCKS: z
    .enum(["true", "false"])
    .default("false")
    .transform((value) => value === "true"),
});

const parsed = envSchema.safeParse({
  VITE_SITE_URL: import.meta.env.VITE_SITE_URL,
  VITE_BRAND_NAME: import.meta.env.VITE_BRAND_NAME,
  VITE_API_URL: import.meta.env.VITE_API_URL,
  VITE_API_MOCKS: import.meta.env.VITE_API_MOCKS,
});

if (!parsed.success) {
  const issues = parsed.error.issues.map((issue) => `- ${issue.path.join(".")}: ${issue.message}`);
  throw new Error(`Invalid environment configuration:\n${issues.join("\n")}`);
}

export const env = parsed.data;

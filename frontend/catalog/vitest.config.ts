import { defineConfig } from "vitest/config";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      "@": resolve(__dirname, "./"),
    },
  },
  test: {
    // Node by default; component tests opt into jsdom with a
    // `// @vitest-environment jsdom` comment at the top of the file.
    environment: "node",
    include: ["**/*.test.{ts,tsx}"],
    exclude: ["node_modules/**", "dist/**", "e2e/**"],
    setupFiles: ["./src/test/setup.ts"],
    // Component tests run against the mock backend (src/mocks), which
    // mock mode points the API client at.
    env: { VITE_API_MOCKS: "true" },
  },
});

import vike from "vike/plugin";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig(({ isSsrBuild }) => ({
  plugins: [tailwindcss(), vike(), react()],
  // The Django backend only allows CORS from this origin (CORS_ALLOWED_ORIGINS).
  server: { port: 5173, strictPort: true },
  preview: { port: 5173, strictPort: true },
  resolve: {
    alias: {
      "@": resolve(__dirname, "./"),
    },
  },
  build: {
    rollupOptions: {
      output: isSsrBuild
        ? undefined
        : {
            // Keep vendor libraries in stable chunks for better browser caching.
            manualChunks(id) {
              if (id.includes("node_modules/react") || id.includes("node_modules/react-dom")) {
                return "vendor-react";
              }
              if (id.includes("node_modules/vike") || id.includes("node_modules/vike-react")) {
                return "vendor-vike";
              }
              return undefined;
            },
            chunkFileNames: "chunks/[name]-[hash].js",
          },
    },
    // Chunk size warning threshold (in kb)
    chunkSizeWarningLimit: 500,
    // Disable source maps in production.
    sourcemap: false,
  },
}));

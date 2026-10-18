// https://vike.dev/onBeforeRenderClient
//
// In mock mode, start the MSW service worker before the first render so no
// API call can slip past it. The import sits behind a literal
// `import.meta.env` check, so production builds without mocks drop it.

let mocksReady: Promise<unknown> | undefined;

export async function onBeforeRenderClient() {
  if (import.meta.env.VITE_API_MOCKS !== "true") return;

  mocksReady ??= import("@/src/mocks/browser").then(({ worker }) =>
    worker.start({ onUnhandledRequest: "bypass", quiet: true })
  );
  await mocksReady;
}

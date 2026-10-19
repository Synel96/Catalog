import { create } from "zustand";

// The browser's install prompt (Chromium only), held until the user asks.
type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

type PwaState = {
  installPrompt: BeforeInstallPromptEvent | null;
  installed: boolean;
};

export const usePwaStore = create<PwaState>()(() => ({ installPrompt: null, installed: false }));

// Running as the installed app (from the home screen / app list).
export const isStandalone = () =>
  typeof window !== "undefined" &&
  (window.matchMedia?.("(display-mode: standalone)").matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true);

// iPhone / iPad Safari: no install prompt, only Share → Add to Home Screen.
export const isIos = () =>
  typeof navigator !== "undefined" &&
  (/iphone|ipad|ipod/i.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1));

export const isAndroid = () =>
  typeof navigator !== "undefined" && /android/i.test(navigator.userAgent);

// Shows the browser's install dialog; true when the user installed.
export async function promptInstall(): Promise<boolean> {
  const event = usePwaStore.getState().installPrompt;
  if (!event) return false;
  await event.prompt();
  const { outcome } = await event.userChoice;
  // A prompt can be used once.
  usePwaStore.setState({ installPrompt: null, installed: outcome === "accepted" });
  return outcome === "accepted";
}

// Called once on the client (pages/+Layout.tsx), early enough to catch
// `beforeinstallprompt`, which may fire before React has hydrated.
export function setUpPwa() {
  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    usePwaStore.setState({ installPrompt: event as BeforeInstallPromptEvent });
  });
  window.addEventListener("appinstalled", () =>
    usePwaStore.setState({ installPrompt: null, installed: true })
  );

  // Production builds only: in dev it would cache Vite's modules.
  // After the page has loaded, so it doesn't compete with the first render.
  // Some browsers have the property but no worker (e.g. private windows).
  const serviceWorker = navigator.serviceWorker as ServiceWorkerContainer | undefined;
  if (import.meta.env.PROD && serviceWorker) {
    const register = () =>
      serviceWorker.register("/sw.js").catch((error: unknown) => {
        console.error("Service worker registration failed:", error);
      });
    if (document.readyState === "complete") void register();
    else window.addEventListener("load", () => void register(), { once: true });
  }
}

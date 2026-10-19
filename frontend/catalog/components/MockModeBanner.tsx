import { API_MOCKS } from "./site";
import { useTranslation } from "react-i18next";
import { useEffect } from "react";

// Makes it obvious that nothing on screen comes from the real backend.
export function MockModeBanner() {
  const { t } = useTranslation();

  // Earlier versions mocked the backend with a service worker; take it out
  // of visitors' browsers so it can't get in the way of the in-page mock.
  useEffect(() => {
    if (!API_MOCKS) return;
    void navigator.serviceWorker?.getRegistrations().then((registrations) => {
      for (const registration of registrations) {
        const script = (registration.active ?? registration.waiting ?? registration.installing)
          ?.scriptURL;
        if (script?.endsWith("/mockServiceWorker.js")) void registration.unregister();
      }
    });
  }, []);

  if (!API_MOCKS) return null;

  return (
    <div
      role="status"
      className="bg-primary text-primary-foreground px-4 py-1 text-center text-xs font-medium"
    >
      {t("demo.banner")}
    </div>
  );
}

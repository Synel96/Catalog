import { API_MOCKS } from "./site";
import { useTranslation } from "react-i18next";

// Makes it obvious that nothing on screen comes from the real backend.
export function MockModeBanner() {
  const { t } = useTranslation();
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

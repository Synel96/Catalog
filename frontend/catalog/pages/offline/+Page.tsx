import { WifiOffIcon } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";

// Shown by the service worker (public/sw.js) when a page isn't cached and
// there's no network.
export default function Page() {
  const { t } = useTranslation();
  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-4 px-6 py-24 text-center">
      <WifiOffIcon className="text-muted-foreground size-12" aria-hidden />
      <h1 className="text-3xl font-bold">{t("offline.title")}</h1>
      <p className="text-muted-foreground">{t("offline.body")}</p>
      <Button onClick={() => location.reload()}>{t("offline.retry")}</Button>
    </div>
  );
}

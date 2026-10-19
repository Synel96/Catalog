import { DownloadIcon, SmartphoneIcon } from "lucide-react";
import { useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useMounted } from "@/src/hooks/use-mounted";
import { isIos, isStandalone, promptInstall, usePwaStore } from "@/src/pwa";
import { cn } from "@/lib/utils";

// "Get the app" on the home page. Where the browser offers an install
// prompt (Chrome, Edge, Android) the button installs right away; on iOS and
// elsewhere it explains how to add Catalog to the home screen. Hidden inside
// the installed app.
export function InstallAppCard({ className }: { className?: string }) {
  const { t } = useTranslation();
  const mounted = useMounted();
  const canPrompt = usePwaStore((state) => state.installPrompt !== null);
  const installed = usePwaStore((state) => state.installed);
  const [help, setHelp] = useState<"ios" | "other" | null>(null);

  // Display mode is only known in the browser.
  if (!mounted || installed || isStandalone()) return null;

  const install = async () => {
    if (canPrompt) {
      if (await promptInstall()) toast.success(t("install.installed"));
    } else {
      setHelp(isIos() ? "ios" : "other");
    }
  };

  return (
    <section
      aria-labelledby="install-app-title"
      className={cn(
        "bg-card text-card-foreground ring-foreground/10 flex items-center gap-4 rounded-xl p-4 shadow-sm ring-1",
        className
      )}
    >
      <img src="/icons/icon-192.png" alt="" className="size-14 shrink-0 rounded-2xl shadow-sm" />
      <div className="grid min-w-0 flex-1 gap-2">
        <h2 id="install-app-title" className="font-display leading-tight font-bold">
          {t("install.title")}
        </h2>
        <p className="text-muted-foreground text-sm">{t("install.body")}</p>
        <Button onClick={install} className="justify-self-start">
          <DownloadIcon /> {t("install.button")}
        </Button>
      </div>

      <Dialog open={help !== null} onOpenChange={(open) => !open && setHelp(null)}>
        <DialogContent>
          <DialogHeader>
            <SmartphoneIcon
              className="text-primary-foreground dark:text-primary size-8"
              aria-hidden
            />
            <DialogTitle>
              {help === "ios" ? t("install.iosTitle") : t("install.otherTitle")}
            </DialogTitle>
            <DialogDescription className="text-foreground/80 text-base leading-relaxed">
              <Trans
                i18nKey={help === "ios" ? "install.iosSteps" : "install.otherSteps"}
                components={{ b: <strong className="text-foreground" /> }}
              />
            </DialogDescription>
          </DialogHeader>
          <Button onClick={() => setHelp(null)}>{t("tutorial.done")}</Button>
        </DialogContent>
      </Dialog>
    </section>
  );
}

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
import { isAndroid, isIos, isStandalone, promptInstall, usePwaStore } from "@/src/pwa";
import { cn } from "@/lib/utils";

// "Get the app" on the home page. Where the browser offers an install
// prompt the button installs right away; otherwise it explains the steps
// for the platform. Chrome only hands its prompt over after some time and
// a tap on the page (never in incognito or other apps' built-in browsers),
// so the instructions switch to "Install now" as soon as it arrives.
// Hidden inside the installed app.
export function InstallAppCard({ className }: { className?: string }) {
  const { t } = useTranslation();
  const mounted = useMounted();
  const canPrompt = usePwaStore((state) => state.installPrompt !== null);
  const installed = usePwaStore((state) => state.installed);
  const [help, setHelp] = useState<"ios" | "android" | "other" | null>(null);

  // Display mode is only known in the browser.
  if (!mounted || installed || isStandalone()) return null;

  const prompt = async () => {
    setHelp(null);
    if (await promptInstall()) toast.success(t("install.installed"));
  };

  const install = () => {
    if (canPrompt) void prompt();
    else setHelp(isIos() ? "ios" : isAndroid() ? "android" : "other");
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
                i18nKey={`install.${help ?? "other"}Steps`}
                components={{ b: <strong className="text-foreground" /> }}
              />
            </DialogDescription>
          </DialogHeader>
          {canPrompt ? (
            <Button onClick={() => void prompt()}>
              <DownloadIcon /> {t("install.now")}
            </Button>
          ) : (
            <Button onClick={() => setHelp(null)}>{t("tutorial.done")}</Button>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}

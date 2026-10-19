import { BellIcon, CheckCheckIcon } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { navigate } from "vike/client/router";
import { Button } from "@/components/ui/button";
import { formatPostDate } from "@/components/street/media";
import { cn } from "@/lib/utils";
import { useNotificationsStore } from "@/src/store/useNotificationsStore";
import type { Notification } from "@/src/types/api";
import { useTranslation } from "react-i18next";
import { useLocalePath } from "@/src/i18n/hooks";
import { useLang } from "@/src/i18n/hooks";

const POLL_MS = 30_000;

type NotificationBellProps = { className?: string };

// Polls the user's notifications (every 30 s and when the tab regains
// focus) and lists them in a dropdown. Only rendered while logged in.
export function NotificationBell({ className }: NotificationBellProps) {
  const { t } = useTranslation();
  const lang = useLang();
  const localePath = useLocalePath();
  const notifications = useNotificationsStore((state) => state.notifications);
  const loaded = useNotificationsStore((state) => state.loaded);
  const fetchNotifications = useNotificationsStore((state) => state.fetch);
  const markRead = useNotificationsStore((state) => state.markRead);
  const markAllRead = useNotificationsStore((state) => state.markAllRead);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const panelId = useId();

  const unread = notifications.filter((n) => !n.is_read).length;

  useEffect(() => {
    void fetchNotifications();
    const timer = setInterval(() => void fetchNotifications(), POLL_MS);
    const onVisible = () => document.visibilityState === "visible" && void fetchNotifications();
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [fetchNotifications]);

  useEffect(() => {
    if (!open) return;
    const onOutside = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onEscape = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onOutside);
    document.addEventListener("keydown", onEscape);
    return () => {
      document.removeEventListener("mousedown", onOutside);
      document.removeEventListener("keydown", onEscape);
    };
  }, [open]);

  const select = (notification: Notification) => {
    if (!notification.is_read) void markRead(notification.id);
    setOpen(false);
    // Backend links are plain app paths; keep the current language.
    if (notification.link) void navigate(localePath(notification.link));
  };

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <Button
        variant="ghost"
        size="icon"
        aria-label={
          unread ? t("notifications.labelUnread", { count: unread }) : t("notifications.label")
        }
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((o) => !o)}
        className="relative text-(--brand-on-surface) hover:bg-(--brand-on-surface)/10 hover:text-(--brand-on-surface)"
      >
        <BellIcon className="size-5" />
        {unread > 0 && (
          <span className="bg-destructive absolute -top-1 -right-1 min-w-[18px] rounded-full px-1 text-center text-[10px] leading-[18px] font-bold text-white">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </Button>

      {open && (
        <div
          id={panelId}
          className="bg-popover text-popover-foreground ring-foreground/10 fixed inset-x-2 top-16 z-50 overflow-hidden rounded-xl shadow-lg ring-1 sm:absolute sm:inset-x-auto sm:top-full sm:right-0 sm:mt-2 sm:w-96"
        >
          <div className="flex items-center justify-between border-b px-4 py-2">
            <h2 className="font-display font-bold">{t("notifications.label")}</h2>
            {unread > 0 && (
              <Button variant="ghost" size="sm" onClick={() => void markAllRead()}>
                <CheckCheckIcon /> {t("notifications.markAllRead")}
              </Button>
            )}
          </div>
          <ul className="max-h-96 overflow-y-auto">
            {!loaded && (
              <li className="text-muted-foreground p-4 text-sm">{t("common.loading")}</li>
            )}
            {loaded && notifications.length === 0 && (
              <li className="text-muted-foreground p-4 text-sm">{t("notifications.empty")}</li>
            )}
            {notifications.map((notification) => (
              <li key={notification.id}>
                <button
                  type="button"
                  onClick={() => select(notification)}
                  className={cn(
                    "hover:bg-accent flex w-full gap-3 px-4 py-3 text-left text-sm transition-colors",
                    !notification.is_read && "bg-secondary"
                  )}
                >
                  <span
                    aria-hidden
                    className={cn(
                      "mt-1.5 size-2 shrink-0 rounded-full",
                      notification.is_read ? "bg-transparent" : "bg-destructive"
                    )}
                  />
                  <span className="min-w-0">
                    <span className="block">{notification.message}</span>
                    <span className="text-muted-foreground block text-xs">
                      {t("notifications.for", { name: notification.overlord_name })} ·{" "}
                      {formatPostDate(notification.created_at, lang)}
                      {!notification.is_read && (
                        <span className="sr-only"> {t("notifications.unread")}</span>
                      )}
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

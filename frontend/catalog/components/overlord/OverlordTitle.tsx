import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

// The overlord's title, faint under its name; nothing without one.
export function OverlordTitle({
  title,
  className,
}: {
  title: string | null | undefined;
  className?: string;
}) {
  const { t } = useTranslation();
  if (!title) return null;
  return (
    <p className={cn("text-muted-foreground text-xs italic", className)}>
      {t(`titles.${title}`, { defaultValue: "" })}
    </p>
  );
}

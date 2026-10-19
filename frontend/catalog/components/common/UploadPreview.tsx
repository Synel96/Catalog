import "./upload-preview.css";
import { PawPrintIcon, XIcon } from "lucide-react";
import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useUploadStore } from "@/src/store/useUploadStore";

type UploadPreviewProps = {
  file: File;
  // True while the form holding the file is being submitted.
  uploading: boolean;
  onRemove?: () => void;
  className?: string;
};

// Thumbnail of a picked image; while it's being sent it shows a spinning paw
// and the upload progress, so a slow upload doesn't look like a frozen form.
export function UploadPreview({ file, uploading, onRemove, className }: UploadPreviewProps) {
  const { t } = useTranslation();
  const progress = useUploadStore((state) => state.progress);
  const imgRef = useRef<HTMLImageElement>(null);

  // The object URL lives exactly as long as this file is shown.
  useEffect(() => {
    const img = imgRef.current;
    if (!img) return;
    const url = URL.createObjectURL(file);
    img.src = url;
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const percent = progress === null ? null : Math.round(progress * 100);
  const status =
    percent === null
      ? t("upload.uploading")
      : percent >= 100
        ? t("upload.finishing")
        : t("upload.percent", { percent });

  return (
    <div className={cn("flex min-w-0 items-center gap-3", className)}>
      <div className="bg-muted relative size-16 shrink-0 overflow-hidden rounded-md">
        <img ref={imgRef} alt="" className="size-full object-cover" />
        {uploading && (
          <div className="bg-background/60 absolute inset-0 grid place-items-center">
            <PawPrintIcon className="text-primary size-6 animate-spin" aria-hidden />
          </div>
        )}
      </div>

      <div className="grid min-w-0 flex-1 gap-1.5">
        <div className="flex min-w-0 items-center gap-1">
          <span className="text-muted-foreground truncate text-sm">{file.name}</span>
          {onRemove && !uploading && (
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              aria-label={t("composer.removeImage")}
              onClick={onRemove}
            >
              <XIcon />
            </Button>
          )}
        </div>
        {uploading && (
          <>
            <div
              role="progressbar"
              aria-label={status}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={percent ?? undefined}
              className="bg-muted h-1.5 overflow-hidden rounded-full"
            >
              <div
                className={cn(
                  "bg-primary h-full rounded-full transition-[width] duration-300",
                  percent === null && "upload-bar-indeterminate"
                )}
                style={percent === null ? undefined : { width: `${percent}%` }}
              />
            </div>
            <span className="text-muted-foreground text-xs" aria-live="polite">
              {status}
            </span>
          </>
        )}
      </div>
    </div>
  );
}

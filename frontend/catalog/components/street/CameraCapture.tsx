import { CameraIcon, CircleIcon, RotateCcwIcon, SwitchCameraIcon } from "lucide-react";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

type CameraButtonProps = {
  onCapture: (photo: File) => void;
  disabled?: boolean;
};

// Phones and tablets open their own camera app (full quality, focus, flash)
// through a capture input; elsewhere the camera runs in a dialog here.
const prefersNativeCamera = () =>
  typeof window !== "undefined" && window.matchMedia?.("(pointer: coarse)").matches === true;

const canStream = () =>
  typeof navigator !== "undefined" && typeof navigator.mediaDevices?.getUserMedia === "function";

// "Take a photo" next to the image picker of the post forms.
export function CameraButton({ onCapture, disabled }: CameraButtonProps) {
  const { t } = useTranslation();
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);

  const start = () => {
    if (prefersNativeCamera() || !canStream()) inputRef.current?.click();
    else setOpen(true);
  };

  return (
    <>
      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept="image/*"
        capture="environment"
        className="sr-only"
        tabIndex={-1}
        aria-hidden
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onCapture(file);
          e.target.value = "";
        }}
      />
      <Button
        type="button"
        variant="secondary"
        size="icon"
        aria-label={t("camera.take")}
        onClick={start}
        disabled={disabled}
      >
        <CameraIcon />
      </Button>
      <CameraDialog
        open={open}
        onOpenChange={setOpen}
        onCapture={(photo) => {
          onCapture(photo);
          setOpen(false);
        }}
        onChooseFile={() => {
          setOpen(false);
          inputRef.current?.click();
        }}
      />
    </>
  );
}

type CameraDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCapture: (photo: File) => void;
  onChooseFile: () => void;
};

export function CameraDialog({ open, onOpenChange, onCapture, onChooseFile }: CameraDialogProps) {
  const { t } = useTranslation();
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent aria-describedby={undefined} className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{t("camera.title")}</DialogTitle>
        </DialogHeader>
        {/* Mounted only while open, so the camera is on only then. */}
        {open && <CameraView onCapture={onCapture} onChooseFile={onChooseFile} />}
      </DialogContent>
    </Dialog>
  );
}

type CameraState =
  | { status: "starting" }
  | { status: "live" }
  | { status: "captured"; photo: File; url: string }
  | { status: "error"; reason: "denied" | "missing" | "failed" };

function CameraView({
  onCapture,
  onChooseFile,
}: Pick<CameraDialogProps, "onCapture" | "onChooseFile">) {
  const { t } = useTranslation();
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [state, setState] = useState<CameraState>({ status: "starting" });
  const [facing, setFacing] = useState<"environment" | "user">("environment");
  const [cameraCount, setCameraCount] = useState(0);

  const stop = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  }, []);

  // Asks for the camera (the browser shows its permission prompt the first
  // time) and streams it into the preview. Re-runs to switch cameras.
  useEffect(() => {
    let cancelled = false;
    navigator.mediaDevices
      .getUserMedia({
        video: { facingMode: { ideal: facing }, width: { ideal: 1920 }, height: { ideal: 1080 } },
        audio: false,
      })
      .then(async (stream) => {
        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }
        streamRef.current = stream;
        const video = videoRef.current;
        if (video) {
          video.srcObject = stream;
          try {
            await video.play();
          } catch {
            // autoPlay takes over; a paused preview isn't fatal.
          }
        }
        setState({ status: "live" });
        const devices = await navigator.mediaDevices.enumerateDevices().catch(() => []);
        if (!cancelled) setCameraCount(devices.filter((d) => d.kind === "videoinput").length);
      })
      .catch((error: DOMException) => {
        if (cancelled) return;
        const reason =
          error.name === "NotAllowedError" || error.name === "SecurityError"
            ? "denied"
            : error.name === "NotFoundError" || error.name === "OverconstrainedError"
              ? "missing"
              : "failed";
        setState({ status: "error", reason });
      });
    return () => {
      cancelled = true;
      stop();
    };
  }, [facing, stop]);

  // The captured preview's object URL lives as long as it's shown.
  const capturedUrl = state.status === "captured" ? state.url : null;
  useEffect(() => () => void (capturedUrl && URL.revokeObjectURL(capturedUrl)), [capturedUrl]);

  const shoot = () => {
    const video = videoRef.current;
    if (!video || !video.videoWidth) return;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d")?.drawImage(video, 0, 0);
    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        const photo = new File([blob], `photo-${Date.now()}.jpg`, { type: "image/jpeg" });
        setState({ status: "captured", photo, url: URL.createObjectURL(blob) });
      },
      "image/jpeg",
      0.9
    );
  };

  if (state.status === "error") {
    return (
      <div className="grid gap-4 text-center">
        <CameraIcon className="text-muted-foreground mx-auto size-10" aria-hidden />
        <p role="alert" className="text-sm">
          {t(`camera.error.${state.reason}`)}
        </p>
        <Button variant="outline" onClick={onChooseFile}>
          {t("camera.chooseFile")}
        </Button>
      </div>
    );
  }

  const captured = state.status === "captured" ? state : null;

  return (
    <div className="grid gap-4">
      <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-black">
        {/* Kept mounted while reviewing a shot so "Retake" is instant. */}
        <video
          ref={videoRef}
          playsInline
          muted
          autoPlay
          aria-label={t("camera.preview")}
          className={`size-full object-contain ${facing === "user" ? "-scale-x-100" : ""}`}
        />
        {captured && (
          <img
            src={captured.url}
            alt={t("camera.captured")}
            className="absolute inset-0 size-full bg-black object-contain"
          />
        )}
        {state.status === "starting" && (
          <p className="absolute inset-0 grid place-items-center p-6 text-center text-sm text-white/90">
            {t("camera.starting")}
          </p>
        )}
      </div>

      {captured ? (
        <div className="flex justify-center gap-3">
          <Button variant="outline" onClick={() => setState({ status: "live" })}>
            <RotateCcwIcon /> {t("camera.retake")}
          </Button>
          <Button
            onClick={() => {
              stop();
              onCapture(captured.photo);
            }}
          >
            {t("camera.use")}
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-3 items-center">
          <span />
          <Button
            size="icon-lg"
            onClick={shoot}
            disabled={state.status !== "live"}
            aria-label={t("camera.shoot")}
            className="size-14 justify-self-center rounded-full"
          >
            <CircleIcon className="size-8" />
          </Button>
          {cameraCount > 1 && (
            <Button
              variant="ghost"
              size="icon"
              aria-label={t("camera.switch")}
              onClick={() => {
                setState({ status: "starting" });
                setFacing((f) => (f === "environment" ? "user" : "environment"));
              }}
              className="justify-self-end"
            >
              <SwitchCameraIcon />
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

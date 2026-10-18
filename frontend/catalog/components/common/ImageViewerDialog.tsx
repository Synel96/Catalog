import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

type ImageViewerDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  src: string;
  alt: string;
};

export function ImageViewerDialog({ open, onOpenChange, src, alt }: ImageViewerDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        aria-describedby={undefined}
        className="w-auto max-w-[90vw] bg-transparent p-0 shadow-none ring-0 sm:max-w-[90vw]"
      >
        <DialogTitle className="sr-only">{alt}</DialogTitle>
        <img
          src={src}
          alt={alt}
          className="max-h-[80vh] max-w-[90vw] rounded-xl object-contain shadow-lg"
        />
      </DialogContent>
    </Dialog>
  );
}

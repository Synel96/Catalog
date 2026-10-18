import { Toaster as Sonner, type ToasterProps } from "sonner";

// Replaces the old Joy <SnackbarMessage>: one <Toaster> lives in the layout,
// and any component calls `toast.success(...)`. Because the layout persists
// across client-side navigation, a toast fired right before `navigate()`
// still shows on the next page.
function Toaster(props: ToasterProps) {
  return (
    <Sonner
      position="bottom-center"
      closeButton
      richColors
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
        } as React.CSSProperties
      }
      {...props}
    />
  );
}

export { Toaster };

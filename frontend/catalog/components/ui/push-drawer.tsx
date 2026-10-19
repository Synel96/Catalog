import * as React from "react";
import { Dialog as DialogPrimitive } from "radix-ui";
import { XIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

// A mobile nav drawer that pushes the whole page aside instead of just
// overlaying on top of it, with a slight 3D tilt and a shaded hinge edge
// on the panel itself. All animation lives here so <PushDrawerBody> (wraps
// the rest of the page) and <PushDrawerContent> (the panel) only need to
// read the same `open` boolean to stay in sync - nothing page-specific.
const TRANSITION_DURATION = "420ms";
const TRANSITION = `${TRANSITION_DURATION} cubic-bezier(0.22,1,0.36,1)`;

// Mirrors the panel's own width class below (w-[min(20rem,100vw)]) so the
// page push always matches the panel's rendered width, without having to
// measure the (portaled, conditionally-mounted) panel DOM node itself.
const PANEL_MAX_WIDTH_PX = 320;
function getPanelWidth() {
  return Math.min(window.innerWidth, PANEL_MAX_WIDTH_PX);
}

// modal=false: since the "push" is the whole point (the rest of the page
// stays visible, just shifted aside, rather than being fully blocked by a
// modal overlay), Radix's modal machinery only gets in the way here - its
// Overlay refuses to render at all without it, but its modal variant also
// permanently aria-hides every sibling the first time it mounts (cleanup
// only runs on unmount, which force-mounting - needed below for the exit
// transition - would prevent from ever happening). Non-modal skips all of
// that; we build our own dismiss-on-outside-click scrim instead of Radix's.
function PushDrawer(props: React.ComponentProps<typeof DialogPrimitive.Root>) {
  return <DialogPrimitive.Root modal={false} {...props} />;
}

const PushDrawerTrigger = DialogPrimitive.Trigger;
const PushDrawerClose = DialogPrimitive.Close;
const PushDrawerTitle = DialogPrimitive.Title;

type PushDrawerContentProps = React.ComponentProps<typeof DialogPrimitive.Content> & {
  open: boolean;
  closeLabel: string;
};

function PushDrawerContent({
  open,
  closeLabel,
  className,
  style,
  children,
  ...props
}: PushDrawerContentProps) {
  return (
    <DialogPrimitive.Portal forceMount>
      {/* Our own scrim, not Radix's <Overlay> (that one no-ops when
          modal=false). Wrapping it in <Close asChild> gives free
          click-to-dismiss without threading a separate callback prop. */}
      <DialogPrimitive.Close asChild>
        <div
          aria-hidden
          data-slot="push-drawer-overlay"
          className={cn(
            "fixed inset-0 z-40 bg-black/10 transition-opacity supports-backdrop-filter:backdrop-blur-xs",
            open ? "opacity-100" : "pointer-events-none opacity-0"
          )}
          style={{ transitionDuration: TRANSITION_DURATION }}
        />
      </DialogPrimitive.Close>
      <DialogPrimitive.Content
        {...props}
        forceMount
        // Force-mounted so the closing transform transition can actually
        // play (Radix otherwise unmounts Content the instant `open` goes
        // false); `inert` removes it from focus/tab order and hit-testing
        // while closed, so that doesn't silently regress.
        inert={!open}
        data-slot="push-drawer-content"
        className={cn(
          "fixed inset-y-0 right-0 z-50 flex h-full w-[min(20rem,100vw)] max-w-[100vw] flex-col gap-4 overflow-x-hidden overflow-y-auto border-l bg-clip-padding text-sm",
          // Shadow only while open: the closed panel sits just off-screen,
          // and its shadow would otherwise bleed into the viewport's edge.
          open ? "shadow-[-24px_0_48px_-24px_rgba(0,0,0,0.35)]" : "pointer-events-none",
          className
        )}
        style={{
          ...style,
          transformOrigin: "right center",
          transform: open ? "translateX(0) rotateY(0deg)" : "translateX(100%) rotateY(20deg)",
          transition: `transform ${TRANSITION}`,
        }}
      >
        {/* Shaded hinge edge: a subtle inner shadow along the panel's left
            side, where a physical panel opening toward the viewer would
            catch the least light. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 left-0 z-10 w-6 bg-gradient-to-r from-black/12 to-transparent dark:from-black/25"
        />
        {children}
        <DialogPrimitive.Close asChild>
          <Button variant="ghost" className="absolute top-3 right-3 z-20" size="icon-sm">
            <XIcon />
            <span className="sr-only">{closeLabel}</span>
          </Button>
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}

type PushDrawerBodyProps = {
  open: boolean;
  children: React.ReactNode;
  className?: string;
};

// Wraps the rest of the page (main + footer). Shifts left by exactly the
// drawer panel's width and scales down a touch, so the page visibly "slides
// aside" for the drawer rather than being covered by it.
//
// The transform is `none` (not an identity translate) while closed: any
// transform turns this wrapper into the containing block for
// `position: fixed` descendants (snackbars, modals), which must stay pinned
// to the viewport whenever the drawer isn't in use. `none` <-> translate
// still interpolates, so the push animation is unaffected.
function PushDrawerBody({ open, children, className }: PushDrawerBodyProps) {
  const [panelWidth, setPanelWidth] = React.useState(PANEL_MAX_WIDTH_PX);

  React.useEffect(() => {
    const updateWidth = () => setPanelWidth(getPanelWidth());
    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, []);

  return (
    <div
      data-slot="push-drawer-body"
      className={className}
      style={{
        transform: open ? `translateX(-${panelWidth}px) scale(0.97)` : "none",
        transition: `transform ${TRANSITION}`,
      }}
    >
      {children}
    </div>
  );
}

export {
  PushDrawer,
  PushDrawerTrigger,
  PushDrawerClose,
  PushDrawerTitle,
  PushDrawerContent,
  PushDrawerBody,
};

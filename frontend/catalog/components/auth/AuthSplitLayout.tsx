import { Welcome } from "./Welcome";

// Shared two-column shell of the login and register pages: the welcome
// slider on the left (top on mobile), the form on the right.
export function AuthSplitLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col lg:flex-row">
      <section className="bg-background flex flex-1 items-center justify-center p-4">
        <Welcome />
      </section>
      {/* Fixed-width form column on large screens leaves the rest to the
          widescreen slider. */}
      <section className="flex flex-1 items-center justify-center p-4 lg:w-[480px] lg:flex-none">
        {children}
      </section>
    </div>
  );
}

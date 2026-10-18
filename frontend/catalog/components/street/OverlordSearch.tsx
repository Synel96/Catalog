import { SearchIcon, XIcon } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { navigate } from "vike/client/router";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { mediaUrl } from "@/src/services/api";
import { searchOverlords } from "@/src/services/overlordsService";
import type { ApiError, Overlord } from "@/src/types/api";
import { overlordHref } from "./links";
import { OVERLORD_PLACEHOLDER } from "./media";

const DEBOUNCE_MS = 400;

type SearchState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "done"; results: Overlord[] }
  | { status: "error"; message: string };

// Navbar search over all overlords (name, breed, slave). Picking a result
// opens its profile. Collapses to an icon on small screens.
export function OverlordSearch() {
  const [term, setTerm] = useState("");
  const [state, setState] = useState<SearchState>({ status: "idle" });
  const [open, setOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(-1);
  const [mobileOpen, setMobileOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listId = useId();

  const query = term.trim();
  const results = state.status === "done" ? state.results : [];

  useEffect(() => {
    if (!query) return;
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setState({ status: "loading" });
      setOpen(true);
      try {
        const found = await searchOverlords(query, controller.signal);
        setState({ status: "done", results: found });
        setHighlighted(-1);
      } catch (error) {
        if (!controller.signal.aborted) {
          setState({ status: "error", message: (error as ApiError).detail });
        }
      }
    }, DEBOUNCE_MS);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  const reset = () => {
    setTerm("");
    setState({ status: "idle" });
    setOpen(false);
    setHighlighted(-1);
  };

  const select = (overlord: Overlord) => {
    reset();
    setMobileOpen(false);
    void navigate(overlordHref(overlord.id));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setOpen(true);
      setHighlighted((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlighted((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && results[highlighted]) {
      e.preventDefault();
      select(results[highlighted]);
    } else if (e.key === "Escape") {
      setOpen(false);
      setMobileOpen(false);
    }
  };

  const showList = open && query !== "" && state.status !== "idle";

  return (
    <div ref={containerRef} className="relative flex min-w-0 items-center">
      <Button
        variant="ghost"
        size="icon"
        aria-label="Open search"
        onClick={() => {
          setMobileOpen(true);
          setTimeout(() => inputRef.current?.focus(), 0);
        }}
        className={cn("sm:hidden", mobileOpen && "hidden")}
      >
        <SearchIcon className="size-5" />
      </Button>

      <div
        className={cn(
          "relative w-full min-w-0 sm:block sm:w-64",
          mobileOpen
            ? "bg-popover fixed inset-x-2 top-2 z-50 rounded-lg p-2 shadow-lg sm:static sm:p-0 sm:shadow-none"
            : "hidden"
        )}
      >
        <SearchIcon className="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 sm:left-2.5" />
        <Input
          ref={inputRef}
          value={term}
          onChange={(e) => {
            setTerm(e.target.value);
            if (!e.target.value.trim()) reset();
          }}
          onKeyDown={handleKeyDown}
          onFocus={() => setOpen(true)}
          placeholder="Search Overlords..."
          aria-label="Search overlords"
          role="combobox"
          aria-expanded={showList}
          aria-controls={listId}
          aria-activedescendant={highlighted >= 0 ? `${listId}-${highlighted}` : undefined}
          className="bg-background pr-8 pl-8"
        />
        {(term || mobileOpen) && (
          <Button
            variant="ghost"
            size="icon-xs"
            aria-label={term ? "Clear search" : "Close search"}
            onClick={() => {
              if (term) reset();
              else setMobileOpen(false);
            }}
            className="absolute top-1/2 right-1.5 -translate-y-1/2"
          >
            <XIcon />
          </Button>
        )}

        {showList && (
          <ul
            id={listId}
            role="listbox"
            className="bg-popover text-popover-foreground ring-foreground/10 absolute inset-x-0 top-full z-50 mt-1 max-h-80 min-w-64 overflow-y-auto rounded-lg p-1 shadow-md ring-1"
          >
            {state.status === "loading" && <li className="p-3 text-sm">Searching…</li>}
            {state.status === "error" && (
              <li className="text-destructive p-3 text-sm">{state.message}</li>
            )}
            {state.status === "done" && results.length === 0 && (
              <li className="text-muted-foreground p-3 text-sm">No results</li>
            )}
            {results.map((overlord, index) => (
              <li
                key={overlord.id}
                id={`${listId}-${index}`}
                role="option"
                aria-selected={index === highlighted}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => select(overlord)}
                onMouseEnter={() => setHighlighted(index)}
                className={cn(
                  "flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5",
                  index === highlighted && "bg-accent"
                )}
              >
                <Avatar className="size-8">
                  <AvatarImage src={mediaUrl(overlord.avatar, OVERLORD_PLACEHOLDER)} alt="" />
                  <AvatarFallback>{overlord.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <span className="min-w-0">
                  <span className="block truncate font-semibold">{overlord.name}</span>
                  {overlord.slave_name && (
                    <span className="text-muted-foreground block truncate text-xs">
                      Slave: {overlord.slave_name}
                    </span>
                  )}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

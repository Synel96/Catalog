// src/components/navbar/SearchBar.jsx
import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
} from "react";
import { Box, Input, IconButton, Sheet, Typography, Avatar } from "@mui/joy";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";
import ClearIcon from "@mui/icons-material/Clear";
import PropTypes from "prop-types";

/** egyszerű media query hook desktop ellenőrzéshez */
const useIsDesktop = () => {
  const [isDesktop, setIsDesktop] = useState(
    typeof window !== "undefined"
      ? window.matchMedia("(min-width:600px)").matches
      : true
  );
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mql = window.matchMedia("(min-width:600px)");
    const listener = (e) => setIsDesktop(e.matches);
    if (mql.addEventListener) mql.addEventListener("change", listener);
    else mql.addListener(listener);
    return () => {
      if (mql.removeEventListener) mql.removeEventListener("change", listener);
      else mql.removeListener(listener);
    };
  }, []);
  return isDesktop;
};

/** API base env */
const getApiBase = () => import.meta.env.VITE_API_URL?.replace(/\/$/, "") || "";

/** segéd: avatár URL-resolve */
const PLACEHOLDER_AVATAR = "/media/placeholders/overlord_placeholder.png";
const resolveAvatar = (avatar) => {
  const base = getApiBase();
  const placeholderFull = `${base}${PLACEHOLDER_AVATAR}`;
  if (!avatar) return placeholderFull;
  if (avatar.startsWith("http") || avatar.startsWith("data:")) return avatar;
  // normalizáljuk a slash-t
  const path = avatar.startsWith("/") ? avatar : `/${avatar}`;
  return `${base}${path}`;
};

/**
 * Props:
 *  - value, onChange: kontrollált input
 *  - onSearch: fallback (Enter)
 *  - onSelect: kiválasztás
 *  - searchUrl: endpoint pl "/profiles/overlords/"
 *  - extraParams: további query paramok
 *  - placeholder, debounceMs
 *  - currentUser: bejelentkezett user { id, username }
 */
const SearchBar = ({
  value,
  onChange,
  onSearch,
  onSelect,
  searchUrl,
  extraParams = {},
  placeholder = "Search...",
  debounceMs = 400,
  currentUser = null,
}) => {
  const isDesktop = useIsDesktop();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [results, setResults] = useState([]);
  const [openDropdown, setOpenDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [slaveMap, setSlaveMap] = useState({}); // id -> username cache

  const inputRef = useRef(null);
  const containerRef = useRef(null);
  const debounceRef = useRef(null);
  const abortRef = useRef(null);

  // inicializáljuk a current user nevét, ha van
  useEffect(() => {
    if (currentUser?.id && currentUser?.username) {
      setSlaveMap((m) => {
        if (m[currentUser.id]) return m;
        return { ...m, [currentUser.id]: currentUser.username };
      });
    }
  }, [currentUser]);

  const baseUrl = useMemo(() => {
    if (!searchUrl) return null;
    if (searchUrl.startsWith("/")) {
      return `${getApiBase()}${searchUrl}`.replace(/\/+$/, "/");
    }
    return searchUrl;
  }, [searchUrl]);

  const extraParamsSerialized = useMemo(
    () => JSON.stringify(extraParams || {}),
    [extraParams]
  );

  // ha üres a kereső, reseteljük
  useEffect(() => {
    if (!value || value.trim() === "") {
      if (
        results.length !== 0 ||
        error !== null ||
        loading !== false ||
        openDropdown !== false
      ) {
        setResults([]);
        setError(null);
        setLoading(false);
        setOpenDropdown(false);
        setHighlightedIndex(-1);
      }
    }
  }, [value, results, error, loading, openDropdown]);

  // fetch után a slave neveket (ha csak ID jönne, de csak /me van, ezért csak a currentUser-t használjuk)
  // (ha később kiterjeszted /api/profiles/<id>/ végponttal, ide lehet betenni a lekérést)

  // debounce keresés
  useEffect(() => {
    if (!value || value.trim() === "") return;
    if (!baseUrl) return;

    let extra;
    try {
      extra = JSON.parse(extraParamsSerialized);
    } catch {
      extra = {};
    }

    const params = new URLSearchParams();
    if (value) params.set("search", value);
    Object.entries(extra).forEach(([k, v]) => {
      if (v != null && v !== "") params.set(k, v);
    });

    // biztosítjuk, hogy slash-olva legyen a baseUrl (ha kell)
    const url = `${baseUrl.replace(/\/+$/, "")}/?${params.toString()}`;

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      if (abortRef.current) abortRef.current.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      setLoading(true);
      setError(null);

      fetch(url, {
        signal: controller.signal,
        credentials: "include",
        headers: { Accept: "application/json" },
      })
        .then(async (res) => {
          const text = await res.text();
          const contentType = res.headers.get("content-type") || "";
          if (!res.ok) {
            throw new Error(
              `HTTP ${res.status} - ${
                text ? text.slice(0, 200) : res.statusText
              }`
            );
          }
          if (!contentType.includes("application/json")) {
            throw new Error(
              `Várt JSON-t, de mást kaptam: ${text.slice(0, 200)}`
            );
          }
          try {
            return JSON.parse(text);
          } catch (e) {
            throw new Error("JSON parse hiba: " + e.message);
          }
        })
        .then((data) => {
          setResults(Array.isArray(data) ? data : data.results || []);
          setOpenDropdown(true);
          setHighlightedIndex(-1);
        })
        .catch((e) => {
          if (e.name === "AbortError") return;
          setError(e.message);
          setResults([]);
          setOpenDropdown(true);
        })
        .finally(() => {
          setLoading(false);
        });
    }, debounceMs);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [value, baseUrl, debounceMs, extraParamsSerialized]);

  // kattintáson kívüli bezárás
  useEffect(() => {
    const handleOutside = (e) => {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(e.target)) {
        setOpenDropdown(false);
        setHighlightedIndex(-1);
      }
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  const toggleMobile = useCallback(() => {
    setMobileOpen((o) => !o);
    if (!mobileOpen) setTimeout(() => inputRef.current?.focus(), 0);
  }, [mobileOpen]);

  const handleClear = () => {
    onChange("");
    setResults([]);
    setOpenDropdown(false);
    setHighlightedIndex(-1);
  };

  const handleKeyDown = (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((i) => Math.min(i + 1, results.length - 1));
      setOpenDropdown(true);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((i) => Math.max(i - 1, 0));
      setOpenDropdown(true);
    } else if (e.key === "Enter") {
      if (highlightedIndex >= 0 && results[highlightedIndex]) {
        const item = results[highlightedIndex];
        if (onSelect) onSelect(item);
        setOpenDropdown(false);
      } else {
        onSearch && onSearch(value);
      }
    } else if (e.key === "Escape") {
      setOpenDropdown(false);
      setHighlightedIndex(-1);
      if (!isDesktop) setMobileOpen(false);
    }
  };

  const handleItemClick = (item) => {
    if (onSelect) onSelect(item);
    setOpenDropdown(false);
  };

  const getSlaveName = (item) => {
    if (!item) return "";
    if (typeof item.slave === "string" || typeof item.slave === "number") {
      return slaveMap[item.slave] || "";
    }
    // ha esetleg később nested object lenne
    return item.slave?.username || "";
  };

  return (
    <Box
      ref={containerRef}
      sx={{
        position: "relative",
        display: "flex",
        alignItems: "center",
        minWidth: 0,
        gap: 1,
      }}
    >
      {isDesktop ? (
        <Input
          placeholder={placeholder}
          size="sm"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          aria-label="Search"
          inputRef={inputRef}
          endDecorator={
            value ? (
              <IconButton
                size="sm"
                variant="plain"
                aria-label="Clear search"
                onClick={handleClear}
                sx={{ ml: 0.5 }}
              >
                <ClearIcon fontSize="small" />
              </IconButton>
            ) : null
          }
          sx={{
            flexGrow: 1,
            maxWidth: 300,
            transition: "width .2s ease",
            "&:focus-visible": {
              boxShadow: "0 0 0 3px rgba(0,123,255,0.5)",
            },
          }}
        />
      ) : (
        <Box
          sx={{ display: "flex", alignItems: "center", minWidth: 0, gap: 1 }}
        >
          {!mobileOpen && (
            <IconButton
              aria-label="Open search"
              size="sm"
              variant="outlined"
              onClick={toggleMobile}
            >
              <SearchIcon />
            </IconButton>
          )}
          {mobileOpen && (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                width: "100%",
                minWidth: 0,
              }}
            >
              <Input
                placeholder={placeholder}
                size="sm"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onKeyDown={handleKeyDown}
                inputRef={inputRef}
                aria-label="Search"
                endDecorator={
                  value ? (
                    <IconButton
                      size="sm"
                      variant="plain"
                      aria-label="Clear search"
                      onClick={handleClear}
                      sx={{ ml: 0.5 }}
                    >
                      <ClearIcon fontSize="small" />
                    </IconButton>
                  ) : null
                }
                sx={{ flexGrow: 1 }}
              />
              <IconButton
                aria-label="Close search"
                size="sm"
                onClick={toggleMobile}
              >
                <CloseIcon />
              </IconButton>
            </Box>
          )}
        </Box>
      )}

      {/* dropdown */}
      {openDropdown && (
        <Sheet
          variant="outlined"
          sx={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            mt: 0.5,
            zIndex: 1500,
            maxHeight: 320,
            overflowY: "auto",
            bgcolor: "background.surface",
            borderRadius: "md",
            boxShadow: "md",
            minWidth: 260,
          }}
        >
          {loading && (
            <Box sx={{ p: 2 }}>
              <Typography level="body-sm">Keresés...</Typography>
            </Box>
          )}
          {error && (
            <Box sx={{ p: 2 }}>
              <Typography level="body-sm" sx={{ color: "danger.plainColor" }}>
                Hiba: {error}
              </Typography>
            </Box>
          )}
          {!loading && !error && results.length === 0 && (
            <Box sx={{ p: 2 }}>
              <Typography level="body-sm">Nincs találat</Typography>
            </Box>
          )}
          {!loading &&
            !error &&
            results.map((item, idx) => {
              const slaveName = getSlaveName(item);
              return (
                <Box
                  key={item.id || idx}
                  component="button"
                  onClick={() => handleItemClick(item)}
                  sx={{
                    width: "100%",
                    textAlign: "left",
                    px: 2,
                    py: 1,
                    border: "none",
                    background: "transparent",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    "&:hover": { backgroundColor: "action.hover" },
                    ...(highlightedIndex === idx
                      ? {
                          backgroundColor: "rgba(0,0,0,0.05)",
                        }
                      : {}),
                  }}
                >
                  <Avatar
                    src={resolveAvatar(item.avatar)}
                    alt={item.name || ""}
                    size="sm"
                    sx={{ flexShrink: 0, width: 32, height: 32 }}
                  />
                  <Box sx={{ minWidth: 0, flexGrow: 1 }}>
                    <Typography
                      level="body-md"
                      sx={{
                        fontWeight: "bold",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {item.name || item.username || item.title || "—"}
                    </Typography>
                    {slaveName && (
                      <Typography
                        level="body-xs"
                        sx={{ color: "text.secondary", mt: 0.25 }}
                      >
                        <Box component="span" sx={{ opacity: 0.6, mr: 0.5 }}>
                          Slave:
                        </Box>
                        <Box component="span">{slaveName}</Box>
                      </Typography>
                    )}
                  </Box>
                </Box>
              );
            })}
        </Sheet>
      )}
    </Box>
  );
};

SearchBar.propTypes = {
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  onSearch: PropTypes.func,
  onSelect: PropTypes.func,
  searchUrl: PropTypes.string.isRequired,
  extraParams: PropTypes.object,
  placeholder: PropTypes.string,
  debounceMs: PropTypes.number,
  currentUser: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    username: PropTypes.string,
  }),
};

export default SearchBar;

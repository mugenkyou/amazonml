"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, X, Building2, User, Trophy, Globe, Loader2 } from "lucide-react";
import type { Organization, SearchMode, SearchSuggestion } from "@/lib/types";

interface SearchBarProps {
  initialQuery?: string;
  initialMode?: SearchMode;
  initialExact?: boolean;
  popularOrganizations?: Organization[];
}

const SEARCH_MODES: Array<{
  id: SearchMode;
  label: string;
  shortLabel: string;
  icon: typeof Globe;
  placeholder: string;
  exactLabel: string;
}> = [
  {
    id: "all",
    label: "All Categories",
    shortLabel: "All",
    icon: Globe,
    placeholder: "Search college, person name, or team (e.g. IIT, Sachi, Androids)...",
    exactLabel: "Exact match only",
  },
  {
    id: "person",
    label: "Person / Member",
    shortLabel: "Person",
    icon: User,
    placeholder: "Search by participant / member name (e.g. Rahul, Rohit, Md Khalid)...",
    exactLabel: "Exact person name match only",
  },
  {
    id: "college",
    label: "College / University",
    shortLabel: "College",
    icon: Building2,
    placeholder: "Search college or institution (e.g. IIT, BITS, VIT, DTU)...",
    exactLabel: "Exact college match only",
  },
  {
    id: "team",
    label: "Team Name",
    shortLabel: "Team",
    icon: Trophy,
    placeholder: "Search by team name (e.g. Androids, Banana, KL_converge)...",
    exactLabel: "Exact team name match only",
  },
];

export function SearchBar({
  initialQuery = "",
  initialMode = "all",
  initialExact = false,
  popularOrganizations = [],
}: SearchBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [query, setQuery] = useState(initialQuery);
  const [mode, setMode] = useState<SearchMode>(initialMode);
  const [exact, setExact] = useState(initialExact);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const activeModeConfig = SEARCH_MODES.find((m) => m.id === mode) || SEARCH_MODES[0];
  const ActiveIcon = activeModeConfig.icon;

  useEffect(() => {
    if (searchParams) {
      setQuery(searchParams.get("q") || "");
      const modeParam = searchParams.get("mode") as SearchMode;
      if (modeParam && ["all", "college", "person", "team"].includes(modeParam)) {
        setMode(modeParam);
      }
      setExact(searchParams.get("exact") === "1" || searchParams.get("exact") === "true");
    }
  }, [searchParams]);

  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const trimmed = query.trim();
    if (trimmed.length < 1) {
      setSuggestions([]);
      setShowDropdown(false);
      setIsLoadingSuggestions(false);
      return;
    }

    debounceTimerRef.current = setTimeout(async () => {
      const controller = new AbortController();
      abortControllerRef.current = controller;
      setIsLoadingSuggestions(true);

      try {
        const res = await fetch(
          `/api/search?q=${encodeURIComponent(trimmed)}&mode=${mode}&type=suggest&limit=7`,
          { signal: controller.signal }
        );
        if (res.ok) {
          const data = await res.json();
          setSuggestions(data.suggestions || []);
          setShowDropdown(true);
        }
      } catch (err: unknown) {
        if (err instanceof Error && err.name !== "AbortError") {
          setSuggestions([]);
        }
      } finally {
        setIsLoadingSuggestions(false);
      }
    }, 180);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [query, mode]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = (
    overrideQuery?: string,
    overrideMode?: SearchMode,
    overrideExact?: boolean
  ) => {
    const targetQuery = overrideQuery !== undefined ? overrideQuery : query;
    const targetMode = overrideMode !== undefined ? overrideMode : mode;
    const targetExact = overrideExact !== undefined ? overrideExact : exact;

    setShowDropdown(false);

    const params = new URLSearchParams();
    if (targetQuery.trim()) {
      params.set("q", targetQuery.trim());
    }
    if (targetMode && targetMode !== "all") {
      params.set("mode", targetMode);
    }
    if (targetExact) {
      params.set("exact", "1");
    }

    startTransition(() => {
      router.push(`/?${params.toString()}`);
    });
  };

  const handleModeChange = (newMode: SearchMode) => {
    setMode(newMode);
    setFocusedIndex(-1);
    if (query.trim()) {
      handleSearch(query, newMode, exact);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showDropdown || suggestions.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setFocusedIndex((prev) => (prev + 1) % suggestions.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setFocusedIndex((prev) => (prev - 1 + suggestions.length) % suggestions.length);
    } else if (e.key === "Enter") {
      if (focusedIndex >= 0 && suggestions[focusedIndex]) {
        e.preventDefault();
        const selected = suggestions[focusedIndex];
        setQuery(selected.queryValue);
        const targetMode = selected.type === "person" ? "person" : selected.type === "college" ? "college" : selected.type === "team" ? "team" : mode;
        setMode(targetMode);
        handleSearch(selected.queryValue, targetMode);
      }
    } else if (e.key === "Escape") {
      setShowDropdown(false);
      setFocusedIndex(-1);
    }
  };

  return (
    <div ref={containerRef} className="w-full space-y-2.5 sm:space-y-3">
      {/* Search Mode Filter Pills */}
      <div className="flex items-center justify-center sm:justify-start gap-1 sm:gap-1.5 p-1 bg-[#F7F7F7] border border-[#E3E3E3] rounded-lg overflow-x-auto">
        <span className="text-[11px] font-semibold text-[#767676] px-1.5 hidden sm:inline-block">
          Search by:
        </span>
        {SEARCH_MODES.map((m) => {
          const Icon = m.icon;
          const isActive = mode === m.id;
          return (
            <button
              key={m.id}
              type="button"
              onClick={() => handleModeChange(m.id)}
              className={`inline-flex items-center gap-1.5 min-h-[34px] sm:min-h-[30px] rounded-md px-2.5 sm:px-3 text-xs font-semibold transition-all shrink-0 ${
                isActive
                  ? "bg-[#FF9900] text-[#111111] shadow-xs"
                  : "text-[#5F6368] hover:text-[#111111] hover:bg-white active:bg-white"
              }`}
            >
              <Icon className={`h-3.5 w-3.5 ${isActive ? "text-[#111111]" : "text-[#767676]"}`} />
              <span className="sm:hidden">{m.shortLabel}</span>
              <span className="hidden sm:inline">{m.label}</span>
            </button>
          );
        })}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSearch();
        }}
        className="relative w-full"
        role="search"
      >
        <div className="relative flex min-h-[46px] items-stretch rounded-lg border border-[#D5D5D5] bg-white shadow-subtle focus-within:border-[#FF9900] focus-within:ring-2 focus-within:ring-[#FF9900]/20 transition-all">
          <div className="flex items-center pl-3 sm:pl-3.5 pr-2 text-[#767676] shrink-0">
            {isLoadingSuggestions ? (
              <Loader2 className="h-4 w-4 animate-spin text-[#FF9900]" />
            ) : (
              <ActiveIcon className="h-4 w-4 text-[#FF9900]" />
            )}
          </div>

          <input
            type="text"
            role="combobox"
            aria-autocomplete="list"
            aria-expanded={showDropdown && suggestions.length > 0}
            aria-controls="autocomplete-suggestions"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setFocusedIndex(-1);
            }}
            onFocus={() => {
              if (suggestions.length > 0) setShowDropdown(true);
            }}
            onKeyDown={handleKeyDown}
            placeholder={activeModeConfig.placeholder}
            className="w-full min-w-0 py-2.5 sm:py-3 pr-8 text-xs sm:text-sm text-[#111111] placeholder-[#767676] outline-none bg-transparent font-medium"
          />

          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setSuggestions([]);
                setShowDropdown(false);
                handleSearch("", mode);
              }}
              className="flex h-11 w-10 shrink-0 items-center justify-center text-[#767676] hover:text-[#111111] active:scale-95"
              title="Clear search"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}

          <button
            type="submit"
            disabled={isPending}
            className="inline-flex min-h-[46px] items-center justify-center rounded-r-[7px] bg-[#FF9900] px-3.5 sm:px-5 text-xs sm:text-sm font-semibold text-[#111111] hover:bg-[#E47911] active:bg-[#C7511F] transition-colors disabled:opacity-50 shrink-0"
          >
            <span>{isPending ? "..." : "Search"}</span>
          </button>
        </div>

        {/* Autocomplete Dropdown */}
        {showDropdown && suggestions.length > 0 && (
          <div
            id="autocomplete-suggestions"
            role="listbox"
            className="absolute left-0 right-0 top-full z-50 mt-1 max-h-80 overflow-y-auto rounded-lg border border-[#E3E3E3] bg-white shadow-dropdown"
          >
            <div className="p-1">
              {suggestions.map((item, index) => {
                const ItemIcon =
                  item.type === "person"
                    ? User
                    : item.type === "college"
                    ? Building2
                    : item.type === "team"
                    ? Trophy
                    : Globe;

                return (
                  <button
                    key={`${item.type}-${item.teamId || item.slug || item.title}-${index}`}
                    type="button"
                    role="option"
                    aria-selected={focusedIndex === index}
                    onClick={() => {
                      setQuery(item.queryValue);
                      const targetMode =
                        item.type === "person"
                          ? "person"
                          : item.type === "college"
                          ? "college"
                          : item.type === "team"
                          ? "team"
                          : mode;
                      setMode(targetMode);
                      handleSearch(item.queryValue, targetMode);
                    }}
                    className={`flex w-full items-center justify-between min-h-[46px] rounded-md px-3 py-2 text-left text-xs transition-colors ${
                      focusedIndex === index
                        ? "bg-[#FFF3E0] text-[#E47911] font-semibold"
                        : "text-[#111111] hover:bg-[#F7F7F7] active:bg-[#F0F0F0]"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 pr-2">
                      <div className="flex h-7 w-7 items-center justify-center rounded bg-[#FFF3E0] text-[#E47911] shrink-0 border border-[#F5C26B]/50">
                        <ItemIcon className="h-3.5 w-3.5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="font-semibold text-xs text-[#111111] truncate">
                          {item.title}
                        </div>
                        {item.subtitle && (
                          <div className="text-[10px] text-[#767676] truncate">
                            {item.subtitle}
                          </div>
                        )}
                      </div>
                    </div>
                    {item.badge && (
                      <span className="shrink-0 rounded bg-[#F7F7F7] border border-[#E3E3E3] px-1.5 py-0.5 font-mono text-[10px] text-[#5F6368]">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </form>

      {/* Filter Options & Quick Tags */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
        <label className="inline-flex items-center gap-2 cursor-pointer text-[#5F6368] select-none hover:text-[#111111] min-h-[36px] sm:min-h-0 py-1">
          <input
            type="checkbox"
            checked={exact}
            onChange={(e) => {
              const newExact = e.target.checked;
              setExact(newExact);
              handleSearch(query, mode, newExact);
            }}
            className="h-4 w-4 rounded border-[#D5D5D5] text-[#FF9900] focus:ring-[#FF9900] accent-[#FF9900]"
          />
          <span className="text-xs">{activeModeConfig.exactLabel}</span>
        </label>

        {/* Dynamic Quick Suggestions based on active mode */}
        {mode === "college" && popularOrganizations.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 pt-1 sm:pt-0">
            <span className="text-[#767676] font-medium text-[11px]">Popular:</span>
            {popularOrganizations.slice(0, 4).map((org) => (
              <button
                key={org.slug}
                type="button"
                onClick={() => {
                  setQuery(org.name);
                  handleSearch(org.name, "college", false);
                }}
                className="inline-flex items-center gap-1 rounded-md border border-[#E3E3E3] bg-white px-2 py-1 min-h-[32px] sm:min-h-[26px] text-[11px] text-[#5F6368] transition-colors hover:border-[#FF9900] hover:bg-[#FFF7E6] hover:text-[#111111] active:bg-[#FFE0B2]"
              >
                <span className="truncate max-w-[130px] sm:max-w-[160px]">{org.name}</span>
                <span className="font-mono text-[#767676]">({org.teamCount})</span>
              </button>
            ))}
          </div>
        )}

        {mode === "person" && (
          <div className="flex flex-wrap items-center gap-1.5 pt-1 sm:pt-0">
            <span className="text-[#767676] font-medium text-[11px]">Try:</span>
            {["Md Khalid", "Sadat", "Akshat", "Varun"].map((name) => (
              <button
                key={name}
                type="button"
                onClick={() => {
                  setQuery(name);
                  handleSearch(name, "person", false);
                }}
                className="inline-flex items-center gap-1 rounded-md border border-[#E3E3E3] bg-white px-2 py-1 min-h-[32px] sm:min-h-[26px] text-[11px] text-[#5F6368] transition-colors hover:border-[#FF9900] hover:bg-[#FFF7E6] hover:text-[#111111]"
              >
                <span>{name}</span>
              </button>
            ))}
          </div>
        )}

        {mode === "team" && (
          <div className="flex flex-wrap items-center gap-1.5 pt-1 sm:pt-0">
            <span className="text-[#767676] font-medium text-[11px]">Top Teams:</span>
            {["Androids", "Banana", "01BIT", "KL_converge"].map((tName) => (
              <button
                key={tName}
                type="button"
                onClick={() => {
                  setQuery(tName);
                  handleSearch(tName, "team", false);
                }}
                className="inline-flex items-center gap-1 rounded-md border border-[#E3E3E3] bg-white px-2 py-1 min-h-[32px] sm:min-h-[26px] text-[11px] text-[#5F6368] transition-colors hover:border-[#FF9900] hover:bg-[#FFF7E6] hover:text-[#111111]"
              >
                <span>{tName}</span>
              </button>
            ))}
          </div>
        )}

        {mode === "all" && popularOrganizations.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 pt-1 sm:pt-0">
            <span className="text-[#767676] font-medium text-[11px]">Popular:</span>
            {popularOrganizations.slice(0, 3).map((org) => (
              <button
                key={org.slug}
                type="button"
                onClick={() => {
                  setQuery(org.name);
                  handleSearch(org.name, "all", false);
                }}
                className="inline-flex items-center gap-1 rounded-md border border-[#E3E3E3] bg-white px-2 py-1 min-h-[32px] sm:min-h-[26px] text-[11px] text-[#5F6368] transition-colors hover:border-[#FF9900] hover:bg-[#FFF7E6] hover:text-[#111111]"
              >
                <span className="truncate max-w-[120px] sm:max-w-[150px]">{org.name}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, X, Building2, Check, Sparkles } from "lucide-react";
import type { Organization } from "@/lib/types";

interface SearchBarProps {
  initialQuery?: string;
  initialExact?: boolean;
  popularOrganizations?: Organization[];
}

export function SearchBar({
  initialQuery = "",
  initialExact = false,
  popularOrganizations = [],
}: SearchBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [query, setQuery] = useState(initialQuery);
  const [exact, setExact] = useState(initialExact);
  const [suggestions, setSuggestions] = useState<Organization[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);

  const containerRef = useRef<HTMLDivElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setQuery(searchParams.get("q") || "");
    setExact(searchParams.get("exact") === "1" || searchParams.get("exact") === "true");
  }, [searchParams]);

  // Debounced autocomplete fetch from local API route
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (!query || query.trim().length < 1) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }

    debounceTimerRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query.trim())}&type=suggest&limit=6`);
        if (res.ok) {
          const data = await res.json();
          setSuggestions(data.organizations || []);
          setShowDropdown(true);
        }
      } catch (err) {
        console.error("Failed to fetch autocomplete suggestions", err);
      }
    }, 180);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [query]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = (overrideQuery?: string, overrideExact?: boolean) => {
    const targetQuery = overrideQuery !== undefined ? overrideQuery : query;
    const targetExact = overrideExact !== undefined ? overrideExact : exact;

    setShowDropdown(false);

    const params = new URLSearchParams();
    if (targetQuery.trim()) {
      params.set("q", targetQuery.trim());
    }
    if (targetExact) {
      params.set("exact", "1");
    }

    startTransition(() => {
      router.push(`/?${params.toString()}`);
    });
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
        setQuery(selected.name);
        handleSearch(selected.name);
      }
    } else if (e.key === "Escape") {
      setShowDropdown(false);
    }
  };

  return (
    <div ref={containerRef} className="w-full space-y-4">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSearch();
        }}
        className="relative"
      >
        <div className="relative flex items-center">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
            <Search className="h-5 w-5" />
          </div>

          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setFocusedIndex(-1);
            }}
            onFocus={() => {
              if (suggestions.length > 0) setShowDropdown(true);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Search by college or organization (e.g., IIT Madras, VIT, BITS, Manipal)..."
            className="w-full rounded-2xl border border-white/15 bg-surface-900/80 py-4 pl-12 pr-28 text-base text-white placeholder-slate-400 shadow-xl backdrop-blur-md transition-all focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/20"
          />

          <div className="absolute inset-y-0 right-0 flex items-center pr-2 gap-1.5">
            {query && (
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  setSuggestions([]);
                  setShowDropdown(false);
                  handleSearch("");
                }}
                className="rounded-lg p-2 text-slate-400 hover:bg-white/10 hover:text-white"
                title="Clear search"
              >
                <X className="h-4 w-4" />
              </button>
            )}

            <button
              type="submit"
              disabled={isPending}
              className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-500/25 transition-all hover:brightness-110 active:scale-95 disabled:opacity-50"
            >
              <span>{isPending ? "Searching..." : "Search"}</span>
            </button>
          </div>
        </div>

        {/* Autocomplete Dropdown */}
        {showDropdown && suggestions.length > 0 && (
          <div className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-2xl border border-white/15 bg-surface-900 shadow-2xl backdrop-blur-xl">
            <div className="p-1.5">
              {suggestions.map((org, index) => (
                <button
                  key={org.slug || org.name}
                  type="button"
                  onClick={() => {
                    setQuery(org.name);
                    handleSearch(org.name);
                  }}
                  className={`flex w-full items-center justify-between rounded-xl px-4 py-3 text-left transition-colors ${
                    focusedIndex === index
                      ? "bg-indigo-600/30 text-white"
                      : "text-slate-200 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Building2 className="h-4 w-4 text-indigo-400 shrink-0" />
                    <span className="truncate text-sm font-medium">{org.name}</span>
                  </div>
                  <span className="shrink-0 text-xs font-mono text-slate-400">
                    {org.teamCount} {org.teamCount === 1 ? "team" : "teams"}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </form>

      {/* Filter Options & Quick Tags */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm">
        <label className="flex items-center gap-2 cursor-pointer text-slate-300 select-none">
          <input
            type="checkbox"
            checked={exact}
            onChange={(e) => {
              const newExact = e.target.checked;
              setExact(newExact);
              handleSearch(query, newExact);
            }}
            className="h-4 w-4 rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-indigo-500"
          />
          <span>Exact institution match only</span>
        </label>

        {popularOrganizations.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-slate-400 font-medium flex items-center gap-1">
              <Sparkles className="h-3 w-3 text-amber-400" /> Popular:
            </span>
            {popularOrganizations.slice(0, 5).map((org) => (
              <button
                key={org.slug}
                type="button"
                onClick={() => {
                  setQuery(org.name);
                  handleSearch(org.name, false);
                }}
                className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-slate-300 transition-colors hover:border-indigo-500/40 hover:bg-indigo-500/10 hover:text-white"
              >
                {org.name.length > 25 ? `${org.name.substring(0, 25)}...` : org.name}{" "}
                <span className="text-slate-500 font-mono">({org.teamCount})</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

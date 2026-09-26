"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, X, Building2 } from "lucide-react";
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
    <div ref={containerRef} className="w-full space-y-3">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSearch();
        }}
        className="relative"
      >
        <div className="relative flex items-stretch rounded-md border border-[#D5D5D5] bg-white shadow-subtle focus-within:border-[#FF9900] focus-within:ring-2 focus-within:ring-[#FF9900]/20">
          <div className="flex items-center pl-3.5 pr-2 text-[#767676]">
            <Search className="h-4 w-4" />
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
            placeholder="Search teams, organizations, or participants (e.g. IIT Madras, VIT, BITS)..."
            className="w-full py-2.5 pr-10 text-sm text-[#111111] placeholder-[#767676] outline-none"
          />

          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setSuggestions([]);
                setShowDropdown(false);
                handleSearch("");
              }}
              className="flex items-center pr-3 text-[#767676] hover:text-[#111111]"
              title="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}

          <button
            type="submit"
            disabled={isPending}
            className="inline-flex items-center justify-center rounded-r-[5px] bg-[#FF9900] px-5 text-sm font-semibold text-[#111111] hover:bg-[#E47911] transition-colors disabled:opacity-50"
          >
            <span>{isPending ? "Searching..." : "Search"}</span>
          </button>
        </div>

        {/* Autocomplete Dropdown */}
        {showDropdown && suggestions.length > 0 && (
          <div className="absolute left-0 right-0 top-full z-50 mt-1 overflow-hidden rounded-md border border-[#E3E3E3] bg-white shadow-dropdown">
            <div className="p-1">
              {suggestions.map((org, index) => (
                <button
                  key={org.slug || org.name}
                  type="button"
                  onClick={() => {
                    setQuery(org.name);
                    handleSearch(org.name);
                  }}
                  className={`flex w-full items-center justify-between rounded px-3 py-2 text-left text-xs transition-colors ${
                    focusedIndex === index
                      ? "bg-[#FFF3E0] text-[#E47911] font-semibold"
                      : "text-[#111111] hover:bg-[#F7F7F7]"
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <Building2 className="h-3.5 w-3.5 text-[#767676] shrink-0" />
                    <span className="truncate">{org.name}</span>
                  </div>
                  <span className="shrink-0 font-mono text-[11px] text-[#767676]">
                    {org.teamCount} {org.teamCount === 1 ? "team" : "teams"}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </form>

      {/* Filter Options & Quick Tags */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 text-xs">
        <label className="flex items-center gap-1.5 cursor-pointer text-[#5F6368] select-none hover:text-[#111111]">
          <input
            type="checkbox"
            checked={exact}
            onChange={(e) => {
              const newExact = e.target.checked;
              setExact(newExact);
              handleSearch(query, newExact);
            }}
            className="h-3.5 w-3.5 rounded border-[#D5D5D5] text-[#FF9900] focus:ring-[#FF9900]"
          />
          <span>Exact institution match only</span>
        </label>

        {popularOrganizations.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[#767676] font-medium">Popular:</span>
            {popularOrganizations.slice(0, 5).map((org) => (
              <button
                key={org.slug}
                type="button"
                onClick={() => {
                  setQuery(org.name);
                  handleSearch(org.name, false);
                }}
                className="rounded border border-[#E3E3E3] bg-white px-2 py-0.5 text-[11px] text-[#5F6368] transition-colors hover:border-[#FF9900] hover:text-[#111111]"
              >
                {org.name.length > 22 ? `${org.name.substring(0, 22)}...` : org.name}{" "}
                <span className="font-mono text-[#767676]">({org.teamCount})</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

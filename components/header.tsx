"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  Trophy,
  Building2,
  GitFork,
  Menu,
  X,
  ChevronDown,
  ChevronRight,
  Compass,
  Building,
  BarChart3,
  Users,
  Bookmark,
  TrendingUp,
  BookOpen,
  MessageSquare,
} from "lucide-react";


import { useSavedTeams } from "@/hooks/useSavedTeams";

interface LeaderboardSubItem {
  label: string;
  shortLabel: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  badge?: string;
}

export function Header() {
  const pathname = usePathname();
  const { count, isLoaded } = useSavedTeams();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [leaderboardDropdownOpen, setLeaderboardDropdownOpen] = useState(false);
  const [mobileLeaderboardExpanded, setMobileLeaderboardExpanded] = useState(true);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const dropdownTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const leaderboardSubItems: LeaderboardSubItem[] = [
    {
      label: "Teams & Standings",
      shortLabel: "Teams",
      href: "/leaderboard",
      icon: Trophy,
      description: "Final recorded standings, scores & rosters",
      badge: "Final",
    },
    {
      label: "Movements & Climbers",
      shortLabel: "Movers",
      href: "/movers",
      icon: TrendingUp,
      description: "Biggest rank climbers, score improvements & new entries",
      badge: "Gains",
    },
    {
      label: "College Leaderboard",
      shortLabel: "Colleges",
      href: "/colleges/leaderboard",
      icon: Building2,
      description: "Institutional performance, participation, Top 100 & growth",
      badge: "Colleges",
    },
    {
      label: "Competition Statistics",
      shortLabel: "Statistics",
      href: "/statistics",
      icon: BarChart3,
      description: "Historical metrics, score distributions & snapshot comparison",
      badge: "Analytics",
    },
    {
      label: "Women-Only Teams",
      shortLabel: "Women Teams",
      href: "/leaderboard/women-teams",
      icon: Users,
      description: "Dedicated category for verified all-female competitor teams",
      badge: "Category",
    },
    {
      label: "Inter-College Teams",
      shortLabel: "Inter-College",
      href: "/leaderboard/inter-college",
      icon: GitFork,
      description: "Multi-college collaborations & cross-institution teams",
      badge: "Multi-Univ",
    },
  ];

  // Helper to check if current route is part of leaderboard section
  const isLeaderboardActive =
    pathname.startsWith("/leaderboard") ||
    pathname.startsWith("/colleges") ||
    pathname.startsWith("/cross-college") ||
    pathname.startsWith("/women-teams") ||
    pathname.startsWith("/women-only-teams");

  // Handle dropdown mouse enter/leave with grace period
  const handleMouseEnter = () => {
    if (dropdownTimeoutRef.current) {
      clearTimeout(dropdownTimeoutRef.current);
      dropdownTimeoutRef.current = null;
    }
    setLeaderboardDropdownOpen(true);
  };

  const handleMouseLeave = () => {
    dropdownTimeoutRef.current = setTimeout(() => {
      setLeaderboardDropdownOpen(false);
    }, 150);
  };

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setLeaderboardDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      if (dropdownTimeoutRef.current) {
        clearTimeout(dropdownTimeoutRef.current);
      }
    };
  }, []);

  // Prevent background scrolling when mobile drawer is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  // Close mobile menu and dropdown on route change or escape key
  useEffect(() => {
    setMobileMenuOpen(false);
    setLeaderboardDropdownOpen(false);
  }, [pathname]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMobileMenuOpen(false);
        setLeaderboardDropdownOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#E3E3E3] bg-white/95 backdrop-blur-xs">
      <div className="mx-auto flex h-14 sm:h-15 max-w-7xl items-center justify-between px-3 sm:px-6 lg:px-8">
        {/* Brand Identity */}
        <Link
          href="/"
          onClick={() => setMobileMenuOpen(false)}
          className="flex items-center gap-2 sm:gap-2.5 group min-w-0 shrink-0"
        >
          <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white shadow-xs group-hover:scale-105 transition-all border border-[#E3E3E3] overflow-hidden p-0.5">
            <Image
              src="/whitebgfavicon/android-chrome-192x192.png"
              alt="Amazon ML Challenge Explorer Logo"
              width={36}
              height={36}
              className="h-full w-full object-contain rounded-md"
            />
          </div>
          <div className="flex flex-col min-w-0 justify-center">
            <div className="flex items-center gap-1.5 leading-none">
              <span className="text-xs sm:text-sm font-black tracking-tight text-[#111111] group-hover:text-[#E47911] transition-colors">
                Amazon <span className="text-[#FF9900]">ML</span>
              </span>
              <span className="inline-flex items-center rounded bg-[#FFF3E0] border border-[#F5C26B]/80 px-1.5 py-0.5 font-mono text-[9px] font-bold text-[#E47911] leading-none">
                Challenge
              </span>
            </div>
            <span className="text-[9px] sm:text-[10px] font-bold tracking-widest uppercase text-[#767676] leading-none mt-1">
              Explorer
            </span>
          </div>
        </Link>

        {/* Desktop Primary Navigation (Clean & Uncluttered) */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2 h-full">
          {/* 1. Explorer / Home */}
          <Link
            href="/"
            className={`relative flex items-center gap-1.5 h-full px-3 text-xs lg:text-sm font-medium transition-colors ${
              pathname === "/"
                ? "text-[#E47911] font-semibold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[3px] after:bg-[#FF9900]"
                : "text-[#5F6368] hover:text-[#E47911] hover:bg-[#FFF7E6]/70"
            }`}
          >
            <Compass className={`h-4 w-4 shrink-0 ${pathname === "/" ? "text-[#FF9900]" : "text-[#767676]"}`} />
            <span>Explorer</span>
          </Link>

          {/* 2. Leaderboard Dropdown Menu */}
          <div
            ref={dropdownRef}
            className="relative h-full flex items-center"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <button
              type="button"
              onClick={() => setLeaderboardDropdownOpen(!leaderboardDropdownOpen)}
              aria-expanded={leaderboardDropdownOpen}
              aria-haspopup="true"
              className={`relative flex items-center gap-1.5 h-full px-3 text-xs lg:text-sm font-medium transition-colors cursor-pointer select-none ${
                isLeaderboardActive
                  ? "text-[#E47911] font-semibold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[3px] after:bg-[#FF9900]"
                  : "text-[#5F6368] hover:text-[#E47911] hover:bg-[#FFF7E6]/70"
              }`}
            >
              <Trophy
                className={`h-4 w-4 shrink-0 ${
                  isLeaderboardActive ? "text-[#FF9900]" : "text-[#767676]"
                }`}
              />
              <span>Leaderboard</span>
              <ChevronDown
                className={`h-3.5 w-3.5 transition-transform duration-200 ${
                  leaderboardDropdownOpen ? "rotate-180 text-[#E47911]" : "text-[#767676]"
                }`}
              />
            </button>

            {/* Dropdown Popover */}
            {leaderboardDropdownOpen && (
              <div
                className="absolute top-[calc(100%-2px)] left-0 w-80 rounded-xl border border-[#E3E3E3] bg-white p-2 shadow-xl ring-1 ring-black/5 animate-in fade-in-0 zoom-in-95 duration-150 z-50"
                role="menu"
                aria-orientation="vertical"
              >
                <div className="px-3 py-1.5 border-b border-[#F0F0F0] mb-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#767676]">
                    Leaderboard Categories
                  </span>
                </div>

                <div className="space-y-1">
                  {leaderboardSubItems.map((item) => {
                    const isItemActive =
                      item.href === "/leaderboard"
                        ? pathname === "/leaderboard"
                        : item.href === "/leaderboard/colleges"
                        ? pathname === "/leaderboard/colleges" || pathname === "/colleges"
                        : pathname === "/leaderboard/inter-college" || pathname === "/cross-college";

                    const IconComponent = item.icon;

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        role="menuitem"
                        onClick={() => setLeaderboardDropdownOpen(false)}
                        className={`group flex items-start gap-3 rounded-lg p-2.5 transition-all ${
                          isItemActive
                            ? "bg-[#FFF3E0] border border-[#F5C26B]/80 text-[#111111]"
                            : "hover:bg-[#F7F7F7] border border-transparent text-[#111111]"
                        }`}
                      >
                        <div
                          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md border transition-colors mt-0.5 ${
                            isItemActive
                              ? "bg-[#FF9900] text-[#111111] border-[#E47911]"
                              : "bg-[#F7F7F7] text-[#5F6368] border-[#E3E3E3] group-hover:bg-[#FFF3E0] group-hover:text-[#E47911] group-hover:border-[#F5C26B]"
                          }`}
                        >
                          <IconComponent className="h-4 w-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-1.5">
                            <span className="text-xs font-bold leading-tight group-hover:text-[#E47911] transition-colors">
                              {item.label}
                            </span>
                            {item.badge && (
                              <span
                                className={`text-[9px] font-mono font-semibold px-1.5 py-0.2 rounded border ${
                                  isItemActive
                                    ? "bg-[#FF9900]/20 text-[#E47911] border-[#FF9900]/40"
                                    : "bg-[#F0F0F0] text-[#767676] border-[#E3E3E3]"
                                }`}
                              >
                                {item.badge}
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-[#767676] line-clamp-1 mt-0.5 leading-snug">
                            {item.description}
                          </p>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* 3. Colleges Directory */}
          <Link
            href="/colleges"
            className={`relative flex items-center gap-1.5 h-full px-2.5 lg:px-3 text-xs lg:text-sm font-medium transition-colors ${
              pathname.startsWith("/colleges")
                ? "text-[#E47911] font-semibold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[3px] after:bg-[#FF9900]"
                : "text-[#5F6368] hover:text-[#E47911] hover:bg-[#FFF7E6]/70"
            }`}
          >
            <Building className={`h-4 w-4 shrink-0 ${pathname.startsWith("/colleges") ? "text-[#FF9900]" : "text-[#767676]"}`} />
            <span>Colleges</span>
          </Link>

          {/* 4. Compare */}
          <Link
            href="/compare"
            className={`relative flex items-center gap-1.5 h-full px-2.5 lg:px-3 text-xs lg:text-sm font-medium transition-colors ${
              pathname.startsWith("/compare")
                ? "text-[#E47911] font-semibold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[3px] after:bg-[#FF9900]"
                : "text-[#5F6368] hover:text-[#E47911] hover:bg-[#FFF7E6]/70"
            }`}
          >
            <BarChart3 className={`h-4 w-4 shrink-0 ${pathname.startsWith("/compare") ? "text-[#FF9900]" : "text-[#767676]"}`} />
            <span>Compare</span>
          </Link>

          {/* 5. Blog / Insights */}
          <Link
            href="/blog"
            className={`relative flex items-center gap-1.5 h-full px-2.5 lg:px-3 text-xs lg:text-sm font-medium transition-colors ${
              pathname.startsWith("/blog")
                ? "text-[#E47911] font-semibold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[3px] after:bg-[#FF9900]"
                : "text-[#5F6368] hover:text-[#E47911] hover:bg-[#FFF7E6]/70"
            }`}
          >
            <BookOpen className={`h-4 w-4 shrink-0 ${pathname.startsWith("/blog") ? "text-[#FF9900]" : "text-[#767676]"}`} />
            <span>Blog</span>
          </Link>

          {/* 6. Saved Teams */}
          <Link
            href="/saved"
            className={`relative flex items-center gap-1.5 h-full px-2.5 lg:px-3 text-xs lg:text-sm font-medium transition-colors ${
              pathname.startsWith("/saved")
                ? "text-[#E47911] font-semibold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[3px] after:bg-[#FF9900]"
                : "text-[#5F6368] hover:text-[#E47911] hover:bg-[#FFF7E6]/70"
            }`}
          >
            <Bookmark className={`h-4 w-4 shrink-0 ${pathname.startsWith("/saved") ? "text-[#FF9900] fill-[#FF9900]" : "text-[#767676]"}`} />
            <span>Saved</span>
            {isLoaded && count > 0 && (
              <span className="rounded-full bg-[#FFF3E0] border border-[#F5C26B] px-1.5 py-0.2 text-[10px] font-mono font-bold text-[#E47911]">
                {count}
              </span>
            )}
          </Link>
        </nav>


        {/* Right side snapshot indicator, Feedback CTA & Mobile Menu Toggle */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          <a
            href="https://tally.so/r/A71rkk"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg border border-[#E3E3E3] bg-[#FAFAFA] hover:border-[#FF9900] hover:bg-[#FFF3E0] hover:text-[#E47911] px-2.5 sm:px-3 py-1.5 text-xs font-semibold text-[#111111] transition-all shadow-2xs shrink-0"
            title="Send Feedback or Feature Request"
          >
            <MessageSquare className="h-3.5 w-3.5 text-[#FF9900]" />
            <span className="hidden sm:inline">Feedback</span>
          </a>

          <div className="hidden lg:flex items-center gap-1.5 rounded-full bg-[#F7F7F7] border border-[#E3E3E3] px-3 py-1 text-[11px] font-medium text-[#5F6368]">
            <span className="h-2 w-2 rounded-full bg-[#067D62] animate-pulse" />
            <span>4,334 Teams Indexed</span>
          </div>

          {/* Accessible touch target mobile toggle */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden flex h-10 w-10 items-center justify-center rounded-lg border border-[#E3E3E3] bg-[#FAFAFA] text-[#111111] hover:bg-[#FFF3E0] hover:text-[#E47911] hover:border-[#FF9900] active:scale-95 transition-all"
            aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>


      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 top-14 z-50 md:hidden">
          {/* Backdrop Blur */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />

          {/* Drawer Content */}
          <div className="relative z-10 max-h-[calc(100vh-3.5rem)] overflow-y-auto border-b border-[#E3E3E3] bg-white shadow-2xl animate-in slide-in-from-top-2 duration-200">
            <div className="p-3.5 space-y-4">
              {/* Group 1: Leaderboard */}
              <div>
                <div className="px-2 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-[#767676]">
                  Leaderboards
                </div>
                <div className="space-y-1">
                  <Link
                    href="/leaderboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center justify-between rounded-xl px-3 py-2.5 min-h-[44px] text-xs font-semibold transition-colors ${
                      pathname === "/leaderboard"
                        ? "bg-[#FFF3E0] text-[#E47911] border border-[#F5C26B]"
                        : "text-[#111111] hover:bg-[#F7F7F7]"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[#FFF3E0] text-[#E47911]">
                        <Trophy className="h-4 w-4 text-[#FF9900]" />
                      </div>
                      <span>Teams Standings</span>
                    </div>
                    <span className="font-mono text-[10px] text-[#767676] bg-[#F0F0F0] px-1.5 py-0.5 rounded">
                      4,334
                    </span>
                  </Link>

                  <Link
                    href="/movers"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center justify-between rounded-xl px-3 py-2.5 min-h-[44px] text-xs font-semibold transition-colors ${
                      pathname === "/movers"
                        ? "bg-[#FFF3E0] text-[#E47911] border border-[#F5C26B]"
                        : "text-[#111111] hover:bg-[#F7F7F7]"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[#ECFDF5] text-emerald-700">
                        <span className="text-emerald-600 font-bold">▲</span>
                      </div>
                      <span>Biggest Movers</span>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                      LIVE
                    </span>
                  </Link>

                  <Link
                    href="/leaderboard/colleges"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center justify-between rounded-xl px-3 py-2.5 min-h-[44px] text-xs font-semibold transition-colors ${
                      pathname === "/leaderboard/colleges"
                        ? "bg-[#FFF3E0] text-[#E47911] border border-[#F5C26B]"
                        : "text-[#111111] hover:bg-[#F7F7F7]"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[#FFF3E0] text-[#E47911]">
                        <Building2 className="h-4 w-4 text-[#FF9900]" />
                      </div>
                      <span>Colleges Leaderboard</span>
                    </div>
                    <span className="font-mono text-[10px] text-[#767676] bg-[#F0F0F0] px-1.5 py-0.5 rounded">
                      1,546
                    </span>
                  </Link>

                  <Link
                    href="/leaderboard/inter-college"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center justify-between rounded-xl px-3 py-2.5 min-h-[44px] text-xs font-semibold transition-colors ${
                      pathname === "/leaderboard/inter-college"
                        ? "bg-[#FFF3E0] text-[#E47911] border border-[#F5C26B]"
                        : "text-[#111111] hover:bg-[#F7F7F7]"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[#FFF3E0] text-[#E47911]">
                        <GitFork className="h-4 w-4 text-[#FF9900]" />
                      </div>
                      <span>Inter-College Teams</span>
                    </div>
                    <span className="font-mono text-[10px] text-[#E47911] bg-[#FFF3E0] px-1.5 py-0.5 rounded border border-[#F5C26B]/60">
                      Multi-Univ
                    </span>
                  </Link>

                  <Link
                    href="/leaderboard/women-teams"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center justify-between rounded-xl px-3 py-2.5 min-h-[44px] text-xs font-semibold transition-colors ${
                      pathname === "/leaderboard/women-teams"
                        ? "bg-[#FFF3E0] text-[#E47911] border border-[#F5C26B]"
                        : "text-[#111111] hover:bg-[#F7F7F7]"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[#FFF3E0] text-[#E47911]">
                        <Users className="h-4 w-4 text-[#FF9900]" />
                      </div>
                      <span>Women-Only Teams</span>
                    </div>
                    <span className="font-mono text-[10px] text-[#767676] bg-[#F0F0F0] px-1.5 py-0.5 rounded">
                      27
                    </span>
                  </Link>
                </div>
              </div>

              {/* Group 2: Explore */}
              <div className="pt-2 border-t border-[#F0F0F0]">
                <div className="px-2 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-[#767676]">
                  Explore & Analytics
                </div>
                <div className="space-y-1">
                  <Link
                    href="/"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center justify-between rounded-xl px-3 py-2.5 min-h-[44px] text-xs font-semibold transition-colors ${
                      pathname === "/"
                        ? "bg-[#FFF3E0] text-[#E47911] border border-[#F5C26B]"
                        : "text-[#111111] hover:bg-[#F7F7F7]"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[#F7F7F7] text-[#5F6368] border border-[#E3E3E3]">
                        <Compass className="h-4 w-4" />
                      </div>
                      <span>Search & Explorer</span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-[#767676]" />
                  </Link>

                  <Link
                    href="/colleges"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center justify-between rounded-xl px-3 py-2.5 min-h-[44px] text-xs font-semibold transition-colors ${
                      pathname.startsWith("/colleges")
                        ? "bg-[#FFF3E0] text-[#E47911] border border-[#F5C26B]"
                        : "text-[#111111] hover:bg-[#F7F7F7]"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[#F7F7F7] text-[#5F6368] border border-[#E3E3E3]">
                        <Building className="h-4 w-4" />
                      </div>
                      <span>Colleges Directory</span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-[#767676]" />
                  </Link>

                  <Link
                    href="/compare"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center justify-between rounded-xl px-3 py-2.5 min-h-[44px] text-xs font-semibold transition-colors ${
                      pathname.startsWith("/compare")
                        ? "bg-[#FFF3E0] text-[#E47911] border border-[#F5C26B]"
                        : "text-[#111111] hover:bg-[#F7F7F7]"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[#F7F7F7] text-[#5F6368] border border-[#E3E3E3]">
                        <BarChart3 className="h-4 w-4" />
                      </div>
                      <span>Compare Colleges</span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-[#767676]" />
                  </Link>

                  <Link
                    href="/blog"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center justify-between rounded-xl px-3 py-2.5 min-h-[44px] text-xs font-semibold transition-colors ${
                      pathname.startsWith("/blog")
                        ? "bg-[#FFF3E0] text-[#E47911] border border-[#F5C26B]"
                        : "text-[#111111] hover:bg-[#F7F7F7]"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[#F7F7F7] text-[#5F6368] border border-[#E3E3E3]">
                        <BookOpen className="h-4 w-4" />
                      </div>
                      <span>Editorial Blog & Insights</span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-[#767676]" />
                  </Link>

                  <Link
                    href="/faq"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center justify-between rounded-xl px-3 py-2.5 min-h-[44px] text-xs font-semibold transition-colors ${
                      pathname.startsWith("/faq")
                        ? "bg-[#FFF3E0] text-[#E47911] border border-[#F5C26B]"
                        : "text-[#111111] hover:bg-[#F7F7F7]"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[#F7F7F7] text-[#5F6368] border border-[#E3E3E3]">
                        <span className="font-bold text-xs">?</span>
                      </div>
                      <span>Frequently Asked Questions</span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-[#767676]" />
                  </Link>
                </div>
              </div>

              {/* Group 3: My Saved Teams */}
              <div className="pt-2 border-t border-[#F0F0F0]">
                <div className="px-2 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-[#767676]">
                  My Space
                </div>

                <Link
                  href="/saved"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between rounded-xl px-3 py-2.5 min-h-[44px] text-xs font-semibold transition-colors ${
                    pathname.startsWith("/saved")
                      ? "bg-[#FFF3E0] text-[#E47911] border border-[#F5C26B]"
                      : "text-[#111111] hover:bg-[#F7F7F7]"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[#FFF3E0] text-[#E47911]">
                      <Bookmark className="h-4 w-4 text-[#FF9900] fill-[#FF9900]" />
                    </div>
                    <span>Saved Bookmarked Teams</span>
                  </div>
                  {isLoaded && count > 0 && (
                    <span className="rounded-full bg-[#FF9900] text-[#111111] px-2 py-0.5 text-[10px] font-mono font-bold">
                      {count}
                    </span>
                  )}
                </Link>

                <Link
                  href="/support"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between rounded-xl px-3 py-2.5 min-h-[44px] text-xs font-semibold transition-colors ${
                    pathname.startsWith("/support")
                      ? "bg-[#FFF3E0] text-[#E47911] border border-[#F5C26B]"
                      : "text-[#111111] hover:bg-[#F7F7F7]"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[#FFF3E0] text-[#E47911]">
                      <span className="text-xs">☕</span>
                    </div>
                    <span>Support the Project</span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-[#767676]" />
                </Link>

                <a
                  href="https://tally.so/r/A71rkk"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between rounded-xl px-3 py-2.5 min-h-[44px] text-xs font-semibold text-[#111111] hover:bg-[#F7F7F7] transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[#F7F7F7] text-[#5F6368] border border-[#E3E3E3]">
                      <MessageSquare className="h-4 w-4 text-[#FF9900]" />
                    </div>
                    <span>Send Feedback / Request</span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-[#767676]" />
                </a>
              </div>

            </div>

            {/* Mobile Footer Status Tag */}
            <div className="border-t border-[#EAEAEA] bg-[#FAFAFA] px-4 py-3 text-xs text-[#5F6368] flex items-center justify-between">
              <span className="flex items-center gap-1.5 font-mono text-[11px]">
                <span className="h-2 w-2 rounded-full bg-[#067D62]" />
                <span>4,334 Teams Indexed</span>
              </span>
              <span className="font-mono text-[11px] text-[#767676]">
                Snapshot 2026
              </span>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

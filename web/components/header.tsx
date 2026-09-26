"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Trophy, BarChart2, Building2, Users2, GitFork, Menu, X, ChevronRight } from "lucide-react";

export function Header() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { label: "Explorer", href: "/", icon: Trophy, description: "Search & overview" },
    { label: "Leaderboard", href: "/leaderboard", icon: BarChart2, description: "Official rankings & scores" },
    { label: "Organizations", href: "/organizations", icon: Building2, description: "Colleges directory" },
    { label: "Compare", href: "/compare", icon: Users2, description: "Side-by-side metrics" },
    { label: "Cross-College", href: "/cross-college", icon: GitFork, description: "Inter-university teams" },
  ];

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

  // Close on escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileMenuOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#E3E3E3] bg-white/95 backdrop-blur-xs">
      <div className="mx-auto flex h-14 sm:h-15 max-w-7xl items-center justify-between px-3 sm:px-6 lg:px-8">
        {/* Brand Identity - Clean 2-Line Layout */}
        <Link
          href="/"
          onClick={() => setMobileMenuOpen(false)}
          className="flex items-center gap-2 sm:gap-2.5 group min-w-0 shrink-0"
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#131921] text-white shadow-xs group-hover:bg-[#232F3E] transition-colors border border-black/10">
            <Trophy className="h-4.5 w-4.5 text-[#FF9900]" />
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

        {/* Desktop Primary Navigation */}
        <nav className="hidden md:flex items-center gap-0.5 lg:gap-1 h-full">
          {navItems.map((item) => {
            const isActive =
              item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative flex items-center gap-1.5 h-full px-3 lg:px-3.5 text-xs lg:text-sm font-medium transition-colors ${
                  isActive
                    ? "text-[#E47911] font-semibold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[3px] after:bg-[#FF9900]"
                    : "text-[#5F6368] hover:text-[#E47911] hover:bg-[#FFF7E6]"
                }`}
              >
                <item.icon className={`h-3.5 w-3.5 shrink-0 ${isActive ? "text-[#FF9900]" : "text-[#767676]"}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right side snapshot indicator & Mobile Menu Toggle */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="hidden lg:flex items-center gap-1.5 rounded bg-[#F7F7F7] border border-[#E3E3E3] px-2.5 py-1 text-[11px] font-medium text-[#5F6368]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#067D62]" />
            <span>Local Dataset (4,334 Teams)</span>
          </div>

          {/* Accessible 44px+ touch target button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden flex h-11 w-11 items-center justify-center rounded-md border border-[#E3E3E3] bg-[#FAFAFA] text-[#111111] hover:bg-[#FFF3E0] hover:text-[#E47911] hover:border-[#FF9900] active:scale-95 transition-all"
            aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer / Backdrop Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 top-14 z-50 md:hidden">
          {/* Backdrop Blur */}
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />

          {/* Drawer Content */}
          <div className="relative z-10 max-h-[calc(100vh-3.5rem)] overflow-y-auto border-b border-[#E3E3E3] bg-white shadow-xl animate-in slide-in-from-top-2 duration-200">
            <div className="px-3 py-3 space-y-1">
              {navItems.map((item) => {
                const isActive =
                  item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center justify-between rounded-lg px-3.5 py-3 min-h-[48px] text-sm transition-colors ${
                      isActive
                        ? "bg-[#FFF3E0] text-[#E47911] font-bold border-l-4 border-[#FF9900]"
                        : "text-[#111111] hover:bg-[#F7F7F7] active:bg-[#F0F0F0]"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-8 w-8 items-center justify-center rounded-md ${
                          isActive
                            ? "bg-[#FF9900] text-[#111111]"
                            : "bg-[#F7F7F7] text-[#5F6368] border border-[#E3E3E3]"
                        }`}
                      >
                        <item.icon className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="font-semibold leading-tight">{item.label}</div>
                        <div className="text-[11px] text-[#767676] font-normal mt-0.5">
                          {item.description}
                        </div>
                      </div>
                    </div>
                    <ChevronRight className={`h-4 w-4 ${isActive ? "text-[#E47911]" : "text-[#A0A0A0]"}`} />
                  </Link>
                );
              })}
            </div>

            {/* Mobile Footer Status Tag */}
            <div className="border-t border-[#EAEAEA] bg-[#FAFAFA] px-4 py-3 text-xs text-[#5F6368] flex items-center justify-between">
              <span className="flex items-center gap-1.5 font-mono text-[11px]">
                <span className="h-2 w-2 rounded-full bg-[#067D62]" />
                <span>4,334 Teams Indexed</span>
              </span>
              <span className="font-mono text-[11px] text-[#767676]">
                Challenge ID: 290344
              </span>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

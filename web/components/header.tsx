"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Trophy, BarChart2, Building2, Users2, GitFork, Menu, X } from "lucide-react";

export function Header() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { label: "Explorer", href: "/", icon: Trophy },
    { label: "Leaderboard", href: "/leaderboard", icon: BarChart2 },
    { label: "Organizations", href: "/organizations", icon: Building2 },
    { label: "Compare", href: "/compare", icon: Users2 },
    { label: "Cross-College", href: "/cross-college", icon: GitFork },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#E3E3E3] bg-white">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Identity */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-[#131921] text-white shadow-xs group-hover:bg-[#232F3E] transition-colors">
            <Trophy className="h-4 w-4 text-[#FF9900]" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-sm sm:text-base font-bold tracking-tight text-[#111111] group-hover:text-[#E47911] transition-colors">
              AmazonML Challenge Explorer
            </span>
            <span className="hidden text-[11px] font-mono text-[#767676] sm:inline-block">
              Challenge 290344
            </span>
          </div>
        </Link>

        {/* Desktop Primary Navigation */}
        <nav className="hidden md:flex items-center gap-1 h-full">
          {navItems.map((item) => {
            const isActive =
              item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative flex items-center gap-1.5 h-full px-3.5 text-xs sm:text-sm font-medium transition-colors ${
                  isActive
                    ? "text-[#E47911] font-semibold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[3px] after:bg-[#FF9900]"
                    : "text-[#5F6368] hover:text-[#E47911] hover:bg-[#FFF7E6]"
                }`}
              >
                <item.icon className={`h-3.5 w-3.5 ${isActive ? "text-[#FF9900]" : "text-[#767676]"}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right side snapshot indicator & Mobile Menu Toggle */}
        <div className="flex items-center gap-3">
          <div className="hidden lg:flex items-center gap-1.5 rounded bg-[#F7F7F7] border border-[#E3E3E3] px-2.5 py-1 text-[11px] font-medium text-[#5F6368]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#067D62]" />
            <span>Local Dataset (3,398 Teams)</span>
          </div>

          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden rounded p-1.5 text-[#5F6368] hover:bg-[#FFF7E6] hover:text-[#E47911]"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-[#E3E3E3] bg-[#FAFAFA] px-4 py-2 space-y-1">
          {navItems.map((item) => {
            const isActive =
              item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium ${
                  isActive
                    ? "bg-[#FFF3E0] text-[#E47911] font-semibold border-l-3 border-[#FF9900]"
                    : "text-[#5F6368] hover:bg-white hover:text-[#111111]"
                }`}
              >
                <item.icon className="h-4 w-4 text-[#FF9900]" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
}

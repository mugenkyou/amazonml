"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Trophy, Users2, Building2, BarChart2, GitFork } from "lucide-react";

export function Header() {
  const pathname = usePathname();

  const navItems = [
    { label: "Explorer", href: "/", icon: Trophy },
    { label: "Leaderboard", href: "/leaderboard", icon: BarChart2 },
    { label: "Organizations", href: "/organizations", icon: Building2 },
    { label: "Compare", href: "/compare", icon: Users2 },
    { label: "Cross-College", href: "/cross-college", icon: GitFork },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-surface-950/85 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-3 transition-opacity hover:opacity-90">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-md shadow-indigo-500/20">
            <Trophy className="h-4 w-4 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-bold tracking-tight text-white">ML Explorer</span>
              <span className="hidden rounded-full bg-indigo-500/10 px-2 py-0.5 text-[10px] font-semibold text-indigo-400 border border-indigo-500/20 md:inline-block">
                Contest 290344
              </span>
            </div>
          </div>
        </Link>

        {/* Primary Navigation */}
        <nav className="flex items-center gap-1 sm:gap-2">
          {navItems.map((item) => {
            const isActive =
              item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs sm:text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-indigo-500/15 text-indigo-300 border border-indigo-500/30"
                    : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
                }`}
              >
                <item.icon className="h-3.5 w-3.5 shrink-0 opacity-80" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}

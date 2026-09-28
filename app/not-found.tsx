import Link from "next/link";
import {
  Trophy,
  Building2,
  GitFork,
  Search,
  Home,
  ArrowRight,
  HelpCircle,
} from "lucide-react";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-3xl px-3.5 sm:px-6 lg:px-8 py-10 sm:py-16 text-center">
      <div className="inline-flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-2xl bg-[#FFF3E0] border border-[#F5C26B] text-[#E47911] shadow-xs mb-4">
        <HelpCircle className="h-8 w-8 sm:h-9 sm:w-9 text-[#FF9900]" />
      </div>

      <div className="font-mono text-xs font-bold uppercase tracking-widest text-[#E47911] mb-1">
        404 — Page Not Found
      </div>
      <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#111111]">
        Looking for a Team, College, or Leaderboard?
      </h1>
      <p className="mt-2 text-xs sm:text-sm text-[#5F6368] max-w-lg mx-auto leading-relaxed">
        The page or resource you requested does not exist or may have moved. You can search the 4,334 teams and 1,546 colleges below or jump to a section.
      </p>

      {/* Quick Search Bar */}
      <form action="/" method="GET" className="mt-6 max-w-md mx-auto">
        <div className="relative flex items-center">
          <Search className="pointer-events-none absolute left-3.5 h-4 w-4 text-[#767676]" />
          <input
            type="text"
            name="q"
            placeholder="Search teams, student members, or colleges..."
            className="w-full min-h-[44px] rounded-lg border border-[#D5D5D5] bg-white py-2.5 pl-10 pr-24 text-xs sm:text-sm text-[#111111] placeholder-[#767676] outline-none focus:border-[#FF9900] shadow-xs"
          />
          <button
            type="submit"
            className="absolute right-1.5 rounded-md bg-[#FF9900] px-3 py-1.5 text-xs font-bold text-[#111111] hover:bg-[#E47911] hover:text-white transition-colors"
          >
            Search
          </button>
        </div>
      </form>

      {/* Primary Discovery Links */}
      <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3 text-left max-w-2xl mx-auto">
        <Link
          href="/leaderboard"
          className="group rounded-lg border border-[#E3E3E3] bg-white p-3.5 shadow-subtle hover:border-[#FF9900] hover:bg-[#FFFDF9] transition-all"
        >
          <div className="flex items-center justify-between mb-1.5">
            <Trophy className="h-4 w-4 text-[#FF9900]" />
            <ArrowRight className="h-3.5 w-3.5 text-[#767676] group-hover:translate-x-1 group-hover:text-[#E47911] transition-transform" />
          </div>
          <span className="text-xs font-bold text-[#111111] group-hover:text-[#E47911] block">
            Team Leaderboard
          </span>
          <span className="text-[11px] text-[#767676] mt-0.5 block">
            Browse all 4,334 teams
          </span>
        </Link>

        <Link
          href="/leaderboard/colleges"
          className="group rounded-lg border border-[#E3E3E3] bg-white p-3.5 shadow-subtle hover:border-[#FF9900] hover:bg-[#FFFDF9] transition-all"
        >
          <div className="flex items-center justify-between mb-1.5">
            <Building2 className="h-4 w-4 text-[#FF9900]" />
            <ArrowRight className="h-3.5 w-3.5 text-[#767676] group-hover:translate-x-1 group-hover:text-[#E47911] transition-transform" />
          </div>
          <span className="text-xs font-bold text-[#111111] group-hover:text-[#E47911] block">
            College Leaderboard
          </span>
          <span className="text-[11px] text-[#767676] mt-0.5 block">
            Rank 1,546 universities
          </span>
        </Link>

        <Link
          href="/leaderboard/inter-college"
          className="group rounded-lg border border-[#E3E3E3] bg-white p-3.5 shadow-subtle hover:border-[#FF9900] hover:bg-[#FFFDF9] transition-all"
        >
          <div className="flex items-center justify-between mb-1.5">
            <GitFork className="h-4 w-4 text-[#FF9900]" />
            <ArrowRight className="h-3.5 w-3.5 text-[#767676] group-hover:translate-x-1 group-hover:text-[#E47911] transition-transform" />
          </div>
          <span className="text-xs font-bold text-[#111111] group-hover:text-[#E47911] block">
            Inter-College Teams
          </span>
          <span className="text-[11px] text-[#767676] mt-0.5 block">
            Multi-university rosters
          </span>
        </Link>
      </div>

      <div className="mt-8">
        <Link
          href="/"
          className="inline-flex min-h-[38px] items-center gap-1.5 rounded-lg border border-[#D5D5D5] bg-white px-4 py-2 text-xs font-semibold text-[#111111] hover:border-[#FF9900] hover:bg-[#FFF3E0] hover:text-[#E47911] transition-all shadow-xs"
        >
          <Home className="h-3.5 w-3.5" />
          <span>Return to Homepage Explorer</span>
        </Link>
      </div>
    </div>
  );
}

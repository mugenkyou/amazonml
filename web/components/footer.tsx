import { getDatasetMetadata } from "@/lib/data";

export function Footer() {
  const meta = getDatasetMetadata();

  return (
    <footer className="mt-auto border-t border-white/10 bg-surface-950 py-8">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 text-center sm:flex-row sm:text-left sm:px-6 lg:px-8">
        <div>
          <p className="text-sm font-medium text-slate-300">
            Unstop ML Challenge Leaderboard & Organization Explorer
          </p>
          <p className="text-xs text-slate-500 font-mono mt-1">
            Challenge ID: <code>{meta.challengeId}</code> • Public Competition Snapshot
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-slate-400">
          <span className="inline-flex items-center gap-1.5 rounded-md bg-slate-900 px-2.5 py-1 border border-slate-800">
            <span className="text-slate-500">Collected:</span>
            <strong className="text-slate-300 font-mono">
              {meta.uniqueTeams.toLocaleString()} teams
            </strong>
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-md bg-slate-900 px-2.5 py-1 border border-slate-800">
            <span className="text-slate-500">Institutions:</span>
            <strong className="text-slate-300 font-mono">
              {meta.uniqueOrganizations.toLocaleString()}
            </strong>
          </span>
          {meta.complete && (
            <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/10 px-2 py-1 text-emerald-400 border border-emerald-500/20 font-medium">
              ● Complete Dataset
            </span>
          )}
        </div>
      </div>
    </footer>
  );
}

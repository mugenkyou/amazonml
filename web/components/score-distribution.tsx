import type { ScoreDistributionBucket } from "@/lib/types";

interface ScoreDistributionProps {
  buckets: ScoreDistributionBucket[];
  highestScore: number | null;
  lowestScore: number | null;
  averageScore: number | null;
  medianScore: number | null;
}

export function ScoreDistribution({
  buckets,
  highestScore,
  lowestScore,
  averageScore,
  medianScore,
}: ScoreDistributionProps) {
  if (!buckets || buckets.length === 0) return null;

  return (
    <div className="rounded-2xl border border-white/10 bg-surface-900/60 p-5 backdrop-blur-md">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/5 pb-4 mb-4">
        <div>
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Score Distribution & Metrics
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Statistical breakdown across affiliated teams
          </p>
        </div>

        {/* Factual Score KPIs */}
        <div className="flex flex-wrap items-center gap-3 text-xs font-mono">
          <div className="rounded-lg bg-slate-950 px-2.5 py-1 border border-white/5">
            <span className="text-slate-400 mr-1.5">Max:</span>
            <strong className="text-emerald-400">{highestScore?.toFixed(6) || "—"}</strong>
          </div>
          <div className="rounded-lg bg-slate-950 px-2.5 py-1 border border-white/5">
            <span className="text-slate-400 mr-1.5">Avg:</span>
            <strong className="text-indigo-300">{averageScore?.toFixed(6) || "—"}</strong>
          </div>
          <div className="rounded-lg bg-slate-950 px-2.5 py-1 border border-white/5">
            <span className="text-slate-400 mr-1.5">Median:</span>
            <strong className="text-purple-300">{medianScore?.toFixed(6) || "—"}</strong>
          </div>
          <div className="rounded-lg bg-slate-950 px-2.5 py-1 border border-white/5">
            <span className="text-slate-400 mr-1.5">Min:</span>
            <strong className="text-slate-300">{lowestScore?.toFixed(6) || "—"}</strong>
          </div>
        </div>
      </div>

      {/* Compact Score Distribution Bars */}
      <div className="space-y-2.5">
        {buckets.map((b) => (
          <div key={b.label} className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-mono text-slate-300 font-medium">{b.label}</span>
              <span className="text-slate-400 font-mono text-[11px]">
                {b.count} {b.count === 1 ? "team" : "teams"}{" "}
                <span className="text-slate-400">({b.percentage}%)</span>
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-950 border border-white/5">
              <div
                className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500"
                style={{ width: `${Math.max(b.percentage > 0 ? 3 : 0, b.percentage)}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

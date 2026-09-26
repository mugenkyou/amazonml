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
    <div className="rounded-md border border-[#E3E3E3] bg-white p-4 shadow-subtle">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E3E3E3] pb-3 mb-3">
        <div>
          <h3 className="text-xs font-bold text-[#111111] uppercase tracking-wider">
            Score Distribution
          </h3>
          <p className="text-[11px] text-[#767676]">
            Submission score ranges across affiliated teams
          </p>
        </div>

        {/* Factual Score Metrics */}
        <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
          <div className="rounded bg-[#F7F7F7] border border-[#E3E3E3] px-2 py-0.5">
            <span className="text-[#767676] mr-1">Max:</span>
            <strong className="text-[#111111]">{highestScore?.toFixed(6) || "—"}</strong>
          </div>
          <div className="rounded bg-[#F7F7F7] border border-[#E3E3E3] px-2 py-0.5">
            <span className="text-[#767676] mr-1">Avg:</span>
            <strong className="text-[#111111]">{averageScore?.toFixed(6) || "—"}</strong>
          </div>
          <div className="rounded bg-[#F7F7F7] border border-[#E3E3E3] px-2 py-0.5">
            <span className="text-[#767676] mr-1">Median:</span>
            <strong className="text-[#111111]">{medianScore?.toFixed(6) || "—"}</strong>
          </div>
          <div className="rounded bg-[#F7F7F7] border border-[#E3E3E3] px-2 py-0.5">
            <span className="text-[#767676] mr-1">Min:</span>
            <strong className="text-[#111111]">{lowestScore?.toFixed(6) || "—"}</strong>
          </div>
        </div>
      </div>

      {/* Compact Distribution Bars */}
      <div className="space-y-2">
        {buckets.map((b, idx) => {
          const isTopTier = idx === 0;

          return (
            <div key={b.label} className="space-y-0.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono text-[#111111] font-medium">{b.label}</span>
                <span className="text-[#5F6368] font-mono text-[11px]">
                  {b.count} {b.count === 1 ? "team" : "teams"}{" "}
                  <span className="text-[#767676]">({b.percentage}%)</span>
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-[#F3F3F3]">
                <div
                  className={`h-full rounded-full transition-all ${
                    isTopTier
                      ? "bg-[#FF9900]"
                      : b.count > 0
                      ? "bg-[#5F6368]"
                      : "bg-transparent"
                  }`}
                  style={{ width: `${Math.max(b.percentage > 0 ? 3 : 0, b.percentage)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

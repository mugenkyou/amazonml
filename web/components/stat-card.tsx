import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  icon: LucideIcon;
  badge?: string;
  badgeVariant?: "success" | "warning" | "info";
}

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  badge,
  badgeVariant = "info",
}: StatCardProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-surface-900/60 p-5 backdrop-blur-md transition-all hover:border-white/20 hover:shadow-lg hover:shadow-indigo-500/5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
          {title}
        </span>
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/5 text-indigo-400">
          <Icon className="h-5 w-5" />
        </div>
      </div>

      <div className="mt-3 flex items-baseline gap-2">
        <span className="text-3xl font-extrabold tracking-tight text-white font-mono">
          {typeof value === "number" ? value.toLocaleString() : value}
        </span>
        {badge && (
          <span
            className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
              badgeVariant === "success"
                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                : badgeVariant === "warning"
                ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                : "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"
            }`}
          >
            {badge}
          </span>
        )}
      </div>

      <p className="mt-1 text-xs text-slate-400">{subtitle}</p>
    </div>
  );
}

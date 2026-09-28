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
    <div className="rounded-lg border border-[#E3E3E3] bg-white p-3.5 sm:p-4 shadow-subtle">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-[#5F6368] truncate">
          {title}
        </span>
        <Icon className="h-4 w-4 text-[#767676] shrink-0 ml-1" />
      </div>

      <div className="mt-2 flex items-baseline gap-2 flex-wrap">
        <span className="text-xl sm:text-2xl font-bold tracking-tight text-[#111111] font-mono">
          {typeof value === "number" ? value.toLocaleString() : value}
        </span>
        {badge && (
          <span
            className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${
              badgeVariant === "success"
                ? "bg-[#ECFDF3] text-[#067D62] border border-[#A6F4C5]"
                : badgeVariant === "warning"
                ? "bg-[#FFF4ED] text-[#B54708] border border-[#FECDCA]"
                : "bg-[#F7F7F7] text-[#5F6368] border border-[#E3E3E3]"
            }`}
          >
            {badge}
          </span>
        )}
      </div>

      <p className="mt-0.5 text-[10px] sm:text-[11px] text-[#767676] truncate">{subtitle}</p>
    </div>
  );
}

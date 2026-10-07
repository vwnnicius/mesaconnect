import React from "react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: string;
  trendPositive?: boolean;
  highlight?: boolean;
}

export function StatCard({
  title,
  value,
  subtitle,
  trend,
  trendPositive,
  highlight,
}: StatCardProps) {
  return (
    <div
      className={cn("py-5 px-5 md:py-6 md:px-6", highlight && "text-accent")}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium text-muted-foreground">{title}</p>
          <p className="mt-3 text-[2rem] md:text-[2.5rem] font-semibold tabular-nums tracking-[-0.045em] leading-none">
            {value}
          </p>
        </div>
      </div>

      {(subtitle || trend) && (
        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs leading-relaxed">
          {trend ? (
            <span
              className={cn(
                "font-medium",
                trendPositive
                  ? "text-emerald-700 dark:text-emerald-400"
                  : "text-red-700 dark:text-red-400",
              )}
            >
              {trend}
            </span>
          ) : null}
          {subtitle ? <span className="text-stone-500">{subtitle}</span> : null}
        </div>
      )}
    </div>
  );
}

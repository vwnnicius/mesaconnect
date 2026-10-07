import React from 'react';
import { Card } from '@/components/ui/Card';
import { cn } from '@/lib/utils';

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
  icon,
  trend,
  trendPositive,
  highlight,
}: StatCardProps) {
  return (
    <Card
      className={cn(
        highlight && 'border-orange-300/80 bg-orange-50/40 dark:border-orange-800 dark:bg-orange-950/20'
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-medium text-stone-500 uppercase tracking-[0.08em]">
            {title}
          </p>
          <p className="mt-2 text-[1.75rem] font-semibold tabular-nums tracking-tight text-stone-900 dark:text-stone-50 leading-none">
            {value}
          </p>
        </div>
        {icon ? (
          <div className="p-2 rounded-lg bg-cream dark:bg-stone-800 text-stone-600 dark:text-stone-300">
            {icon}
          </div>
        ) : null}
      </div>

      {(subtitle || trend) && (
        <div className="mt-3 flex items-center gap-2 text-xs">
          {trend ? (
            <span
              className={cn(
                'font-medium',
                trendPositive
                  ? 'text-emerald-700 dark:text-emerald-400'
                  : 'text-red-700 dark:text-red-400'
              )}
            >
              {trend}
            </span>
          ) : null}
          {subtitle ? <span className="text-stone-500">{subtitle}</span> : null}
        </div>
      )}
    </Card>
  );
}

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
      hoverEffect
      className={cn(
        'relative overflow-hidden',
        highlight && 'border-amber-300 dark:border-amber-700 bg-amber-50/30 dark:bg-amber-950/20'
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
            {title}
          </p>
          <h4 className="mt-2 text-3xl font-black tracking-tight text-zinc-900 dark:text-zinc-50 font-mono">
            {value}
          </h4>
        </div>
        {icon && (
          <div className="p-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
            {icon}
          </div>
        )}
      </div>

      {(subtitle || trend) && (
        <div className="mt-3 flex items-center gap-2 text-xs">
          {trend && (
            <span
              className={cn(
                'font-bold',
                trendPositive
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-rose-600 dark:text-rose-400'
              )}
            >
              {trend}
            </span>
          )}
          {subtitle && <span className="text-zinc-500">{subtitle}</span>}
        </div>
      )}
    </Card>
  );
}

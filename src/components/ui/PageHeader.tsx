import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface PageHeaderProps {
  kicker?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
  className?: string;
}

export function PageHeader({
  kicker,
  title,
  description,
  actions,
  className,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        'flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4',
        className
      )}
    >
      <div className="min-w-0">
        {kicker ? (
          <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-stone-500 mb-1">
            {kicker}
          </p>
        ) : null}
        <h1 className="text-[1.65rem] md:text-[1.85rem] font-semibold tracking-tight text-stone-900 dark:text-stone-100 leading-tight">
          {title}
        </h1>
        {description ? (
          <p className="text-sm text-stone-500 mt-1.5 max-w-xl leading-relaxed">
            {description}
          </p>
        ) : null}
      </div>
      {actions ? (
        <div className="flex flex-wrap items-center gap-2 shrink-0">{actions}</div>
      ) : null}
    </div>
  );
}

import React from 'react';
import { cn } from '@/lib/utils';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverEffect?: boolean;
}

export function Card({
  children,
  className,
  hoverEffect = false,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        'bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl p-5 shadow-[0_2px_8px_rgba(0,0,0,0.04)]',
        hoverEffect &&
          'transition-all duration-200 hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] hover:border-zinc-300 dark:hover:border-zinc-700',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('flex items-center justify-between pb-3 mb-3 border-b border-zinc-100 dark:border-zinc-800/80', className)}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardTitle({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn('text-base font-semibold text-zinc-900 dark:text-zinc-100 tracking-tight', className)}
      {...props}
    >
      {children}
    </h3>
  );
}

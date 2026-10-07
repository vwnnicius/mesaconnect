import React from "react";
import { cn } from "@/lib/utils";

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
        "bg-card border border-border rounded-box p-5 md:p-6 shadow-card",
        hoverEffect &&
          "transition-colors hover:border-stone-400/70 dark:hover:border-stone-600",
        className,
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
      className={cn(
        "flex items-center justify-between pb-3 mb-3 border-b border-border",
        className,
      )}
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
      className={cn(
        "text-sm font-semibold text-stone-900 dark:text-stone-100 tracking-tight",
        className,
      )}
      {...props}
    >
      {children}
    </h3>
  );
}

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

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
        "flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4",
        className,
      )}
    >
      <div className="min-w-0">
        {kicker ? (
          <p className="text-xs font-medium text-muted-foreground mb-2">
            {kicker}
          </p>
        ) : null}
        <h1 className="text-[2rem] md:text-[2.5rem] font-semibold tracking-[-0.045em] text-foreground leading-[1.12]">
          {title}
        </h1>
        {description ? (
          <p className="text-sm text-muted-foreground mt-3 max-w-xl leading-relaxed">
            {description}
          </p>
        ) : null}
      </div>
      {actions ? (
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {actions}
        </div>
      ) : null}
    </div>
  );
}

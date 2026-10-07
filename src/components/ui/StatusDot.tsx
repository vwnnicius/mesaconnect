import React from 'react';
import { TableStatus } from '@/types';
import { TABLE_STATUS_CONFIG } from '@/lib/constants';
import { cn } from '@/lib/utils';

interface StatusDotProps {
  status: TableStatus;
  showText?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function StatusDot({
  status,
  showText = true,
  className,
  size = 'md',
}: StatusDotProps) {
  const config = TABLE_STATUS_CONFIG[status] || TABLE_STATUS_CONFIG.AVAILABLE;

  const dotSizes = {
    sm: 'w-2 h-2',
    md: 'w-2.5 h-2.5',
    lg: 'w-3 h-3',
  };

  return (
    <span className={cn('inline-flex items-center gap-2 font-medium text-xs', className)}>
      <span className="relative flex items-center justify-center">
        {status === 'CALLING' && (
          <span
            className={cn(
              'absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping',
              config.dotColor
            )}
          />
        )}
        <span
          className={cn(
            'relative inline-block rounded-full',
            dotSizes[size],
            config.dotColor
          )}
        />
      </span>
      {showText && <span className={config.textColor}>{config.label}</span>}
    </span>
  );
}

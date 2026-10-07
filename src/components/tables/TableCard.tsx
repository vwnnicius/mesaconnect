'use client';

import React from 'react';
import Link from 'next/link';
import { Table } from '@/types';
import { TABLE_STATUS_CONFIG, RESTAURANT_DEMO } from '@/lib/constants';
import { StatusDot } from '@/components/ui/StatusDot';
import { useElapsedTime } from '@/hooks/useElapsedTime';
import { QrCode, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TableCardProps {
  table: Table;
}

export function TableCard({ table }: TableCardProps) {
  const config = TABLE_STATUS_CONFIG[table.status] || TABLE_STATUS_CONFIG.AVAILABLE;
  const hasActiveCall = table.status === 'CALLING' || table.status === 'ACKNOWLEDGED';
  const { elapsed } = useElapsedTime(table.active_call_requested_at);

  return (
    <div
      className={cn(
        'relative rounded-2xl border p-4 transition-all flex flex-col justify-between shadow-sm',
        config.bgColor,
        config.borderColor
      )}
    >
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-zinc-500">Mesa</span>
          <StatusDot status={table.status} size="sm" />
        </div>

        <div className="flex items-baseline justify-between">
          <h3 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100">
            {table.number}
          </h3>

          {hasActiveCall && (
            <span className="font-mono text-xs font-bold text-zinc-700 dark:text-zinc-300">
              ⏱ {elapsed}
            </span>
          )}
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-zinc-200/50 dark:border-zinc-800/80 flex items-center justify-between text-xs text-zinc-500">
        <span className="truncate max-w-[120px]">{config.description}</span>
        <Link
          href={`/evaluate/${RESTAURANT_DEMO.slug}/${table.number}`}
          target="_blank"
          title="Ver página do QR Code desta mesa"
          className="p-1 rounded-md hover:bg-zinc-200/60 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400 transition-colors"
        >
          <QrCode className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}

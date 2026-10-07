'use client';

import React from 'react';
import { ServiceCall } from '@/types';
import { useElapsedTime } from '@/hooks/useElapsedTime';
import { Button } from '@/components/ui/Button';
import { CheckCircle2, UserCheck, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CallCardProps {
  call: ServiceCall;
  onAcknowledge: (id: string) => void;
  onComplete: (id: string) => void;
}

export function CallCard({ call, onAcknowledge, onComplete }: CallCardProps) {
  const isCalling = call.status === 'CALLING';
  const isAcknowledged = call.status === 'ACKNOWLEDGED';

  const { elapsed, isUrgent } = useElapsedTime(
    isCalling ? call.requested_at : call.acknowledged_at || call.requested_at
  );

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-2xl border p-5 transition-all shadow-sm',
        isCalling && !isUrgent && 'bg-amber-50/70 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800',
        isCalling && isUrgent && 'bg-rose-50/90 dark:bg-rose-950/30 border-rose-300 dark:border-rose-700 ring-2 ring-rose-400/30',
        isAcknowledged && 'bg-blue-50/70 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800'
      )}
    >
      {/* Top Header of Card */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
            Salão Principal
          </span>
          <h2 className="text-3xl font-black tracking-tight text-zinc-900 dark:text-zinc-50">
            MESA {call.table_number || '??'}
          </h2>
        </div>

        {/* Status Badge & Timer */}
        <div className="text-right">
          <div
            className={cn(
              'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold tracking-wide',
              isCalling && !isUrgent && 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
              isCalling && isUrgent && 'bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-200 animate-pulse',
              isAcknowledged && 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
            )}
          >
            {isCalling && isUrgent && <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />}
            <span>{isCalling ? 'AGUARDANDO' : 'EM ATENDIMENTO'}</span>
          </div>

          <p className="mt-1 font-mono text-sm font-semibold text-zinc-700 dark:text-zinc-300">
            {isCalling ? `há ${elapsed}` : `atendendo há ${elapsed}`}
          </p>
        </div>
      </div>

      {/* Action Button - 1 tap large mobile friendly */}
      <div className="mt-4 pt-3 border-t border-zinc-200/60 dark:border-zinc-800">
        {isCalling ? (
          <Button
            size="lg"
            fullWidth
            onClick={() => onAcknowledge(call.id)}
            className="bg-amber-500 hover:bg-amber-600 text-white font-bold text-lg py-4 shadow-md active:bg-amber-700"
          >
            <UserCheck className="w-5 h-5 mr-2" />
            ATENDER
          </Button>
        ) : (
          <Button
            size="lg"
            fullWidth
            onClick={() => onComplete(call.id)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-lg py-4 shadow-md active:bg-emerald-800"
          >
            <CheckCircle2 className="w-5 h-5 mr-2" />
            CONCLUIR
          </Button>
        )}
      </div>
    </div>
  );
}

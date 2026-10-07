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
        'relative overflow-hidden rounded-box border p-5 shadow-card',
        isCalling && !isUrgent && 'bg-orange-50/80 dark:bg-orange-950/20 border-orange-200 dark:border-orange-800',
        isCalling && isUrgent && 'bg-red-50 dark:bg-red-950/30 border-red-300 dark:border-red-800',
        isAcknowledged && 'bg-blue-50/70 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800'
      )}
    >
      <div className="flex items-start justify-between mb-4 gap-3">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-stone-500">
            Salão principal
          </p>
          <h2 className="text-[1.75rem] font-semibold tracking-tight text-stone-900 dark:text-stone-50 leading-tight mt-0.5">
            Mesa {call.table_number || '—'}
          </h2>
        </div>

        <div className="text-right">
          <div
            className={cn(
              'inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[11px] font-semibold',
              isCalling && !isUrgent && 'bg-orange-100 text-orange-900 dark:bg-orange-900 dark:text-orange-100',
              isCalling && isUrgent && 'bg-red-100 text-red-900 dark:bg-red-900 dark:text-red-100',
              isAcknowledged && 'bg-blue-100 text-blue-900 dark:bg-blue-900 dark:text-blue-100'
            )}
          >
            {isCalling && isUrgent ? <AlertTriangle className="w-3.5 h-3.5" /> : null}
            {isCalling ? 'Aguardando' : 'Em atendimento'}
          </div>
          <p className="mt-1.5 font-mono text-sm tabular-nums text-stone-700 dark:text-stone-300">
            {isCalling ? `há ${elapsed}` : `há ${elapsed}`}
          </p>
        </div>
      </div>

      <div className="pt-3 border-t border-black/5 dark:border-white/10">
        {isCalling ? (
          <Button
            size="lg"
            fullWidth
            variant="accent"
            onClick={() => onAcknowledge(call.id)}
          >
            <UserCheck className="w-5 h-5" />
            Atender mesa
          </Button>
        ) : (
          <Button size="lg" fullWidth variant="success" onClick={() => onComplete(call.id)}>
            <CheckCircle2 className="w-5 h-5" />
            Concluir
          </Button>
        )}
      </div>
    </div>
  );
}

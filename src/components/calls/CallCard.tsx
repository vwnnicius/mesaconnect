'use client';

import React, { useState } from 'react';
import { ServiceCall } from '@/types';
import { useElapsedTime } from '@/hooks/useElapsedTime';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

interface CallCardProps {
  call: ServiceCall;
  onAcknowledge: (id: string) => Promise<void>;
  onComplete: (id: string) => Promise<void>;
}

export function CallCard({ call, onAcknowledge, onComplete }: CallCardProps) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isCalling = call.status === 'CALLING';
  const isAcknowledged = call.status === 'ACKNOWLEDGED';

  const { elapsed, isUrgent } = useElapsedTime(
    isCalling ? call.requested_at : call.acknowledged_at || call.requested_at
  );

  const handleAction = async () => {
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      await (isCalling ? onAcknowledge(call.id) : onComplete(call.id));
    } catch {
      setError('Não foi possível salvar. Atualize a fila e tente novamente.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      className={cn(
        'relative rounded-box border border-border bg-card p-5 sm:p-6 shadow-card',
        isCalling && isUrgent && 'border-red-200 dark:border-red-900',
        isAcknowledged && 'border-border'
      )}
    >
      <div className="flex items-start justify-between mb-5 gap-3">
        <div>
          <p className="text-xs font-medium text-muted-foreground">
            {isCalling ? 'Aguardando atendimento' : 'Em atendimento'}
          </p>
          <h2 className="text-[2rem] font-semibold tracking-[-0.045em] text-foreground leading-tight mt-2">
            Mesa {call.table_number || '—'}
          </h2>
        </div>

        <div className="text-right">
          <div
            className={cn(
              'inline-flex items-center gap-1.5 text-xs font-medium',
              isCalling && !isUrgent && 'text-amber-700 dark:text-amber-400',
              isCalling && isUrgent && 'text-red-700 dark:text-red-400',
              isAcknowledged && 'text-blue-700 dark:text-blue-400'
            )}
          >
            {isCalling ? (isUrgent ? 'Espera prolongada' : 'Solicitado há') : 'Atendendo há'}
          </div>
          <p className="mt-2 text-[1.75rem] font-medium tracking-tight tabular-nums text-foreground">
            {elapsed}
          </p>
        </div>
      </div>

      <div>
        {isCalling ? (
          <Button
            size="lg"
            fullWidth
            variant="accent"
            onClick={handleAction}
            disabled={busy}
            aria-label={`Atender mesa ${call.table_number || ''}`}
          >
            {busy ? 'Salvando…' : 'Atender mesa'}
          </Button>
        ) : (
          <Button size="lg" fullWidth variant="primary" onClick={handleAction} disabled={busy} aria-label={`Concluir atendimento da mesa ${call.table_number || ''}`}>
            {busy ? 'Salvando…' : 'Concluir atendimento'}
          </Button>
        )}
      </div>
      {error ? <p role="alert" className="text-xs text-red-700 dark:text-red-400 mt-3">{error}</p> : null}
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import { ServiceCall } from '@/types';
import { useElapsedTime } from '@/hooks/useElapsedTime';
import { ArrowRight } from 'lucide-react';

interface CallCardProps {
  call: ServiceCall;
  onAcknowledge: (id: string) => Promise<void>;
  onComplete: (id: string) => Promise<void>;
}

export function CallCard({ call, onAcknowledge, onComplete }: CallCardProps) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isCalling = call.status === 'CALLING';
  const { elapsed, isUrgent } = useElapsedTime(isCalling ? call.requested_at : call.acknowledged_at || call.requested_at);
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
    <div className="call-row" data-status={call.status} data-urgent={isCalling && isUrgent}>
      <div className="call-row-main">
        <div><p className="call-row-state"><span className="call-row-marker" />{isCalling ? 'Aguardando atendimento' : 'Em atendimento'}</p><h2>Mesa {call.table_number || '—'}</h2></div>
        <div className="call-row-time"><span>{isCalling ? (isUrgent ? 'Espera prolongada' : 'Esperando há') : 'Atendendo há'}</span><strong>{elapsed}</strong></div>
      </div>
      <button type="button" className={isCalling ? 'action-solid' : 'action-outline'} disabled={busy} onClick={handleAction} aria-label={isCalling ? `Atender mesa ${call.table_number || ''}` : `Concluir atendimento da mesa ${call.table_number || ''}`}>{busy ? 'Salvando…' : isCalling ? 'Estou indo' : 'Concluir atendimento'}<ArrowRight size={14} /></button>
      {error ? <p role="alert" className="text-xs text-red-700 dark:text-red-300 mt-3">{error}</p> : null}
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import { Table } from '@/types';
import { TABLE_STATUS_CONFIG } from '@/lib/constants';
import { StatusDot } from '@/components/ui/StatusDot';
import { processDeviceEvent } from '@/services/deviceService';
import { Button } from '@/components/ui/Button';
import { BellRing, Moon, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SimulatorTableCardProps {
  table: Table;
  onEventTriggered?: () => void;
}

export function SimulatorTableCard({
  table,
  onEventTriggered,
}: SimulatorTableCardProps) {
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [lastMessage, setLastMessage] = useState<string | null>(null);

  const deviceUid = `MESA-${table.number.padStart(3, '0')}-ESP32`;
  const config = TABLE_STATUS_CONFIG[table.status] || TABLE_STATUS_CONFIG.AVAILABLE;

  const handleAction = async (eventType: 'CALL' | 'DO_NOT_DISTURB' | 'RESET') => {
    setLoadingAction(eventType);
    setLastMessage(null);
    try {
      const res = await processDeviceEvent({
        device_uid: deviceUid,
        event_type: eventType,
        timestamp: new Date().toISOString(),
      });
      if (res.success) {
        setLastMessage(res.message);
        onEventTriggered?.();
      } else {
        setLastMessage(res.message);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro inesperado';
      setLastMessage(message);
    } finally {
      setLoadingAction(null);
    }
  };

  return (
    <div
      className={cn(
        'rounded-box border p-4 shadow-card',
        config.bgColor,
        config.borderColor
      )}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="font-mono text-[10px] text-stone-500">{deviceUid}</p>
          <h3 className="text-xl font-semibold mt-0.5">Mesa {table.number}</h3>
        </div>
        <StatusDot status={table.status} size="md" />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Button
          size="sm"
          variant="accent"
          onClick={() => handleAction('CALL')}
          disabled={loadingAction !== null}
          className="col-span-2"
        >
          <BellRing className="w-4 h-4" />
          {loadingAction === 'CALL' ? 'Enviando…' : 'Chamar garçom'}
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => handleAction('DO_NOT_DISTURB')}
          disabled={loadingAction !== null}
          className="text-red-800 border-red-200"
        >
          <Moon className="w-3.5 h-3.5" />
          Não incomodar
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => handleAction('RESET')}
          disabled={loadingAction !== null}
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Reset
        </Button>
      </div>

      {lastMessage ? (
        <p className="mt-3 text-[11px] font-mono text-stone-600 dark:text-stone-400 truncate">
          {lastMessage}
        </p>
      ) : null}
    </div>
  );
}

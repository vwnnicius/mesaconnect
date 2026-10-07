'use client';

import React, { useState } from 'react';
import { Table } from '@/types';
import { TABLE_STATUS_CONFIG } from '@/lib/constants';
import { StatusDot } from '@/components/ui/StatusDot';
import { processDeviceEvent } from '@/services/deviceService';
import { Button } from '@/components/ui/Button';
import { BellRing, Moon, RotateCcw, Check, Radio } from 'lucide-react';
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
        if (onEventTriggered) onEventTriggered();
      } else {
        setLastMessage(`Erro: ${res.message}`);
      }
    } catch (err: any) {
      setLastMessage(`Falha: ${err?.message || 'Erro inesperado'}`);
    } finally {
      setLoadingAction(null);
    }
  };

  return (
    <div
      className={cn(
        'rounded-2xl border p-5 shadow-sm transition-all',
        config.bgColor,
        config.borderColor
      )}
    >
      {/* Device Header */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-[11px] font-semibold text-zinc-500 uppercase tracking-wider flex items-center gap-1">
              <Radio className="w-3 h-3 text-emerald-500" />
              {deviceUid}
            </span>
          </div>
          <h3 className="text-2xl font-black text-zinc-900 dark:text-zinc-100">
            Mesa {table.number}
          </h3>
        </div>
        <StatusDot status={table.status} size="md" />
      </div>

      {/* Hardware Push-Buttons Simulator */}
      <div className="mt-4 grid grid-cols-2 gap-2">
        {/* CHAMAR (Botão Principal do ESP32) */}
        <Button
          size="sm"
          onClick={() => handleAction('CALL')}
          disabled={loadingAction !== null}
          className="col-span-2 bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 text-sm shadow-sm"
        >
          <BellRing className="w-4 h-4 mr-1.5" />
          {loadingAction === 'CALL' ? 'Enviando Wi-Fi...' : 'CHAMAR GARÇOM'}
        </Button>

        {/* NÃO INCOMODAR */}
        <Button
          size="sm"
          variant="outline"
          onClick={() => handleAction('DO_NOT_DISTURB')}
          disabled={loadingAction !== null}
          className="text-rose-600 border-rose-200 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs py-2"
        >
          <Moon className="w-3.5 h-3.5 mr-1" />
          NÃO INCOMODAR
        </Button>

        {/* NORMAL / RESET */}
        <Button
          size="sm"
          variant="outline"
          onClick={() => handleAction('RESET')}
          disabled={loadingAction !== null}
          className="text-zinc-700 border-zinc-200 hover:bg-zinc-100 dark:border-zinc-800 dark:text-zinc-300 text-xs py-2"
        >
          <RotateCcw className="w-3.5 h-3.5 mr-1" />
          RESET (NORMAL)
        </Button>
      </div>

      {lastMessage && (
        <p className="mt-3 text-[11px] font-mono text-zinc-600 dark:text-zinc-400 bg-white/60 dark:bg-zinc-950/60 p-1.5 rounded-lg border border-zinc-200/50 truncate">
          ✓ {lastMessage}
        </p>
      )}
    </div>
  );
}

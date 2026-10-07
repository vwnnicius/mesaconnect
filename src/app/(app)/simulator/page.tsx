'use client';

import React, { useState } from 'react';
import { useTables } from '@/hooks/useTables';
import { SimulatorTableCard } from '@/components/simulator/SimulatorTableCard';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { PageHeader } from '@/components/ui/PageHeader';
import { RefreshCw, Send, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function SimulatorPage() {
  const { tables, refresh } = useTables();
  const [selectedDeviceUid, setSelectedDeviceUid] = useState('MESA-007-ESP32');
  const [selectedEvent, setSelectedEvent] = useState<
    'CALL' | 'DO_NOT_DISTURB' | 'RESET' | 'HEARTBEAT'
  >('CALL');
  const [apiResponse, setApiResponse] = useState<string | null>(null);
  const [sendingApi, setSendingApi] = useState(false);

  const testApiPost = async () => {
    setSendingApi(true);
    setApiResponse(null);
    try {
      const res = await fetch('/api/device/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          device_uid: selectedDeviceUid,
          event_type: selectedEvent,
          timestamp: new Date().toISOString(),
        }),
      });
      const data = await res.json();
      setApiResponse(JSON.stringify(data, null, 2));
      refresh();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Falha na requisição';
      setApiResponse(JSON.stringify({ error: message }, null, 2));
    } finally {
      setSendingApi(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        kicker="Hardware"
        title="Simulador ESP32"
        description="Dispara os mesmos eventos Wi-Fi que a placa física enviará para o backend."
        actions={
          <>
            <Link href="/calls">
              <Button size="md" variant="accent">
                Ver fila
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Button size="md" variant="outline" onClick={() => refresh()}>
              <RefreshCw className="w-4 h-4" />
              Atualizar
            </Button>
          </>
        }
      />

      <div className="rounded-box border border-border bg-cream-paper dark:bg-[#221c18] p-4 text-sm text-stone-600 dark:text-stone-400 leading-relaxed">
        Chame uma mesa, abra a fila e atenda. O ciclo completo grava tempo de resposta e devolve a
        mesa ao mapa.
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
        {tables.map((table) => (
          <SimulatorTableCard key={table.id} table={table} onEventTriggered={() => refresh()} />
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>POST /api/device/events</CardTitle>
        </CardHeader>
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-medium text-stone-500 mb-1">device_uid</label>
              <select
                value={selectedDeviceUid}
                onChange={(e) => setSelectedDeviceUid(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-border bg-cream dark:bg-stone-900 text-xs"
              >
                {tables.map((t) => (
                  <option key={t.id} value={`MESA-${t.number.padStart(3, '0')}-ESP32`}>
                    MESA-{t.number.padStart(3, '0')}-ESP32
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-medium text-stone-500 mb-1">event_type</label>
              <select
                value={selectedEvent}
                onChange={(e) =>
                  setSelectedEvent(e.target.value as 'CALL' | 'DO_NOT_DISTURB' | 'RESET' | 'HEARTBEAT')
                }
                className="w-full px-3 py-2 rounded-lg border border-border bg-cream dark:bg-stone-900 text-xs"
              >
                <option value="CALL">CALL</option>
                <option value="DO_NOT_DISTURB">DO_NOT_DISTURB</option>
                <option value="RESET">RESET</option>
                <option value="HEARTBEAT">HEARTBEAT</option>
              </select>
            </div>
            <div className="flex items-end">
              <Button size="md" fullWidth onClick={testApiPost} disabled={sendingApi}>
                <Send className="w-3.5 h-3.5" />
                {sendingApi ? 'Enviando…' : 'Enviar'}
              </Button>
            </div>
          </div>
          {apiResponse ? (
            <pre className="p-3 rounded-lg bg-espresso text-cream font-mono text-xs overflow-x-auto">
              {apiResponse}
            </pre>
          ) : null}
        </div>
      </Card>
    </div>
  );
}

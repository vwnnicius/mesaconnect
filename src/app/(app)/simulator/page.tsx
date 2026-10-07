'use client';

import React, { useState } from 'react';
import { useTables } from '@/hooks/useTables';
import { SimulatorTableCard } from '@/components/simulator/SimulatorTableCard';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Cpu, Terminal, RefreshCw, Send, CheckCircle2, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function SimulatorPage() {
  const { tables, refresh } = useTables();
  const [selectedDeviceUid, setSelectedDeviceUid] = useState('MESA-007-ESP32');
  const [selectedEvent, setSelectedEvent] = useState<'CALL' | 'DO_NOT_DISTURB' | 'RESET' | 'HEARTBEAT'>('CALL');
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
    } catch (err: any) {
      setApiResponse(JSON.stringify({ error: err?.message || 'Falha na requisição' }, null, 2));
    } finally {
      setSendingApi(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-2 border-b border-zinc-200/80 dark:border-zinc-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
              Ambiente de Simulação de Hardware
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-semibold">
              ESP32 Firmware Mock
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight text-zinc-900 dark:text-zinc-50 mt-1">
            Simulador de Mesas & Dispositivos
          </h1>
          <p className="text-sm text-zinc-500 mt-1">
            Simula exatamente os eventos Wi-Fi que o hardware físico ESP32 enviará para a camada de serviços do Supabase.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/calls">
            <Button size="md" className="bg-amber-500 hover:bg-amber-600 text-white font-semibold">
              Ver Fila de Chamados
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          </Link>
          <Button size="md" variant="outline" onClick={() => refresh()}>
            <RefreshCw className="w-4 h-4 mr-1.5 text-zinc-500" />
            Atualizar
          </Button>
        </div>
      </div>

      {/* Como Funciona - Step Guide Banner */}
      <div className="p-4 rounded-2xl bg-amber-50/80 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200 space-y-1">
        <p className="font-bold flex items-center gap-1.5">
          <CheckCircle2 className="w-4 h-4 text-amber-600" />
          Como testar o fluxo completo em 3 passos:
        </p>
        <p>1. Clique em <strong>CHAMAR GARÇOM</strong> em qualquer mesa abaixo (ex: Mesa 07).</p>
        <p>2. Acesse a tela de <strong>Chamados (/calls)</strong> e veja o card surgir instantaneamente com cronômetro em tempo real.</p>
        <p>3. Clique em <strong>ATENDER</strong> e depois em <strong>CONCLUIR</strong> para ver o ciclo de vida completo do atendimento ser registrado.</p>
      </div>

      {/* Grid de Simuladores por Mesa */}
      <div>
        <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100 mb-4 flex items-center gap-2">
          <Cpu className="w-4 h-4 text-zinc-500" />
          Dispositivos Ativos no Salão (10 Mesas)
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {tables.map((table) => (
            <SimulatorTableCard
              key={table.id}
              table={table}
              onEventTriggered={() => refresh()}
            />
          ))}
        </div>
      </div>

      {/* Terminal de Teste da API HTTP Oficial do ESP32 */}
      <Card className="border-dashed border-zinc-300 dark:border-zinc-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm font-bold">
            <Terminal className="w-4 h-4 text-zinc-500" />
            Console de Teste da API ESP32 (POST /api/device/events)
          </CardTitle>
        </CardHeader>

        <div className="space-y-4 pt-2">
          <p className="text-xs text-zinc-500">
            Você também pode simular a chamada HTTP exata que a placa ESP32 fará via Wi-Fi:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                Dispositivo (device_uid)
              </label>
              <select
                value={selectedDeviceUid}
                onChange={(e) => setSelectedDeviceUid(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none"
              >
                {tables.map((t) => (
                  <option key={t.id} value={`MESA-${t.number.padStart(3, '0')}-ESP32`}>
                    MESA-{t.number.padStart(3, '0')}-ESP32 (Mesa {t.number})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                Tipo de Evento (event_type)
              </label>
              <select
                value={selectedEvent}
                onChange={(e) => setSelectedEvent(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none"
              >
                <option value="CALL">CALL (Cliente apertou o botão)</option>
                <option value="DO_NOT_DISTURB">DO_NOT_DISTURB (Não incomodar)</option>
                <option value="RESET">RESET (Mesa liberada)</option>
                <option value="HEARTBEAT">HEARTBEAT (Ping de sinal online)</option>
              </select>
            </div>

            <div className="flex items-end">
              <Button
                size="md"
                fullWidth
                onClick={testApiPost}
                disabled={sendingApi}
                className="text-xs"
              >
                <Send className="w-3.5 h-3.5 mr-1.5" />
                {sendingApi ? 'Enviando...' : 'Testar Envio HTTP'}
              </Button>
            </div>
          </div>

          {apiResponse && (
            <div className="mt-3 p-3 rounded-xl bg-zinc-900 text-zinc-100 font-mono text-xs overflow-x-auto">
              <span className="text-zinc-400 text-[10px] uppercase block mb-1">
                Resposta da API:
              </span>
              <pre>{apiResponse}</pre>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}

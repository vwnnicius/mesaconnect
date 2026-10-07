'use client';

import React, { useState } from 'react';
import { useCalls } from '@/hooks/useCalls';
import { CallCard } from '@/components/calls/CallCard';
import { Bell, CheckCircle2, RotateCw, Filter, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

export default function CallsPage() {
  const { calls, loading, refresh, acknowledge, complete } = useCalls();
  const [filter, setFilter] = useState<'ALL' | 'CALLING' | 'ACKNOWLEDGED'>('ALL');

  const callingCalls = calls.filter((c) => c.status === 'CALLING');
  const acknowledgedCalls = calls.filter((c) => c.status === 'ACKNOWLEDGED');

  const filteredCalls = calls.filter((c) => {
    if (filter === 'CALLING') return c.status === 'CALLING';
    if (filter === 'ACKNOWLEDGED') return c.status === 'ACKNOWLEDGED';
    return true;
  });

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Top Header Bar for Waiter */}
      <div className="flex items-center justify-between pb-3 border-b border-zinc-200/80 dark:border-zinc-800">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
            Fila do Garçom
          </span>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
            Chamados
            {callingCalls.length > 0 && (
              <span className="px-2.5 py-0.5 rounded-full text-sm font-extrabold bg-amber-500 text-white animate-pulse">
                {callingCalls.length}
              </span>
            )}
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => refresh()}
            title="Atualizar chamados"
            className="p-2"
          >
            <RotateCw className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />
          </Button>

          <Link href="/simulator">
            <Button size="sm" variant="outline" className="text-xs border-dashed">
              <Sparkles className="w-3.5 h-3.5 mr-1 text-amber-500" />
              Simular Botão
            </Button>
          </Link>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex rounded-xl bg-zinc-100 dark:bg-zinc-900 p-1 text-xs font-semibold">
        <button
          onClick={() => setFilter('ALL')}
          className={`flex-1 py-2 rounded-lg transition-all ${
            filter === 'ALL'
              ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-sm'
              : 'text-zinc-500 hover:text-zinc-800'
          }`}
        >
          Todos ({calls.length})
        </button>
        <button
          onClick={() => setFilter('CALLING')}
          className={`flex-1 py-2 rounded-lg transition-all ${
            filter === 'CALLING'
              ? 'bg-white dark:bg-zinc-800 text-amber-600 dark:text-amber-400 shadow-sm'
              : 'text-zinc-500 hover:text-zinc-800'
          }`}
        >
          Aguardando ({callingCalls.length})
        </button>
        <button
          onClick={() => setFilter('ACKNOWLEDGED')}
          className={`flex-1 py-2 rounded-lg transition-all ${
            filter === 'ACKNOWLEDGED'
              ? 'bg-white dark:bg-zinc-800 text-blue-600 dark:text-blue-400 shadow-sm'
              : 'text-zinc-500 hover:text-zinc-800'
          }`}
        >
          Em Atendimento ({acknowledgedCalls.length})
        </button>
      </div>

      {/* Main List of Calls */}
      {loading ? (
        <div className="py-16 text-center text-zinc-400 text-sm animate-pulse">
          Carregando chamados em tempo real...
        </div>
      ) : filteredCalls.length === 0 ? (
        <div className="py-16 text-center rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/50 p-8">
          <div className="w-14 h-14 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-3">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
            Nenhum chamado pendente!
          </h3>
          <p className="text-xs text-zinc-500 mt-1 max-w-xs mx-auto">
            Todas as mesas estão atendidas. Quando um cliente apertar o botão ou você usar o simulador, o card surgirá aqui instantaneamente.
          </p>
          <div className="mt-5">
            <Link href="/simulator">
              <Button size="sm" className="bg-amber-500 hover:bg-amber-600 text-white font-semibold">
                Abrir Simulador e Disparar Chamado
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredCalls.map((call) => (
            <CallCard
              key={call.id}
              call={call}
              onAcknowledge={acknowledge}
              onComplete={complete}
            />
          ))}
        </div>
      )}
    </div>
  );
}

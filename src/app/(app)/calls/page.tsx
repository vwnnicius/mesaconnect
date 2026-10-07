'use client';

import React, { useState } from 'react';
import { useCalls } from '@/hooks/useCalls';
import { CallCard } from '@/components/calls/CallCard';
import { RotateCw } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { PageHeader } from '@/components/ui/PageHeader';
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
    <div className="max-w-2xl mx-auto space-y-5">
      <PageHeader
        kicker="Fila do garçom"
        title="Chamados"
        description="Toque uma vez para assumir; o cronômetro segue até concluir."
        actions={
          <>
            <Button size="sm" variant="outline" onClick={() => refresh()} title="Atualizar">
              <RotateCw className="w-4 h-4" />
            </Button>
            <Link href="/simulator">
              <Button size="sm" variant="outline">
                Simular botão
              </Button>
            </Link>
          </>
        }
      />

      <div className="flex rounded-lg bg-white/70 dark:bg-black/20 p-1 text-xs font-medium border border-border">
        {(
          [
            ['ALL', `Todos (${calls.length})`],
            ['CALLING', `Aguardando (${callingCalls.length})`],
            ['ACKNOWLEDGED', `Em atendimento (${acknowledgedCalls.length})`],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`flex-1 py-2 rounded-md transition-colors ${
              filter === key
                ? 'bg-espresso text-cream dark:bg-cream dark:text-espresso'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="py-16 text-center text-stone-400 text-sm">Carregando fila…</div>
      ) : filteredCalls.length === 0 ? (
        <div className="py-14 text-center rounded-box border border-border bg-cream-paper dark:bg-[#221c18] px-6">
          <h3 className="text-base font-semibold">Fila vazia</h3>
          <p className="text-sm text-stone-500 mt-1 max-w-sm mx-auto">
            Use o simulador para disparar um chamado e ver o card aparecer com o cronômetro.
          </p>
          <Link href="/simulator" className="inline-block mt-4">
            <Button size="sm" variant="accent">
              Abrir simulador
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
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

'use client';

import React, { useState } from 'react';
import { useCalls } from '@/hooks/useCalls';
import { CallCard } from '@/components/calls/CallCard';
import { RotateCw } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { PageHeader } from '@/components/ui/PageHeader';
import Link from 'next/link';

export default function CallsPage() {
  const { calls, loading, error, refresh, acknowledge, complete } = useCalls();
  const [filter, setFilter] = useState<'ALL' | 'CALLING' | 'ACKNOWLEDGED'>('ALL');

  const callingCalls = calls.filter((c) => c.status === 'CALLING');
  const acknowledgedCalls = calls.filter((c) => c.status === 'ACKNOWLEDGED');

  const filteredCalls = calls.filter((c) => {
    if (filter === 'CALLING') return c.status === 'CALLING';
    if (filter === 'ACKNOWLEDGED') return c.status === 'ACKNOWLEDGED';
    return true;
  });

  return (
    <div className="max-w-2xl mx-auto space-y-7">
      <PageHeader
        kicker="Fila do garçom"
        title="Chamados"
        description="As mesas que esperam há mais tempo aparecem primeiro."
        actions={
          <>
            <Button size="sm" variant="outline" onClick={() => refresh()} title="Atualizar" aria-label="Atualizar fila">
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

      <div className="flex rounded-xl bg-card p-1 text-xs font-medium border border-border" role="group" aria-label="Filtrar chamados">
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
            aria-pressed={filter === key}
            className={`flex-1 min-h-11 px-1 py-2 rounded-lg transition-colors ${
              filter === key
                ? 'bg-background text-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {label}
          </button>
        ))}
      </div>
      {error ? <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 dark:bg-red-950 dark:border-red-900 dark:text-red-200">{error}</p> : null}

      {loading ? (
        <div className="py-16 text-center text-stone-400 text-sm">Carregando fila…</div>
      ) : filteredCalls.length === 0 ? (
        <div className="py-14 text-center rounded-box border border-border bg-cream-paper dark:bg-card px-6">
          <h3 className="text-base font-semibold">Fila vazia</h3>
          <p className="text-sm text-stone-500 mt-1 max-w-sm mx-auto">
            {filter === 'ALL' ? 'Nenhuma mesa precisa de atendimento agora.' : 'Não há chamados neste filtro.'}
          </p>
          <Link href="/simulator" className="inline-block mt-4">
            <Button size="sm" variant="accent">
              Abrir simulador
            </Button>
          </Link>
        </div>
      ) : (
        <div className="border-t border-border">
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

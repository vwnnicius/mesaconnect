'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Bell, Clock, Star, CheckCircle, ArrowRight, Grid3X3 } from 'lucide-react';
import { StatCard } from '@/components/analytics/StatCard';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatusDot } from '@/components/ui/StatusDot';
import { PageHeader } from '@/components/ui/PageHeader';
import { useCalls } from '@/hooks/useCalls';
import { useTables } from '@/hooks/useTables';
import {
  DEMO_DASHBOARD_METRICS,
  DEMO_HOURLY_CALLS,
  DEMO_CALLS_BY_TABLE,
} from '@/lib/demo-data';
import { formatSecondsToTime } from '@/lib/utils';

export default function DashboardPage() {
  const { calls } = useCalls();
  const { tables } = useTables();
  const [greeting, setGreeting] = useState('Olá');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Bom dia');
    else if (hour < 18) setGreeting('Boa tarde');
    else setGreeting('Boa noite');
  }, []);

  const openCallsCount = calls.filter((c) => c.status === 'CALLING').length;
  const inServiceCallsCount = calls.filter((c) => c.status === 'ACKNOWLEDGED').length;

  return (
    <div className="space-y-7">
      <PageHeader
        kicker="Hoje no salão"
        title="Visão do salão"
        description={`${greeting}. Acompanhe as mesas e a fila de atendimento.`}
        actions={
          <>
            <Link href="/calls">
              <Button size="md" variant="accent">
                <Bell className="w-4 h-4" />
                Chamados ({openCallsCount})
              </Button>
            </Link>
            <Link href="/simulator">
              <Button size="md" variant="outline">
                Simular botão
              </Button>
            </Link>
          </>
        }
      />

      <div className="metric-strip border-y border-border">
        <StatCard
          title="Chamados em aberto"
          value={openCallsCount}
          subtitle={`${inServiceCallsCount} em atendimento`}
          highlight={openCallsCount > 0}
          icon={<Bell className="w-4 h-4 text-orange-700" />}
        />
        <StatCard
          title="Tempo médio de resposta"
          value={formatSecondsToTime(DEMO_DASHBOARD_METRICS.avgResponseTimeSeconds)}
          subtitle={`Mediana ${formatSecondsToTime(DEMO_DASHBOARD_METRICS.medianResponseTimeSeconds)}`}
          trend="−18s vs. semana passada"
          trendPositive
          icon={<Clock className="w-4 h-4 text-blue-700" />}
        />
        <StatCard
          title="Chamados hoje"
          value={DEMO_DASHBOARD_METRICS.totalCallsToday}
          subtitle="98% dentro do SLA"
          icon={<CheckCircle className="w-4 h-4 text-emerald-700" />}
        />
        <StatCard
          title="Nota média"
          value={DEMO_DASHBOARD_METRICS.avgRating}
          subtitle={`${DEMO_DASHBOARD_METRICS.totalEvaluations} avaliações`}
          trend="+0,2"
          trendPositive
          icon={<Star className="w-4 h-4 text-orange-600" />}
        />
      </div>
      <p className="text-xs text-muted-foreground leading-relaxed">Fila e mapa acompanham a operação. Tempo médio, total do dia, notas e gráficos abaixo usam dados de demonstração.</p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between w-full">
              <CardTitle>Fila imediata</CardTitle>
              <Link
                href="/calls"
                className="text-xs font-medium text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 inline-flex items-center gap-1"
              >
                Abrir fila <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </CardHeader>

          {calls.length === 0 ? (
            <div className="py-10 text-center text-stone-500">
              <p className="text-sm font-medium text-stone-800 dark:text-stone-200">
                Nenhuma mesa esperando
              </p>
              <p className="text-xs mt-1">Quando um botão for acionado, o chamado aparece aqui.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {calls.slice(0, 4).map((call) => (
                <div
                  key={call.id}
                  className="flex items-center justify-between py-4 border-b border-border last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-background border border-border flex items-center justify-center text-sm font-semibold tabular-nums">
                      {call.table_number}
                    </div>
                    <div>
                      <p className="text-sm font-medium">Mesa {call.table_number}</p>
                      <p className="text-xs text-stone-500">
                        {call.status === 'CALLING' ? 'Aguardando garçom' : 'Em atendimento'}
                      </p>
                    </div>
                  </div>
                  <Link href="/calls">
                    <Button size="sm" variant={call.status === 'CALLING' ? 'accent' : 'success'}>
                      {call.status === 'CALLING' ? 'Atender' : 'Concluir'}
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between w-full">
              <CardTitle className="flex items-center gap-2">
                <Grid3X3 className="w-4 h-4 text-stone-400" />
                Mapa
              </CardTitle>
              <Link href="/tables" className="text-xs font-medium text-stone-500 hover:text-stone-800">
                {tables.length} mesas
              </Link>
            </div>
          </CardHeader>

          <div className="grid grid-cols-5 gap-1.5">
            {tables.map((table) => (
              <Link
                key={table.id}
                href="/tables"
                className="flex flex-col items-center justify-center py-2 rounded-lg border border-border hover:border-stone-400 transition-colors"
              >
                <span className="text-[11px] font-semibold tabular-nums">{table.number}</span>
                <StatusDot status={table.status} showText={false} size="sm" className="mt-1" />
              </Link>
            ))}
          </div>

          <div className="mt-4 pt-3 border-t border-border text-[11px] text-stone-500 space-y-1">
            <div className="flex justify-between">
              <span>Disponíveis</span>
              <span className="tabular-nums font-medium text-stone-700 dark:text-stone-300">
                {tables.filter((t) => t.status === 'AVAILABLE').length}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Chamando</span>
              <span className="tabular-nums font-medium text-orange-700">
                {tables.filter((t) => t.status === 'CALLING').length}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Em atendimento</span>
              <span className="tabular-nums font-medium text-blue-700">
                {tables.filter((t) => t.status === 'ACKNOWLEDGED').length}
              </span>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Volume por horário</CardTitle>
          </CardHeader>
          <div className="h-40 flex items-end gap-1.5 sm:gap-2.5 px-1">
            {DEMO_HOURLY_CALLS.map((item) => {
              const max = Math.max(...DEMO_HOURLY_CALLS.map((h) => h.calls));
              const heightPercent = Math.round((item.calls / max) * 100);
              return (
                <div key={item.hour} className="min-w-0 flex-1 flex flex-col items-center gap-1.5">
                  <span className="text-[10px] font-mono tabular-nums text-stone-500">
                    {item.calls}
                  </span>
                  <div className="w-full bg-cream dark:bg-stone-800 rounded-t h-28 flex items-end">
                    <div
                      style={{ height: `${heightPercent}%` }}
                      className="w-full bg-espresso dark:bg-stone-300 rounded-t"
                    />
                  </div>
                  <span className="text-[10px] font-mono text-stone-400">{item.hour}</span>
                </div>
              );
            })}
          </div>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Mesas com mais chamados</CardTitle>
          </CardHeader>
          <div className="space-y-3">
            {[...DEMO_CALLS_BY_TABLE].sort((a, b) => b.calls - a.calls).slice(0, 5).map((t, idx) => {
              const max = Math.max(1, ...DEMO_CALLS_BY_TABLE.map((item) => item.calls));
              const pct = Math.round((t.calls / max) * 100);
              return (
                <div key={t.tableNumber} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-medium">Mesa {t.tableNumber}</span>
                    <span className="font-mono tabular-nums text-stone-500">{t.calls}</span>
                  </div>
                  <div className="w-full h-1.5 bg-cream dark:bg-stone-800 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${pct}%` }}
                      className={`h-full rounded-full ${idx === 0 ? 'bg-accent' : 'bg-espresso dark:bg-stone-300'}`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
}

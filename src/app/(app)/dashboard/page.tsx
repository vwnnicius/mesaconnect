'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Bell,
  Clock,
  Star,
  CheckCircle,
  TrendingUp,
  ArrowRight,
  Flame,
  Cpu,
  Grid3X3,
} from 'lucide-react';
import { StatCard } from '@/components/analytics/StatCard';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatusDot } from '@/components/ui/StatusDot';
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
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-2 border-b border-zinc-200/80 dark:border-zinc-800">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
            Resumo Operacional de Hoje
          </span>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight text-zinc-900 dark:text-zinc-50">
            {greeting}, João 👋
          </h1>
          <p className="text-sm text-zinc-500 mt-1">
            Painel em tempo real para acompanhamento de SLA e ritmo do rodízio.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link href="/calls">
            <Button size="md" className="bg-amber-500 hover:bg-amber-600 text-white font-semibold">
              <Bell className="w-4 h-4 mr-2" />
              Ver Chamados ({openCallsCount})
            </Button>
          </Link>
          <Link href="/simulator">
            <Button size="md" variant="outline" className="border-dashed">
              <Cpu className="w-4 h-4 mr-2 text-amber-500" />
              Simular ESP32
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Chamados em Aberto"
          value={openCallsCount}
          subtitle={`${inServiceCallsCount} mesas em atendimento`}
          highlight={openCallsCount > 0}
          icon={<Bell className="w-5 h-5 text-amber-500" />}
        />

        <StatCard
          title="Tempo Médio Resposta"
          value={formatSecondsToTime(DEMO_DASHBOARD_METRICS.avgResponseTimeSeconds)}
          subtitle={`Mediana: ${formatSecondsToTime(DEMO_DASHBOARD_METRICS.medianResponseTimeSeconds)}`}
          trend="-18s vs semana passada"
          trendPositive={true}
          icon={<Clock className="w-5 h-5 text-blue-500" />}
        />

        <StatCard
          title="Total de Chamados Hoje"
          value={DEMO_DASHBOARD_METRICS.totalCallsToday}
          subtitle="98.4% atendidos dentro do SLA"
          icon={<CheckCircle className="w-5 h-5 text-emerald-500" />}
        />

        <StatCard
          title="Avaliação Média Clientes"
          value={`${DEMO_DASHBOARD_METRICS.avgRating} ★`}
          subtitle={`${DEMO_DASHBOARD_METRICS.totalEvaluations} avaliações via QR Code`}
          trend="+0.2 NPS"
          trendPositive={true}
          icon={<Star className="w-5 h-5 text-amber-400" />}
        />
      </div>

      {/* Realtime Attention Status & Active Tables Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Mesas com Chamados Ativos */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between w-full">
              <CardTitle className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-amber-500" />
                Fila de Atendimento Imediato
              </CardTitle>
              <Link
                href="/calls"
                className="text-xs font-semibold text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 inline-flex items-center gap-1"
              >
                Abrir tela inteira <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </CardHeader>

          {calls.length === 0 ? (
            <div className="py-12 text-center text-zinc-400">
              <CheckCircle className="w-8 h-8 mx-auto mb-2 text-emerald-500" />
              <p className="text-sm font-medium">Nenhum chamado pendente no momento!</p>
              <p className="text-xs mt-1">Todos os clientes foram atendidos.</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {calls.slice(0, 4).map((call) => (
                <div
                  key={call.id}
                  className="flex items-center justify-between p-3.5 rounded-xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-900/60 hover:bg-zinc-100/60 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 flex items-center justify-center font-black text-sm">
                      {call.table_number}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                        Mesa {call.table_number}
                      </p>
                      <p className="text-xs text-zinc-500">
                        {call.status === 'CALLING' ? 'Aguardando garçom' : 'Em atendimento'}
                      </p>
                    </div>
                  </div>

                  <Link href="/calls">
                    <Button
                      size="sm"
                      className={
                        call.status === 'CALLING'
                          ? 'bg-amber-500 hover:bg-amber-600 text-white'
                          : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                      }
                    >
                      {call.status === 'CALLING' ? 'Atender' : 'Concluir'}
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Mini Mapa de Mesas */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between w-full">
              <CardTitle className="flex items-center gap-2">
                <Grid3X3 className="w-4 h-4 text-zinc-500" />
                Mapa do Salão
              </CardTitle>
              <Link
                href="/tables"
                className="text-xs font-semibold text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
              >
                Ver todas ({tables.length})
              </Link>
            </div>
          </CardHeader>

          <div className="grid grid-cols-5 gap-2 pt-1">
            {tables.map((table) => (
              <Link
                key={table.id}
                href="/tables"
                className="flex flex-col items-center justify-center p-2 rounded-xl border border-zinc-200/80 dark:border-zinc-800 hover:scale-105 transition-all text-center"
              >
                <span className="text-xs font-black text-zinc-800 dark:text-zinc-200">
                  {table.number}
                </span>
                <StatusDot status={table.status} showText={false} size="sm" className="mt-1" />
              </Link>
            ))}
          </div>

          <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800 text-[11px] text-zinc-500 space-y-1">
            <div className="flex justify-between">
              <span>🟢 Disponíveis</span>
              <span className="font-semibold">
                {tables.filter((t) => t.status === 'AVAILABLE').length}
              </span>
            </div>
            <div className="flex justify-between">
              <span>🟡 Chamando</span>
              <span className="font-semibold text-amber-600">
                {tables.filter((t) => t.status === 'CALLING').length}
              </span>
            </div>
            <div className="flex justify-between">
              <span>🔵 Em Atendimento</span>
              <span className="font-semibold text-blue-600">
                {tables.filter((t) => t.status === 'ACKNOWLEDGED').length}
              </span>
            </div>
          </div>
        </Card>
      </div>

      {/* Gráficos de Chamados por Hora e Mesas com Maior Movimento */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Gráfico Chamados por Hora */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-zinc-500" />
              Volume de Chamados por Horário
            </CardTitle>
          </CardHeader>
          <div className="pt-4">
            <div className="h-44 flex items-end gap-3 px-2">
              {DEMO_HOURLY_CALLS.map((item) => {
                const max = Math.max(...DEMO_HOURLY_CALLS.map((h) => h.calls));
                const heightPercent = Math.round((item.calls / max) * 100);
                return (
                  <div key={item.hour} className="flex-1 flex flex-col items-center gap-2">
                    <span className="text-[10px] font-mono font-semibold text-zinc-500">
                      {item.calls}
                    </span>
                    <div className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-t-lg h-32 flex items-end">
                      <div
                        style={{ height: `${heightPercent}%` }}
                        className="w-full bg-zinc-900 dark:bg-zinc-100 rounded-t-lg transition-all"
                      />
                    </div>
                    <span className="text-[10px] font-mono text-zinc-400">
                      {item.hour}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </Card>

        {/* Mesas Mais Demandadas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-amber-500" />
              Mesas com Mais Chamados
            </CardTitle>
          </CardHeader>
          <div className="space-y-3 pt-2">
            {DEMO_CALLS_BY_TABLE.slice(0, 5).map((t, idx) => {
              const max = DEMO_CALLS_BY_TABLE[0].calls;
              const pct = Math.round((t.calls / max) * 100);
              return (
                <div key={t.tableNumber} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-zinc-800 dark:text-zinc-200">
                      Mesa {t.tableNumber}
                    </span>
                    <span className="font-mono text-zinc-500">{t.calls} chamados</span>
                  </div>
                  <div className="w-full h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${pct}%` }}
                      className={`h-full rounded-full ${
                        idx === 0 ? 'bg-amber-500' : 'bg-zinc-900 dark:bg-zinc-200'
                      }`}
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

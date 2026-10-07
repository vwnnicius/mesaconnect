'use client';

import React from 'react';
import { StatCard } from '@/components/analytics/StatCard';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import {
  Clock,
  CheckCircle,
  Star,
  BarChart3,
  Flame,
  ArrowUpRight,
  TrendingDown,
  Timer,
  Zap,
} from 'lucide-react';
import {
  DEMO_DASHBOARD_METRICS,
  DEMO_HOURLY_CALLS,
  DEMO_CALLS_BY_TABLE,
} from '@/lib/demo-data';
import { formatSecondsToTime } from '@/lib/utils';

export default function AnalyticsPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-zinc-200/80 dark:border-zinc-800">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
            Relatórios de Desempenho e SLA
          </span>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight text-zinc-900 dark:text-zinc-50">
            Analytics do Restaurante
          </h1>
          <p className="text-sm text-zinc-500 mt-1">
            Métricas de tempo de resposta dos garçons, fluxo de pedidos e satisfação dos clientes.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-zinc-500">
          <span className="px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 font-semibold text-zinc-700 dark:text-zinc-300">
            Período: Hoje
          </span>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total de Chamados"
          value={DEMO_DASHBOARD_METRICS.totalCallsToday}
          subtitle="Média de 12.7 chamados/mesa"
          icon={<Zap className="w-5 h-5 text-amber-500" />}
        />

        <StatCard
          title="Tempo Médio Resposta"
          value={formatSecondsToTime(DEMO_DASHBOARD_METRICS.avgResponseTimeSeconds)}
          subtitle="Tempo até o garçom aceitar"
          trend="-18s (Melhora de 19%)"
          trendPositive={true}
          icon={<Clock className="w-5 h-5 text-blue-500" />}
        />

        <StatCard
          title="Mediana de Resposta"
          value={formatSecondsToTime(DEMO_DASHBOARD_METRICS.medianResponseTimeSeconds)}
          subtitle="50% atendidos abaixo deste tempo"
          icon={<Timer className="w-5 h-5 text-emerald-500" />}
        />

        <StatCard
          title="Duração Média Atendimento"
          value={formatSecondsToTime(DEMO_DASHBOARD_METRICS.avgServiceDurationSeconds)}
          subtitle="Tempo total na mesa"
          icon={<CheckCircle className="w-5 h-5 text-purple-500" />}
        />
      </div>

      {/* Second Row KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          title="Avaliação Média dos Clientes"
          value={`${DEMO_DASHBOARD_METRICS.avgRating} ★`}
          subtitle="Baseado em formulário QR Code"
          trend="+0.2 pts"
          trendPositive={true}
          icon={<Star className="w-5 h-5 text-amber-400" />}
        />

        <StatCard
          title="Total de Avaliações"
          value={DEMO_DASHBOARD_METRICS.totalEvaluations}
          subtitle="37.8% dos clientes avaliaram"
          icon={<BarChart3 className="w-5 h-5 text-zinc-600 dark:text-zinc-300" />}
        />

        <StatCard
          title="Conformidade de SLA (< 2 min)"
          value="96.8%"
          subtitle="Apenas 4 chamados acima de 2 min"
          trendPositive={true}
          trend="+4.2%"
          icon={<ArrowUpRight className="w-5 h-5 text-emerald-500" />}
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chamados por Horário */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Clock className="w-4 h-4 text-zinc-500" />
              Distribuição de Chamados por Hora
            </CardTitle>
          </CardHeader>

          <div className="pt-4">
            <div className="h-48 flex items-end gap-3 px-2">
              {DEMO_HOURLY_CALLS.map((item) => {
                const max = Math.max(...DEMO_HOURLY_CALLS.map((h) => h.calls));
                const heightPercent = Math.round((item.calls / max) * 100);
                return (
                  <div key={item.hour} className="flex-1 flex flex-col items-center gap-2">
                    <span className="text-[10px] font-mono font-semibold text-zinc-500">
                      {item.calls}
                    </span>
                    <div className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-t-lg h-36 flex items-end">
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
            <p className="mt-4 text-[11px] text-zinc-400 text-center">
              Pico de chamados identificado entre 20:00 e 21:00 (jantar de rodízio).
            </p>
          </div>
        </Card>

        {/* Frequência por Mesa */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Flame className="w-4 h-4 text-amber-500" />
              Volume de Chamados por Mesa
            </CardTitle>
          </CardHeader>

          <div className="space-y-3 pt-2">
            {DEMO_CALLS_BY_TABLE.map((t, idx) => {
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

'use client';

import React from 'react';
import { StatCard } from '@/components/analytics/StatCard';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { PageHeader } from '@/components/ui/PageHeader';
import { Clock, CheckCircle, Star, BarChart3, Timer, Zap } from 'lucide-react';
import {
  DEMO_DASHBOARD_METRICS,
  DEMO_HOURLY_CALLS,
  DEMO_CALLS_BY_TABLE,
} from '@/lib/demo-data';
import { formatSecondsToTime } from '@/lib/utils';

export default function AnalyticsPage() {
  return (
    <div className="space-y-7">
      <PageHeader
        kicker="SLA e fluxo"
        title="Desempenho"
        description="Tempo até o garçom assumir, duração na mesa e volume por horário."
        actions={
          <span className="text-xs font-medium px-2.5 py-1 rounded-md border border-border bg-cream-paper">
            Hoje
          </span>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <StatCard
          title="Total de chamados"
          value={DEMO_DASHBOARD_METRICS.totalCallsToday}
          subtitle="Média 12,7 por mesa"
          icon={<Zap className="w-4 h-4 text-orange-700" />}
        />
        <StatCard
          title="Tempo médio de resposta"
          value={formatSecondsToTime(DEMO_DASHBOARD_METRICS.avgResponseTimeSeconds)}
          subtitle="Até o aceite"
          trend="−18s (19%)"
          trendPositive
          icon={<Clock className="w-4 h-4 text-blue-700" />}
        />
        <StatCard
          title="Mediana"
          value={formatSecondsToTime(DEMO_DASHBOARD_METRICS.medianResponseTimeSeconds)}
          subtitle="Metade abaixo deste tempo"
          icon={<Timer className="w-4 h-4 text-emerald-700" />}
        />
        <StatCard
          title="Duração média"
          value={formatSecondsToTime(DEMO_DASHBOARD_METRICS.avgServiceDurationSeconds)}
          subtitle="Do aceite à conclusão"
          icon={<CheckCircle className="w-4 h-4 text-stone-600" />}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <StatCard
          title="Nota média"
          value={DEMO_DASHBOARD_METRICS.avgRating}
          subtitle="QR da mesa"
          trend="+0,2"
          trendPositive
          icon={<Star className="w-4 h-4 text-orange-600" />}
        />
        <StatCard
          title="Avaliações"
          value={DEMO_DASHBOARD_METRICS.totalEvaluations}
          subtitle="37% das mesas responderam"
          icon={<BarChart3 className="w-4 h-4 text-stone-600" />}
        />
        <StatCard
          title="SLA abaixo de 2 min"
          value="96,8%"
          subtitle="4 chamados acima"
          trend="+4,2%"
          trendPositive
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Chamados por hora</CardTitle>
          </CardHeader>
          <div className="h-44 flex items-end gap-2.5 px-1">
            {DEMO_HOURLY_CALLS.map((item) => {
              const max = Math.max(...DEMO_HOURLY_CALLS.map((h) => h.calls));
              const heightPercent = Math.round((item.calls / max) * 100);
              return (
                <div key={item.hour} className="flex-1 flex flex-col items-center gap-1.5">
                  <span className="text-[10px] font-mono tabular-nums text-stone-500">
                    {item.calls}
                  </span>
                  <div className="w-full bg-cream dark:bg-stone-800 rounded-t h-32 flex items-end">
                    <div
                      style={{ height: `${heightPercent}%` }}
                      className="w-full bg-espresso dark:bg-cream rounded-t"
                    />
                  </div>
                  <span className="text-[10px] font-mono text-stone-400">{item.hour}</span>
                </div>
              );
            })}
          </div>
          <p className="mt-3 text-[11px] text-stone-400">Pico entre 20h e 21h no jantar.</p>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Volume por mesa</CardTitle>
          </CardHeader>
          <div className="space-y-3">
            {DEMO_CALLS_BY_TABLE.map((t, idx) => {
              const max = DEMO_CALLS_BY_TABLE[0].calls;
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
                      className={`h-full rounded-full ${idx === 0 ? 'bg-accent' : 'bg-espresso dark:bg-cream'}`}
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

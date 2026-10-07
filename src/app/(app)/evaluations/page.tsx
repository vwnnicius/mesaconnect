'use client';

import React, { useEffect, useState } from 'react';
import { getEvaluations } from '@/services/evaluationsService';
import { Evaluation } from '@/types';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { PageHeader } from '@/components/ui/PageHeader';
import { ExternalLink, QrCode } from 'lucide-react';
import { formatRelativeTime } from '@/lib/utils';
import { RESTAURANT_DEMO } from '@/lib/constants';
import Link from 'next/link';

export default function EvaluationsPage() {
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await getEvaluations();
        setEvaluations(data);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const avgRating =
    evaluations.length > 0
      ? (evaluations.reduce((acc, e) => acc + e.rating, 0) / evaluations.length).toFixed(1)
      : '—';
  const approval = evaluations.length ? `${Math.round(evaluations.filter((e) => e.rating >= 4).length / evaluations.length * 100)}%` : '—';

  return (
    <div className="space-y-5">
      <PageHeader
        kicker="Cliente"
        title="Avaliações"
        description="Notas enviadas pelo QR da mesa, sem login."
        actions={
          <Link href={`/evaluate/${RESTAURANT_DEMO.slug}/07`} target="_blank">
            <Button size="md" variant="outline">
              <QrCode className="w-4 h-4" />
              Testar mesa 07
              <ExternalLink className="w-3.5 h-3.5 opacity-50" />
            </Button>
          </Link>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <Card className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-orange-50 dark:bg-orange-950/40 text-orange-800 dark:text-orange-300 flex items-center justify-center font-semibold text-xl tabular-nums">
            {avgRating}
          </div>
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-stone-500">
              Média
            </p>
            <p className="text-xs text-stone-500 mt-0.5">Satisfação geral</p>
          </div>
        </Card>
        <Card className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-cream dark:bg-stone-800 flex items-center justify-center font-semibold text-xl tabular-nums">
            {evaluations.length}
          </div>
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-stone-500">
              Recebidas
            </p>
            <p className="text-xs text-stone-500 mt-0.5">Por mesa, com horário</p>
          </div>
        </Card>
        <Card className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 flex items-center justify-center font-semibold text-xl tabular-nums">
            {approval}
          </div>
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-stone-500">
              4 e 5 estrelas
            </p>
            <p className="text-xs text-stone-500 mt-0.5">Aprovação no rodízio</p>
          </div>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Comentários recentes</CardTitle>
        </CardHeader>
        {loading ? (
          <div className="py-10 text-center text-stone-400 text-sm">Carregando…</div>
        ) : evaluations.length === 0 ? (
          <div className="py-10 text-center text-stone-400 text-sm">
            Nenhuma avaliação ainda.
          </div>
        ) : (
          <div className="divide-y divide-border">
            {evaluations.map((item) => (
              <div key={item.id} className="py-3.5 first:pt-0 last:pb-0 space-y-1.5">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md bg-cream dark:bg-stone-800 text-xs font-medium">
                      Mesa {item.table_number || '—'}
                    </span>
                    <span className="text-xs text-orange-700 dark:text-orange-300 tabular-nums">
                      {item.rating}/5
                    </span>
                  </div>
                  <span className="text-xs text-stone-400 font-mono">
                    {formatRelativeTime(item.created_at)}
                  </span>
                </div>
                {item.comment ? (
                  <p className="text-sm text-stone-700 dark:text-stone-300 leading-relaxed">
                    {item.comment}
                  </p>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

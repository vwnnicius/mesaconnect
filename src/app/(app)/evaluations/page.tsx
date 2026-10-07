'use client';

import React, { useEffect, useState } from 'react';
import { getEvaluations } from '@/services/evaluationsService';
import { Evaluation } from '@/types';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Star, MessageSquare, ExternalLink, QrCode } from 'lucide-react';
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
      : '5.0';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-zinc-200/80 dark:border-zinc-800">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
            Satisfação do Cliente
          </span>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight text-zinc-900 dark:text-zinc-50">
            Avaliações via QR Code
          </h1>
          <p className="text-sm text-zinc-500 mt-1">
            Feedbacks enviados diretamente pelas mesas sem necessidade de login.
          </p>
        </div>

        <Link
          href={`/evaluate/${RESTAURANT_DEMO.slug}/07`}
          target="_blank"
        >
          <Button size="md" className="bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900">
            <QrCode className="w-4 h-4 mr-2" />
            Testar Avaliação (Mesa 07)
            <ExternalLink className="w-3.5 h-3.5 ml-1.5 opacity-60" />
          </Button>
        </Link>
      </div>

      {/* Summary Score Card */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-500 flex items-center justify-center font-black text-2xl">
            {avgRating}
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Nota Média Geral
            </p>
            <div className="flex text-amber-400 text-sm mt-0.5">
              {'★★★★★'}
            </div>
            <p className="text-[11px] text-zinc-500 mt-0.5">Excelente satisfação</p>
          </div>
        </Card>

        <Card className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 flex items-center justify-center font-black text-2xl">
            {evaluations.length}
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Total Recebido
            </p>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">
              Avaliações verificadas por mesa
            </p>
          </div>
        </Card>

        <Card className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-black text-2xl">
            96%
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Avaliações 4 e 5 Estrelas
            </p>
            <p className="text-[11px] text-zinc-500 mt-1">Alta aprovação no rodízio</p>
          </div>
        </Card>
      </div>

      {/* Evaluations Feed */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-zinc-500" />
            Comentários Recentes
          </CardTitle>
        </CardHeader>

        {loading ? (
          <div className="py-12 text-center text-zinc-400 text-xs">
            Carregando avaliações...
          </div>
        ) : evaluations.length === 0 ? (
          <div className="py-12 text-center text-zinc-400 text-xs">
            Nenhuma avaliação recebida ainda.
          </div>
        ) : (
          <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {evaluations.map((item) => (
              <div key={item.id} className="py-4 first:pt-0 last:pb-0 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-xs font-bold text-zinc-800 dark:text-zinc-200">
                      Mesa {item.table_number || '??'}
                    </span>
                    <div className="flex text-amber-400 text-sm">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <span key={i}>
                          {i < item.rating ? '★' : <span className="text-zinc-300 dark:text-zinc-700">★</span>}
                        </span>
                      ))}
                    </div>
                  </div>
                  <span className="text-xs text-zinc-400 font-mono">
                    {formatRelativeTime(item.created_at)}
                  </span>
                </div>

                {item.comment && (
                  <p className="text-sm text-zinc-700 dark:text-zinc-300 italic pl-1">
                    &ldquo;{item.comment}&rdquo;
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

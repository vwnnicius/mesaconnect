'use client';

import React, { useState } from 'react';
import { useTables } from '@/hooks/useTables';
import { TableCard } from '@/components/tables/TableCard';
import { TableStatus } from '@/types';
import { TABLE_STATUS_CONFIG } from '@/lib/constants';
import { Button } from '@/components/ui/Button';
import { PageHeader } from '@/components/ui/PageHeader';
import { RotateCw } from 'lucide-react';
import Link from 'next/link';

export default function TablesPage() {
  const { tables, loading, refresh } = useTables();
  const [filter, setFilter] = useState<TableStatus | 'ALL'>('ALL');

  const filteredTables = tables.filter((t) => {
    if (filter === 'ALL') return true;
    return t.status === filter;
  });

  const statusCounts: Record<TableStatus, number> = {
    AVAILABLE: tables.filter((t) => t.status === 'AVAILABLE').length,
    CALLING: tables.filter((t) => t.status === 'CALLING').length,
    ACKNOWLEDGED: tables.filter((t) => t.status === 'ACKNOWLEDGED').length,
    DO_NOT_DISTURB: tables.filter((t) => t.status === 'DO_NOT_DISTURB').length,
    COMPLETED: tables.filter((t) => t.status === 'COMPLETED').length,
    OFFLINE: tables.filter((t) => t.status === 'OFFLINE').length,
  };

  return (
    <div className="space-y-5">
      <PageHeader
        kicker="Salão"
        title="Mapa de mesas"
        description="Status ao vivo de cada mesa e do botão físico."
        actions={
          <>
            <Button size="sm" variant="outline" onClick={() => refresh()} title="Atualizar">
              <RotateCw className="w-4 h-4" />
            </Button>
            <Link href="/simulator">
              <Button size="sm" variant="outline">
                Simulador
              </Button>
            </Link>
          </>
        }
      />

      <div className="flex flex-wrap items-center gap-1.5">
        <button
          onClick={() => setFilter('ALL')}
          className={`px-2.5 py-1.5 rounded-md text-xs font-medium border ${
            filter === 'ALL'
              ? 'bg-espresso text-cream border-transparent dark:bg-cream dark:text-espresso'
              : 'bg-cream-paper text-stone-600 border-border hover:border-stone-400'
          }`}
        >
          Todas ({tables.length})
        </button>

        {(['AVAILABLE', 'CALLING', 'ACKNOWLEDGED', 'DO_NOT_DISTURB', 'OFFLINE'] as TableStatus[]).map(
          (statusKey) => {
            const cfg = TABLE_STATUS_CONFIG[statusKey];
            const isSelected = filter === statusKey;
            return (
              <button
                key={statusKey}
                onClick={() => setFilter(statusKey)}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium border ${
                  isSelected
                    ? `${cfg.bgColor} ${cfg.textColor} ${cfg.borderColor}`
                    : 'bg-cream-paper text-stone-600 border-border hover:border-stone-400'
                }`}
              >
                {cfg.label}
                <span className="tabular-nums opacity-70">({statusCounts[statusKey]})</span>
              </button>
            );
          }
        )}
      </div>

      {loading ? (
        <div className="py-16 text-center text-stone-400 text-sm">Carregando salão…</div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {filteredTables.map((table) => (
            <TableCard key={table.id} table={table} />
          ))}
        </div>
      )}

      <p className="text-xs text-stone-500">
        Cada mesa tem um QR de avaliação.{' '}
        <Link href="/settings" className="font-medium text-stone-800 dark:text-stone-200 underline">
          Ver links
        </Link>
      </p>
    </div>
  );
}

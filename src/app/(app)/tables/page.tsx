'use client';

import React, { useState } from 'react';
import { useTables } from '@/hooks/useTables';
import { TableCard } from '@/components/tables/TableCard';
import { TableStatus } from '@/types';
import { TABLE_STATUS_CONFIG } from '@/lib/constants';
import { Button } from '@/components/ui/Button';
import { RotateCw, Cpu, QrCode } from 'lucide-react';
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-zinc-200/80 dark:border-zinc-800">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
            Visão Geral do Salão
          </span>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight text-zinc-900 dark:text-zinc-50">
            Mapa de Mesas
          </h1>
          <p className="text-sm text-zinc-500 mt-1">
            Status em tempo real de cada mesa e dispositivo físico.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => refresh()}
            className="p-2.5"
            title="Atualizar mesas"
          >
            <RotateCw className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />
          </Button>

          <Link href="/simulator">
            <Button size="sm" variant="outline" className="border-dashed">
              <Cpu className="w-4 h-4 mr-1.5 text-amber-500" />
              Abrir Simulador
            </Button>
          </Link>
        </div>
      </div>

      {/* Legend & Filter Badges */}
      <div className="flex flex-wrap items-center gap-2 pt-1">
        <button
          onClick={() => setFilter('ALL')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
            filter === 'ALL'
              ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 border-transparent shadow-sm'
              : 'bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100'
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
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
                  isSelected
                    ? `${cfg.bgColor} ${cfg.textColor} ${cfg.borderColor} ring-2 ring-zinc-900/10`
                    : 'bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50'
                }`}
              >
                <span>{cfg.icon}</span>
                <span>{cfg.label}</span>
                <span className="font-mono ml-0.5 opacity-80">({statusCounts[statusKey]})</span>
              </button>
            );
          }
        )}
      </div>

      {/* Tables Grid */}
      {loading ? (
        <div className="py-16 text-center text-zinc-400 text-sm animate-pulse">
          Carregando mapa do salão...
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filteredTables.map((table) => (
            <TableCard key={table.id} table={table} />
          ))}
        </div>
      )}

      {/* QR Code Quick Notice Banner */}
      <div className="p-4 rounded-2xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-zinc-600 dark:text-zinc-400">
        <div className="flex items-center gap-2">
          <QrCode className="w-5 h-5 text-zinc-800 dark:text-zinc-200 flex-shrink-0" />
          <span>
            Cada mesa possui um QR Code exclusivo com link direto para avaliação do cliente sem necessidade de login.
          </span>
        </div>
        <Link
          href="/settings"
          className="font-semibold text-zinc-900 dark:text-zinc-100 underline whitespace-nowrap"
        >
          Gerar QR Codes
        </Link>
      </div>
    </div>
  );
}

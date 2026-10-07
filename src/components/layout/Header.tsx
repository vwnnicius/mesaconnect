'use client';

import React from 'react';
import Link from 'next/link';
import { UtensilsCrossed, QrCode, Cpu, Bell } from 'lucide-react';
import { RESTAURANT_DEMO } from '@/lib/constants';
import { useCalls } from '@/hooks/useCalls';

export function Header() {
  const { calls } = useCalls();
  const callingCount = calls.filter((c) => c.status === 'CALLING').length;

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between h-16 px-4 md:px-8 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-md border-b border-zinc-200/80 dark:border-zinc-800">
      {/* Mobile Title */}
      <div className="flex items-center gap-2 md:hidden">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900">
          <UtensilsCrossed className="w-4 h-4" />
        </div>
        <span className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
          MesaConnect
        </span>
      </div>

      {/* Desktop Context Title */}
      <div className="hidden md:flex items-center gap-3">
        <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800">
          📍 {RESTAURANT_DEMO.name}
        </span>
        <span className="inline-flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          Realtime Ativo
        </span>
      </div>

      {/* Quick Action Shortcuts */}
      <div className="flex items-center gap-2">
        {/* Simulador Shortcut */}
        <Link
          href="/simulator"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800 transition-colors"
        >
          <Cpu className="w-3.5 h-3.5" />
          <span>Simulador ESP32</span>
        </Link>

        {/* QR Code Evaluation Shortcut */}
        <Link
          href={`/evaluate/${RESTAURANT_DEMO.slug}/07`}
          target="_blank"
          title="Abrir página pública de avaliação da Mesa 07"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 transition-colors"
        >
          <QrCode className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Avaliar Mesa 07</span>
        </Link>

        {/* Calls Alert Pill */}
        <Link
          href="/calls"
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            callingCount > 0
              ? 'bg-amber-500 text-white animate-bounce shadow-sm'
              : 'bg-zinc-100 text-zinc-700 dark:bg-zinc-900 dark:text-zinc-300'
          }`}
        >
          <Bell className="w-3.5 h-3.5" />
          <span>{callingCount}</span>
        </Link>
      </div>
    </header>
  );
}

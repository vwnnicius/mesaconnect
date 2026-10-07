'use client';

import React from 'react';
import Link from 'next/link';
import { QrCode, Play, Bell } from 'lucide-react';
import { RESTAURANT_DEMO } from '@/lib/constants';
import { useCalls } from '@/hooks/useCalls';
import { BrandMark } from '@/components/layout/BrandMark';
import { isSupabaseConfigured } from '@/lib/supabase/client';

export function Header() {
  const { calls } = useCalls();
  const callingCount = calls.filter((c) => c.status === 'CALLING').length;

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between h-[76px] px-5 md:px-10 bg-background/95 backdrop-blur-md border-b border-border">
      <div className="flex items-center gap-2 md:hidden">
        <BrandMark className="w-7 h-7" />
        <span className="font-semibold text-sm">MesaConnect</span>
        {!isSupabaseConfigured() ? <span className="text-[10px] text-muted-foreground border border-border px-1.5 py-0.5 rounded">Demo</span> : null}
      </div>

      <div className="hidden md:flex items-center gap-3 text-xs text-stone-500">
        <span className="font-medium text-stone-700 dark:text-stone-300">
          {RESTAURANT_DEMO.name}
        </span>
        <span className="text-border">·</span>
        <span className="inline-flex items-center gap-1.5">
          {isSupabaseConfigured() ? 'Operação do salão' : 'Demonstração local'}
        </span>
      </div>

      <div className="flex items-center gap-1.5">
        <Link
          href="/demo"
          className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-stone-600 hover:bg-white/70 dark:text-stone-300 dark:hover:bg-white/5"
        >
          <Play className="w-3.5 h-3.5" />
          Demo interativa
        </Link>
        <Link
          href={`/evaluate/${RESTAURANT_DEMO.slug}/07`}
          target="_blank"
          className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-stone-600 hover:bg-white/70 dark:text-stone-300 dark:hover:bg-white/5"
        >
          <QrCode className="w-3.5 h-3.5" />
          QR Mesa 07
        </Link>
        <Link
          href="/calls"
          aria-label={`${callingCount} mesas aguardando atendimento`}
          className={`inline-flex items-center gap-1.5 min-h-11 px-3 py-2 rounded-xl text-xs font-semibold ${
            callingCount > 0
              ? 'bg-accent text-white'
              : 'text-stone-600 hover:bg-white/70 dark:text-stone-300 dark:hover:bg-white/5'
          }`}
        >
          <Bell className="w-3.5 h-3.5" />
          {callingCount}
        </Link>
      </div>
    </header>
  );
}

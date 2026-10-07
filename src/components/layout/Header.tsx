'use client';

import React from 'react';
import Link from 'next/link';
import { QrCode, Cpu, Bell } from 'lucide-react';
import { RESTAURANT_DEMO } from '@/lib/constants';
import { useCalls } from '@/hooks/useCalls';
import { BrandMark } from '@/components/layout/BrandMark';

export function Header() {
  const { calls } = useCalls();
  const callingCount = calls.filter((c) => c.status === 'CALLING').length;

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between h-16 px-4 md:px-7 bg-cream/85 dark:bg-[#161210]/85 backdrop-blur-md border-b border-border">
      <div className="flex items-center gap-2 md:hidden">
        <BrandMark className="w-7 h-7" />
        <span className="font-semibold text-sm">MesaConnect</span>
      </div>

      <div className="hidden md:flex items-center gap-3 text-xs text-stone-500">
        <span className="font-medium text-stone-700 dark:text-stone-300">
          {RESTAURANT_DEMO.name}
        </span>
        <span className="text-border">·</span>
        <span className="inline-flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
          Salão ao vivo
        </span>
      </div>

      <div className="flex items-center gap-1.5">
        <Link
          href="/simulator"
          className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-stone-600 hover:bg-white/70 dark:text-stone-300 dark:hover:bg-white/5"
        >
          <Cpu className="w-3.5 h-3.5" />
          Simulador
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
          className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold ${
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

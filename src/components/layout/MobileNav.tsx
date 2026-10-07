'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, BellRing, Grid3X3, Cpu } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCalls } from '@/hooks/useCalls';

export function MobileNav() {
  const pathname = usePathname();
  const { calls } = useCalls();
  const callingCount = calls.filter((c) => c.status === 'CALLING').length;

  const items = [
    {
      name: 'Chamados',
      href: '/calls',
      icon: BellRing,
      badge: callingCount,
    },
    {
      name: 'Mesas',
      href: '/tables',
      icon: Grid3X3,
    },
    {
      name: 'Simulador',
      href: '/simulator',
      icon: Cpu,
    },
    {
      name: 'Painel',
      href: '/dashboard',
      icon: LayoutDashboard,
    },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-30 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-lg border-t border-zinc-200/80 dark:border-zinc-800 pb-safe">
      <div className="grid grid-cols-4 h-16">
        {items.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'relative flex flex-col items-center justify-center gap-1 transition-colors select-none',
                isActive
                  ? 'text-zinc-900 dark:text-zinc-100 font-semibold'
                  : 'text-zinc-400 hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300'
              )}
            >
              <div className="relative">
                <Icon className="w-5 h-5" />
                {item.badge && item.badge > 0 ? (
                  <span className="absolute -top-1.5 -right-2.5 px-1.5 py-0.2 text-[10px] font-bold bg-amber-500 text-white rounded-full animate-pulse">
                    {item.badge}
                  </span>
                ) : null}
              </div>
              <span className="text-[11px] leading-tight">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

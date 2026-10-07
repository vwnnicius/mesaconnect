'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  BellRing,
  Grid3X3,
  BarChart3,
  Star,
  Cpu,
  Settings,
  UtensilsCrossed,
  LogOut,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCalls } from '@/hooks/useCalls';
import { RESTAURANT_DEMO } from '@/lib/constants';

const navItems = [
  {
    name: 'Visão Geral',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    name: 'Chamados',
    href: '/calls',
    icon: BellRing,
    badge: true,
  },
  {
    name: 'Mapa de Mesas',
    href: '/tables',
    icon: Grid3X3,
  },
  {
    name: 'Analytics & SLA',
    href: '/analytics',
    icon: BarChart3,
  },
  {
    name: 'Avaliações',
    href: '/evaluations',
    icon: Star,
  },
  {
    name: 'Simulador ESP32',
    href: '/simulator',
    icon: Cpu,
    highlight: true,
  },
  {
    name: 'Configurações',
    href: '/settings',
    icon: Settings,
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { calls } = useCalls();
  const pendingCallsCount = calls.filter((c) => c.status === 'CALLING').length;

  return (
    <aside className="hidden md:flex md:w-64 md:flex-col fixed inset-y-0 z-30 bg-white dark:bg-zinc-950 border-r border-zinc-200/80 dark:border-zinc-800">
      {/* Brand Header */}
      <div className="flex items-center gap-3 px-6 h-16 border-b border-zinc-100 dark:border-zinc-800">
        <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-sm">
          <UtensilsCrossed className="w-5 h-5" />
        </div>
        <div>
          <h1 className="font-bold text-base tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
            MesaConnect
            <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
              MVP
            </span>
          </h1>
          <p className="text-xs text-zinc-500 truncate max-w-[140px]">
            {RESTAURANT_DEMO.name}
          </p>
        </div>
      </div>

      {/* Nav List */}
      <div className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
          Menu Principal
        </div>
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'group flex items-center justify-between px-3.5 py-2.5 text-sm font-medium rounded-xl transition-all',
                isActive
                  ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-sm'
                  : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:text-zinc-100 dark:hover:bg-zinc-900',
                item.highlight && !isActive && 'text-amber-600 dark:text-amber-400 font-semibold'
              )}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={cn(
                    'w-4 h-4 transition-colors',
                    isActive
                      ? 'text-white dark:text-zinc-900'
                      : 'text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300',
                    item.highlight && !isActive && 'text-amber-500'
                  )}
                />
                <span>{item.name}</span>
              </div>

              {item.badge && pendingCallsCount > 0 && (
                <span
                  className={cn(
                    'px-2 py-0.5 text-xs font-bold rounded-full',
                    isActive
                      ? 'bg-amber-400 text-zinc-900'
                      : 'bg-amber-500 text-white animate-pulse'
                  )}
                >
                  {pendingCallsCount}
                </span>
              )}
            </Link>
          );
        })}
      </div>

      {/* User & Restaurant Footer */}
      <div className="p-4 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center font-bold text-xs text-zinc-700 dark:text-zinc-300">
              JG
            </div>
            <div className="text-left">
              <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                João Garçom
              </p>
              <p className="text-[11px] text-zinc-500">Rodízio Ativo</p>
            </div>
          </div>
          <Link
            href="/login"
            title="Sair / Trocar de Usuário"
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-200/60 dark:hover:text-zinc-200 dark:hover:bg-zinc-800 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </aside>
  );
}

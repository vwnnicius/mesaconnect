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
  LogOut,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCalls } from '@/hooks/useCalls';
import { RESTAURANT_DEMO } from '@/lib/constants';
import { BrandMark } from '@/components/layout/BrandMark';

const navItems = [
  { name: 'Painel', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Chamados', href: '/calls', icon: BellRing, badge: true },
  { name: 'Salão', href: '/tables', icon: Grid3X3 },
  { name: 'Desempenho', href: '/analytics', icon: BarChart3 },
  { name: 'Avaliações', href: '/evaluations', icon: Star },
  { name: 'Simulador', href: '/simulator', icon: Cpu },
  { name: 'Configurações', href: '/settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { calls } = useCalls();
  const pendingCallsCount = calls.filter((c) => c.status === 'CALLING').length;

  return (
    <aside className="hidden md:flex md:w-[260px] md:flex-col fixed inset-y-0 z-30 bg-espresso text-cream">
      <div className="flex items-center gap-3 px-5 h-[64px] border-b border-white/10">
        <BrandMark className="w-8 h-8" />
        <div className="min-w-0">
          <p className="font-semibold text-[15px] tracking-tight leading-none">MesaConnect</p>
          <p className="text-[11px] text-stone-400 truncate mt-1">{RESTAURANT_DEMO.name}</p>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'group flex items-center justify-between px-3 py-2 text-[13px] rounded-lg transition-colors',
                isActive
                  ? 'bg-white/10 text-white'
                  : 'text-stone-400 hover:text-cream hover:bg-white/5'
              )}
            >
              <span className="flex items-center gap-2.5">
                <Icon className={cn('w-4 h-4', isActive ? 'text-orange-300' : 'text-stone-500')} />
                {item.name}
              </span>

              {item.badge && pendingCallsCount > 0 ? (
                <span
                  className={cn(
                    'min-w-[1.25rem] h-5 px-1.5 text-[11px] font-semibold rounded-md text-center leading-5',
                    isActive ? 'bg-accent text-white' : 'bg-accent text-white'
                  )}
                >
                  {pendingCallsCount}
                </span>
              ) : null}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-white/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-[11px] font-semibold">
              JG
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium truncate">João Silva</p>
              <p className="text-[11px] text-stone-500">Garçom · turno jantar</p>
            </div>
          </div>
          <Link
            href="/login"
            title="Sair"
            className="p-1.5 rounded-md text-stone-500 hover:text-cream hover:bg-white/10"
          >
            <LogOut className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </aside>
  );
}

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
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

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
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);
  const [signOutError, setSignOutError] = useState(false);
  const pathname = usePathname();
  const { calls } = useCalls();
  const pendingCallsCount = calls.filter((c) => c.status === 'CALLING').length;

  const signOut = async () => {
    setSigningOut(true);
    setSignOutError(false);
    try {
      if (isSupabaseConfigured()) {
        const { error } = await createClient().auth.signOut();
        if (error) throw error;
      }
      router.replace('/login');
      router.refresh();
    } catch {
      setSignOutError(true);
    } finally {
      setSigningOut(false);
    }
  };

  return (
    <aside className="hidden md:flex md:w-[232px] md:flex-col fixed inset-y-0 z-30 bg-card border-r border-border text-foreground">
      <div className="flex items-center gap-3 px-5 h-[76px]">
        <BrandMark className="w-8 h-8" />
        <div className="min-w-0">
          <p className="font-semibold text-[15px] tracking-tight leading-none">MesaConnect</p>
          <p className="text-[11px] text-muted-foreground truncate mt-1">Atendimento por mesa</p>
        </div>
      </div>

      <nav aria-label="Navegação principal" className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
        <p className="px-3 mb-3 text-[11px] text-muted-foreground font-medium">Restaurante</p>
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? 'page' : undefined}
              className={cn(
                'group flex items-center justify-between px-3 py-2.5 text-[13px] rounded-lg transition-colors',
                isActive
                  ? 'bg-background text-foreground font-semibold'
                  : 'text-muted-foreground hover:text-foreground hover:bg-background'
              )}
            >
              <span className="flex items-center gap-2.5">
                <Icon aria-hidden className={cn('w-4 h-4', isActive ? 'text-accent' : 'text-muted-foreground')} strokeWidth={1.7} />
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

      <div className="p-4 border-t border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-background border border-border flex items-center justify-center text-[11px] font-semibold">
              MC
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium truncate">Equipe do salão</p>
              <p className="text-[11px] text-muted-foreground truncate">{RESTAURANT_DEMO.name}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={signOut}
            disabled={signingOut}
            aria-label="Sair da conta"
            title="Sair"
            className="p-3 rounded-lg text-muted-foreground hover:text-foreground hover:bg-background disabled:opacity-50"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
        {signOutError ? <p role="alert" className="text-xs text-red-600 mt-2">Não foi possível sair. Tente novamente.</p> : null}
      </div>
    </aside>
  );
}

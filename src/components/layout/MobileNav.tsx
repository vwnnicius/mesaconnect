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
    { name: 'Chamados', href: '/calls', icon: BellRing, badge: callingCount },
    { name: 'Salão', href: '/tables', icon: Grid3X3 },
    { name: 'Simulador', href: '/simulator', icon: Cpu },
    { name: 'Painel', href: '/dashboard', icon: LayoutDashboard },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-30 bg-cream-paper/95 dark:bg-[#221c18]/95 backdrop-blur-md border-t border-border pb-safe">
      <div className="grid grid-cols-4 h-16">
        {items.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'relative flex flex-col items-center justify-center gap-0.5 select-none',
                isActive ? 'text-espresso dark:text-cream' : 'text-stone-400'
              )}
            >
              <div className="relative">
                <Icon className="w-5 h-5" />
                {item.badge && item.badge > 0 ? (
                  <span className="absolute -top-1.5 -right-2 min-w-[16px] h-4 px-1 text-[10px] font-semibold bg-accent text-white rounded-full text-center leading-4">
                    {item.badge}
                  </span>
                ) : null}
              </div>
              <span className="text-[10px] font-medium">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

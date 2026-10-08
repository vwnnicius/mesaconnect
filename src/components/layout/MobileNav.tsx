"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, BellRing, Grid3X3, Menu } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useCalls } from "@/hooks/useCalls";
import { useWorkspace } from "@/providers/WorkspaceProvider";

export function MobileNav() {
  const pathname = usePathname();
  const { manager, platformAdmin } = useWorkspace();
  const [moreOpen, setMoreOpen] = useState(false);
  const { calls } = useCalls();
  const callingCount = calls.filter((c) => c.status === "CALLING").length;

  const items = [
    { name: "Chamados", href: "/calls", icon: BellRing, badge: callingCount },
    { name: "Mesas", href: "/tables", icon: Grid3X3 },
    {
      name: manager ? "Visão geral" : "Tela",
      href: manager ? "/dashboard" : "/screen",
      icon: LayoutDashboard,
    },
  ];

  return (
    <nav
      aria-label="Navegação no celular"
      className="md:hidden fixed bottom-0 inset-x-0 z-30 bg-card border-t border-border pb-safe"
    >
      {moreOpen ? (
        <div
          className="border-b border-border p-3 grid grid-cols-2 gap-2"
          aria-label="Mais páginas"
        >
          {[
            ["Demo interativa", "/demo"],
            ["Seu perfil", "/profile"],
            ["Tela", "/screen"],
            ...(manager
              ? [
                  ["Insights", "/analytics"],
                  ["Atividade", "/activity"],
                  ["Avaliações", "/evaluations"],
                  ["Simulador", "/simulator"],
                  ["Configurações", "/settings"],
                ]
              : []),
            ...(platformAdmin ? [["Dispositivos", "/devices"]] : []),
            ["Login", "/login"],
          ].map(([name, href]) => (
            <Link
              key={href}
              href={href}
              onClick={() => setMoreOpen(false)}
              className="rounded-lg px-4 py-3 text-sm hover:bg-background"
              aria-current={pathname === href ? "page" : undefined}
            >
              {name}
            </Link>
          ))}
        </div>
      ) : null}
      <div className="grid grid-cols-4 h-16">
        {items.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMoreOpen(false)}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "relative flex flex-col items-center justify-center gap-0.5 select-none",
                isActive ? "text-accent" : "text-muted-foreground",
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
        <button
          type="button"
          aria-expanded={moreOpen}
          onClick={() => setMoreOpen(!moreOpen)}
          className="flex flex-col items-center justify-center gap-0.5 text-muted-foreground"
        >
          <Menu className="w-5 h-5" />
          <span className="text-[10px] font-medium">Mais</span>
        </button>
      </div>
    </nav>
  );
}

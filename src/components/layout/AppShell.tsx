"use client";
import { useEffect, useState, type ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { MobileNav } from "./MobileNav";
export function AppShell({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  useEffect(
    () =>
      setCollapsed(localStorage.getItem("mesaconnect-sidebar") === "hidden"),
    [],
  );
  return (
    <div
      className="workspace-shell min-h-screen bg-background flex"
      data-nav-collapsed={collapsed}
    >
      {!collapsed && <Sidebar />}
      <div className="workspace-content flex-1 flex flex-col min-w-0">
        <Header
          collapsed={collapsed}
          toggleSidebar={() => {
            const next = !collapsed;
            setCollapsed(next);
            localStorage.setItem(
              "mesaconnect-sidebar",
              next ? "hidden" : "visible",
            );
          }}
        />
        <main
          id="main-content"
          className="flex-1 px-5 py-7 md:px-10 md:py-10 pb-[calc(7rem+env(safe-area-inset-bottom))] md:pb-12 max-w-6xl w-full mx-auto"
        >
          {children}
        </main>
        <MobileNav />
      </div>
    </div>
  );
}

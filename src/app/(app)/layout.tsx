import React from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { MobileNav } from "@/components/layout/MobileNav";
import { RestaurantDataProvider } from "@/providers/RestaurantDataProvider";
import { WorkspaceProvider } from "@/providers/WorkspaceProvider";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <WorkspaceProvider>
      <RestaurantDataProvider>
        <div className="min-h-screen bg-background flex">
          <Sidebar />
          <div className="flex-1 flex flex-col md:pl-[232px] min-w-0">
            <Header />
            <main
              id="main-content"
              className="flex-1 px-5 py-7 md:px-10 md:py-10 pb-[calc(7rem+env(safe-area-inset-bottom))] md:pb-12 max-w-6xl w-full mx-auto"
            >
              {children}
            </main>
            <MobileNav />
          </div>
        </div>
      </RestaurantDataProvider>
    </WorkspaceProvider>
  );
}

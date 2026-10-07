import React from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { MobileNav } from '@/components/layout/MobileNav';
import { RestaurantDataProvider } from '@/providers/RestaurantDataProvider';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RestaurantDataProvider>
      <div className="min-h-screen bg-cream dark:bg-[#161210] flex">
        <Sidebar />
        <div className="flex-1 flex flex-col md:pl-[260px] min-w-0">
          <Header />
          <main className="flex-1 p-4 md:p-7 pb-24 md:pb-10 max-w-6xl w-full mx-auto">
            {children}
          </main>
          <MobileNav />
        </div>
      </div>
    </RestaurantDataProvider>
  );
}

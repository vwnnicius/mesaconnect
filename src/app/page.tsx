'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';
import { BrandMark } from '@/components/layout/BrandMark';

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    async function checkAuth() {
      if (!isSupabaseConfigured()) {
        router.replace('/dashboard');
        return;
      }

      const supabase = createClient();
      const { data } = await supabase.auth.getSession();

      if (data.session) {
        router.replace('/dashboard');
      } else {
        router.replace('/login');
      }
    }

    checkAuth();
  }, [router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-cream dark:bg-[#161210]">
      <BrandMark className="w-11 h-11 mb-4" />
      <p className="text-sm font-medium text-stone-800 dark:text-stone-100">MesaConnect</p>
      <p className="text-sm text-stone-500 mt-1">Abrindo o painel…</p>
    </div>
  );
}

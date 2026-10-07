'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';
import { UtensilsCrossed, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function RootPage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    async function checkAuth() {
      if (!isSupabaseConfigured()) {
        // Modo Demo / Local: redireciona para o dashboard
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
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-zinc-50 dark:bg-zinc-950">
      <div className="w-12 h-12 rounded-2xl bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 flex items-center justify-center mb-4 shadow-lg animate-pulse">
        <UtensilsCrossed className="w-6 h-6" />
      </div>
      <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
        MesaConnect
      </h1>
      <p className="text-sm text-zinc-500 mt-1">Carregando painel do restaurante...</p>

      {/* Atalhos diretos caso o redirecionamento demore */}
      <div className="mt-8 flex gap-3 text-xs">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 font-medium"
        >
          Acessar Dashboard <ArrowRight className="w-3.5 h-3.5" />
        </Link>
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-200 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 font-medium"
        >
          Tela de Login
        </Link>
      </div>
    </div>
  );
}

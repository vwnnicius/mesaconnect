'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';
import { Lock, Mail, AlertCircle, ArrowRight } from 'lucide-react';
import { RESTAURANT_DEMO } from '@/lib/constants';
import { BrandMark } from '@/components/layout/BrandMark';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    if (!isSupabaseConfigured()) {
      router.push('/dashboard');
      return;
    }

    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setErrorMsg(error.message || 'Credenciais inválidas. Verifique e-mail e senha.');
      } else if (data.session) {
        router.push('/dashboard');
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro inesperado ao conectar.';
      setErrorMsg(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-cream dark:bg-[#161210]">
      <div className="hidden lg:flex flex-col justify-between p-10 bg-espresso text-cream relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.07] grain"
          aria-hidden
        />
        <div className="relative">
          <div className="flex items-center gap-3">
            <BrandMark className="w-9 h-9" />
            <span className="font-semibold tracking-tight">MesaConnect</span>
          </div>
        </div>
        <div className="relative max-w-md">
          <p className="text-[11px] uppercase tracking-[0.16em] text-orange-300/90 mb-3">
            Operação de salão
          </p>
          <h1 className="text-4xl font-semibold tracking-tight leading-[1.15]">
            O botão da mesa chega no painel antes do gesto.
          </h1>
          <p className="mt-4 text-stone-400 text-[15px] leading-relaxed">
            Chamados em tempo real, mapa do salão e tempo de resposta da equipe — feito para
            rodízio e casa de alto giro.
          </p>
        </div>
        <p className="relative text-xs text-stone-500">{RESTAURANT_DEMO.name} · unidade demo</p>
      </div>

      <div className="flex flex-col justify-center px-5 py-12 sm:px-10">
        <div className="w-full max-w-[400px] mx-auto">
          <div className="lg:hidden flex items-center gap-2.5 mb-8">
            <BrandMark className="w-8 h-8" />
            <span className="font-semibold">MesaConnect</span>
          </div>

          <h2 className="text-2xl font-semibold tracking-tight text-stone-900 dark:text-stone-100">
            Entrar no painel
          </h2>
          <p className="text-sm text-stone-500 mt-1.5 mb-8">
            Use o e-mail da equipe ou o acesso de demonstração.
          </p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-stone-600 dark:text-stone-400 mb-1.5">
                E-mail
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="gerente@saborgrill.com.br"
                  className="w-full pl-10 pr-3 py-2.5 rounded-lg border border-border bg-cream-paper dark:bg-[#221c18] text-sm focus:outline-none focus:ring-2 focus:ring-accent/30"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-stone-600 dark:text-stone-400 mb-1.5">
                Senha
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-3 py-2.5 rounded-lg border border-border bg-cream-paper dark:bg-[#221c18] text-sm focus:outline-none focus:ring-2 focus:ring-accent/30"
                />
              </div>
            </div>

            {errorMsg ? (
              <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-300 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            ) : null}

            <Button type="submit" disabled={loading} fullWidth size="lg">
              {loading ? 'Entrando…' : 'Entrar'}
              <ArrowRight className="w-4 h-4" />
            </Button>
          </form>

          <div className="mt-4">
            <Button
              type="button"
              variant="outline"
              fullWidth
              onClick={() => router.push('/dashboard')}
            >
              Continuar como João · garçom (demo)
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

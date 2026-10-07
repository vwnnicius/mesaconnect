'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { PageHeader } from '@/components/ui/PageHeader';
import { CheckCircle, Copy, ExternalLink } from 'lucide-react';
import { RESTAURANT_DEMO } from '@/lib/constants';
import { isSupabaseConfigured } from '@/lib/supabase/client';
import { useTables } from '@/hooks/useTables';
import Link from 'next/link';

export default function SettingsPage() {
  const { tables } = useTables();
  const [supabaseConnected, setSupabaseConnected] = useState(false);
  const [copiedLink, setCopiedLink] = useState<string | null>(null);

  useEffect(() => {
    setSupabaseConnected(isSupabaseConfigured());
  }, []);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedLink(id);
    setTimeout(() => setCopiedLink(null), 2000);
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <PageHeader
        kicker="Administração"
        title="Configurações"
        description="Unidade, QR das mesas e dispositivos pareados."
      />

      <Card>
        <CardHeader>
          <CardTitle>Estabelecimento</CardTitle>
        </CardHeader>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div>
            <label className="block text-xs font-medium text-stone-500 mb-1">Nome</label>
            <input
              type="text"
              disabled
              value={RESTAURANT_DEMO.name}
              className="w-full px-3 py-2 rounded-lg border border-border bg-cream dark:bg-stone-900"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-stone-500 mb-1">Slug (QR)</label>
            <input
              type="text"
              disabled
              value={RESTAURANT_DEMO.slug}
              className="w-full px-3 py-2 rounded-lg border border-border bg-cream dark:bg-stone-900 font-mono text-xs"
            />
          </div>
        </div>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Supabase</CardTitle>
        </CardHeader>
        <div className="flex items-center justify-between p-3 rounded-lg bg-cream dark:bg-stone-900 border border-border text-sm">
          <div className="flex items-center gap-2">
            <span
              className={`w-2 h-2 rounded-full ${supabaseConnected ? 'bg-emerald-600' : 'bg-orange-600'}`}
            />
            <span>
              {supabaseConnected
                ? 'Conectado — realtime ativo'
                : 'Modo local — configure as variáveis na Vercel'}
            </span>
          </div>
        </div>
        <p className="text-xs text-stone-500 mt-3">
          Use <code className="font-mono">NEXT_PUBLIC_SUPABASE_URL</code> e{' '}
          <code className="font-mono">NEXT_PUBLIC_SUPABASE_ANON_KEY</code>.
        </p>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Links de avaliação</CardTitle>
        </CardHeader>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {tables.map((table) => {
            const url = `/evaluate/${RESTAURANT_DEMO.slug}/${table.number}`;
            return (
              <div
                key={table.id}
                className="flex items-center justify-between p-2.5 rounded-lg border border-border text-xs"
              >
                <div className="min-w-0">
                  <span className="font-medium">Mesa {table.number}</span>
                  <span className="font-mono text-stone-400 ml-2">{url}</span>
                </div>
                <div className="flex items-center gap-0.5 shrink-0">
                  <button
                    onClick={() => copyToClipboard(`${window.location.origin}${url}`, table.id)}
                    className="p-1 rounded-md hover:bg-cream dark:hover:bg-stone-800 text-stone-500"
                  >
                    {copiedLink === table.id ? (
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-700" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                  <Link
                    href={url}
                    target="_blank"
                    className="p-1 rounded-md hover:bg-cream dark:hover:bg-stone-800 text-stone-500"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Dispositivos ESP32</CardTitle>
        </CardHeader>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          {tables.map((table) => (
            <div
              key={table.id}
              className="flex items-center justify-between p-2.5 rounded-lg border border-border"
            >
              <span className="font-medium">Mesa {table.number}</span>
              <span className="font-mono text-stone-500">
                MESA-{table.number.padStart(3, '0')}-ESP32
              </span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

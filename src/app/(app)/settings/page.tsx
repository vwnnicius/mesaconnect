'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import {
  Settings as SettingsIcon,
  QrCode,
  Cpu,
  Database,
  ExternalLink,
  ShieldCheck,
  CheckCircle,
  Copy,
} from 'lucide-react';
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
    <div className="space-y-8 max-w-4xl">
      {/* Header */}
      <div className="pb-2 border-b border-zinc-200/80 dark:border-zinc-800">
        <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
          Administração
        </span>
        <h1 className="text-2xl md:text-3xl font-black tracking-tight text-zinc-900 dark:text-zinc-50">
          Configurações do Restaurante
        </h1>
        <p className="text-sm text-zinc-500 mt-1">
          Gerenciamento de unidades, QR Codes de mesas e vinculação de dispositivos ESP32.
        </p>
      </div>

      {/* Dados do Restaurante */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <SettingsIcon className="w-4 h-4 text-zinc-500" />
            Dados Cadastrais
          </CardTitle>
        </CardHeader>
        <div className="space-y-4 pt-2 text-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-500 mb-1">
                Nome do Estabelecimento
              </label>
              <input
                type="text"
                disabled
                value={RESTAURANT_DEMO.name}
                className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-500 mb-1">
                Slug do Restaurante (Identificador QR Code)
              </label>
              <input
                type="text"
                disabled
                value={RESTAURANT_DEMO.slug}
                className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 font-mono"
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Status da Conexão Supabase */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <Database className="w-4 h-4 text-zinc-500" />
            Conexão com o Supabase (PostgreSQL & Realtime)
          </CardTitle>
        </CardHeader>
        <div className="pt-2 text-xs space-y-3">
          <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800">
            <div className="flex items-center gap-2">
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  supabaseConnected ? 'bg-emerald-500' : 'bg-amber-500'
                }`}
              />
              <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                {supabaseConnected
                  ? 'Supabase Conectado e Operacional'
                  : 'Modo de Demonstração / Local Ativo (Supabase não configurado nas variáveis .env)'}
              </span>
            </div>
            <span className="font-mono text-zinc-500">
              {supabaseConnected ? 'Produção' : 'Fallback Local'}
            </span>
          </div>

          <p className="text-zinc-500">
            Para sincronizar com seu projeto Supabase em nuvem, adicione{' '}
            <code className="bg-zinc-100 dark:bg-zinc-800 px-1 py-0.5 rounded text-zinc-800 dark:text-zinc-200">
              NEXT_PUBLIC_SUPABASE_URL
            </code>{' '}
            e{' '}
            <code className="bg-zinc-100 dark:bg-zinc-800 px-1 py-0.5 rounded text-zinc-800 dark:text-zinc-200">
              NEXT_PUBLIC_SUPABASE_ANON_KEY
            </code>{' '}
            no arquivo <code className="font-bold">.env.local</code> ou no painel da Vercel.
          </p>
        </div>
      </Card>

      {/* QR Codes das Mesas */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <QrCode className="w-4 h-4 text-zinc-500" />
            Links e QR Codes de Avaliação das Mesas
          </CardTitle>
        </CardHeader>

        <div className="pt-2 space-y-2">
          <p className="text-xs text-zinc-500 mb-3">
            Links diretos para impressão em adesivos ou displays acrílicos de mesa:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {tables.map((table) => {
              const url = `/evaluate/${RESTAURANT_DEMO.slug}/${table.number}`;
              return (
                <div
                  key={table.id}
                  className="flex items-center justify-between p-2.5 rounded-xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-zinc-900 dark:text-zinc-100">
                      Mesa {table.number}
                    </span>
                    <span className="font-mono text-[10px] text-zinc-400">
                      {url}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() =>
                        copyToClipboard(`${window.location.origin}${url}`, table.id)
                      }
                      title="Copiar link da mesa"
                      className="p-1 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500"
                    >
                      {copiedLink === table.id ? (
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                    <Link
                      href={url}
                      target="_blank"
                      title="Abrir página da mesa"
                      className="p-1 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </Card>

      {/* Dispositivos ESP32 Pareados */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <Cpu className="w-4 h-4 text-zinc-500" />
            Dispositivos de Hardware Pareados (ESP32)
          </CardTitle>
        </CardHeader>
        <div className="pt-2 text-xs space-y-3">
          <p className="text-zinc-500">
            Cada placa física com botão possui um identificador único de fábrica (device_uid).
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {tables.map((table) => (
              <div
                key={table.id}
                className="flex items-center justify-between p-2.5 rounded-xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50"
              >
                <div className="flex items-center gap-2">
                  <span className="font-bold text-zinc-800 dark:text-zinc-200">
                    Mesa {table.number}
                  </span>
                  <span className="font-mono text-[10px] text-zinc-500">
                    MESA-{table.number.padStart(3, '0')}-ESP32
                  </span>
                </div>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                  Online
                </span>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}

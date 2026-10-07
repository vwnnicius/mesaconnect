'use client';

import { useState, useEffect, useCallback } from 'react';
import { Table, TableStatus } from '@/types';
import { getTables, updateTableStatus } from '@/services/tablesService';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';
import { inMemoryStore } from '@/services/mockStore';
import { RESTAURANT_DEMO } from '@/lib/constants';

export function useTables(restaurantId: string = RESTAURANT_DEMO.id) {
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTables = useCallback(async () => {
    try {
      const data = await getTables(restaurantId);
      setTables(data);
    } catch (err) {
      console.error('Erro ao buscar mesas:', err);
    } finally {
      setLoading(false);
    }
  }, [restaurantId]);

  useEffect(() => {
    fetchTables();

    // 1. Escuta alterações locais (Simulador e modo demo)
    const unsubscribeStore = inMemoryStore.subscribe(() => {
      fetchTables();
    });

    // 2. Se Supabase configurado, escuta via Supabase Realtime
    if (isSupabaseConfigured()) {
      const supabase = createClient();
      const channel = supabase
        .channel('realtime_tables')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'tables',
            filter: `restaurant_id=eq.${restaurantId}`,
          },
          () => {
            fetchTables();
          }
        )
        .subscribe();

      return () => {
        unsubscribeStore();
        supabase.removeChannel(channel);
      };
    }

    return () => {
      unsubscribeStore();
    };
  }, [fetchTables, restaurantId]);

  const setStatus = async (tableId: string, status: TableStatus) => {
    setTables((prev) =>
      prev.map((t) => (t.id === tableId ? { ...t, status } : t))
    );
    await updateTableStatus(tableId, status);
    fetchTables();
  };

  return {
    tables,
    loading,
    refresh: fetchTables,
    setStatus,
  };
}

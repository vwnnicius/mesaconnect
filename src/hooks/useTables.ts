'use client';

import { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { Table, TableStatus } from '@/types';
import { getTables, updateTableStatus } from '@/services/tablesService';
import { inMemoryStore } from '@/services/mockStore';
import { subscribeTableChanges } from '@/lib/realtime';
import { RESTAURANT_DEMO } from '@/lib/constants';

export type TablesApi = {
  tables: Table[];
  loading: boolean;
  refresh: () => Promise<void>;
  setStatus: (tableId: string, status: TableStatus) => Promise<void>;
};

export const TablesContext = createContext<TablesApi | null>(null);

export function useTablesState(restaurantId: string = RESTAURANT_DEMO.id): TablesApi {
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

    const unsubscribeStore = inMemoryStore.subscribe(() => {
      fetchTables();
    });

    const unsubscribeRealtime = subscribeTableChanges(
      'tables',
      `restaurant_id=eq.${restaurantId}`,
      fetchTables
    );

    return () => {
      unsubscribeStore();
      unsubscribeRealtime();
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

export function useTables(): TablesApi {
  const ctx = useContext(TablesContext);
  if (ctx) return ctx;
  throw new Error('useTables deve ser usado dentro de TablesProvider');
}

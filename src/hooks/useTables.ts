"use client";

import {
  useState,
  useEffect,
  useCallback,
  createContext,
  useContext,
  useRef,
} from "react";
import { Table, TableStatus } from "@/types";
import { getTables, updateTableStatus } from "@/services/tablesService";
import { inMemoryStore } from "@/services/mockStore";
import { subscribeTableChanges, type LiveStatus } from "@/lib/realtime";
import { RESTAURANT_DEMO } from "@/lib/constants";

export type TablesApi = {
  tables: Table[];
  liveStatus: LiveStatus;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  setStatus: (tableId: string, status: TableStatus) => Promise<void>;
};

export const TablesContext = createContext<TablesApi | null>(null);

export function useTablesState(
  restaurantId: string = RESTAURANT_DEMO.id,
): TablesApi {
  const [liveStatus, setLiveStatus] = useState<LiveStatus>("connecting");
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const generation = useRef(0);
  const fetchTables = useCallback(async () => {
    const request = ++generation.current;
    try {
      const data = await getTables(restaurantId);
      if (request !== generation.current) return;
      setTables(data);
      setError(null);
    } catch (err) {
      if (request !== generation.current) return;
      console.error("Erro ao buscar mesas:", err);
      setError("Não foi possível atualizar as mesas. Verifique a conexão.");
    } finally {
      if (request === generation.current) setLoading(false);
    }
  }, [restaurantId]);

  useEffect(() => {
    fetchTables();

    const unsubscribeStore = inMemoryStore.subscribe(() => {
      fetchTables();
    });

    const unsubscribeRealtime = subscribeTableChanges(
      "tables",
      `restaurant_id=eq.${restaurantId}`,
      fetchTables,
      setLiveStatus,
    );
    const unsubscribeCalls = subscribeTableChanges(
      "service_calls",
      `restaurant_id=eq.${restaurantId}`,
      fetchTables,
    );

    const currentGeneration = generation;
    return () => {
      currentGeneration.current++;
      unsubscribeStore();
      unsubscribeRealtime();
      unsubscribeCalls();
    };
  }, [fetchTables, restaurantId]);

  const setStatus = async (tableId: string, status: TableStatus) => {
    if (!(await updateTableStatus(tableId, status)))
      throw new Error("Não foi possível salvar a mesa.");
    await fetchTables();
  };

  return {
    tables,
    liveStatus,
    loading,
    error,
    refresh: fetchTables,
    setStatus,
  };
}

export function useTables(): TablesApi {
  const ctx = useContext(TablesContext);
  if (ctx) return ctx;
  throw new Error("useTables deve ser usado dentro de TablesProvider");
}

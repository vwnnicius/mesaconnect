"use client";

import {
  useState,
  useEffect,
  useCallback,
  createContext,
  useContext,
} from "react";
import { ServiceCall } from "@/types";
import {
  getActiveCalls,
  acknowledgeServiceCall,
  completeServiceCall,
} from "@/services/callsService";
import { inMemoryStore } from "@/services/mockStore";
import { subscribeTableChanges } from "@/lib/realtime";
import { RESTAURANT_DEMO } from "@/lib/constants";

export type CallsApi = {
  calls: ServiceCall[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  acknowledge: (callId: string) => Promise<void>;
  complete: (callId: string) => Promise<void>;
};

export const CallsContext = createContext<CallsApi | null>(null);

export function useCallsState(
  restaurantId: string = RESTAURANT_DEMO.id,
): CallsApi {
  const [calls, setCalls] = useState<ServiceCall[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCalls = useCallback(async () => {
    try {
      const data = await getActiveCalls(restaurantId);
      setCalls(data);
      setError(null);
    } catch (err) {
      console.error("Erro ao buscar chamados:", err);
      setError(
        "Não foi possível atualizar a fila. Verifique a conexão e tente novamente.",
      );
    } finally {
      setLoading(false);
    }
  }, [restaurantId]);

  useEffect(() => {
    fetchCalls();

    const unsubscribeStore = inMemoryStore.subscribe(() => {
      fetchCalls();
    });

    const unsubscribeRealtime = subscribeTableChanges(
      "service_calls",
      `restaurant_id=eq.${restaurantId}`,
      fetchCalls,
    );

    return () => {
      unsubscribeStore();
      unsubscribeRealtime();
    };
  }, [fetchCalls, restaurantId]);

  const acknowledge = async (callId: string) => {
    const saved = await acknowledgeServiceCall(callId);
    if (!saved) throw new Error("O chamado não pôde ser assumido.");
    await fetchCalls();
  };

  const complete = async (callId: string) => {
    const saved = await completeServiceCall(callId);
    if (!saved) throw new Error("O chamado não pôde ser concluído.");
    await fetchCalls();
  };

  return {
    calls,
    loading,
    error,
    refresh: fetchCalls,
    acknowledge,
    complete,
  };
}

export function useCalls(): CallsApi {
  const ctx = useContext(CallsContext);
  if (ctx) return ctx;
  throw new Error("useCalls deve ser usado dentro de CallsProvider");
}

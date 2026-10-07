'use client';

import { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { ServiceCall } from '@/types';
import {
  getActiveCalls,
  acknowledgeServiceCall,
  completeServiceCall,
} from '@/services/callsService';
import { inMemoryStore } from '@/services/mockStore';
import { subscribeTableChanges } from '@/lib/realtime';
import { RESTAURANT_DEMO } from '@/lib/constants';

export type CallsApi = {
  calls: ServiceCall[];
  loading: boolean;
  refresh: () => Promise<void>;
  acknowledge: (callId: string) => Promise<void>;
  complete: (callId: string) => Promise<void>;
};

export const CallsContext = createContext<CallsApi | null>(null);

export function useCallsState(restaurantId: string = RESTAURANT_DEMO.id): CallsApi {
  const [calls, setCalls] = useState<ServiceCall[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCalls = useCallback(async () => {
    try {
      const data = await getActiveCalls(restaurantId);
      setCalls(data);
    } catch (err) {
      console.error('Erro ao buscar chamados:', err);
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
      'service_calls',
      `restaurant_id=eq.${restaurantId}`,
      fetchCalls
    );

    return () => {
      unsubscribeStore();
      unsubscribeRealtime();
    };
  }, [fetchCalls, restaurantId]);

  const acknowledge = async (callId: string) => {
    setCalls((prev) =>
      prev.map((c) =>
        c.id === callId
          ? { ...c, status: 'ACKNOWLEDGED', acknowledged_at: new Date().toISOString() }
          : c
      )
    );
    await acknowledgeServiceCall(callId);
    fetchCalls();
  };

  const complete = async (callId: string) => {
    setCalls((prev) => prev.filter((c) => c.id !== callId));
    await completeServiceCall(callId);
    fetchCalls();
  };

  return {
    calls,
    loading,
    refresh: fetchCalls,
    acknowledge,
    complete,
  };
}

export function useCalls(): CallsApi {
  const ctx = useContext(CallsContext);
  if (ctx) return ctx;
  throw new Error('useCalls deve ser usado dentro de CallsProvider');
}

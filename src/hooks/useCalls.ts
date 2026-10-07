'use client';

import { useState, useEffect, useCallback } from 'react';
import { ServiceCall } from '@/types';
import {
  getActiveCalls,
  acknowledgeServiceCall,
  completeServiceCall,
} from '@/services/callsService';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';
import { inMemoryStore } from '@/services/mockStore';
import { RESTAURANT_DEMO } from '@/lib/constants';

export function useCalls(restaurantId: string = RESTAURANT_DEMO.id) {
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

    // 1. Escuta alterações locais (Simulador e modo demo)
    const unsubscribeStore = inMemoryStore.subscribe(() => {
      fetchCalls();
    });

    // 2. Se Supabase configurado, escuta via Supabase Realtime
    if (isSupabaseConfigured()) {
      const supabase = createClient();
      const channel = supabase
        .channel('realtime_calls')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'service_calls',
            filter: `restaurant_id=eq.${restaurantId}`,
          },
          () => {
            fetchCalls();
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
  }, [fetchCalls, restaurantId]);

  const acknowledge = async (callId: string) => {
    // Atualização otimista imediata na UI
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
    // Remoção otimista imediata da fila
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

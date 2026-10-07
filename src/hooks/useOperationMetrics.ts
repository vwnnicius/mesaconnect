"use client";
import { useCallback, useEffect, useState } from "react";
import { useWorkspace } from "@/providers/WorkspaceProvider";
import { createClient } from "@/lib/supabase/client";
import { getEvaluations } from "@/services/evaluationsService";
import { inMemoryStore } from "@/services/mockStore";
import { subscribeTableChanges } from "@/lib/realtime";
import { operationMetrics } from "@/lib/operation-metrics";
import type { ServiceCall, Evaluation } from "@/types";
export function useOperationMetrics(days = 1) {
  const { restaurant, demo, manager } = useWorkspace();
  const [calls, setCalls] = useState<ServiceCall[]>([]);
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const load = useCallback(async () => {
    if (!manager) {
      setLoading(false);
      return;
    }
    try {
      const since = new Date();
      since.setHours(0, 0, 0, 0);
      since.setDate(since.getDate() - days + 1);
      const iso = since.toISOString();
      let history: ServiceCall[];
      if (demo)
        history = inMemoryStore.getCalls().filter((c) => c.requested_at >= iso);
      else {
        const { data, error } = await createClient()
          .from("service_calls")
          .select("*")
          .eq("restaurant_id", restaurant.id)
          .gte("requested_at", iso)
          .order("requested_at")
          .limit(1000);
        if (error) throw error;
        history = data || [];
      }
      const feedback = await getEvaluations(restaurant.id);
      setCalls(history);
      setEvaluations(feedback.filter((e) => e.created_at >= iso));
      setError("");
    } catch {
      setError("Não foi possível atualizar os indicadores.");
    } finally {
      setLoading(false);
    }
  }, [restaurant.id, days, demo, manager]);
  useEffect(() => {
    void load();
    const one = subscribeTableChanges(
      "service_calls",
      `restaurant_id=eq.${restaurant.id}`,
      load,
    );
    const two = subscribeTableChanges(
      "evaluations",
      `restaurant_id=eq.${restaurant.id}`,
      load,
    );
    const three = inMemoryStore.subscribe(() => void load());
    return () => {
      one();
      two();
      three();
    };
  }, [load, restaurant.id]);
  return {
    calls,
    evaluations,
    metrics: operationMetrics(calls, evaluations),
    loading,
    error,
  };
}

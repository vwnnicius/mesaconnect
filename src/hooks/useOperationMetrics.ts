"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { useWorkspace } from "@/providers/WorkspaceProvider";
import { createClient } from "@/lib/supabase/client";
import { subscribeTableChanges } from "@/lib/realtime";
import { operationMetrics } from "@/lib/operation-metrics";
import { reportBounds } from "@/lib/report-period";
import { inMemoryStore } from "@/services/mockStore";
export type StaffRank = {
  id: string;
  name: string;
  accepted: number;
  completed: number;
  response: number | null;
  median: number | null;
  sla: number | null;
};
type Report = ReturnType<typeof operationMetrics> & {
  feedback_count: number;
  ranks: StaffRank[];
};
const empty: Report = {
  ...operationMetrics([], []),
  feedback_count: 0,
  ranks: [],
};
export function useOperationMetrics(
  days = 1,
  month?: string,
  employee?: string,
) {
  const w = useWorkspace();
  const [metrics, setMetrics] = useState<Report>(empty);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const sequence = useRef(0);
  const load = useCallback(async () => {
    const seq = ++sequence.current;
    if (!w.manager) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const bounds = reportBounds(days, month);
      let report: Report;
      if (w.demo) {
        const calls = inMemoryStore
          .getCalls()
          .filter(
            (c) =>
              (!bounds.started || c.requested_at >= bounds.started) &&
              (!bounds.ended || c.requested_at < bounds.ended) &&
              (!employee || c.acknowledged_by === employee),
          );
        const feedback = inMemoryStore
          .getEvaluations()
          .filter(
            (e) =>
              (!bounds.started || e.created_at >= bounds.started) &&
              (!bounds.ended || e.created_at < bounds.ended),
          );
        report = {
          ...operationMetrics(calls, feedback),
          feedback_count: feedback.length,
          ranks: [],
        };
      } else {
        const { data, error } = await createClient().rpc("operational_report", {
          unit: w.restaurant.id,
          ...bounds,
          ...(employee ? { employee } : {}),
        });
        if (error || !data) throw error;
        report = data as unknown as Report;
      }
      if (seq === sequence.current) {
        setMetrics(report);
        setError("");
      }
    } catch {
      if (seq === sequence.current)
        setError("Não foi possível atualizar os indicadores.");
    } finally {
      if (seq === sequence.current) setLoading(false);
    }
  }, [w.restaurant.id, w.manager, w.demo, days, month, employee]);
  useEffect(() => {
    const requestSequence = sequence;
    void load();
    const one = subscribeTableChanges(
      "service_calls",
      `restaurant_id=eq.${w.restaurant.id}`,
      () => void load(),
    );
    const two = subscribeTableChanges(
      "evaluations",
      `restaurant_id=eq.${w.restaurant.id}`,
      () => void load(),
    );
    return () => {
      requestSequence.current++;
      one();
      two();
    };
  }, [load, w.restaurant.id]);
  return {
    metrics,
    feedbackCount: metrics.feedback_count,
    ranks: metrics.ranks,
    loading,
    error,
  };
}

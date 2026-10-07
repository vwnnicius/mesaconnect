"use client";
import { useEffect, useState, useCallback } from "react";
import { useWorkspace } from "@/providers/WorkspaceProvider";
import { useTables } from "./useTables";
import { defaultLayout, type FloorLayout } from "@/lib/floor-layout";
import { loadLayout, saveLayout } from "@/services/workspaceService";
export function useFloorLayout() {
  const { restaurant } = useWorkspace();
  const { tables, loading: tablesLoading } = useTables();
  const numbers = tables.map((table) => table.number).join(",");
  const [layout, setLayout] = useState<FloorLayout>(defaultLayout([]));
  const [version, setVersion] = useState<string>();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const value = await loadLayout(
        restaurant.id,
        numbers ? numbers.split(",") : [],
      );
      setLayout(value.layout);
      setVersion(value.updatedAt);
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar salão");
    } finally {
      setLoading(false);
    }
  }, [numbers, restaurant.id]);
  useEffect(() => {
    if (!tablesLoading) void reload();
  }, [reload, tablesLoading]);
  const save = async (value: FloorLayout) => {
    const updated = await saveLayout(restaurant.id, value, version);
    setVersion(updated);
    setLayout(value);
  };
  return {
    layout,
    setLayout,
    save,
    reload,
    error,
    loading: loading || tablesLoading,
  };
}

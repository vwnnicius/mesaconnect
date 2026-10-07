"use client";

import type { ReactNode } from "react";
import { CallsContext, useCallsState } from "@/hooks/useCalls";
import { TablesContext, useTablesState } from "@/hooks/useTables";
import { useWorkspace } from "./WorkspaceProvider";

function CallsProvider({ children }: { children: ReactNode }) {
  const { restaurant } = useWorkspace();
  const value = useCallsState(restaurant.id);
  return (
    <CallsContext.Provider value={value}>{children}</CallsContext.Provider>
  );
}

function TablesProvider({ children }: { children: ReactNode }) {
  const { restaurant } = useWorkspace();
  const value = useTablesState(restaurant.id);
  return (
    <TablesContext.Provider value={value}>{children}</TablesContext.Provider>
  );
}

export function RestaurantDataProvider({ children }: { children: ReactNode }) {
  return (
    <CallsProvider>
      <TablesProvider>{children}</TablesProvider>
    </CallsProvider>
  );
}

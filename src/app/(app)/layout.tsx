import React from "react";
import { AppShell } from "@/components/layout/AppShell";
import { RestaurantDataProvider } from "@/providers/RestaurantDataProvider";
import { WorkspaceProvider } from "@/providers/WorkspaceProvider";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <WorkspaceProvider>
      <RestaurantDataProvider>
        <AppShell>{children}</AppShell>
      </RestaurantDataProvider>
    </WorkspaceProvider>
  );
}

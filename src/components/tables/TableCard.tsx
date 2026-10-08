"use client";

import React, { useState } from "react";
import { TableNotes } from "./TableNotes";
import { useTables } from "@/hooks/useTables";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { Table } from "@/types";
import { TABLE_STATUS_CONFIG } from "@/lib/constants";
import { useWorkspace } from "@/providers/WorkspaceProvider";
import { StatusDot } from "@/components/ui/StatusDot";
import { useElapsedTime } from "@/hooks/useElapsedTime";
import { QrCode } from "lucide-react";
import { cn } from "@/lib/utils";

interface TableCardProps {
  table: Table;
}

export function TableCard({ table }: TableCardProps) {
  const { restaurant, manager, demo } = useWorkspace();
  const { refresh } = useTables();
  const [expanded, setExpanded] = useState(false);
  const [error, setError] = useState("");
  const config =
    TABLE_STATUS_CONFIG[table.status] || TABLE_STATUS_CONFIG.AVAILABLE;
  const hasActiveCall =
    table.status === "CALLING" || table.status === "ACKNOWLEDGED";
  const { elapsed } = useElapsedTime(table.active_call_requested_at);

  return (
    <div
      className={cn(
        "mesa-card relative rounded-box border p-5 flex flex-col justify-between bg-card border-border min-h-[168px]",
        table.status === "CALLING" && "border-amber-300 dark:border-amber-800",
      )}
    >
      <div>
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <span className="text-[11px] font-medium text-muted-foreground">
            Mesa
          </span>
          <StatusDot status={table.status} size="sm" />
        </div>
        <div className="flex items-baseline justify-between">
          <h3 className="text-4xl font-medium tabular-nums tracking-[-0.04em] text-foreground">
            {table.number}
          </h3>
          {hasActiveCall ? (
            <span className="font-mono text-xs tabular-nums text-foreground">
              {elapsed}
            </span>
          ) : null}
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-black/5 dark:border-white/10 flex items-center justify-between text-xs text-muted-foreground">
        <span className="truncate pr-2">{config.description}</span>
        <Link
          href={`/evaluate/${restaurant.slug}/${table.number}`}
          target="_blank"
          title="Página de avaliação desta mesa"
          aria-label={`Abrir avaliação da mesa ${table.number}`}
          className="p-3 -mr-2 rounded-lg hover:bg-background text-muted-foreground"
        >
          <QrCode className="w-4 h-4" />
        </Link>
      </div>
      {table.priority && <p className="priority-tag">Prioridade</p>}
      {manager && (
        <label className="priority-control">
          <input
            type="checkbox"
            checked={Boolean(table.priority)}
            disabled={demo}
            onChange={async (e) => {
              const { error } = await createClient()
                .from("tables")
                .update({ priority: e.target.checked })
                .eq("id", table.id);
              if (error) setError("Não foi possível alterar prioridade.");
              else {
                setError("");
                await refresh();
              }
            }}
          />
          Priorizar atendimento
        </label>
      )}
      <details
        className="table-notes-toggle"
        onToggle={(e) => setExpanded(e.currentTarget.open)}
      >
        <summary>Observações da mesa</summary>
        {expanded && <TableNotes tableId={table.id} number={table.number} />}
      </details>
      {error && <p role="alert">{error}</p>}
    </div>
  );
}

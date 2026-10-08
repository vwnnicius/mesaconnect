"use client";

import React, { useState } from "react";
import { ServiceCall } from "@/types";
import { useElapsedTime } from "@/hooks/useElapsedTime";
import { TableNotes } from "@/components/tables/TableNotes";
import { ArrowRight } from "lucide-react";
import { useWorkspace } from "@/providers/WorkspaceProvider";

interface CallCardProps {
  call: ServiceCall;
  priority?: boolean;
  onAcknowledge: (id: string) => Promise<void>;
  onComplete: (id: string) => Promise<void>;
}

export function CallCard({
  call,
  priority,
  onAcknowledge,
  onComplete,
}: CallCardProps) {
  const { profile, members, manager, demo } = useWorkspace();
  const canAct =
    call.status === "CALLING" ||
    manager ||
    call.acknowledged_by === profile.id ||
    demo;
  const owner = members.find((m) => m.id === call.acknowledged_by)?.name;
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isCalling = call.status === "CALLING";
  const { elapsed, isUrgent } = useElapsedTime(
    isCalling ? call.requested_at : call.acknowledged_at || call.requested_at,
  );
  const handleAction = async () => {
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      await (isCalling ? onAcknowledge(call.id) : onComplete(call.id));
    } catch {
      setError("Não foi possível salvar. Atualize a fila e tente novamente.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      className="call-row"
      data-status={call.status}
      data-urgent={isCalling && isUrgent}
    >
      <div className="call-row-main">
        <div>
          <p className="call-row-state">
            <span className="call-row-marker" />
            {isCalling ? "Aguardando atendimento" : "Em atendimento"}
          </p>
          <h2>Mesa {call.table_number || "—"}</h2>
        </div>
        <div className="call-row-time">
          <span>
            {isCalling
              ? isUrgent
                ? "Espera prolongada"
                : "Esperando há"
              : "Atendendo há"}
          </span>
          <strong>{elapsed}</strong>
        </div>
      </div>
      {priority && <p className="priority-tag">Atendimento prioritário</p>}
      <p className="call-meta">
        {isCalling
          ? "Pedido de atendimento"
          : call.acknowledged_by === profile.id
            ? "Você está atendendo esta mesa."
            : owner
              ? `${owner} está atendendo.`
              : "Atendimento em andamento"}
      </p>
      {canAct && (
        <button
          type="button"
          className={isCalling ? "action-solid" : "action-outline"}
          disabled={busy}
          onClick={handleAction}
          aria-label={
            isCalling
              ? `Atender mesa ${call.table_number || ""}`
              : `Concluir atendimento da mesa ${call.table_number || ""}`
          }
        >
          {busy
            ? "Salvando…"
            : isCalling
              ? "Atender agora"
              : "Concluir atendimento"}
          <ArrowRight size={14} />
        </button>
      )}
      <details className="call-details">
        <summary>Detalhes do chamado</summary>
        <div className="call-timeline">
          <p>
            Cliente chamou
            <span>
              {new Date(call.requested_at).toLocaleTimeString("pt-BR", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </p>
          <p>
            Garçom confirmou
            <span>
              {call.acknowledged_at
                ? new Date(call.acknowledged_at).toLocaleTimeString("pt-BR", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "Aguardando"}
            </span>
          </p>
          <p>
            Atendimento concluído
            <span>{call.completed_at ? "Concluído" : "Pendente"}</span>
          </p>
        </div>
        <TableNotes tableId={call.table_id} number={call.table_number || ""} />
      </details>
      {error ? (
        <p role="alert" className="text-xs text-red-700 dark:text-red-300 mt-3">
          {error}
        </p>
      ) : null}
    </div>
  );
}

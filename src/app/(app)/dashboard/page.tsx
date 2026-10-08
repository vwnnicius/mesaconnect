"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useCalls } from "@/hooks/useCalls";
import { useTables } from "@/hooks/useTables";
import { useFloorLayout } from "@/hooks/useFloorLayout";
import { useOperationMetrics } from "@/hooks/useOperationMetrics";
import { useWorkspace } from "@/providers/WorkspaceProvider";
import { FloorPlan } from "@/components/tables/FloorPlan";
import { CallCard } from "@/components/calls/CallCard";
import { operationalTime } from "@/lib/operational-time";
export default function DashboardPage() {
  const { calls, loading, error, acknowledge, complete } = useCalls();
  const { tables } = useTables();
  const floor = useFloorLayout();
  const w = useWorkspace();
  const history = useOperationMetrics();
  const [selected, setSelected] = useState("");
  const router = useRouter();
  useEffect(() => {
    if (!w.manager) router.replace("/calls");
  }, [w.manager, router]);
  const queue = calls.filter(
    (c) =>
      !selected || tables.find((t) => t.id === c.table_id)?.number === selected,
  );
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Bom dia" : hour < 18 ? "Boa tarde" : "Boa noite";
  const m = history.metrics;
  if (!w.manager) return <p role="status">Abrindo seus chamados…</p>;
  return (
    <div className="space-y-6">
      <div className="dashboard-greeting">
        <h1>
          {greeting}, {w.profile.name.split(" ")[0]}.
        </h1>
        <p>
          {loading
            ? "Conferindo o salão…"
            : error
              ? "Não foi possível conferir o salão."
              : calls.filter((c) => c.status === "CALLING").length
                ? `${calls.filter((c) => c.status === "CALLING").length} mesa(s) precisam de atenção.`
                : "Seu salão está tranquilo."}
        </p>
      </div>
      <div className="dashboard-metrics">
        <div>
          <span>Chamados hoje</span>
          <strong>{history.loading ? "—" : m.total}</strong>
          <small>{m.completed} atendimentos concluídos</small>
        </div>
        <div>
          <span>Tempo médio de resposta</span>
          <strong>{history.loading ? "—" : operationalTime(m.response)}</strong>
          <small>Da solicitação ao aceite</small>
        </div>
        <div>
          <span>Nota média</span>
          <strong>
            {m.rating === null ? "—" : m.rating.toFixed(1).replace(".", ",")}
          </strong>
          <small>{history.feedbackCount} avaliações hoje</small>
        </div>
        <div>
          <span>Tempo médio de atendimento</span>
          <strong>{history.loading ? "—" : operationalTime(m.duration)}</strong>
          <small>Do aceite à conclusão</small>
        </div>
      </div>
      {(error || history.error || floor.error) && (
        <p role="alert" className="form-error">
          {error || history.error || floor.error}
        </p>
      )}
      <div className="dashboard-grid">
        <section className="surface">
          <div className="section-heading">
            <h2>Status das mesas</h2>
            <Link href="/tables">Personalizar salão →</Link>
          </div>
          <FloorPlan
            tables={tables}
            layout={floor.layout}
            selected={selected}
            onSelect={(n) => setSelected(n === selected ? "" : n)}
            compact
          />
        </section>
        <section className="surface">
          <div className="section-heading">
            <h2>
              {selected
                ? `Chamados · Mesa ${selected}`
                : "Chamados em andamento"}
            </h2>
            <Link href="/calls">Ver todos →</Link>
          </div>
          <div className="calls-list">
            {loading ? (
              <p>Carregando…</p>
            ) : queue.length ? (
              queue
                .slice(0, 3)
                .map((c) => (
                  <CallCard
                    key={c.id}
                    call={c}
                    onAcknowledge={acknowledge}
                    onComplete={complete}
                  />
                ))
            ) : (
              <p className="section-description">
                Tudo em ordem. Quando uma mesa chamar, ela aparece aqui.
              </p>
            )}
          </div>
        </section>
      </div>
      <section className="surface">
        <div className="section-heading">
          <h2>Movimento de hoje</h2>
          <Link href="/analytics">Ver relatórios →</Link>
        </div>
        <div className="analytics-chart">
          {m.hours.map((h) => (
            <div className="analytics-bar" key={h.hour}>
              <small>{h.calls}</small>
              <div>
                <i
                  style={{
                    height: `${(h.calls / Math.max(1, ...m.hours.map((v) => v.calls))) * 100}%`,
                  }}
                />
              </div>
              <span>{h.hour % 3 === 0 ? `${h.hour}h` : ""}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

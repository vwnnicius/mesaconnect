"use client";
import { useState } from "react";
import { useOperationMetrics } from "@/hooks/useOperationMetrics";
import { useWorkspace } from "@/providers/WorkspaceProvider";
import { PageHeader } from "@/components/ui/PageHeader";
export default function AnalyticsPage() {
  const [days, setDays] = useState(1);
  const { metrics: m, evaluations, loading, error } = useOperationMetrics(days);
  const { manager } = useWorkspace();
  if (!manager) return <p>Relatórios disponíveis para a administração.</p>;
  const time = (n: number | null) =>
    n === null ? "—" : `${(n / 60).toFixed(1).replace(".", ",")} min`;
  return (
    <div className="space-y-6">
      <PageHeader
        title="Relatórios"
        description="Indicadores calculados a partir dos atendimentos desta unidade."
        actions={
          <select
            className="action-outline"
            aria-label="Período dos relatórios"
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
          >
            <option value={1}>Hoje</option>
            <option value={7}>Últimos 7 dias</option>
            <option value={30}>Últimos 30 dias</option>
          </select>
        }
      />
      {error && (
        <p role="alert" className="form-error">
          {error}
        </p>
      )}
      {loading && <p role="status">Atualizando indicadores…</p>}
      <div className="dashboard-metrics">
        <div>
          <span>Chamados</span>
          <strong>{m.total}</strong>
          <small>{m.completed} concluídos</small>
        </div>
        <div>
          <span>Resposta média</span>
          <strong>{time(m.response)}</strong>
          <small>Até o aceite</small>
        </div>
        <div>
          <span>Mediana de resposta</span>
          <strong>{time(m.median)}</strong>
          <small>Metade dos aceites abaixo desse tempo</small>
        </div>
        <div>
          <span>Duração média</span>
          <strong>{time(m.duration)}</strong>
          <small>Do aceite à conclusão</small>
        </div>
      </div>
      <div className="evaluation-summary">
        <section className="surface">
          <h2>Chamados por hora</h2>
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
          <p className="section-description">
            Horários exibidos no fuso do seu dispositivo.
          </p>
        </section>
        <section className="surface rating-average">
          <h2>A experiência do cliente</h2>
          <strong>
            {m.rating === null ? "—" : m.rating.toFixed(1).replace(".", ",")}
          </strong>
          <p>{evaluations.length} avaliações no período</p>
          <p className="mt-4">
            {m.sla === null
              ? "Ainda não há aceites suficientes para medir o prazo."
              : `${m.sla}% dos chamados foram assumidos em até 2 minutos.`}
          </p>
        </section>
      </div>
      <p className="section-description">
        Médias consideram apenas etapas concluídas. O período mostra até 10.000
        chamados; volumes maiores exigem agregação no banco.
      </p>
    </div>
  );
}

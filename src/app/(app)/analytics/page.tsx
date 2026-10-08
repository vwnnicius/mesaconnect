"use client";
import { useState } from "react";
import { useOperationMetrics } from "@/hooks/useOperationMetrics";
import { useWorkspace } from "@/providers/WorkspaceProvider";
import { PageHeader } from "@/components/ui/PageHeader";
import { operationalTime } from "@/lib/operational-time";
export default function AnalyticsPage() {
  const [days, setDays] = useState(1);
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const [employee, setEmployee] = useState("");
  const {
    metrics: m,
    feedbackCount,
    ranks,
    loading,
    error,
  } = useOperationMetrics(days, month, employee);
  const { manager, members } = useWorkspace();
  if (!manager) return <p>Relatórios disponíveis para a administração.</p>;
  const time = operationalTime;
  const peak = m.hours.reduce((a, b) => (b.calls > a.calls ? b : a), {
    hour: 0,
    calls: 0,
  });
  return (
    <div className="space-y-6">
      <PageHeader
        title="Insights"
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
            <option value={-1}>Por mês</option>
            <option value={0}>Todo o histórico</option>
          </select>
        }
      />
      <div className="report-filters">
        {days === -1 && (
          <label>
            Mês
            <input
              type="month"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
            />
          </label>
        )}
        <label>
          Funcionário
          <select
            aria-label="Funcionário nos relatórios"
            value={employee}
            onChange={(e) => setEmployee(e.target.value)}
          >
            <option value="">Toda a equipe</option>
            {members.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
        </label>
      </div>
      {error && (
        <p role="alert" className="form-error">
          {error}
        </p>
      )}
      {loading && <p role="status">Atualizando indicadores…</p>}
      {!loading && !error && (
        <section className="surface">
          <h2>
            {m.total
              ? "O atendimento neste período"
              : "Ainda sem atendimentos neste período."}
          </h2>
          {m.response !== null && (
            <p className="mt-3">
              Seus clientes esperaram em média{" "}
              <strong>{time(m.response)}</strong> até a equipe assumir o
              chamado.
            </p>
          )}
          {peak.calls > 0 && (
            <p className="mt-3">
              <strong>
                {peak.hour}h–{peak.hour + 1}h
              </strong>{" "}
              foi um dos horários de maior demanda, com {peak.calls} chamado(s).
            </p>
          )}
          {m.sla !== null && (
            <p className="mt-3">
              Entre os chamados assumidos, <strong>{m.sla}%</strong> receberam
              resposta em até 2 minutos.
            </p>
          )}
        </section>
      )}
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
          <p className="section-description">Horários de Brasília.</p>
        </section>
        <section className="surface rating-average">
          <h2>A experiência do cliente</h2>
          <strong>
            {m.rating === null ? "—" : m.rating.toFixed(1).replace(".", ",")}
          </strong>
          <p>{feedbackCount} avaliações no período</p>
          <p className="mt-4">
            {m.sla === null
              ? "Ainda não há aceites suficientes para medir o prazo."
              : `${m.sla}% dos chamados assumidos receberam resposta em até 2 minutos.`}
          </p>
        </section>
      </div>
      <section className="surface">
        <h2>Ranking de atendimento</h2>
        <p className="section-description">
          Ordem: prazo de até 2 minutos, mediana de resposta e conclusões.
          Mínimo de 3 aceites para comparação. É um indicador operacional, não
          uma avaliação automática das pessoas.
        </p>
        <div className="rank-list">
          {ranks.map((r, i) => (
            <article key={r.id}>
              <span>
                {r.accepted >= 3 ? String(i + 1).padStart(2, "0") : "—"}
              </span>
              <div>
                <strong>{r.name}</strong>
                <small>
                  {r.completed} concluídos · {r.accepted} aceites
                </small>
              </div>
              <div>
                <strong>{r.sla === null ? "—" : `${r.sla}% no prazo`}</strong>
                <small>
                  {r.accepted < 3
                    ? "Amostra insuficiente"
                    : `Mediana ${time(r.median)}`}
                </small>
              </div>
            </article>
          ))}
        </div>
        {!ranks.length && <p>Nenhum garçom cadastrado.</p>}
      </section>
      <p className="section-description">
        Métricas agregadas no banco sobre todo o período. Atribuição por
        funcionário segue quem assumiu o chamado. Avaliações sem vínculo a um
        atendimento permanecem apenas no relatório geral.
      </p>
    </div>
  );
}

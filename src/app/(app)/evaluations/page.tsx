"use client";
import { useEffect, useState } from "react";
import { Star } from "lucide-react";
import { getEvaluations } from "@/services/evaluationsService";
import { useWorkspace } from "@/providers/WorkspaceProvider";
import { subscribeTableChanges } from "@/lib/realtime";
import { PageHeader } from "@/components/ui/PageHeader";
import type { Evaluation } from "@/types";
export default function EvaluationsPage() {
  const { restaurant, manager } = useWorkspace();
  const [rows, setRows] = useState<Evaluation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState(0);
  const [comments, setComments] = useState(false);
  const [ascending, setAscending] = useState(false);
  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const data = await getEvaluations(restaurant.id);
        if (active) {
          setRows(data);
          setError("");
        }
      } catch {
        if (active) setError("Não foi possível carregar as avaliações.");
      } finally {
        if (active) setLoading(false);
      }
    };
    if (manager) void load();
    else setLoading(false);
    const stop = subscribeTableChanges(
      "evaluations",
      `restaurant_id=eq.${restaurant.id}`,
      load,
    );
    return () => {
      active = false;
      stop();
    };
  }, [restaurant.id, manager]);
  if (!manager) return <p>Avaliações disponíveis para a administração.</p>;
  const avg = rows.length
    ? (rows.reduce((sum, r) => sum + r.rating, 0) / rows.length)
        .toFixed(1)
        .replace(".", ",")
    : "—";
  const visible = rows
    .filter(
      (r) => (!filter || r.rating === filter) && (!comments || !!r.comment),
    )
    .sort((a, b) =>
      ascending
        ? a.created_at.localeCompare(b.created_at)
        : b.created_at.localeCompare(a.created_at),
    );
  return (
    <div className="space-y-6">
      <PageHeader
        title="Avaliações"
        description="Escute seus clientes e encontre oportunidades de melhorar o atendimento."
      />
      <div className="evaluation-summary">
        <section className="surface rating-average">
          <h2>Nota média</h2>
          <strong>
            {avg}
            <span className="text-sm text-muted-foreground ml-3">de 5,0</span>
          </strong>
          <p>{rows.length} avaliações no total</p>
        </section>
        <section className="surface rating-distribution">
          <h2>Distribuição das avaliações</h2>
          {[5, 4, 3, 2, 1].map((n) => {
            const count = rows.filter((r) => r.rating === n).length;
            return (
              <div key={n}>
                <span>
                  {n} {n === 1 ? "estrela" : "estrelas"}
                </span>
                <progress
                  aria-label={`${n} estrelas: ${count} avaliações`}
                  max={Math.max(1, rows.length)}
                  value={count}
                />
                <span>
                  {count} (
                  {rows.length ? Math.round((count / rows.length) * 100) : 0}%)
                </span>
              </div>
            );
          })}
        </section>
      </div>
      <section className="surface">
        <div
          className="workspace-tabs"
          role="group"
          aria-label="Filtrar avaliações"
        >
          {[0, 5, 4, 3, 2, 1].map((n) => (
            <button
              key={n}
              aria-pressed={filter === n}
              onClick={() => setFilter(n)}
            >
              {n ? `${n} estrelas` : `Todas (${rows.length})`}
            </button>
          ))}
          <button
            aria-pressed={comments}
            onClick={() => setComments(!comments)}
          >
            Com comentários
          </button>
          <button onClick={() => setAscending(!ascending)}>
            {ascending ? "Mais antigas" : "Mais recentes"} ↓
          </button>
        </div>
        {error && (
          <p role="alert" className="form-error mt-4">
            {error}
          </p>
        )}
        {loading ? (
          <p className="section-description">Carregando avaliações…</p>
        ) : visible.length ? (
          <div className="evaluation-table-wrap">
            <table className="evaluation-table">
              <thead>
                <tr>
                  <th>Cliente</th>
                  <th>Avaliação</th>
                  <th>Comentário</th>
                  <th>Data e hora</th>
                </tr>
              </thead>
              <tbody>
                {visible.map((r) => (
                  <tr key={r.id}>
                    <td>
                      <strong>Mesa {r.table_number || "—"}</strong>
                      <small>Cliente anônimo</small>
                    </td>
                    <td>
                      <span
                        className="rating-stars"
                        aria-label={`${r.rating} estrelas`}
                      >
                        {[1, 2, 3, 4, 5].map((n) => (
                          <Star
                            size={15}
                            key={n}
                            fill={n <= r.rating ? "currentColor" : "none"}
                            className={n > r.rating ? "text-stone-300" : ""}
                          />
                        ))}
                      </span>
                    </td>
                    <td>
                      {r.comment || (
                        <span className="text-muted-foreground">
                          Sem comentário
                        </span>
                      )}
                    </td>
                    <td>
                      {new Date(r.created_at).toLocaleDateString("pt-BR")}
                      <small>
                        {new Date(r.created_at).toLocaleTimeString("pt-BR", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </small>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="section-description mt-6">
            Nenhuma avaliação neste filtro.
          </p>
        )}
      </section>
    </div>
  );
}

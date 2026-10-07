"use client";
import { useState, useEffect, useCallback } from "react";
import { useWorkspace } from "@/providers/WorkspaceProvider";
import { createClient } from "@/lib/supabase/client";
import { subscribeTableChanges } from "@/lib/realtime";
import { PageHeader } from "@/components/ui/PageHeader";
type Log = {
  id: string;
  actor_id: string | null;
  table_id: string | null;
  action: string;
  created_at: string;
};
const labels: Record<string, string> = {
  CALL_CALLING: "Chamado criado",
  CALL_ACKNOWLEDGED: "Chamado assumido",
  CALL_COMPLETED: "Atendimento concluído",
  NOTE_ADDED: "Observação adicionada",
  PRIORITY_CHANGED: "Prioridade alterada",
  STAFF_CREATED: "Acesso criado",
  PASSWORD_RESET: "Senha redefinida",
};
export default function ActivityPage() {
  const w = useWorkspace();
  const [logs, setLogs] = useState<Log[]>([]);
  const [who, setWho] = useState("");
  const [error, setError] = useState("");
  const [page, setPage] = useState(0);
  const load = useCallback(async () => {
    if (!w.manager || w.demo) return;
    let q = createClient()
      .from("activity_logs")
      .select("*")
      .eq("restaurant_id", w.restaurant.id)
      .order("created_at", { ascending: false })
      .range(page * 50, page * 50 + 49);
    if (who) q = q.eq("actor_id", who);
    const { data, error } = await q;
    if (error) setError("Não foi possível carregar os registros.");
    else {
      setLogs(data || []);
      setError("");
    }
  }, [w.manager, w.demo, w.restaurant.id, page, who]);
  useEffect(() => {
    void load();
    return subscribeTableChanges(
      "activity_logs",
      `restaurant_id=eq.${w.restaurant.id}`,
      () => void load(),
    );
  }, [load, w.restaurant.id]);
  if (!w.manager) return <p>Registros disponíveis para a gestão.</p>;
  return (
    <div className="space-y-6">
      <PageHeader
        title="Atividade da equipe"
        description="Registro automático de ações, com autoria e horário."
      />
      <select
        className="action-outline"
        aria-label="Funcionário nos registros"
        value={who}
        onChange={(e) => {
          setWho(e.target.value);
          setPage(0);
        }}
      >
        <option value="">Toda a equipe</option>
        {w.members.map((m) => (
          <option key={m.id} value={m.id}>
            {m.name}
          </option>
        ))}
      </select>
      {error && <p role="alert">{error}</p>}
      <section className="surface">
        <ul className="activity-feed">
          {logs.map((l) => (
            <li key={l.id}>
              <div>
                <strong>{labels[l.action] || l.action}</strong>
                <p>
                  {w.members.find((m) => m.id === l.actor_id)?.name ||
                    (l.actor_id === w.profile.id
                      ? w.profile.name
                      : l.actor_id
                        ? "Usuário do sistema"
                        : "Sistema / dispositivo")}
                </p>
              </div>
              <time>{new Date(l.created_at).toLocaleString("pt-BR")}</time>
            </li>
          ))}
        </ul>
        {!logs.length && (
          <p>
            Nenhum registro neste filtro. O histórico começa a partir da
            ativação desta função.
          </p>
        )}
        <div className="wall-actions">
          <button
            className="action-outline"
            disabled={!page}
            onClick={() => setPage(page - 1)}
          >
            Anterior
          </button>
          <span>Página {page + 1}</span>
          <button
            className="action-outline"
            disabled={logs.length < 50}
            onClick={() => setPage(page + 1)}
          >
            Próxima
          </button>
        </div>
      </section>
    </div>
  );
}

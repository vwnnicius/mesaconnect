"use client";
import { useState, useEffect, useCallback } from "react";
import { useWorkspace } from "@/providers/WorkspaceProvider";
import { createClient } from "@/lib/supabase/client";
import { subscribeTableChanges } from "@/lib/realtime";
type Note = {
  id: string;
  author_id: string;
  content: string;
  created_at: string;
};
export function TableNotes({
  tableId,
  number,
}: {
  tableId: string;
  number: string;
}) {
  const w = useWorkspace();
  const [notes, setNotes] = useState<Note[]>([]);
  const [text, setText] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const load = useCallback(async () => {
    if (w.demo) return;
    const { data, error } = await createClient()
      .from("table_notes")
      .select("*")
      .eq("table_id", tableId)
      .order("created_at", { ascending: false })
      .limit(20);
    if (error) setError("Não foi possível carregar observações.");
    else setNotes(data || []);
  }, [tableId, w.demo]);
  useEffect(() => {
    void load();
    return subscribeTableChanges(
      "table_notes",
      `table_id=eq.${tableId}`,
      () => void load(),
    );
  }, [load, tableId]);
  return (
    <section className="table-notes">
      <h3>Observações da mesa {number}</h3>
      <p className="section-description">
        Anote preferências e informações úteis ao próximo atendimento. Evite
        dados sensíveis.
      </p>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          setError("");
          try {
            if (w.demo) {
              setNotes([
                {
                  id: crypto.randomUUID(),
                  author_id: w.profile.id,
                  content: text,
                  created_at: new Date().toISOString(),
                },
                ...notes,
              ]);
            } else {
              const { error } = await createClient().rpc("add_table_note", {
                target: tableId,
                note: text,
              });
              if (error) throw error;
              await load();
            }
            setText("");
          } catch {
            setError("Não foi possível salvar a observação.");
          } finally {
            setBusy(false);
          }
        }}
      >
        <textarea
          aria-label={`Nova observação da mesa ${number}`}
          value={text}
          maxLength={1000}
          rows={3}
          onChange={(e) => setText(e.target.value)}
          placeholder="Ex.: prefere atendimento pelo lado do corredor"
        />
        <button className="action-outline" disabled={busy || !text.trim()}>
          Adicionar observação
        </button>
      </form>
      {error && <p role="alert">{error}</p>}
      <ul>
        {notes.map((n) => (
          <li key={n.id}>
            <p>{n.content}</p>
            <small>
              {w.members.find((m) => m.id === n.author_id)?.name || "Equipe"} ·{" "}
              {new Date(n.created_at).toLocaleString("pt-BR")}
            </small>
          </li>
        ))}
      </ul>
    </section>
  );
}

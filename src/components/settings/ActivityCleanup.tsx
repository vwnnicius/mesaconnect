"use client";
import { useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useWorkspace } from "@/providers/WorkspaceProvider";
import { Button } from "@/components/ui/Button";
type Preview = {
  count: number;
  cutoff: string;
  phrase: string;
  scope: "unit" | "all";
  restaurant_id: string;
};
export function ActivityCleanup() {
  const w = useWorkspace();
  const dialog = useRef<HTMLDialogElement>(null);
  const [preview, setPreview] = useState<Preview | null>(null);
  const [confirmation, setConfirmation] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  async function invoke(body: Record<string, unknown>) {
    if (w.demo)
      throw new Error("Limpeza disponível somente no ambiente conectado.");
    const { data, error } = await createClient().functions.invoke(
      "workspace-admin",
      { body },
    );
    if (error || data?.error)
      throw new Error(
        data?.error || "Não foi possível concluir a solicitação.",
      );
    return data;
  }
  async function open(scope: "unit" | "all") {
    setBusy(true);
    setMessage("");
    setConfirmation("");
    try {
      const result = await invoke({
        action: "logs_preview",
        scope,
        restaurant_id: w.restaurant.id,
      });
      setPreview({ ...result, scope, restaurant_id: w.restaurant.id });
      dialog.current?.showModal();
    } catch (e) {
      setMessage(
        e instanceof Error ? e.message : "Não foi possível conferir os logs.",
      );
    } finally {
      setBusy(false);
    }
  }
  async function clear() {
    if (!preview || confirmation !== preview.phrase) return;
    setBusy(true);
    setMessage("");
    try {
      const result = await invoke({
        ...preview,
        action: "clear_logs",
        confirmation,
      });
      setMessage(`${result.count} registro(s) de atividade removido(s).`);
      dialog.current?.close();
      setPreview(null);
    } catch (e) {
      setMessage(
        e instanceof Error ? e.message : "Não foi possível limpar os logs.",
      );
    } finally {
      setBusy(false);
    }
  }
  if (!w.platformAdmin) return null;
  return (
    <section className="surface cleanup-panel">
      <h2>Logs de atividade</h2>
      <p>
        Apaga somente o registro das ações da equipe. Contas, mesas, chamados,
        avaliações, imagens, dispositivos e plantas são preservados.
      </p>
      <p>
        Estabelecimento selecionado: <strong>{w.restaurant.name}</strong>
      </p>
      <div className="flex flex-wrap gap-3">
        <Button
          variant="outline"
          disabled={busy}
          onClick={() => void open("unit")}
        >
          Limpar logs deste estabelecimento
        </Button>
        <Button
          variant="outline"
          disabled={busy}
          onClick={() => void open("all")}
        >
          Limpar logs de todos os estabelecimentos
        </Button>
      </div>
      {message && <p role="status">{message}</p>}
      <dialog
        ref={dialog}
        className="cleanup-dialog"
        aria-labelledby="cleanup-title"
        onCancel={(e) => {
          if (busy) e.preventDefault();
        }}
      >
        {message && <p role="alert">{message}</p>}
        <h2 id="cleanup-title">Confirmar limpeza</h2>
        <p>
          {preview?.count} registro(s) serão apagados{" "}
          {preview?.scope === "all"
            ? "em todos os estabelecimentos"
            : `em ${w.restaurant.name}`}
          . Esta ação não pode ser desfeita. Novos registros criados após esta
          conferência serão preservados.
        </p>
        <label>
          Digite <strong>{preview?.phrase}</strong>
          <input
            autoComplete="off"
            value={confirmation}
            disabled={busy}
            onChange={(e) => setConfirmation(e.target.value)}
          />
        </label>
        <div className="cleanup-actions">
          <Button
            variant="outline"
            disabled={busy}
            onClick={() => dialog.current?.close()}
          >
            Cancelar
          </Button>
          <Button
            variant="danger"
            disabled={
              busy ||
              !preview ||
              confirmation !== preview.phrase ||
              preview.count === 0
            }
            onClick={() => void clear()}
          >
            {busy ? "Limpando…" : "Apagar logs"}
          </Button>
        </div>
      </dialog>
    </section>
  );
}

"use client";
import { useState } from "react";
import Link from "next/link";
import { useTables } from "@/hooks/useTables";
import { useCalls } from "@/hooks/useCalls";
import { useWorkspace } from "@/providers/WorkspaceProvider";
import { PageHeader } from "@/components/ui/PageHeader";
import { TABLE_STATUS_CONFIG } from "@/lib/constants";
import {
  simulateTableEvent,
  type DeviceEventType,
} from "@/services/deviceService";
export default function SimulatorPage() {
  const { tables, refresh, error } = useTables();
  const calls = useCalls();
  const { manager } = useWorkspace();
  const [events, setEvents] = useState<{ text: string; time: string }[]>([]);
  const [busy, setBusy] = useState("");
  const [message, setMessage] = useState("");
  const trigger = async (id: string, event: DeviceEventType) => {
    const table = tables.find((t) => t.id === id);
    if (!table) return;
    setBusy(id);
    setMessage("");
    try {
      await simulateTableEvent(table, event);
      setEvents((prev) =>
        [
          {
            text: `Mesa ${table.number} · ${event === "CALL" ? "Chamou atendimento" : event === "RESET" ? "Disponível" : event === "DO_NOT_DISTURB" ? "Não incomodar" : "Conectada"}`,
            time: new Date().toLocaleTimeString("pt-BR", {
              hour: "2-digit",
              minute: "2-digit",
            }),
          },
          ...prev,
        ].slice(0, 20),
      );
      await Promise.all([refresh(), calls.refresh()]);
    } catch (e) {
      setMessage(
        e instanceof Error ? e.message : "Não foi possível registrar o evento.",
      );
    } finally {
      setBusy("");
    }
  };
  if (!manager)
    return (
      <div className="surface">
        O simulador está disponível para a administração.
      </div>
    );
  return (
    <div className="space-y-6">
      <PageHeader
        title="Simulador"
        description="Experimente os sinais da mesa antes de conectar o equipamento físico."
        actions={
          <Link className="action-solid" href="/calls">
            Abrir chamados →
          </Link>
        }
      />
      <p className="form-message">
        Ambiente de testes · As ações alteram as mesas reais desta unidade. Para
        uma experiência isolada, use a{" "}
        <Link href="/demo" className="underline">
          demo interativa
        </Link>
        .
      </p>
      {(message || error) && (
        <p role="alert" className="form-error">
          {message || error}
        </p>
      )}
      <div className="simulator-layout">
        <section className="surface">
          <div className="section-heading">
            <h2>Simulador de mesas</h2>
            <span className="text-xs text-muted-foreground">
              {tables.length} mesas
            </span>
          </div>
          <div className="simulator-grid">
            {tables.map((t) => (
              <article className="simulator-card" key={t.id}>
                <div className="simulator-card-head">
                  <div className="simulator-mini" data-status={t.status}>
                    {t.number}
                  </div>
                  <div>
                    <h3>Mesa {t.number}</h3>
                    <p>{TABLE_STATUS_CONFIG[t.status].label}</p>
                  </div>
                </div>
                <div className="simulator-actions">
                  {(
                    [
                      ["RESET", "Normal"],
                      ["CALL", "Chamar"],
                      ["DO_NOT_DISTURB", "Não incomodar"],
                      ["RESET", "Resetar"],
                    ] as const
                  ).map(([event, label], index) => (
                    <button
                      key={index}
                      disabled={!!busy}
                      onClick={() => void trigger(t.id, event)}
                      aria-label={`${label} mesa ${t.number}`}
                    >
                      {busy === t.id ? "…" : label}
                    </button>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>
        <aside className="simulator-side">
          <section className="surface">
            <h2>Eventos desta sessão</h2>
            {events.length ? (
              <ul className="event-list">
                {events.map((e, i) => (
                  <li key={i}>
                    <span>{e.text}</span>
                    <time>{e.time}</time>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-6">Os sinais enviados aparecerão aqui.</p>
            )}
          </section>
          <section className="surface">
            <h2>Fluxo da integração</h2>
            <div className="integration-flow">
              <span>Mesa</span>
              <span>→</span>
              <span>Sistema</span>
              <span>→</span>
              <span>Garçom</span>
            </div>
            <p>
              O simulador e o ESP32 usam o mesmo serviço de eventos. O chamado
              aparece em tempo real, é assumido por uma pessoa e concluído ao
              finalizar o atendimento.
            </p>
            <Link href="/settings" className="action-outline mt-5">
              Configurar dispositivos
            </Link>
          </section>
        </aside>
      </div>
    </div>
  );
}

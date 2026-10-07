"use client";
import { useEffect, useRef, useState } from "react";
import { useTables } from "@/hooks/useTables";
import { useCalls } from "@/hooks/useCalls";
import { useWorkspace } from "@/providers/WorkspaceProvider";
import { TABLE_STATUS_CONFIG } from "@/lib/constants";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
export default function ScreenPage() {
  const { tables, loading, error } = useTables();
  const { calls } = useCalls();
  const w = useWorkspace();
  const [now, setNow] = useState(Date.now());
  const [full, setFull] = useState(false);
  const [sound, setSound] = useState(false);
  const seen = useRef(new Set<string>());
  const audio = useRef<AudioContext | null>(null);
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);
  useEffect(() => {
    const incoming = calls.filter((c) => c.status === "CALLING");
    const fresh = incoming.some((c) => !seen.current.has(c.id));
    seen.current = new Set(incoming.map((c) => c.id));
    if (sound && fresh && audio.current) {
      const ctx = audio.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.frequency.value = 620;
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    }
  }, [calls, sound]);
  useEffect(() => {
    const exit = () => {
      if (!document.fullscreenElement) setFull(false);
    };
    const escape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setFull(false);
    };
    document.addEventListener("fullscreenchange", exit);
    window.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener("fullscreenchange", exit);
      window.removeEventListener("keydown", escape);
    };
  }, []);
  const pending = tables.filter((t) => t.status === "CALLING").length;
  return (
    <div className={`wall-screen ${full ? "is-full" : ""}`}>
      <header>
        <div>
          <p className="eyebrow">{w.restaurant.name}</p>
          <h1>Tela do salão</h1>
          <p>{pending} mesas aguardando · atualização em tempo real</p>
        </div>
        <div className="wall-actions">
          <ThemeToggle />
          <button
            className="action-outline"
            onClick={() => {
              if (!sound) {
                audio.current ??= new AudioContext();
                void audio.current.resume();
              }
              setSound(!sound);
            }}
          >
            {sound ? "Som ligado" : "Ativar som"}
          </button>
          <button
            className="action-solid"
            onClick={() => {
              if (!full) {
                setFull(true);
                void document.documentElement
                  .requestFullscreen?.()
                  .catch(() => {});
              } else {
                setFull(false);
                if (document.fullscreenElement) void document.exitFullscreen();
              }
            }}
          >
            {full ? "Sair da tela cheia" : "Tela cheia"}
          </button>
        </div>
      </header>
      {error && <p role="alert">{error}</p>}
      {loading && <p>Carregando mesas…</p>}
      <div className="wall-legend">
        <span>Verde: disponível</span>
        <span>Âmbar pulsante: chamando</span>
        <span>Azul: em atendimento</span>
        <span>Vermelho: não incomodar</span>
        <span>Cinza: offline</span>
      </div>
      <div className="wall-grid">
        {[...tables]
          .sort(
            (a, b) =>
              Number(b.priority) - Number(a.priority) ||
              Number(b.status === "CALLING") - Number(a.status === "CALLING") ||
              a.number.localeCompare(b.number),
          )
          .map((t) => {
            const seconds = t.active_call_requested_at
              ? Math.max(
                  0,
                  Math.floor(
                    (now - Date.parse(t.active_call_requested_at)) / 1000,
                  ),
                )
              : 0;
            const late = t.status === "CALLING" && seconds >= 300;
            return (
              <article
                key={t.id}
                className={`wall-table ${late ? "is-late" : ""}`}
                data-status={t.status}
              >
                <p>{TABLE_STATUS_CONFIG[t.status]?.label}</p>
                <h2>Mesa {t.number}</h2>
                <strong>
                  {["CALLING", "ACKNOWLEDGED"].includes(t.status)
                    ? `${Math.floor(seconds / 60)
                        .toString()
                        .padStart(
                          2,
                          "0",
                        )}:${(seconds % 60).toString().padStart(2, "0")}`
                    : "—"}
                </strong>
                {t.device_id &&
                  (!t.device_last_seen ||
                    now - Date.parse(t.device_last_seen) > 90000) && (
                    <span>Dispositivo sem sinal recente</span>
                  )}
                {t.priority && <span>Prioridade definida pela gestão</span>}
                {late && <b>Atraso · aguardando há mais de 5 minutos</b>}
              </article>
            );
          })}
      </div>
      <footer>
        {new Date(now).toLocaleTimeString("pt-BR")} · Não exponha esta tela em
        áreas públicas.
      </footer>
    </div>
  );
}

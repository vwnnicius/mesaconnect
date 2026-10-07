"use client";

import { useEffect, useReducer, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Pause,
  Play,
  RotateCcw,
  Star,
  Wifi,
  WifiOff,
} from "lucide-react";
import { BrandMark } from "@/components/layout/BrandMark";
import { FloorPlan } from "@/components/tables/FloorPlan";
import {
  demoReducer,
  demoStep,
  initialDemoState,
  type DemoTable,
} from "@/lib/demo-scenario";
import { cn } from "@/lib/utils";

const chapters = [
  "Escolha a mesa",
  "Cliente chama",
  "Garçom assume",
  "Atendimento concluído",
  "Cliente avalia",
];
const descriptions = [
  "Tudo começa com um toque. Escolha qualquer mesa do salão para experimentar.",
  "O chamado aparece na fila. A equipe sabe exatamente qual mesa precisa de atenção.",
  "Ana assumiu o chamado. A mesa sabe que alguém está a caminho.",
  "Atendimento encerrado. Agora o cliente pode contar como foi sua experiência.",
  "O ciclo está completo. A avaliação ajuda o gerente a acompanhar a experiência no salão.",
];

function elapsed(start: number | null, end: number): string {
  const seconds =
    start === null ? 0 : Math.max(0, Math.floor((end - start) / 1000));
  return `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
}

function nextEvent(table: DemoTable, at: number) {
  if (table.status === "AVAILABLE")
    return { type: "CALL" as const, table: table.number, at };
  if (table.status === "CALLING")
    return { type: "ACKNOWLEDGE" as const, table: table.number, at };
  if (table.status === "ACKNOWLEDGED")
    return { type: "COMPLETE" as const, table: table.number, at };
  return { type: "RATE" as const, table: table.number, rating: 5, at };
}

export function DemoExperience() {
  const [state, dispatch] = useReducer(
    demoReducer,
    undefined,
    initialDemoState,
  );
  const [playing, setPlaying] = useState(false);
  const [now, setNow] = useState(0);
  const [rating, setRating] = useState(5);
  const table = state.tables.find((item) => item.number === state.selected)!;
  const step = demoStep(table);
  const waiting = state.tables.filter(
    (item) => item.status === "CALLING",
  ).length;
  const serving = state.tables.filter(
    (item) => item.status === "ACKNOWLEDGED",
  ).length;

  useEffect(() => {
    setNow(Date.now());
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!playing) return;
    if (step === 4 || !table.connected) {
      setPlaying(false);
      return;
    }
    const timer = setTimeout(
      () => dispatch(nextEvent(table, Date.now())),
      3000,
    );
    return () => clearTimeout(timer);
  }, [playing, table, step]);

  const reset = () => {
    setPlaying(false);
    setRating(5);
    dispatch({ type: "RESET" });
  };
  const select = (number: string) => {
    setPlaying(false);
    setRating(5);
    dispatch({ type: "SELECT", table: number });
  };
  const advance = () => {
    setPlaying(false);
    dispatch(nextEvent(table, Date.now()));
  };
  const play = () => {
    if (playing) {
      setPlaying(false);
      return;
    }
    if (step === 4) {
      dispatch({ type: "RESET" });
      setRating(5);
    }
    setPlaying(true);
  };
  const led = !table.connected ? "OFFLINE" : table.status;

  return (
    <div className="demo-experience min-h-screen">
      <a className="sr-only focus:not-sr-only" href="#demo-content">
        Pular para a demonstração
      </a>
      <header className="demo-header">
        <Link
          href="/dashboard"
          className="flex items-center gap-3"
          aria-label="MesaConnect, voltar ao painel"
        >
          <BrandMark className="w-8 h-8" />
          <span className="font-semibold tracking-tight">MesaConnect</span>
        </Link>
        <span className="demo-label">Experiência interativa</span>
        <Link href="/dashboard" className="demo-back">
          <ArrowLeft size={15} />
          <span>Voltar ao painel</span>
        </Link>
      </header>

      <main id="demo-content" className="demo-main">
        <section className="demo-intro">
          <div>
            <p className="eyebrow">Do primeiro toque ao último detalhe</p>
            <h1>
              O salão,
              <br />
              <span className="editorial-word">em sintonia.</span>
            </h1>
            <p className="demo-description">
              Um cliente chama. A equipe percebe. O atendimento acontece.
              <br className="hidden sm:block" /> Experimente o MesaConnect pelos
              dois lados da mesa.
            </p>
          </div>
          <div className="demo-controls">
            <p>Explore no seu ritmo ou acompanhe o percurso.</p>
            <button
              type="button"
              className="action-solid"
              onClick={play}
              disabled={!table.connected}
              title={
                !table.connected
                  ? "Restabeleça o Wi-Fi simulado para reproduzir o percurso."
                  : undefined
              }
            >
              {playing ? <Pause size={16} /> : <Play size={16} />}
              {playing
                ? "Pausar percurso"
                : step === 4
                  ? "Rever percurso"
                  : "Reproduzir percurso"}
            </button>
            <button type="button" className="demo-reset" onClick={reset}>
              <RotateCcw size={14} />
              Reiniciar demo
            </button>
          </div>
        </section>

        <div className="demo-notice">
          <span className="demo-notice-dot" />
          Ambiente de demonstração. Mesas, equipe, tempos e avaliações são
          simulados; nada é enviado ao restaurante.
        </div>

        <section
          className="demo-workspace"
          aria-label="Demonstração do atendimento"
        >
          <div className="demo-salon">
            <div className="demo-section-header">
              <div>
                <p className="eyebrow">01 / O espaço</p>
                <h2>Um olhar para o salão.</h2>
              </div>
              <div className="demo-live-count">
                <strong>{waiting}</strong> esperando <span>·</span>
                <strong>{serving}</strong> em atendimento
              </div>
            </div>
            <FloorPlan
              tables={state.tables}
              selected={state.selected}
              onSelect={select}
            />
            <p className="demo-map-hint">
              Toque em uma mesa para acompanhar seu atendimento. Você pode
              chamar várias mesas.
            </p>
          </div>

          <div className="demo-action-panel">
            <div className="demo-panel-title">
              <p className="eyebrow">02 / A experiência</p>
              <span>Mesa {table.number}</span>
            </div>
            <div className="demo-device-section">
              <div className="flex items-center justify-between gap-3">
                <h3>Na mesa do cliente</h3>
                <span
                  className={cn(
                    "device-connection",
                    !table.connected && "device-disconnected",
                  )}
                >
                  {table.connected ? <Wifi size={13} /> : <WifiOff size={13} />}
                  {table.connected ? "Wi-Fi simulado" : "Sem conexão"}
                </span>
              </div>
              <div className="demo-device">
                <span className="device-wordmark">mesaconnect</span>
                <button
                  type="button"
                  className="physical-button"
                  disabled={
                    !table.connected ||
                    table.status === "CALLING" ||
                    table.status === "ACKNOWLEDGED"
                  }
                  aria-label={`Cliente chamar atendimento na mesa ${table.number}`}
                  onClick={() => {
                    setPlaying(false);
                    dispatch({
                      type: "CALL",
                      table: table.number,
                      at: Date.now(),
                    });
                  }}
                >
                  <span className="device-led" data-status={led} />
                  <span>Chamar</span>
                  <small>atendimento</small>
                </button>
                <span className="device-number">MESA {table.number}</span>
              </div>
              <p className="device-feedback">
                {!table.connected
                  ? "O botão não consegue enviar. Restabeleça a conexão para chamar."
                  : table.status === "AVAILABLE"
                    ? "Pressione o botão para solicitar atendimento."
                    : table.status === "CALLING"
                      ? "Pedido registrado. A equipe já pode ver sua mesa."
                      : table.status === "ACKNOWLEDGED"
                        ? "Ana está a caminho da sua mesa."
                        : "Atendimento concluído. Obrigado!"}
              </p>
              <button
                type="button"
                className="connection-toggle"
                onClick={() => {
                  setPlaying(false);
                  dispatch({
                    type: "CONNECTION",
                    table: table.number,
                    at: Date.now(),
                  });
                }}
              >
                {table.connected
                  ? "Testar perda de Wi-Fi"
                  : "Restabelecer Wi-Fi"}
              </button>
            </div>

            <div className="demo-waiter-section">
              <div className="demo-waiter-heading">
                <h3>No celular do garçom</h3>
                <span className="waiter-avatar">A</span>
                <span>Ana</span>
              </div>
              {table.status === "AVAILABLE" ? (
                <div className="waiter-empty">
                  Tudo em ordem.
                  <span>O chamado aparecerá aqui após o toque.</span>
                </div>
              ) : table.status === "COMPLETED" ? (
                <div className="waiter-done">
                  <Check size={18} />
                  <div>
                    Atendimento concluído<span>Mesa {table.number} · Ana</span>
                  </div>
                </div>
              ) : (
                <div className="waiter-call">
                  <div className="waiter-call-meta">
                    <span>
                      {table.status === "CALLING"
                        ? "Aguardando atendimento"
                        : "Assumido por Ana"}
                    </span>
                    <time>
                      {elapsed(
                        table.status === "CALLING"
                          ? table.requestedAt
                          : table.acknowledgedAt,
                        now,
                      )}
                    </time>
                  </div>
                  <p>Mesa {table.number}</p>
                  <button
                    type="button"
                    className="action-solid w-full"
                    onClick={advance}
                  >
                    {table.status === "CALLING"
                      ? "Estou indo"
                      : "Concluir atendimento"}
                    <ArrowRight size={15} />
                  </button>
                </div>
              )}
            </div>

            {table.status === "COMPLETED" ? (
              <div className="demo-review">
                <h3>
                  {table.rating
                    ? "Obrigado pela avaliação."
                    : "Como foi seu atendimento?"}
                </h3>
                <p>
                  {table.rating
                    ? `${table.rating} de 5 estrelas · avaliação simulada`
                    : "Prévia da experiência de avaliação pelo QR da mesa."}
                </p>
                {!table.rating ? (
                  <>
                    <div
                      className="rating-stars"
                      role="group"
                      aria-label="Escolher nota"
                    >
                      <span className="sr-only">
                        Nota selecionada: {rating} de 5
                      </span>
                      {[1, 2, 3, 4, 5].map((value) => (
                        <button
                          type="button"
                          key={value}
                          onClick={() => {
                            setPlaying(false);
                            setRating(value);
                          }}
                          aria-label={`Dar ${value} ${value === 1 ? "estrela" : "estrelas"}`}
                          aria-pressed={rating === value}
                        >
                          <Star
                            size={23}
                            fill={value <= rating ? "currentColor" : "none"}
                          />
                        </button>
                      ))}
                    </div>
                    <button
                      type="button"
                      className="action-outline w-full"
                      onClick={() => {
                        setPlaying(false);
                        dispatch({
                          type: "RATE",
                          table: table.number,
                          rating,
                          at: Date.now(),
                        });
                      }}
                    >
                      Enviar avaliação simulada
                    </button>
                  </>
                ) : null}
              </div>
            ) : null}
          </div>
        </section>

        <section className="demo-journey" aria-label="Etapas do percurso">
          <div className="journey-heading">
            <div>
              <p className="eyebrow">03 / O percurso</p>
              <h2>{chapters[step]}</h2>
            </div>
            <span>
              0{step + 1} <span>/ 05</span>
            </span>
          </div>
          <div className="journey-progress">
            {chapters.map((chapter, index) => (
              <div
                key={chapter}
                className={cn(
                  index <= step && "journey-reached",
                  index === step && "journey-current",
                )}
                aria-current={index === step ? "step" : undefined}
              >
                <span>{String(index + 1).padStart(2, "0")}</span>
                <p>{chapter}</p>
              </div>
            ))}
          </div>
          <div className="journey-description">
            <p aria-live="polite">
              Mesa {table.number}: {descriptions[step]}
            </p>
            {step < 4 ? (
              <button
                type="button"
                className="action-outline"
                disabled={!table.connected && step === 0}
                onClick={advance}
              >
                Próxima etapa
                <ArrowRight size={14} />
              </button>
            ) : (
              <button type="button" className="action-outline" onClick={reset}>
                Experimentar de novo
                <RotateCcw size={14} />
              </button>
            )}
          </div>
        </section>

        <section
          className="demo-journal"
          aria-label="Histórico da demonstração"
        >
          <div>
            <p className="eyebrow">O que aconteceu</p>
            <h2>
              Pequenos gestos.
              <br />
              Tudo registrado.
            </h2>
            <p>Histórico local desta demonstração.</p>
          </div>
          <ol>
            {state.events.length === 0 ? (
              <li className="journal-empty">
                O primeiro toque inicia a história.
              </li>
            ) : (
              state.events.slice(0, 5).map((event) => (
                <li key={event.id}>
                  <time>
                    {new Date(event.at).toLocaleTimeString("pt-BR", {
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                    })}
                  </time>
                  <span>Mesa {event.table}</span>
                  <p>{event.message}</p>
                </li>
              ))
            )}
          </ol>
        </section>
        <footer className="demo-footer">
          <span>MesaConnect / Atendimento por mesa</span>
          <span>Protótipo funcional · hardware e conexão simulados</span>
        </footer>
      </main>
    </div>
  );
}

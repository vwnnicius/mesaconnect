"use client";
/* eslint-disable @next/next/no-img-element */
import { useEffect, useState } from "react";
import { useWorkspace } from "@/providers/WorkspaceProvider";
import { createClient } from "@/lib/supabase/client";
import { storeDemoWorkspace } from "@/services/workspaceService";
export function GoogleReviews() {
  const w = useWorkspace();
  const [url, setUrl] = useState(w.restaurant.google_review_url || "");
  const [qr, setQr] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    let active = true;
    setQr("");
    if (w.restaurant.google_review_url)
      void import("qrcode")
        .then((QR) =>
          QR.toDataURL(w.restaurant.google_review_url!, {
            width: 800,
            margin: 4,
          }),
        )
        .then((image) => {
          if (active) setQr(image);
        })
        .catch(() => setMessage("Não foi possível gerar o QR."));
    return () => {
      active = false;
    };
  }, [w.restaurant.google_review_url]);
  return (
    <section className="surface settings-form">
      <h2>Avaliação no Google</h2>
      <p className="section-description">
        Cole o link de avaliação do Perfil da Empresa no Google. Ele ficará
        disponível para todos os clientes, independentemente da nota dada aqui.
      </p>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          setMessage("");
          try {
            const value = url.trim();
            if (
              value &&
              !/^https:\/\/(search\.google\.com|maps\.google\.com|www\.google\.com|g\.page|maps\.app\.goo\.gl)\//.test(
                value,
              )
            )
              throw Error("Use um link HTTPS oficial do Google.");
            if (w.demo)
              storeDemoWorkspace(
                { ...w.restaurant, google_review_url: value || null },
                w.members,
              );
            else {
              const { error } = await createClient()
                .from("restaurants")
                .update({ google_review_url: value || null })
                .eq("id", w.restaurant.id);
              if (error) throw Error("Não foi possível salvar o link.");
            }
            await w.refresh();
            setMessage("Link salvo. O QR foi atualizado.");
          } catch (e) {
            setMessage(
              e instanceof Error ? e.message : "Não foi possível salvar.",
            );
          } finally {
            setBusy(false);
          }
        }}
      >
        <label>
          Link do Google
          <input
            type="url"
            value={url}
            maxLength={1800}
            placeholder="https://g.page/r/.../review"
            onChange={(e) => setUrl(e.target.value)}
          />
        </label>
        <button className="action-solid" disabled={busy}>
          Salvar link e gerar QR
        </button>
      </form>
      {message && <p role="status">{message}</p>}
      {qr && (
        <div className="google-qr">
          <img
            src={qr}
            alt="QR para avaliar no Google"
            width={180}
            height={180}
          />
          <a
            className="action-outline"
            href={qr}
            download="benservire-google.png"
          >
            Baixar QR do Google
          </a>
          <a
            href={w.restaurant.google_review_url!}
            target="_blank"
            rel="noopener noreferrer"
          >
            Abrir avaliação no Google ↗
          </a>
        </div>
      )}
    </section>
  );
}

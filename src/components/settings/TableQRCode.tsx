"use client";
/* eslint-disable @next/next/no-img-element */
import { useState } from "react";
export function TableQRCode({
  slug,
  number,
}: {
  slug: string;
  number: string;
}) {
  const [image, setImage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  return (
    <div className="table-qr">
      <button
        className="action-outline"
        disabled={busy}
        onClick={async () => {
          setBusy(true);
          try {
            const QR = await import("qrcode");
            setImage(
              await QR.toDataURL(
                `${location.origin}/evaluate/${slug}/${number}`,
                {
                  width: 800,
                  margin: 4,
                  errorCorrectionLevel: "M",
                  color: { dark: "#203b2c", light: "#ffffff" },
                },
              ),
            );
            setError("");
          } catch {
            setError("Não foi possível gerar o QR.");
          } finally {
            setBusy(false);
          }
        }}
      >
        {busy ? "Gerando…" : "Gerar QR"}
      </button>
      {image && (
        <div>
          <img
            src={image}
            alt={`QR de avaliação da mesa ${number}`}
            width={100}
            height={100}
          />
          <a href={image} download={`mesaconnect-mesa-${number}.png`}>
            Baixar QR da mesa {number}
          </a>
          <button
            onClick={() => setImage("")}
            aria-label={`Fechar QR da mesa ${number}`}
          >
            Fechar
          </button>
        </div>
      )}
      {error && <p role="alert">{error}</p>}
    </div>
  );
}

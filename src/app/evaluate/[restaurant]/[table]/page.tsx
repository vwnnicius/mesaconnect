"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Star, ArrowRight, CheckCircle } from "lucide-react";
import { BrandMark } from "@/components/layout/BrandMark";
import { AssetImage } from "@/components/ui/AssetImage";
import { getTableByNumber } from "@/services/tablesService";
import { createEvaluation } from "@/services/evaluationsService";
import { RESTAURANT_DEMO } from "@/lib/constants";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import type { Table } from "@/types";
type PublicTable = Table & {
  restaurant_name?: string;
  logo_path?: string | null;
  cover_path?: string | null;
  google_review_url?: string | null;
};
export default function CustomerEvaluation() {
  const params = useParams();
  const slug = String(params.restaurant || "");
  const number = String(params.table || "").padStart(2, "0");
  const [table, setTable] = useState<PublicTable | null>(null);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    setLoading(true);
    setSent(false);
    getTableByNumber(slug, number)
      .then((t) => {
        if (active) setTable(t);
      })
      .catch(() => {
        if (active) setTable(null);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [slug, number]);
  return (
    <main className="customer-evaluation">
      <section className="customer-panel">
        {table?.cover_path && (
          <AssetImage
            kind="cover"
            path={table.cover_path}
            name={table.restaurant_name}
            className="customer-cover"
          />
        )}
        <div className="customer-brand">
          {table?.logo_path ? (
            <AssetImage
              kind="logo"
              path={table.logo_path}
              name={table.restaurant_name}
            />
          ) : (
            <BrandMark />
          )}
          <span>benservire</span>
        </div>
        {table?.google_review_url && (
          <a
            className="google-review-link"
            href={table.google_review_url}
            target="_blank"
            rel="noopener noreferrer"
          >
            Avaliar o estabelecimento no Google ↗
          </a>
        )}
        {loading ? (
          <p role="status">Abrindo sua mesa…</p>
        ) : !table ? (
          <p role="alert">
            Esta mesa não está disponível. Confira o QR Code com a equipe.
          </p>
        ) : sent ? (
          <div className="text-center py-8">
            <CheckCircle className="mx-auto text-accent mb-6" size={48} />
            <h1>Obrigado.</h1>
            <p className="customer-description">
              {isSupabaseConfigured()
                ? "Sua opinião ajuda este restaurante a servir melhor."
                : "Avaliação registrada nesta demonstração."}
            </p>
          </div>
        ) : (
          <>
            <p className="customer-context">
              Mesa {number} · {table.restaurant_name || RESTAURANT_DEMO.name}
            </p>
            <h1>
              Como foi seu
              <br />
              atendimento?
            </h1>
            <p className="customer-description">
              Sua opinião nos ajuda a oferecer
              <br />
              uma experiência cada vez melhor.
            </p>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (!rating) return;
                setBusy(true);
                setError("");
                try {
                  await createEvaluation({
                    restaurantId: table.restaurant_id,
                    tableId: table.id,
                    rating,
                    comment: comment.trim(),
                    tableNumber: number,
                  });
                  setSent(true);
                } catch {
                  setError(
                    "Não foi possível enviar. Tente novamente em alguns instantes.",
                  );
                } finally {
                  setBusy(false);
                }
              }}
            >
              <div className="customer-stars">
                <div role="group" aria-label="Escolha sua avaliação">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      type="button"
                      aria-label={`${n} ${n === 1 ? "estrela" : "estrelas"}`}
                      aria-pressed={rating === n}
                      onClick={() => setRating(n)}
                      onMouseEnter={() => setHover(n)}
                      onMouseLeave={() => setHover(0)}
                    >
                      <Star
                        color={(hover || rating) >= n ? "#eab235" : "#dfe1e2"}
                        fill={(hover || rating) >= n ? "#eab235" : "#dfe1e2"}
                        strokeWidth={1.3}
                      />
                    </button>
                  ))}
                </div>
                <p>
                  {
                    [
                      "Toque nas estrelas",
                      "Precisa melhorar",
                      "Regular",
                      "Bom",
                      "Muito bom",
                      "Excelente",
                    ][rating]
                  }
                </p>
              </div>
              <label className="customer-comment">
                Conte mais sobre sua experiência{" "}
                <span className="text-muted-foreground">(opcional)</span>
                <textarea
                  maxLength={500}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="O que você mais gostou? Há algo que podemos melhorar?"
                />
                <small>{comment.length}/500</small>
              </label>
              {error && (
                <p role="alert" className="form-error mb-4">
                  {error}
                </p>
              )}
              <button className="action-solid" disabled={busy || !rating}>
                {busy ? "Enviando…" : "Enviar avaliação"}
                <ArrowRight size={19} />
              </button>
            </form>
          </>
        )}
        <p className="customer-thanks">
          Obrigado por dedicar alguns segundos
          <br />
          para compartilhar sua experiência.
        </p>
      </section>
    </main>
  );
}

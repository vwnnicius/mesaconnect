'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Star, CheckCircle, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { createEvaluation } from '@/services/evaluationsService';
import { RESTAURANT_DEMO } from '@/lib/constants';
import { BrandMark } from '@/components/layout/BrandMark';
import { getTableByNumber } from '@/services/tablesService';
import { Table } from '@/types';
import { isSupabaseConfigured } from '@/lib/supabase/client';

export default function CustomerEvaluationPage() {
  const params = useParams();
  const tableParam = (params?.table as string) || '07';
  const tableNumber = tableParam.padStart(2, '0');
  const restaurantSlug = String(params?.restaurant || '');
  const [table, setTable] = useState<Table | null>(null);
  const [resolving, setResolving] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setResolving(true);
    getTableByNumber(restaurantSlug, tableNumber)
      .then((value) => { if (active) setTable(value); })
      .catch(() => { if (active) setTable(null); })
      .finally(() => { if (active) setResolving(false); });
    return () => { active = false; };
  }, [restaurantSlug, tableNumber]);

  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [comment, setComment] = useState<string>('');
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!table) return;
    setLoading(true);
    setError(null);

    try {
      await createEvaluation({
        restaurantId: table.restaurant_id,
        tableId: table.id,
        tableNumber: tableNumber,
        rating,
        comment: comment.trim() || null,
      });
      setSubmitted(true);
    } catch (err) {
      console.error('Erro ao enviar avaliação:', err);
      setError('Não foi possível enviar sua avaliação. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream dark:bg-background flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <BrandMark className="w-10 h-10 mx-auto mb-3" />
          <h1 className="text-lg font-semibold tracking-tight">{restaurantSlug === RESTAURANT_DEMO.slug ? RESTAURANT_DEMO.name : 'Avalie o atendimento'}</h1>
          <p className="text-xs text-stone-500 mt-1">Mesa {tableNumber}</p>
        </div>

        <div className="bg-cream-paper dark:bg-card border border-border rounded-box p-6 shadow-card">
          {resolving ? <p role="status" className="text-center text-sm text-muted-foreground py-6">Abrindo sua mesa…</p> : !table ? <p role="alert" className="text-center text-sm text-muted-foreground py-6">Esta mesa não está disponível. Verifique o QR Code com a equipe.</p> : submitted ? (
            <div className="py-6 text-center space-y-3">
              <CheckCircle className="w-10 h-10 mx-auto text-emerald-700" />
              <h2 className="text-lg font-semibold">Obrigado</h2>
              <p className="text-sm text-stone-500 leading-relaxed">
                {isSupabaseConfigured() ? 'Sua avaliação foi enviada. Obrigado por compartilhar sua experiência.' : 'Avaliação registrada nesta demonstração local.'}
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="text-center">
                <h2 className="text-base font-semibold">Como foi o atendimento?</h2>
                <p className="text-xs text-stone-400 mt-1">Toque nas estrelas</p>
              </div>

              <div className="flex justify-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => {
                  const active = (hoverRating ?? rating) >= star;
                  return (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(null)}
                      aria-label={`${star} ${star === 1 ? 'estrela' : 'estrelas'}`}
                      aria-pressed={rating === star}
                      className="p-2 rounded-lg"
                    >
                      <Star
                        className={`w-8 h-8 ${
                          active
                            ? 'text-orange-500 fill-orange-500'
                            : 'text-stone-300 dark:text-stone-700'
                        }`}
                      />
                    </button>
                  );
                })}
              </div>

              <div>
                <label htmlFor="evaluation-comment" className="block text-xs font-medium text-stone-600 mb-1.5">
                  Comentário (opcional)
                </label>
                <textarea
                  id="evaluation-comment"
                  maxLength={1000}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Comida no ponto? Garçom rápido?"
                  rows={3}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-cream dark:bg-stone-900 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-accent/30"
                />
              </div>
              {error ? <p role="alert" className="text-sm text-red-700 dark:text-red-400">{error}</p> : null}

              <Button type="submit" disabled={loading} fullWidth size="lg">
                {loading ? 'Enviando…' : 'Enviar'}
                <ArrowRight className="w-4 h-4" />
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

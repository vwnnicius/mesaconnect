'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { Star, CheckCircle, UtensilsCrossed, ArrowRight, Heart } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { createEvaluation } from '@/services/evaluationsService';
import { RESTAURANT_DEMO } from '@/lib/constants';

export default function CustomerEvaluationPage() {
  const params = useParams();
  const restaurantSlug = (params?.restaurant as string) || RESTAURANT_DEMO.slug;
  const tableParam = (params?.table as string) || '07';
  const tableNumber = tableParam.padStart(2, '0');

  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [comment, setComment] = useState<string>('');
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await createEvaluation({
        restaurantId: RESTAURANT_DEMO.id,
        tableId: `table-${tableNumber}`,
        tableNumber: tableNumber,
        rating,
        comment: comment.trim() || null,
      });
      setSubmitted(true);
    } catch (err) {
      console.error('Erro ao enviar avaliação:', err);
      // Fallback gracioso para a experiência do usuário
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-sm">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 flex items-center justify-center mx-auto shadow-md mb-3">
            <UtensilsCrossed className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight">
            {RESTAURANT_DEMO.name}
          </h1>
          <p className="text-xs font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400 mt-1">
            Mesa {tableNumber}
          </p>
        </div>

        {/* Content Card */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-3xl p-6 shadow-sm">
          {submitted ? (
            <div className="py-8 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto animate-bounce">
                <CheckCircle className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                  Obrigado pela sua avaliação!
                </h2>
                <p className="text-xs text-zinc-500 mt-1.5 leading-relaxed">
                  Sua opinião ajuda nossa equipe a entregar o melhor rodízio para você. Tenha uma excelente refeição!
                </p>
              </div>

              <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800">
                <p className="text-[11px] text-zinc-400 flex items-center justify-center gap-1">
                  Atendimento ágil com MesaConnect <Heart className="w-3 h-3 text-rose-500 fill-rose-500" />
                </p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="text-center">
                <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                  Como foi seu atendimento?
                </h2>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Selecione de 1 a 5 estrelas
                </p>
              </div>

              {/* Star Rating Interactive */}
              <div className="flex justify-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => {
                  const active = (hoverRating ?? rating) >= star;
                  return (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(null)}
                      className="p-1 text-3xl focus:outline-none transition-transform hover:scale-125 active:scale-95"
                    >
                      <Star
                        className={`w-9 h-9 transition-colors ${
                          active
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-zinc-300 dark:text-zinc-700'
                        }`}
                      />
                    </button>
                  );
                })}
              </div>

              {/* Comment Field (Optional) */}
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                  Conte-nos mais (opcional)
                </label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="A comida estava no ponto? O garçom atendeu com rapidez?"
                  rows={3}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/50 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 transition-all resize-none"
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                fullWidth
                size="lg"
                className="bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 font-bold"
              >
                {loading ? 'Enviando...' : 'ENVIAR AVALIAÇÃO'}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </form>
          )}
        </div>

        <p className="text-center text-[11px] text-zinc-400 mt-4">
          MesaConnect • Atendimento conectado
        </p>
      </div>
    </div>
  );
}

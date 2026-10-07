'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { Star, CheckCircle, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { createEvaluation } from '@/services/evaluationsService';
import { RESTAURANT_DEMO } from '@/lib/constants';
import { BrandMark } from '@/components/layout/BrandMark';

export default function CustomerEvaluationPage() {
  const params = useParams();
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
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream dark:bg-[#161210] flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <BrandMark className="w-10 h-10 mx-auto mb-3" />
          <h1 className="text-lg font-semibold tracking-tight">{RESTAURANT_DEMO.name}</h1>
          <p className="text-xs text-stone-500 mt-1">Mesa {tableNumber}</p>
        </div>

        <div className="bg-cream-paper dark:bg-[#221c18] border border-border rounded-box p-6 shadow-card">
          {submitted ? (
            <div className="py-6 text-center space-y-3">
              <CheckCircle className="w-10 h-10 mx-auto text-emerald-700" />
              <h2 className="text-lg font-semibold">Obrigado</h2>
              <p className="text-sm text-stone-500 leading-relaxed">
                Sua nota chegou à cozinha e ao salão. Bom apetite.
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
                      className="p-1"
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
                <label className="block text-xs font-medium text-stone-600 mb-1.5">
                  Comentário (opcional)
                </label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Comida no ponto? Garçom rápido?"
                  rows={3}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-cream dark:bg-stone-900 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-accent/30"
                />
              </div>

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

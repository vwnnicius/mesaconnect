import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';
import { Evaluation } from '@/types';
import { inMemoryStore } from './mockStore';
import { RESTAURANT_DEMO } from '@/lib/constants';

export async function createEvaluation(params: {
  restaurantId?: string;
  tableId: string;
  serviceCallId?: string | null;
  rating: number;
  comment?: string | null;
  tableNumber?: string;
}): Promise<Evaluation | null> {
  const restaurantId = params.restaurantId || RESTAURANT_DEMO.id;
  if (!Number.isInteger(params.rating) || params.rating < 1 || params.rating > 5) {
    throw new Error('Escolha uma nota de 1 a 5.');
  }

  if (!isSupabaseConfigured()) {
    return inMemoryStore.addEvaluation({
      restaurant_id: restaurantId,
      table_id: params.tableId,
      service_call_id: params.serviceCallId || null,
      rating: params.rating,
      comment: params.comment || null,
      table_number: params.tableNumber || '??',
    });
  }

  const supabase = createClient();
  const { data, error } = await (supabase.from('evaluations') as any)
    .insert({
      restaurant_id: restaurantId,
      table_id: params.tableId,
      service_call_id: params.serviceCallId || null,
      rating: params.rating,
      comment: params.comment || null,
    })
    .select()
    .single();

  if (error || !data) {
    throw new Error(error?.message || 'Não foi possível enviar a avaliação.');
  }

  return data as Evaluation;
}

export async function getEvaluations(
  restaurantId: string = RESTAURANT_DEMO.id
): Promise<Evaluation[]> {
  if (!isSupabaseConfigured()) {
    return inMemoryStore.getEvaluations();
  }

  const supabase = createClient();
  const { data, error } = await (supabase.from('evaluations') as any)
    .select(`
      *,
      table:tables(number)
    `)
    .eq('restaurant_id', restaurantId)
    .order('created_at', { ascending: false });

  if (error || !data) {
    return inMemoryStore.getEvaluations();
  }

  return data.map((item: any) => ({
    ...item,
    table_number: item.table?.number || '??',
  }));
}

import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';
import { ServiceCall } from '@/types';
import { inMemoryStore } from './mockStore';
import { RESTAURANT_DEMO } from '@/lib/constants';

export async function createServiceCall(params: {
  restaurantId?: string;
  tableId: string;
  requestedBy?: string;
}): Promise<ServiceCall | null> {
  const restaurantId = params.restaurantId || RESTAURANT_DEMO.id;
  const requestedBy = params.requestedBy || 'CLIENT_BUTTON';

  if (!isSupabaseConfigured()) {
    return inMemoryStore.createCall(params.tableId, restaurantId);
  }

  const supabase = createClient();
  const requestedAt = new Date().toISOString();

  const { data, error } = await (supabase.from('service_calls') as any)
    .insert({
      restaurant_id: restaurantId,
      table_id: params.tableId,
      requested_at: requestedAt,
      status: 'CALLING',
      requested_by: requestedBy,
    })
    .select()
    .single();

  if (error || !data) {
    console.warn('Erro ao inserir chamado no Supabase, usando fallback local:', error?.message);
    return inMemoryStore.createCall(params.tableId, restaurantId);
  }

  // Atualiza mesa no Supabase (se trigger não estiver ativo)
  await (supabase.from('tables') as any)
    .update({ status: 'CALLING' })
    .eq('id', params.tableId);

  // Também replica no store local para sincronia imediata
  inMemoryStore.createCall(params.tableId, restaurantId);

  return data as ServiceCall;
}

export async function acknowledgeServiceCall(
  callId: string,
  staffUserId?: string
): Promise<boolean> {
  const now = new Date().toISOString();

  if (!isSupabaseConfigured()) {
    inMemoryStore.acknowledgeCall(callId, staffUserId || 'Garçom');
    return true;
  }

  const supabase = createClient();
  const { data: call, error } = await (supabase.from('service_calls') as any)
    .update({
      status: 'ACKNOWLEDGED',
      acknowledged_at: now,
      acknowledged_by: staffUserId || null,
    })
    .eq('id', callId)
    .select('table_id')
    .single();

  if (error) {
    console.error('Erro ao assumir chamado no Supabase:', error);
    inMemoryStore.acknowledgeCall(callId);
    return false;
  }

  if (call?.table_id) {
    await (supabase.from('tables') as any)
      .update({ status: 'ACKNOWLEDGED' })
      .eq('id', call.table_id);
  }

  inMemoryStore.acknowledgeCall(callId);
  return true;
}

export async function completeServiceCall(
  callId: string,
  staffUserId?: string
): Promise<boolean> {
  const now = new Date().toISOString();

  if (!isSupabaseConfigured()) {
    inMemoryStore.completeCall(callId, staffUserId || 'Garçom');
    return true;
  }

  const supabase = createClient();
  const { data: call, error } = await (supabase.from('service_calls') as any)
    .update({
      status: 'COMPLETED',
      completed_at: now,
      completed_by: staffUserId || null,
    })
    .eq('id', callId)
    .select('table_id')
    .single();

  if (error) {
    console.error('Erro ao concluir chamado no Supabase:', error);
    inMemoryStore.completeCall(callId);
    return false;
  }

  if (call?.table_id) {
    await (supabase.from('tables') as any)
      .update({ status: 'AVAILABLE' })
      .eq('id', call.table_id);
  }

  inMemoryStore.completeCall(callId);
  return true;
}

export async function getActiveCalls(
  restaurantId: string = RESTAURANT_DEMO.id
): Promise<ServiceCall[]> {
  if (!isSupabaseConfigured()) {
    return inMemoryStore
      .getCalls()
      .filter((c) => c.status === 'CALLING' || c.status === 'ACKNOWLEDGED')
      .sort(
        (a, b) =>
          new Date(a.requested_at).getTime() - new Date(b.requested_at).getTime()
      );
  }

  const supabase = createClient();
  const { data, error } = await (supabase.from('service_calls') as any)
    .select(`
      *,
      table:tables(number)
    `)
    .eq('restaurant_id', restaurantId)
    .in('status', ['CALLING', 'ACKNOWLEDGED'])
    .order('requested_at', { ascending: true }); // Mais antigo primeiro

  if (error || !data) {
    console.warn('Erro ao buscar chamados no Supabase, usando store local:', error?.message);
    return inMemoryStore
      .getCalls()
      .filter((c) => c.status === 'CALLING' || c.status === 'ACKNOWLEDGED')
      .sort(
        (a, b) =>
          new Date(a.requested_at).getTime() - new Date(b.requested_at).getTime()
      );
  }

  return data.map((item: any) => ({
    ...item,
    table_number: item.table?.number || '??',
  }));
}

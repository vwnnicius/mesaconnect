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
    throw new Error(error?.message || 'Não foi possível registrar o chamado.');
  }

  // Atualiza mesa no Supabase (se trigger não estiver ativo)
  await (supabase.from('tables') as any)
    .update({ status: 'CALLING' })
    .eq('id', params.tableId);

  return data as ServiceCall;
}

export async function acknowledgeServiceCall(
  callId: string,
  staffUserId?: string
): Promise<boolean> {
  const now = new Date().toISOString();

  if (!isSupabaseConfigured()) {
    return !!inMemoryStore.acknowledgeCall(callId, staffUserId || 'Garçom');
  }

  const supabase = createClient();
  const { data: auth } = await supabase.auth.getUser();
  const { data: call, error } = await (supabase.from('service_calls') as any)
    .update({
      status: 'ACKNOWLEDGED',
      acknowledged_at: now,
      acknowledged_by: auth.user?.id || staffUserId || null,
    })
    .eq('id', callId)
    .eq('status', 'CALLING')
    .select('table_id')
    .single();

  if (error) {
    console.error('Erro ao assumir chamado no Supabase:', error);
    return false;
  }

  if (call?.table_id) {
    await (supabase.from('tables') as any)
      .update({ status: 'ACKNOWLEDGED' })
      .eq('id', call.table_id);
  }

  return true;
}

export async function completeServiceCall(
  callId: string,
  staffUserId?: string
): Promise<boolean> {
  const now = new Date().toISOString();

  if (!isSupabaseConfigured()) {
    return !!inMemoryStore.completeCall(callId, staffUserId || 'Garçom');
  }

  const supabase = createClient();
  const { data: auth } = await supabase.auth.getUser();
  const { data: call, error } = await (supabase.from('service_calls') as any)
    .update({
      status: 'COMPLETED',
      completed_at: now,
      completed_by: auth.user?.id || staffUserId || null,
    })
    .eq('id', callId)
    .eq('status', 'ACKNOWLEDGED')
    .select('table_id')
    .single();

  if (error) {
    console.error('Erro ao concluir chamado no Supabase:', error);
    return false;
  }

  if (call?.table_id) {
    await (supabase.from('tables') as any)
      .update({ status: 'AVAILABLE' })
      .eq('id', call.table_id);
  }

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
    throw new Error(error?.message || 'Não foi possível carregar os chamados.');
  }

  return data.map((item: any) => ({
    ...item,
    table_number: item.table?.number || '??',
  }));
}

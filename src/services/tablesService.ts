import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';
import { Table, TableStatus } from '@/types';
import { inMemoryStore } from './mockStore';
import { RESTAURANT_DEMO } from '@/lib/constants';

export async function getTables(restaurantId: string = RESTAURANT_DEMO.id): Promise<Table[]> {
  if (!isSupabaseConfigured()) {
    return inMemoryStore.getTables();
  }

  const supabase = createClient();
  const { data: tables, error } = await (supabase.from('tables') as any)
    .select(`
      id,
      restaurant_id,
      number,
      device_id,
      status,
      created_at
    `)
    .eq('restaurant_id', restaurantId)
    .order('number', { ascending: true });

  if (error || !tables) {
    console.warn('Erro ao buscar mesas no Supabase, usando fallback local:', error?.message);
    return inMemoryStore.getTables();
  }

  // Busca chamados ativos para cruzar dados de tempo
  const { data: activeCalls } = await (supabase.from('service_calls') as any)
    .select('id, table_id, requested_at, status')
    .eq('restaurant_id', restaurantId)
    .in('status', ['CALLING', 'ACKNOWLEDGED']);

  return (tables as Table[]).map((t) => {
    const active = activeCalls?.find((c: any) => c.table_id === t.id);
    return {
      ...t,
      active_call_id: active?.id || null,
      active_call_requested_at: active?.requested_at || null,
    };
  });
}

export async function updateTableStatus(
  tableId: string,
  status: TableStatus
): Promise<boolean> {
  if (!isSupabaseConfigured()) {
    inMemoryStore.updateTableStatus(tableId, status);
    return true;
  }

  const supabase = createClient();
  const { error } = await (supabase.from('tables') as any)
    .update({ status })
    .eq('id', tableId);

  if (error) {
    console.error('Erro ao atualizar status da mesa:', error);
    inMemoryStore.updateTableStatus(tableId, status);
    return false;
  }

  inMemoryStore.updateTableStatus(tableId, status);
  return true;
}

export async function getTableByNumber(
  restaurantSlug: string,
  tableNumber: string
): Promise<Table | null> {
  if (!isSupabaseConfigured()) {
    if (restaurantSlug !== RESTAURANT_DEMO.slug) return null;
    const tables = inMemoryStore.getTables();
    return tables.find((t) => t.number.padStart(2, '0') === tableNumber.padStart(2, '0')) || null;
  }

  const supabase = createClient();
  const { data: restaurant } = await (supabase.from('restaurants') as any)
    .select('id')
    .eq('slug', restaurantSlug)
    .single();

  if (!restaurant) {
    return null;
  }

  const { data: table, error } = await (supabase.from('tables') as any)
    .select('*')
    .eq('restaurant_id', restaurant.id)
    .eq('number', tableNumber.padStart(2, '0'))
    .single();

  if (error || !table) {
    return null;
  }

  return table as Table;
}

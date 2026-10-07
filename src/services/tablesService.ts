import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { Table, TableStatus } from "@/types";
import { inMemoryStore } from "./mockStore";
import { RESTAURANT_DEMO } from "@/lib/constants";

export async function getTables(
  restaurantId: string = RESTAURANT_DEMO.id,
): Promise<Table[]> {
  if (!isSupabaseConfigured()) {
    return inMemoryStore.getTables();
  }

  const supabase = createClient();
  const { data: tables, error } = await supabase
    .from("tables")
    .select(
      `
      id,
      restaurant_id,
      number,
      device_id,
      status,
      created_at
    `,
    )
    .eq("restaurant_id", restaurantId)
    .order("number", { ascending: true });

  if (error || !tables) {
    throw new Error("Não foi possível carregar as mesas.");
  }

  // Busca chamados ativos para cruzar dados de tempo
  const { data: activeCalls } = await supabase
    .from("service_calls")
    .select("id, table_id, requested_at, status")
    .eq("restaurant_id", restaurantId)
    .in("status", ["CALLING", "ACKNOWLEDGED"]);

  return (tables as Table[]).map((t) => {
    const active = activeCalls?.find((c) => c.table_id === t.id);
    return {
      ...t,
      status: active ? (active.status as TableStatus) : t.status,
      active_call_id: active?.id || null,
      active_call_requested_at: active?.requested_at || null,
    };
  });
}

export async function updateTableStatus(
  tableId: string,
  status: TableStatus,
): Promise<boolean> {
  if (!isSupabaseConfigured()) {
    inMemoryStore.updateTableStatus(tableId, status);
    return true;
  }

  const supabase = createClient();
  const { data, error } = await supabase
    .from("tables")
    .update({ status })
    .eq("id", tableId)
    .select("id")
    .single();

  if (error) {
    console.error("Erro ao atualizar status da mesa:", error);
    return false;
  }

  return Boolean(data);
}

export async function getTableByNumber(
  restaurantSlug: string,
  tableNumber: string,
): Promise<Table | null> {
  if (!isSupabaseConfigured()) {
    if (restaurantSlug !== RESTAURANT_DEMO.slug) return null;
    const tables = inMemoryStore.getTables();
    return (
      tables.find(
        (t) => t.number.padStart(2, "0") === tableNumber.padStart(2, "0"),
      ) || null
    );
  }

  const supabase = createClient();
  const { data: table, error } = await supabase.rpc("public_table", {
    unit_slug: restaurantSlug,
    table_number: tableNumber.padStart(2, "0"),
  });

  if (error || !table) {
    return null;
  }

  return table as unknown as Table;
}

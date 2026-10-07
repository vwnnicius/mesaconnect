import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import type { ServiceCall } from "@/types";
import { inMemoryStore } from "./mockStore";
import { RESTAURANT_DEMO } from "@/lib/constants";
export async function createServiceCall(params: {
  restaurantId?: string;
  tableId: string;
  requestedBy?: string;
}): Promise<ServiceCall | null> {
  const restaurantId = params.restaurantId || RESTAURANT_DEMO.id;
  if (!isSupabaseConfigured())
    return inMemoryStore.createCall(params.tableId, restaurantId);
  const { data, error } = await createClient()
    .from("service_calls")
    .insert({
      restaurant_id: restaurantId,
      table_id: params.tableId,
      requested_by: params.requestedBy || "CLIENT_BUTTON",
      status: "CALLING",
    })
    .select()
    .single();
  if (error || !data)
    throw new Error(error?.message || "Não foi possível registrar o chamado.");
  return data;
}
export async function acknowledgeServiceCall(
  callId: string,
  staffUserId?: string,
): Promise<boolean> {
  if (!isSupabaseConfigured())
    return !!inMemoryStore.acknowledgeCall(callId, staffUserId || "Garçom");
  const client = createClient();
  const { data: auth, error: authError } = await client.auth.getUser();
  if (authError || !auth.user) return false;
  // The database stamps the actor/time and syncs the table in the same transaction.
  const { data, error } = await client
    .from("service_calls")
    .update({ status: "ACKNOWLEDGED" })
    .eq("id", callId)
    .eq("status", "CALLING")
    .select("id")
    .single();
  return !error && !!data;
}
export async function completeServiceCall(
  callId: string,
  staffUserId?: string,
): Promise<boolean> {
  if (!isSupabaseConfigured())
    return !!inMemoryStore.completeCall(callId, staffUserId || "Garçom");
  const client = createClient();
  const { data: auth, error: authError } = await client.auth.getUser();
  if (authError || !auth.user) return false;
  const { data, error } = await client
    .from("service_calls")
    .update({ status: "COMPLETED" })
    .eq("id", callId)
    .eq("status", "ACKNOWLEDGED")
    .select("id")
    .single();
  return !error && !!data;
}
export async function getActiveCalls(
  restaurantId: string = RESTAURANT_DEMO.id,
): Promise<ServiceCall[]> {
  if (!isSupabaseConfigured())
    return inMemoryStore
      .getCalls()
      .filter((c) => ["CALLING", "ACKNOWLEDGED"].includes(c.status))
      .sort((a, b) => Date.parse(a.requested_at) - Date.parse(b.requested_at));
  const { data, error } = await createClient()
    .from("service_calls")
    .select("*,table:tables(number)")
    .eq("restaurant_id", restaurantId)
    .in("status", ["CALLING", "ACKNOWLEDGED"])
    .order("requested_at");
  if (error || !data)
    throw new Error(error?.message || "Não foi possível carregar os chamados.");
  return data.map(({ table, ...call }) => ({
    ...call,
    table_number: table?.number || "—",
  }));
}

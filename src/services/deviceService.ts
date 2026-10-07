import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { createServiceCall } from "./callsService";
import { updateTableStatus } from "./tablesService";
import { inMemoryStore } from "./mockStore";
import type { Table } from "@/types";
export type DeviceEventType = "CALL" | "DO_NOT_DISTURB" | "RESET" | "HEARTBEAT";
export interface DeviceEventPayload {
  device_uid: string;
  event_type: DeviceEventType;
  token?: string;
  timestamp?: string;
  payload?: unknown;
}
export interface DeviceEventResult {
  success: boolean;
  message: string;
  table_id?: string;
  table_number?: string;
  call_id?: string;
}
// Both authenticated simulator and physical devices enter the same transactional database service.
export async function simulateTableEvent(
  table: Table,
  event: DeviceEventType,
): Promise<DeviceEventResult> {
  if (!isSupabaseConfigured()) {
    if (event === "CALL") {
      const call = await createServiceCall({
        restaurantId: table.restaurant_id,
        tableId: table.id,
        requestedBy: "SIMULATOR",
      });
      return {
        success: true,
        message: "Chamado registrado",
        table_number: table.number,
        call_id: call?.id,
      };
    }
    if (event !== "HEARTBEAT") {
      if (
        inMemoryStore
          .getCalls()
          .some(
            (c) =>
              c.table_id === table.id &&
              ["CALLING", "ACKNOWLEDGED"].includes(c.status),
          )
      )
        throw new Error("Conclua o atendimento ativo antes de alterar a mesa.");
      await updateTableStatus(
        table.id,
        event === "RESET" ? "AVAILABLE" : "DO_NOT_DISTURB",
      );
    }
    return {
      success: true,
      message: "Evento registrado",
      table_number: table.number,
    };
  }
  const { data, error } = await createClient().rpc("simulator_event", {
    target: table.id,
    event,
  });
  if (error) throw new Error(error.message);
  return data as unknown as DeviceEventResult;
}
export async function processDeviceEvent(
  event: DeviceEventPayload,
  client: ReturnType<typeof createClient> = createClient(),
): Promise<DeviceEventResult> {
  if (!event.token)
    return { success: false, message: "Token do dispositivo obrigatório" };
  const { data, error } = await client.rpc("device_gateway", {
    uid: event.device_uid,
    token: event.token,
    event: event.event_type,
  });
  return error
    ? {
        success: false,
        message: "Dispositivo não autorizado ou evento recusado",
      }
    : (data as unknown as DeviceEventResult);
}

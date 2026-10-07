import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';
import { createServiceCall } from './callsService';
import { updateTableStatus } from './tablesService';
import { inMemoryStore } from './mockStore';
import { RESTAURANT_DEMO } from '@/lib/constants';

export interface DeviceEventPayload {
  device_uid: string;
  event_type: 'CALL' | 'DO_NOT_DISTURB' | 'RESET' | 'HEARTBEAT';
  timestamp?: string;
  payload?: any;
}

export interface DeviceEventResult {
  success: boolean;
  message: string;
  table_id?: string;
  table_number?: string;
  call_id?: string;
}

export async function processDeviceEvent(
  event: DeviceEventPayload
): Promise<DeviceEventResult> {
  const { device_uid, event_type, payload } = event;

  // 1. Validação básica
  if (!device_uid) {
    return { success: false, message: 'device_uid é obrigatório' };
  }

  // 2. Se Supabase não configurado ou em modo demo, resolve via mockStore
  if (!isSupabaseConfigured()) {
    const tables = inMemoryStore.getTables();
    const match = device_uid.match(/^MESA-(\d+)-ESP32$/i);
    const tableNum = match ? String(Number(match[1])).padStart(2, '0') : null;
    const table = tables.find((t) => t.number.padStart(2, '0') === tableNum);

    if (!table) {
      return { success: false, message: `Dispositivo ${device_uid} não encontrado na base de demonstração` };
    }

    if (event_type === 'CALL') {
      const call = inMemoryStore.createCall(table.id, RESTAURANT_DEMO.id);
      return {
        success: true,
        message: `Chamado gerado para Mesa ${table.number}`,
        table_id: table.id,
        table_number: table.number,
        call_id: call.id,
      };
    } else if (event_type === 'DO_NOT_DISTURB') {
      inMemoryStore.updateTableStatus(table.id, 'DO_NOT_DISTURB');
      return { success: true, message: `Mesa ${table.number} colocada em Não Incomodar`, table_id: table.id, table_number: table.number };
    } else if (event_type === 'RESET') {
      inMemoryStore.updateTableStatus(table.id, 'AVAILABLE');
      return { success: true, message: `Mesa ${table.number} resetada para Disponível`, table_id: table.id, table_number: table.number };
    } else if (event_type === 'HEARTBEAT') {
      return { success: true, message: `Heartbeat recebido para ${device_uid}`, table_id: table.id, table_number: table.number };
    }

    return { success: false, message: `Tipo de evento desconhecido: ${event_type}` };
  }

  // 3. Supabase em modo Real
  const supabase = createClient();

  // Valida o dispositivo no banco antes de aceitar
  const { data: device, error: devError } = await (supabase.from('devices') as any)
    .select('id, table_id, device_uid, online')
    .eq('device_uid', device_uid)
    .single();

  if (devError || !device) {
    return {
      success: false,
      message: `Dispositivo não autorizado ou inexistente: ${device_uid}`,
    };
  }

  if (!device.table_id) {
    return {
      success: false,
      message: `Dispositivo ${device_uid} não está associado a nenhuma mesa`,
    };
  }

  const { data: table } = await (supabase.from('tables') as any)
    .select('id, number, restaurant_id')
    .eq('id', device.table_id)
    .single();

  if (!table) {
    return { success: false, message: 'Mesa associada não encontrada' };
  }

  // Registra o evento de telemetria
  await (supabase.from('device_events') as any).insert({
    device_id: device.id,
    table_id: table.id,
    event_type,
    payload: payload || {},
  });

  // Atualiza last_seen e status online
  await (supabase.from('devices') as any)
    .update({ online: true, last_seen: new Date().toISOString() })
    .eq('id', device.id);

  // Executa a lógica de negócio de acordo com o evento
  switch (event_type) {
    case 'CALL': {
      const call = await createServiceCall({
        restaurantId: table.restaurant_id,
        tableId: table.id,
        requestedBy: `DEVICE_${device_uid}`,
      });
      return {
        success: true,
        message: `Chamado registrado para Mesa ${table.number}`,
        table_id: table.id,
        table_number: table.number,
        call_id: call?.id,
      };
    }
    case 'DO_NOT_DISTURB': {
      await updateTableStatus(table.id, 'DO_NOT_DISTURB');
      return {
        success: true,
        message: `Mesa ${table.number} definida como Não Incomodar`,
        table_id: table.id,
        table_number: table.number,
      };
    }
    case 'RESET': {
      await updateTableStatus(table.id, 'AVAILABLE');
      return {
        success: true,
        message: `Mesa ${table.number} resetada para Disponível`,
        table_id: table.id,
        table_number: table.number,
      };
    }
    case 'HEARTBEAT': {
      return {
        success: true,
        message: `Heartbeat processado com sucesso`,
        table_id: table.id,
        table_number: table.number,
      };
    }
    default:
      return {
        success: false,
        message: `Tipo de evento inválido: ${event_type}`,
      };
  }
}

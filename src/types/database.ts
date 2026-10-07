export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type UserRole = "OWNER" | "MANAGER" | "WAITER";

export type TableStatus =
  | "AVAILABLE"
  | "DO_NOT_DISTURB"
  | "CALLING"
  | "ACKNOWLEDGED"
  | "COMPLETED"
  | "OFFLINE";

export type ServiceCallStatus =
  | "CALLING"
  | "ACKNOWLEDGED"
  | "COMPLETED"
  | "CANCELLED";

export interface Restaurant {
  id: string;
  name: string;
  slug: string;
  google_review_url?: string | null;
  created_at: string;
}

export interface Profile {
  id: string;
  restaurant_id: string;
  name: string;
  username?: string | null;
  role: UserRole;
  created_at: string;
}

export interface Table {
  id: string;
  restaurant_id: string;
  number: string;
  priority?: boolean;
  device_last_seen?: string | null;
  device_id: string | null;
  status: TableStatus;
  created_at: string;
  // Propriedades calculadas/relacionadas para facilidade na UI
  active_call_id?: string | null;
  active_call_requested_at?: string | null;
}

export interface Device {
  id: string;
  table_id: string | null;
  device_uid: string;
  online: boolean;
  last_seen: string | null;
  firmware_version: string | null;
  created_at: string;
}

export interface ServiceCall {
  id: string;
  restaurant_id: string;
  table_id: string;
  requested_at: string;
  acknowledged_at: string | null;
  completed_at: string | null;
  status: ServiceCallStatus;
  requested_by: string | null;
  acknowledged_by: string | null;
  completed_by: string | null;
  created_at: string;
  // Campos populados em joins:
  table_number?: string;
  table?: Table;
}

export interface Evaluation {
  id: string;
  restaurant_id: string;
  table_id: string;
  service_call_id: string | null;
  rating: number; // 1 a 5
  comment: string | null;
  created_at: string;
  table_number?: string;
}

export interface DeviceEvent {
  id: string;
  priority?: boolean;
  device_last_seen?: string | null;
  device_id: string | null;
  table_id: string | null;
  event_type: "CALL" | "DO_NOT_DISTURB" | "RESET" | "HEARTBEAT" | string;
  payload: Json;
  created_at: string;
}

export type { Database } from "./supabase-generated";

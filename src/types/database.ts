export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type UserRole = 'OWNER' | 'MANAGER' | 'WAITER';

export type TableStatus =
  | 'AVAILABLE'
  | 'DO_NOT_DISTURB'
  | 'CALLING'
  | 'ACKNOWLEDGED'
  | 'COMPLETED'
  | 'OFFLINE';

export type ServiceCallStatus =
  | 'CALLING'
  | 'ACKNOWLEDGED'
  | 'COMPLETED'
  | 'CANCELLED';

export interface Restaurant {
  id: string;
  name: string;
  slug: string;
  created_at: string;
}

export interface Profile {
  id: string;
  restaurant_id: string;
  name: string;
  role: UserRole;
  created_at: string;
}

export interface Table {
  id: string;
  restaurant_id: string;
  number: string;
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
  device_id: string | null;
  table_id: string | null;
  event_type: 'CALL' | 'DO_NOT_DISTURB' | 'RESET' | 'HEARTBEAT' | string;
  payload: Json;
  created_at: string;
}

export interface Database {
  public: {
    Tables: {
      restaurants: {
        Row: Restaurant;
        Insert: Omit<Restaurant, 'id' | 'created_at'> & { id?: string; created_at?: string };
        Update: Partial<Restaurant>;
      };
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, 'created_at'> & { created_at?: string };
        Update: Partial<Profile>;
      };
      tables: {
        Row: Table;
        Insert: Omit<Table, 'id' | 'created_at'> & { id?: string; created_at?: string };
        Update: Partial<Table>;
      };
      devices: {
        Row: Device;
        Insert: Omit<Device, 'id' | 'created_at'> & { id?: string; created_at?: string };
        Update: Partial<Device>;
      };
      service_calls: {
        Row: ServiceCall;
        Insert: Omit<ServiceCall, 'id' | 'created_at'> & { id?: string; created_at?: string };
        Update: Partial<ServiceCall>;
      };
      evaluations: {
        Row: Evaluation;
        Insert: Omit<Evaluation, 'id' | 'created_at'> & { id?: string; created_at?: string };
        Update: Partial<Evaluation>;
      };
      device_events: {
        Row: DeviceEvent;
        Insert: Omit<DeviceEvent, 'id' | 'created_at'> & { id?: string; created_at?: string };
        Update: Partial<DeviceEvent>;
      };
    };
  };
}

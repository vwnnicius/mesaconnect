export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.18";
  };
  public: {
    Tables: {
      device_events: {
        Row: {
          created_at: string;
          device_id: string | null;
          event_type: string;
          id: string;
          payload: Json | null;
          table_id: string | null;
        };
        Insert: {
          created_at?: string;
          device_id?: string | null;
          event_type: string;
          id?: string;
          payload?: Json | null;
          table_id?: string | null;
        };
        Update: {
          created_at?: string;
          device_id?: string | null;
          event_type?: string;
          id?: string;
          payload?: Json | null;
          table_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "device_events_device_id_fkey";
            columns: ["device_id"];
            isOneToOne: false;
            referencedRelation: "devices";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "device_events_table_id_fkey";
            columns: ["table_id"];
            isOneToOne: false;
            referencedRelation: "tables";
            referencedColumns: ["id"];
          },
        ];
      };
      devices: {
        Row: {
          created_at: string;
          device_uid: string;
          firmware_version: string | null;
          id: string;
          last_seen: string | null;
          online: boolean;
          table_id: string | null;
        };
        Insert: {
          created_at?: string;
          device_uid: string;
          firmware_version?: string | null;
          id?: string;
          last_seen?: string | null;
          online?: boolean;
          table_id?: string | null;
        };
        Update: {
          created_at?: string;
          device_uid?: string;
          firmware_version?: string | null;
          id?: string;
          last_seen?: string | null;
          online?: boolean;
          table_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "fk_devices_table";
            columns: ["table_id"];
            isOneToOne: false;
            referencedRelation: "tables";
            referencedColumns: ["id"];
          },
        ];
      };
      evaluations: {
        Row: {
          comment: string | null;
          created_at: string;
          id: string;
          rating: number;
          restaurant_id: string;
          service_call_id: string | null;
          table_id: string;
        };
        Insert: {
          comment?: string | null;
          created_at?: string;
          id?: string;
          rating: number;
          restaurant_id: string;
          service_call_id?: string | null;
          table_id: string;
        };
        Update: {
          comment?: string | null;
          created_at?: string;
          id?: string;
          rating?: number;
          restaurant_id?: string;
          service_call_id?: string | null;
          table_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "evaluations_restaurant_id_fkey";
            columns: ["restaurant_id"];
            isOneToOne: false;
            referencedRelation: "restaurants";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "evaluations_service_call_id_fkey";
            columns: ["service_call_id"];
            isOneToOne: false;
            referencedRelation: "service_calls";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "evaluations_table_id_fkey";
            columns: ["table_id"];
            isOneToOne: false;
            referencedRelation: "tables";
            referencedColumns: ["id"];
          },
        ];
      };
      profiles: {
        Row: {
          active: boolean;
          avatar_path: string | null;
          created_at: string;
          id: string;
          name: string;
          restaurant_id: string | null;
          role: Database["public"]["Enums"]["user_role"];
          sector: string | null;
        };
        Insert: {
          active?: boolean;
          avatar_path?: string | null;
          created_at?: string;
          id: string;
          name: string;
          restaurant_id?: string | null;
          role?: Database["public"]["Enums"]["user_role"];
          sector?: string | null;
        };
        Update: {
          active?: boolean;
          avatar_path?: string | null;
          created_at?: string;
          id?: string;
          name?: string;
          restaurant_id?: string | null;
          role?: Database["public"]["Enums"]["user_role"];
          sector?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "profiles_restaurant_id_fkey";
            columns: ["restaurant_id"];
            isOneToOne: false;
            referencedRelation: "restaurants";
            referencedColumns: ["id"];
          },
        ];
      };
      restaurant_settings: {
        Row: {
          floor_plan: Json;
          restaurant_id: string;
          updated_at: string;
        };
        Insert: {
          floor_plan?: Json;
          restaurant_id: string;
          updated_at?: string;
        };
        Update: {
          floor_plan?: Json;
          restaurant_id?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "restaurant_settings_restaurant_id_fkey";
            columns: ["restaurant_id"];
            isOneToOne: true;
            referencedRelation: "restaurants";
            referencedColumns: ["id"];
          },
        ];
      };
      restaurants: {
        Row: {
          cover_path: string | null;
          created_at: string;
          id: string;
          logo_path: string | null;
          name: string;
          slug: string;
        };
        Insert: {
          cover_path?: string | null;
          created_at?: string;
          id?: string;
          logo_path?: string | null;
          name: string;
          slug: string;
        };
        Update: {
          cover_path?: string | null;
          created_at?: string;
          id?: string;
          logo_path?: string | null;
          name?: string;
          slug?: string;
        };
        Relationships: [];
      };
      service_calls: {
        Row: {
          acknowledged_at: string | null;
          acknowledged_by: string | null;
          completed_at: string | null;
          completed_by: string | null;
          created_at: string;
          id: string;
          requested_at: string;
          requested_by: string | null;
          restaurant_id: string;
          status: Database["public"]["Enums"]["call_status"];
          table_id: string;
        };
        Insert: {
          acknowledged_at?: string | null;
          acknowledged_by?: string | null;
          completed_at?: string | null;
          completed_by?: string | null;
          created_at?: string;
          id?: string;
          requested_at?: string;
          requested_by?: string | null;
          restaurant_id: string;
          status?: Database["public"]["Enums"]["call_status"];
          table_id: string;
        };
        Update: {
          acknowledged_at?: string | null;
          acknowledged_by?: string | null;
          completed_at?: string | null;
          completed_by?: string | null;
          created_at?: string;
          id?: string;
          requested_at?: string;
          requested_by?: string | null;
          restaurant_id?: string;
          status?: Database["public"]["Enums"]["call_status"];
          table_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "service_calls_acknowledged_by_fkey";
            columns: ["acknowledged_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "service_calls_completed_by_fkey";
            columns: ["completed_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "service_calls_restaurant_id_fkey";
            columns: ["restaurant_id"];
            isOneToOne: false;
            referencedRelation: "restaurants";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "service_calls_table_id_fkey";
            columns: ["table_id"];
            isOneToOne: false;
            referencedRelation: "tables";
            referencedColumns: ["id"];
          },
        ];
      };
      tables: {
        Row: {
          created_at: string;
          device_id: string | null;
          id: string;
          number: string;
          restaurant_id: string;
          status: Database["public"]["Enums"]["table_status"];
        };
        Insert: {
          created_at?: string;
          device_id?: string | null;
          id?: string;
          number: string;
          restaurant_id: string;
          status?: Database["public"]["Enums"]["table_status"];
        };
        Update: {
          created_at?: string;
          device_id?: string | null;
          id?: string;
          number?: string;
          restaurant_id?: string;
          status?: Database["public"]["Enums"]["table_status"];
        };
        Relationships: [
          {
            foreignKeyName: "tables_device_id_fkey";
            columns: ["device_id"];
            isOneToOne: false;
            referencedRelation: "devices";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "tables_restaurant_id_fkey";
            columns: ["restaurant_id"];
            isOneToOne: false;
            referencedRelation: "restaurants";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      current_user_restaurant_id: { Args: never; Returns: string };
      device_gateway: {
        Args: { event: string; token: string; uid: string };
        Returns: Json;
      };
      pair_table_device: { Args: { target: string }; Returns: Json };
      public_table: {
        Args: { table_number: string; unit_slug: string };
        Returns: Json;
      };
      simulator_event: {
        Args: { event: string; target: string };
        Returns: Json;
      };
      submit_evaluation: {
        Args: { note: string; score: number; target: string };
        Returns: string;
      };
    };
    Enums: {
      call_status: "CALLING" | "ACKNOWLEDGED" | "COMPLETED" | "CANCELLED";
      table_status:
        | "AVAILABLE"
        | "DO_NOT_DISTURB"
        | "CALLING"
        | "ACKNOWLEDGED"
        | "COMPLETED"
        | "OFFLINE";
      user_role: "OWNER" | "MANAGER" | "WAITER";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<
  keyof Database,
  "public"
>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {
      call_status: ["CALLING", "ACKNOWLEDGED", "COMPLETED", "CANCELLED"],
      table_status: [
        "AVAILABLE",
        "DO_NOT_DISTURB",
        "CALLING",
        "ACKNOWLEDGED",
        "COMPLETED",
        "OFFLINE",
      ],
      user_role: ["OWNER", "MANAGER", "WAITER"],
    },
  },
} as const;

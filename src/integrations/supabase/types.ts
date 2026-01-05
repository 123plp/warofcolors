export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      friends: {
        Row: {
          created_at: string | null
          friend_id: string
          id: string
          status: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          friend_id: string
          id?: string
          status?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          friend_id?: string
          id?: string
          status?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      message_rate_limits: {
        Row: {
          blocked_until: string | null
          message_count: number | null
          user_id: string
          window_start: string | null
        }
        Insert: {
          blocked_until?: string | null
          message_count?: number | null
          user_id: string
          window_start?: string | null
        }
        Update: {
          blocked_until?: string | null
          message_count?: number | null
          user_id?: string
          window_start?: string | null
        }
        Relationships: []
      }
      messages: {
        Row: {
          body: string
          created_at: string | null
          id: string
          message_type: string | null
          metadata: Json | null
          priority: string | null
          read_at: string | null
          recipient_id: string
          sender_id: string
          subject: string
        }
        Insert: {
          body: string
          created_at?: string | null
          id?: string
          message_type?: string | null
          metadata?: Json | null
          priority?: string | null
          read_at?: string | null
          recipient_id: string
          sender_id: string
          subject: string
        }
        Update: {
          body?: string
          created_at?: string | null
          id?: string
          message_type?: string | null
          metadata?: Json | null
          priority?: string | null
          read_at?: string | null
          recipient_id?: string
          sender_id?: string
          subject?: string
        }
        Relationships: []
      }
      moderation_actions: {
        Row: {
          action_type: string
          created_at: string | null
          created_by: string | null
          expires_at: string | null
          id: string
          is_active: boolean | null
          is_fake: boolean | null
          reason: string | null
          target_ip: unknown
          target_user_id: string | null
        }
        Insert: {
          action_type: string
          created_at?: string | null
          created_by?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          is_fake?: boolean | null
          reason?: string | null
          target_ip?: unknown
          target_user_id?: string | null
        }
        Update: {
          action_type?: string
          created_at?: string | null
          created_by?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          is_fake?: boolean | null
          reason?: string | null
          target_ip?: unknown
          target_user_id?: string | null
        }
        Relationships: []
      }
      monitoring_events: {
        Row: {
          created_at: string | null
          event_data: Json | null
          event_type: string
          id: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          event_data?: Json | null
          event_type: string
          id?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          event_data?: Json | null
          event_type?: string
          id?: string
          user_id?: string | null
        }
        Relationships: []
      }
      navi_auto_actions: {
        Row: {
          action_type: string
          created_at: string | null
          id: string
          reason: string
          reversed: boolean | null
          reversed_at: string | null
          reversed_by: string | null
          target_user_id: string | null
          threat_level: string | null
          trigger_stats: Json | null
        }
        Insert: {
          action_type: string
          created_at?: string | null
          id?: string
          reason: string
          reversed?: boolean | null
          reversed_at?: string | null
          reversed_by?: string | null
          target_user_id?: string | null
          threat_level?: string | null
          trigger_stats?: Json | null
        }
        Update: {
          action_type?: string
          created_at?: string | null
          id?: string
          reason?: string
          reversed?: boolean | null
          reversed_at?: string | null
          reversed_by?: string | null
          target_user_id?: string | null
          threat_level?: string | null
          trigger_stats?: Json | null
        }
        Relationships: []
      }
      navi_messages: {
        Row: {
          created_at: string | null
          id: string
          message: string
          priority: string | null
          sent_by: string | null
          target_audience: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          message: string
          priority?: string | null
          sent_by?: string | null
          target_audience?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          message?: string
          priority?: string | null
          sent_by?: string | null
          target_audience?: string | null
        }
        Relationships: []
      }
      navi_settings: {
        Row: {
          adaptive_thresholds_enabled: boolean | null
          auto_disable_signups: boolean | null
          auto_lockdown_enabled: boolean | null
          auto_read_only_mode: boolean | null
          auto_temp_ban_enabled: boolean | null
          auto_vip_only_mode: boolean | null
          auto_warn_enabled: boolean | null
          degraded_service_messages_enabled: boolean | null
          disable_messages: boolean | null
          disable_signups: boolean | null
          failed_login_rolling_avg: number | null
          failed_login_threshold: number | null
          id: string
          last_threshold_adjustment: string | null
          lockdown_mode: boolean | null
          lockdown_multiplier: number | null
          maintenance_message: string | null
          maintenance_mode: boolean | null
          message_rolling_avg: number | null
          message_threshold: number | null
          push_critical_enabled: boolean | null
          push_recovery_enabled: boolean | null
          push_warning_enabled: boolean | null
          read_only_mode: boolean | null
          signup_rolling_avg: number | null
          signup_threshold: number | null
          updated_at: string | null
          updated_by: string | null
          vip_only_mode: boolean | null
          warning_messages_enabled: boolean | null
          welcome_messages_enabled: boolean | null
        }
        Insert: {
          adaptive_thresholds_enabled?: boolean | null
          auto_disable_signups?: boolean | null
          auto_lockdown_enabled?: boolean | null
          auto_read_only_mode?: boolean | null
          auto_temp_ban_enabled?: boolean | null
          auto_vip_only_mode?: boolean | null
          auto_warn_enabled?: boolean | null
          degraded_service_messages_enabled?: boolean | null
          disable_messages?: boolean | null
          disable_signups?: boolean | null
          failed_login_rolling_avg?: number | null
          failed_login_threshold?: number | null
          id?: string
          last_threshold_adjustment?: string | null
          lockdown_mode?: boolean | null
          lockdown_multiplier?: number | null
          maintenance_message?: string | null
          maintenance_mode?: boolean | null
          message_rolling_avg?: number | null
          message_threshold?: number | null
          push_critical_enabled?: boolean | null
          push_recovery_enabled?: boolean | null
          push_warning_enabled?: boolean | null
          read_only_mode?: boolean | null
          signup_rolling_avg?: number | null
          signup_threshold?: number | null
          updated_at?: string | null
          updated_by?: string | null
          vip_only_mode?: boolean | null
          warning_messages_enabled?: boolean | null
          welcome_messages_enabled?: boolean | null
        }
        Update: {
          adaptive_thresholds_enabled?: boolean | null
          auto_disable_signups?: boolean | null
          auto_lockdown_enabled?: boolean | null
          auto_read_only_mode?: boolean | null
          auto_temp_ban_enabled?: boolean | null
          auto_vip_only_mode?: boolean | null
          auto_warn_enabled?: boolean | null
          degraded_service_messages_enabled?: boolean | null
          disable_messages?: boolean | null
          disable_signups?: boolean | null
          failed_login_rolling_avg?: number | null
          failed_login_threshold?: number | null
          id?: string
          last_threshold_adjustment?: string | null
          lockdown_mode?: boolean | null
          lockdown_multiplier?: number | null
          maintenance_message?: string | null
          maintenance_mode?: boolean | null
          message_rolling_avg?: number | null
          message_threshold?: number | null
          push_critical_enabled?: boolean | null
          push_recovery_enabled?: boolean | null
          push_warning_enabled?: boolean | null
          read_only_mode?: boolean | null
          signup_rolling_avg?: number | null
          signup_threshold?: number | null
          updated_at?: string | null
          updated_by?: string | null
          vip_only_mode?: boolean | null
          warning_messages_enabled?: boolean | null
          welcome_messages_enabled?: boolean | null
        }
        Relationships: []
      }
      navi_threshold_history: {
        Row: {
          id: string
          metric_type: string
          recorded_at: string | null
          value: number
        }
        Insert: {
          id?: string
          metric_type: string
          recorded_at?: string | null
          value: number
        }
        Update: {
          id?: string
          metric_type?: string
          recorded_at?: string | null
          value?: number
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          clearance: number | null
          created_at: string
          display_name: string | null
          id: string
          role: string | null
          settings: Json | null
          updated_at: string
          user_id: string
          username: string
        }
        Insert: {
          avatar_url?: string | null
          clearance?: number | null
          created_at?: string
          display_name?: string | null
          id?: string
          role?: string | null
          settings?: Json | null
          updated_at?: string
          user_id: string
          username: string
        }
        Update: {
          avatar_url?: string | null
          clearance?: number | null
          created_at?: string
          display_name?: string | null
          id?: string
          role?: string | null
          settings?: Json | null
          updated_at?: string
          user_id?: string
          username?: string
        }
        Relationships: []
      }
      site_locks: {
        Row: {
          id: string
          is_locked: boolean | null
          lock_reason: string | null
          locked_at: string | null
          locked_by: string | null
        }
        Insert: {
          id?: string
          is_locked?: boolean | null
          lock_reason?: string | null
          locked_at?: string | null
          locked_by?: string | null
        }
        Update: {
          id?: string
          is_locked?: boolean | null
          lock_reason?: string | null
          locked_at?: string | null
          locked_by?: string | null
        }
        Relationships: []
      }
      site_status: {
        Row: {
          id: string
          message: string | null
          status: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          id: string
          message?: string | null
          status?: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          id?: string
          message?: string | null
          status?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      synced_settings: {
        Row: {
          created_at: string
          desktop_icons: Json | null
          id: string
          install_type: string | null
          installed_apps: Json | null
          last_sync: string
          system_settings: Json | null
          user_id: string
        }
        Insert: {
          created_at?: string
          desktop_icons?: Json | null
          id?: string
          install_type?: string | null
          installed_apps?: Json | null
          last_sync?: string
          system_settings?: Json | null
          user_id: string
        }
        Update: {
          created_at?: string
          desktop_icons?: Json | null
          id?: string
          install_type?: string | null
          installed_apps?: Json | null
          last_sync?: string
          system_settings?: Json | null
          user_id?: string
        }
        Relationships: []
      }
      user_first_login: {
        Row: {
          created_at: string | null
          user_id: string
          welcomed: boolean | null
          welcomed_at: string | null
        }
        Insert: {
          created_at?: string | null
          user_id: string
          welcomed?: boolean | null
          welcomed_at?: string | null
        }
        Update: {
          created_at?: string | null
          user_id?: string
          welcomed?: boolean | null
          welcomed_at?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          granted_at: string | null
          granted_by: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          granted_at?: string | null
          granted_by?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          granted_at?: string | null
          granted_by?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      uur_submissions: {
        Row: {
          author: string
          description: string | null
          github_url: string
          id: string
          package_name: string
          reviewed_at: string | null
          reviewer_notes: string | null
          status: string
          submitted_at: string
          submitted_by: string | null
        }
        Insert: {
          author: string
          description?: string | null
          github_url: string
          id?: string
          package_name: string
          reviewed_at?: string | null
          reviewer_notes?: string | null
          status?: string
          submitted_at?: string
          submitted_by?: string | null
        }
        Update: {
          author?: string
          description?: string | null
          github_url?: string
          id?: string
          package_name?: string
          reviewed_at?: string | null
          reviewer_notes?: string | null
          status?: string
          submitted_at?: string
          submitted_by?: string | null
        }
        Relationships: []
      }
      vips: {
        Row: {
          granted_at: string | null
          granted_by: string | null
          id: string
          reason: string | null
          user_id: string
        }
        Insert: {
          granted_at?: string | null
          granted_by?: string | null
          id?: string
          reason?: string | null
          user_id: string
        }
        Update: {
          granted_at?: string | null
          granted_by?: string | null
          id?: string
          reason?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      adjust_navi_thresholds: { Args: never; Returns: undefined }
      check_and_send_message: {
        Args: {
          p_body: string
          p_priority?: string
          p_recipient_id: string
          p_subject: string
        }
        Returns: Json
      }
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_creator: { Args: { _user_id: string }; Returns: boolean }
      is_vip: { Args: { _user_id: string }; Returns: boolean }
      record_navi_metrics: { Args: never; Returns: undefined }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user" | "creator"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "moderator", "user", "creator"],
    },
  },
} as const

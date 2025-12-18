export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      availabilities: {
        Row: {
          created_at: string
          dtstart: string | null
          duration_mn: number
          id: string
          rrule: string
          until: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          dtstart?: string | null
          duration_mn: number
          id?: string
          rrule: string
          until?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          dtstart?: string | null
          duration_mn?: number
          id?: string
          rrule?: string
          until?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "availabilities_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "professionals"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "availabilities_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "professionals_with_profiles_search"
            referencedColumns: ["user_id"]
          },
        ]
      }
      mission_schedules: {
        Row: {
          created_at: string
          dtstart: string | null
          duration_mn: number
          id: string
          mission_id: string
          rrule: string
          until: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          dtstart?: string | null
          duration_mn: number
          id?: string
          mission_id: string
          rrule: string
          until?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          dtstart?: string | null
          duration_mn?: number
          id?: string
          mission_id?: string
          rrule?: string
          until?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "mission_schedules_mission_id_fkey"
            columns: ["mission_id"]
            isOneToOne: false
            referencedRelation: "missions"
            referencedColumns: ["id"]
          },
        ]
      }
      missions: {
        Row: {
          created_at: string
          description: string | null
          id: string
          mission_dtstart: string
          mission_until: string
          professional_id: string
          status: Database["public"]["Enums"]["mission_status"]
          structure_id: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          mission_dtstart: string
          mission_until: string
          professional_id: string
          status?: Database["public"]["Enums"]["mission_status"]
          structure_id: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          mission_dtstart?: string
          mission_until?: string
          professional_id?: string
          status?: Database["public"]["Enums"]["mission_status"]
          structure_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "missions_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "professionals"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "missions_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "professionals_with_profiles_search"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "missions_structure_id_fkey"
            columns: ["structure_id"]
            isOneToOne: false
            referencedRelation: "structures"
            referencedColumns: ["user_id"]
          },
        ]
      }
      newsletter_subscriptions: {
        Row: {
          created_at: string
          email: string
          id: string
          name: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          name?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          name?: string | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          data: Json
          id: string
          read_at: string | null
          recipient_id: string
          recipient_role: Database["public"]["Enums"]["role"]
          type: Database["public"]["Enums"]["notification_type"]
        }
        Insert: {
          created_at?: string
          data: Json
          id?: string
          read_at?: string | null
          recipient_id: string
          recipient_role: Database["public"]["Enums"]["role"]
          type: Database["public"]["Enums"]["notification_type"]
        }
        Update: {
          created_at?: string
          data?: Json
          id?: string
          read_at?: string | null
          recipient_id?: string
          recipient_role?: Database["public"]["Enums"]["role"]
          type?: Database["public"]["Enums"]["notification_type"]
        }
        Relationships: [
          {
            foreignKeyName: "notifications_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      professionals: {
        Row: {
          city: string
          created_at: string
          current_job: string | null
          description: string | null
          experience_years: number
          has_used_trial: boolean
          hourly_rate: number
          intervention_radius_km: number
          is_available: boolean
          is_certified: boolean
          phone: string | null
          postal_code: string | null
          rating: number | null
          reviews_count: number
          skills: string[] | null
          stripe_customer_id: string | null
          updated_at: string
          user_id: string
          verified_at: string | null
        }
        Insert: {
          city: string
          created_at?: string
          current_job?: string | null
          description?: string | null
          experience_years: number
          has_used_trial?: boolean
          hourly_rate: number
          intervention_radius_km: number
          is_available?: boolean
          is_certified?: boolean
          phone?: string | null
          postal_code?: string | null
          rating?: number | null
          reviews_count?: number
          skills?: string[] | null
          stripe_customer_id?: string | null
          updated_at?: string
          user_id: string
          verified_at?: string | null
        }
        Update: {
          city?: string
          created_at?: string
          current_job?: string | null
          description?: string | null
          experience_years?: number
          has_used_trial?: boolean
          hourly_rate?: number
          intervention_radius_km?: number
          is_available?: boolean
          is_certified?: boolean
          phone?: string | null
          postal_code?: string | null
          rating?: number | null
          reviews_count?: number
          skills?: string[] | null
          stripe_customer_id?: string | null
          updated_at?: string
          user_id?: string
          verified_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "professionals_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          first_name: string | null
          is_onboarded: boolean
          last_name: string | null
          preferred_language: Database["public"]["Enums"]["locale"]
          role: Database["public"]["Enums"]["role"]
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          first_name?: string | null
          is_onboarded?: boolean
          last_name?: string | null
          preferred_language?: Database["public"]["Enums"]["locale"]
          role: Database["public"]["Enums"]["role"]
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          first_name?: string | null
          is_onboarded?: boolean
          last_name?: string | null
          preferred_language?: Database["public"]["Enums"]["locale"]
          role?: Database["public"]["Enums"]["role"]
          user_id?: string
        }
        Relationships: []
      }
      report_attachments: {
        Row: {
          created_at: string
          file_name: string
          file_path: string
          file_size: number
          id: string
          mime_type: string
          report_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          file_name: string
          file_path: string
          file_size: number
          id?: string
          mime_type: string
          report_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          file_name?: string
          file_path?: string
          file_size?: number
          id?: string
          mime_type?: string
          report_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "report_attachments_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "reports"
            referencedColumns: ["id"]
          },
        ]
      }
      reports: {
        Row: {
          author_id: string
          content: string
          created_at: string
          id: string
          mission_id: string
          status: Database["public"]["Enums"]["report_status"]
          title: string
          updated_at: string
        }
        Insert: {
          author_id: string
          content: string
          created_at?: string
          id?: string
          mission_id: string
          status?: Database["public"]["Enums"]["report_status"]
          title: string
          updated_at?: string
        }
        Update: {
          author_id?: string
          content?: string
          created_at?: string
          id?: string
          mission_id?: string
          status?: Database["public"]["Enums"]["report_status"]
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reports_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "professionals"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "reports_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "professionals_with_profiles_search"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "reports_mission_id_fkey"
            columns: ["mission_id"]
            isOneToOne: false
            referencedRelation: "missions"
            referencedColumns: ["id"]
          },
        ]
      }
      structure_invitations: {
        Row: {
          created_at: string
          id: string
          professional_id: string
          status: Database["public"]["Enums"]["invitation_status"]
          structure_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          professional_id: string
          status?: Database["public"]["Enums"]["invitation_status"]
          structure_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          professional_id?: string
          status?: Database["public"]["Enums"]["invitation_status"]
          structure_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "structure_invitations_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "professionals"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "structure_invitations_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "professionals_with_profiles_search"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "structure_invitations_structure_id_fkey"
            columns: ["structure_id"]
            isOneToOne: false
            referencedRelation: "structures"
            referencedColumns: ["user_id"]
          },
        ]
      }
      structure_members: {
        Row: {
          created_at: string
          deleted_at: string | null
          id: string
          professional_id: string
          structure_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          id?: string
          professional_id: string
          structure_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          id?: string
          professional_id?: string
          structure_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "structure_members_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "professionals"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "structure_members_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "professionals_with_profiles_search"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "structure_members_structure_id_fkey"
            columns: ["structure_id"]
            isOneToOne: false
            referencedRelation: "structures"
            referencedColumns: ["user_id"]
          },
        ]
      }
      structure_membership_history: {
        Row: {
          action: Database["public"]["Enums"]["membership_action"]
          created_at: string
          id: string
          initiated_by: string
          initiated_by_role: Database["public"]["Enums"]["role"]
          membership_id: string
          professional_id: string
          structure_id: string
        }
        Insert: {
          action: Database["public"]["Enums"]["membership_action"]
          created_at?: string
          id?: string
          initiated_by: string
          initiated_by_role: Database["public"]["Enums"]["role"]
          membership_id: string
          professional_id: string
          structure_id: string
        }
        Update: {
          action?: Database["public"]["Enums"]["membership_action"]
          created_at?: string
          id?: string
          initiated_by?: string
          initiated_by_role?: Database["public"]["Enums"]["role"]
          membership_id?: string
          professional_id?: string
          structure_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "structure_membership_history_initiated_by_fkey"
            columns: ["initiated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "structure_membership_history_membership_id_fkey"
            columns: ["membership_id"]
            isOneToOne: false
            referencedRelation: "structure_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "structure_membership_history_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "professionals"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "structure_membership_history_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "professionals_with_profiles_search"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "structure_membership_history_structure_id_fkey"
            columns: ["structure_id"]
            isOneToOne: false
            referencedRelation: "structures"
            referencedColumns: ["user_id"]
          },
        ]
      }
      structures: {
        Row: {
          created_at: string
          name: string
          stripe_customer_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          name: string
          stripe_customer_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          name?: string
          stripe_customer_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "structures_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          cancel_at_period_end: boolean
          canceled_at: string | null
          created_at: string
          current_period_end: string | null
          current_period_start: string | null
          id: string
          professional_id: string
          status: Database["public"]["Enums"]["subscription_status"]
          stripe_price_id: string
          stripe_subscription_id: string
          trial_end: string | null
          trial_start: string | null
          updated_at: string
        }
        Insert: {
          cancel_at_period_end?: boolean
          canceled_at?: string | null
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          professional_id: string
          status: Database["public"]["Enums"]["subscription_status"]
          stripe_price_id: string
          stripe_subscription_id: string
          trial_end?: string | null
          trial_start?: string | null
          updated_at?: string
        }
        Update: {
          cancel_at_period_end?: boolean
          canceled_at?: string | null
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          professional_id?: string
          status?: Database["public"]["Enums"]["subscription_status"]
          stripe_price_id?: string
          stripe_subscription_id?: string
          trial_end?: string | null
          trial_start?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "professionals"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "subscriptions_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "professionals_with_profiles_search"
            referencedColumns: ["user_id"]
          },
        ]
      }
    }
    Views: {
      professionals_with_profiles_search: {
        Row: {
          avatar_url: string | null
          city: string | null
          created_at: string | null
          current_job: string | null
          description: string | null
          experience_years: number | null
          first_name: string | null
          hourly_rate: number | null
          intervention_radius_km: number | null
          is_available: boolean | null
          is_certified: boolean | null
          is_onboarded: boolean | null
          last_name: string | null
          phone: string | null
          postal_code: string | null
          profile_created_at: string | null
          profile_email: string | null
          profile_role: Database["public"]["Enums"]["role"] | null
          rating: number | null
          reviews_count: number | null
          skills: string[] | null
          stripe_customer_id: string | null
          updated_at: string | null
          user_id: string | null
          verified_at: string | null
        }
        Relationships: [
          {
            foreignKeyName: "professionals_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
    }
    Functions: {
      add_exdate_to_recurring_availability: {
        Args: { availability_id_param: string; date_to_exclude: string }
        Returns: string
      }
      create_onetime_availability: {
        Args: {
          day_offset: number
          duration_minutes: number
          hour: number
          user_id_param: string
        }
        Returns: string
      }
      create_recurring_availability: {
        Args: {
          day_offset: number
          duration_minutes: number
          exdate_offsets?: number[]
          hour: number
          user_id_param: string
        }
        Returns: string
      }
      expire_pending_missions: { Args: never; Returns: number }
      get_rrule_day: { Args: { day_offset: number }; Returns: string }
      get_vault_secret: { Args: { secret_name: string }; Returns: string }
      is_admin: { Args: never; Returns: boolean }
      is_professional_subscribed: {
        Args: { user_id_param: string }
        Returns: boolean
      }
      seeds_create_mission_from_availability: {
        Args: {
          day_offset: number
          description_param?: string
          duration_minutes: number
          hour: number
          professional_id_param: string
          status_param?: string
          structure_id_param: string
          title_param?: string
          until_offset?: number
          weeks_ahead?: number
        }
        Returns: string
      }
      seeds_create_mission_rrule: {
        Args: {
          day_offset: number
          duration_minutes: number
          hour: number
          until_offset?: number
          weeks_ahead?: number
        }
        Returns: string
      }
      seeds_create_onetime_availability: {
        Args: {
          day_offset: number
          duration_minutes: number
          hour: number
          user_id_param: string
        }
        Returns: string
      }
      seeds_create_recurring_availability: {
        Args: {
          day_offset: number
          duration_minutes: number
          exdate_offsets?: number[]
          hour: number
          user_id_param: string
        }
        Returns: string
      }
      seeds_format_exdate: { Args: { date_offset: number }; Returns: string }
      seeds_get_next_weekday: {
        Args: { days_ahead?: number; target_dow: number }
        Returns: string
      }
      seeds_get_rrule_day: { Args: { day_offset: number }; Returns: string }
    }
    Enums: {
      invitation_status: "pending" | "accepted" | "declined"
      locale: "en" | "fr"
      membership_action:
        | "joined"
        | "left"
        | "removed_by_structure"
        | "removed_by_admin"
      mission_status:
        | "pending"
        | "accepted"
        | "declined"
        | "cancelled"
        | "expired"
      notification_type:
        | "invitation_received"
        | "invitation_accepted"
        | "invitation_declined"
        | "member_quit"
        | "member_fired"
        | "mission_received"
        | "mission_accepted"
        | "mission_declined"
        | "mission_cancelled"
        | "report_sent"
      report_status: "draft" | "sent"
      role: "professional" | "structure" | "admin"
      subscription_status:
        | "active"
        | "trialing"
        | "past_due"
        | "canceled"
        | "unpaid"
        | "incomplete"
        | "incomplete_expired"
        | "paused"
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      invitation_status: ["pending", "accepted", "declined"],
      locale: ["en", "fr"],
      membership_action: [
        "joined",
        "left",
        "removed_by_structure",
        "removed_by_admin",
      ],
      mission_status: [
        "pending",
        "accepted",
        "declined",
        "cancelled",
        "expired",
      ],
      notification_type: [
        "invitation_received",
        "invitation_accepted",
        "invitation_declined",
        "member_quit",
        "member_fired",
        "mission_received",
        "mission_accepted",
        "mission_declined",
        "mission_cancelled",
        "report_sent",
      ],
      report_status: ["draft", "sent"],
      role: ["professional", "structure", "admin"],
      subscription_status: [
        "active",
        "trialing",
        "past_due",
        "canceled",
        "unpaid",
        "incomplete",
        "incomplete_expired",
        "paused",
      ],
    },
  },
} as const


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
      appointment_reminders: {
        Row: {
          created_at: string
          id: string
          mission_id: string
          mission_schedule_id: string
          occurrence_date: string
          sent_at: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          mission_id: string
          mission_schedule_id: string
          occurrence_date: string
          sent_at?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          mission_id?: string
          mission_schedule_id?: string
          occurrence_date?: string
          sent_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "appointment_reminders_mission_id_fkey"
            columns: ["mission_id"]
            isOneToOne: false
            referencedRelation: "missions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointment_reminders_mission_schedule_id_fkey"
            columns: ["mission_schedule_id"]
            isOneToOne: false
            referencedRelation: "mission_schedules"
            referencedColumns: ["id"]
          },
        ]
      }
      appointment_reminders_pending: {
        Row: {
          attempts: number
          created_at: string
          error_message: string | null
          id: string
          last_attempt_at: string | null
          mission_id: string
          mission_schedule_id: string
          next_retry_at: string | null
          occurrence_date: string
          processed_at: string | null
          reminder_type: string
          status: string
        }
        Insert: {
          attempts?: number
          created_at?: string
          error_message?: string | null
          id?: string
          last_attempt_at?: string | null
          mission_id: string
          mission_schedule_id: string
          next_retry_at?: string | null
          occurrence_date: string
          processed_at?: string | null
          reminder_type?: string
          status?: string
        }
        Update: {
          attempts?: number
          created_at?: string
          error_message?: string | null
          id?: string
          last_attempt_at?: string | null
          mission_id?: string
          mission_schedule_id?: string
          next_retry_at?: string | null
          occurrence_date?: string
          processed_at?: string | null
          reminder_type?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointment_reminders_pending_mission_id_fkey"
            columns: ["mission_id"]
            isOneToOne: false
            referencedRelation: "missions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointment_reminders_pending_mission_schedule_id_fkey"
            columns: ["mission_schedule_id"]
            isOneToOne: false
            referencedRelation: "mission_schedules"
            referencedColumns: ["id"]
          },
        ]
      }
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
      conversations: {
        Row: {
          created_at: string
          id: string
          last_message_at: string | null
          last_message_preview: string | null
          mission_id: string | null
          professional_id: string
          structure_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          last_message_at?: string | null
          last_message_preview?: string | null
          mission_id?: string | null
          professional_id: string
          structure_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          last_message_at?: string | null
          last_message_preview?: string | null
          mission_id?: string | null
          professional_id?: string
          structure_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversations_mission_id_fkey"
            columns: ["mission_id"]
            isOneToOne: false
            referencedRelation: "missions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "professionals"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "conversations_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "professionals_with_profiles_search"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "conversations_structure_id_fkey"
            columns: ["structure_id"]
            isOneToOne: false
            referencedRelation: "structures"
            referencedColumns: ["user_id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          sender_id: string
          status: string | null
          type: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          sender_id: string
          status?: string | null
          type?: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          sender_id?: string
          status?: string | null
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
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
          address: string | null
          created_at: string
          description: string | null
          id: string
          mission_dtstart: string
          mission_until: string
          modality: Database["public"]["Enums"]["mission_modality"]
          professional_id: string
          status: Database["public"]["Enums"]["mission_status"]
          structure_id: string
          title: string
          updated_at: string
        }
        Insert: {
          address?: string | null
          created_at?: string
          description?: string | null
          id?: string
          mission_dtstart: string
          mission_until: string
          modality?: Database["public"]["Enums"]["mission_modality"]
          professional_id: string
          status?: Database["public"]["Enums"]["mission_status"]
          structure_id: string
          title: string
          updated_at?: string
        }
        Update: {
          address?: string | null
          created_at?: string
          description?: string | null
          id?: string
          mission_dtstart?: string
          mission_until?: string
          modality?: Database["public"]["Enums"]["mission_modality"]
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
      professional_notification_preferences: {
        Row: {
          appointment_reminders: boolean
          created_at: string
          email_notifications: boolean
          newsletter: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          appointment_reminders?: boolean
          created_at?: string
          email_notifications?: boolean
          newsletter?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          appointment_reminders?: boolean
          created_at?: string
          email_notifications?: boolean
          newsletter?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "professional_notification_preferences_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "professionals"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "professional_notification_preferences_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "professionals_with_profiles_search"
            referencedColumns: ["user_id"]
          },
        ]
      }
      professional_ratings: {
        Row: {
          comment: string | null
          created_at: string
          id: string
          professional_id: string
          rating: number
          structure_id: string
          updated_at: string
        }
        Insert: {
          comment?: string | null
          created_at?: string
          id?: string
          professional_id: string
          rating: number
          structure_id: string
          updated_at?: string
        }
        Update: {
          comment?: string | null
          created_at?: string
          id?: string
          professional_id?: string
          rating?: number
          structure_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "professional_ratings_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "professionals"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "professional_ratings_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "professionals_with_profiles_search"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "professional_ratings_structure_id_fkey"
            columns: ["structure_id"]
            isOneToOne: false
            referencedRelation: "structures"
            referencedColumns: ["user_id"]
          },
        ]
      }
      professionals: {
        Row: {
          availability_end: string | null
          availability_start: string | null
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
          latitude: number | null
          location: unknown
          longitude: number | null
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
          availability_end?: string | null
          availability_start?: string | null
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
          latitude?: number | null
          location?: unknown
          longitude?: number | null
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
          availability_end?: string | null
          availability_start?: string | null
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
          latitude?: number | null
          location?: unknown
          longitude?: number | null
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
      profile_views: {
        Row: {
          id: string
          professional_id: string
          viewed_at: string
          viewer_id: string | null
        }
        Insert: {
          id?: string
          professional_id: string
          viewed_at?: string
          viewer_id?: string | null
        }
        Update: {
          id?: string
          professional_id?: string
          viewed_at?: string
          viewer_id?: string | null
        }
        Relationships: []
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
      structure_notification_preferences: {
        Row: {
          created_at: string
          email_notifications: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email_notifications?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email_notifications?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "structure_notification_preferences_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "structures"
            referencedColumns: ["user_id"]
          },
        ]
      }
      structures: {
        Row: {
          address: string | null
          city: string | null
          created_at: string
          latitude: number | null
          location: unknown
          longitude: number | null
          name: string
          phone: string | null
          postal_code: string | null
          stripe_customer_id: string | null
          structure_type: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          address?: string | null
          city?: string | null
          created_at?: string
          latitude?: number | null
          location?: unknown
          longitude?: number | null
          name: string
          phone?: string | null
          postal_code?: string | null
          stripe_customer_id?: string | null
          structure_type?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          address?: string | null
          city?: string | null
          created_at?: string
          latitude?: number | null
          location?: unknown
          longitude?: number | null
          name?: string
          phone?: string | null
          postal_code?: string | null
          stripe_customer_id?: string | null
          structure_type?: string | null
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
          availability_end: string | null
          availability_start: string | null
          avatar_url: string | null
          city: string | null
          created_at: string | null
          current_job: string | null
          description: string | null
          experience_years: number | null
          first_name: string | null
          has_used_trial: boolean | null
          hourly_rate: number | null
          intervention_radius_km: number | null
          is_available: boolean | null
          is_certified: boolean | null
          is_onboarded: boolean | null
          last_name: string | null
          latitude: number | null
          location: unknown
          longitude: number | null
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
      check_professional_availability: {
        Args: { professional_id_param: string }
        Returns: boolean
      }
      cleanup_ended_mission_reminders: { Args: never; Returns: number }
      end_accepted_missions: { Args: never; Returns: number }
      expire_pending_missions: { Args: never; Returns: number }
      expire_professionals_availability: { Args: never; Returns: number }
      get_nearby_professionals_from_structure: {
        Args: { p_structure_id: string }
        Returns: {
          city: string
          distance_km: number
          hourly_rate: number
          is_available: boolean
          is_default_case: boolean
          user_id: string
        }[]
      }
      get_profile_view_stats: {
        Args: { p_professional_id: string }
        Returns: Json
      }
      get_rrule_day: { Args: { day_offset: number }; Returns: string }
      get_vault_secret: { Args: { secret_name: string }; Returns: string }
      is_admin: { Args: never; Returns: boolean }
      is_professional_subscribed: {
        Args: { user_id_param: string }
        Returns: boolean
      }
      process_appointment_reminders: { Args: never; Returns: number }
      queue_appointment_reminders: { Args: never; Returns: number }
      select_pending_reminders: {
        Args: { batch_size_param?: number }
        Returns: {
          attempts: number
          id: string
          mission_id: string
          mission_schedule_id: string
          occurrence_date: string
          reminder_type: string
        }[]
      }
      send_appointment_reminders: { Args: never; Returns: number }
      update_professional_rating_stats: {
        Args: { professional_user_id: string }
        Returns: undefined
      }
    }
    Enums: {
      invitation_status: "pending" | "accepted" | "declined"
      locale: "en" | "fr"
      membership_action:
        | "joined"
        | "left"
        | "removed_by_structure"
        | "removed_by_admin"
      mission_modality: "remote" | "on_site" | "hybrid"
      mission_status:
        | "pending"
        | "accepted"
        | "declined"
        | "cancelled"
        | "expired"
        | "ended"
        | "draft"
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
        | "mission_expired"
        | "mission_ended"
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
      mission_modality: ["remote", "on_site", "hybrid"],
      mission_status: [
        "pending",
        "accepted",
        "declined",
        "cancelled",
        "expired",
        "ended",
        "draft",
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
        "mission_expired",
        "mission_ended",
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


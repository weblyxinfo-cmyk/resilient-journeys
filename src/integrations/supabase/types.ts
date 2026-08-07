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
    PostgrestVersion: "14.1"
  }
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
      availability: {
        Row: {
          created_at: string
          day_of_week: number
          effective_from: string | null
          effective_until: string | null
          end_time: string
          id: string
          is_active: boolean
          schedule_name: string | null
          start_time: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          day_of_week: number
          effective_from?: string | null
          effective_until?: string | null
          end_time: string
          id?: string
          is_active?: boolean
          schedule_name?: string | null
          start_time: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          day_of_week?: number
          effective_from?: string | null
          effective_until?: string | null
          end_time?: string
          id?: string
          is_active?: boolean
          schedule_name?: string | null
          start_time?: string
          updated_at?: string
        }
        Relationships: []
      }
      blocked_dates: {
        Row: {
          created_at: string
          date: string
          id: string
          reason: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          date: string
          id?: string
          reason?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          date?: string
          id?: string
          reason?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      blog_posts: {
        Row: {
          author_id: string | null
          category: string
          content: string
          created_at: string
          excerpt: string | null
          featured_image_url: string | null
          gallery_images: string[] | null
          id: string
          is_paid_workshop: boolean | null
          is_published: boolean
          meta_description: string | null
          meta_title: string | null
          min_membership: Database["public"]["Enums"]["membership_type"]
          payment_iban: string | null
          payment_message: string | null
          published_at: string | null
          scheduled_at: string | null
          slug: string
          tags: string[] | null
          title: string
          updated_at: string
          video_urls: string[] | null
          view_count: number | null
          workshop_currency: string | null
          workshop_price: number | null
        }
        Insert: {
          author_id?: string | null
          category: string
          content: string
          created_at?: string
          excerpt?: string | null
          featured_image_url?: string | null
          gallery_images?: string[] | null
          id?: string
          is_paid_workshop?: boolean | null
          is_published?: boolean
          meta_description?: string | null
          meta_title?: string | null
          min_membership?: Database["public"]["Enums"]["membership_type"]
          payment_iban?: string | null
          payment_message?: string | null
          published_at?: string | null
          scheduled_at?: string | null
          slug: string
          tags?: string[] | null
          title: string
          updated_at?: string
          video_urls?: string[] | null
          view_count?: number | null
          workshop_currency?: string | null
          workshop_price?: number | null
        }
        Update: {
          author_id?: string | null
          category?: string
          content?: string
          created_at?: string
          excerpt?: string | null
          featured_image_url?: string | null
          gallery_images?: string[] | null
          id?: string
          is_paid_workshop?: boolean | null
          is_published?: boolean
          meta_description?: string | null
          meta_title?: string | null
          min_membership?: Database["public"]["Enums"]["membership_type"]
          payment_iban?: string | null
          payment_message?: string | null
          published_at?: string | null
          scheduled_at?: string | null
          slug?: string
          tags?: string[] | null
          title?: string
          updated_at?: string
          video_urls?: string[] | null
          view_count?: number | null
          workshop_currency?: string | null
          workshop_price?: number | null
        }
        Relationships: []
      }
      booking_cards: {
        Row: {
          badge: string | null
          booking_type: string | null
          card_key: string
          contact_heading: string | null
          created_at: string
          description: string
          duration_label: string | null
          duration_minutes: number
          email: string | null
          extra_sections: Json
          features: Json
          features_heading: string | null
          highlight: boolean
          id: string
          image: string | null
          is_active: boolean
          note: string | null
          phone: string | null
          price_eur: number
          price_note: string | null
          sort_order: number
          title: string
          updated_at: string
          valid_until: string | null
        }
        Insert: {
          badge?: string | null
          booking_type?: string | null
          card_key: string
          contact_heading?: string | null
          created_at?: string
          description?: string
          duration_label?: string | null
          duration_minutes?: number
          email?: string | null
          extra_sections?: Json
          features?: Json
          features_heading?: string | null
          highlight?: boolean
          id?: string
          image?: string | null
          is_active?: boolean
          note?: string | null
          phone?: string | null
          price_eur?: number
          price_note?: string | null
          sort_order?: number
          title: string
          updated_at?: string
          valid_until?: string | null
        }
        Update: {
          badge?: string | null
          booking_type?: string | null
          card_key?: string
          contact_heading?: string | null
          created_at?: string
          description?: string
          duration_label?: string | null
          duration_minutes?: number
          email?: string | null
          extra_sections?: Json
          features?: Json
          features_heading?: string | null
          highlight?: boolean
          id?: string
          image?: string | null
          is_active?: boolean
          note?: string | null
          phone?: string | null
          price_eur?: number
          price_note?: string | null
          sort_order?: number
          title?: string
          updated_at?: string
          valid_until?: string | null
        }
        Relationships: []
      }
      cms_content: {
        Row: {
          created_at: string
          description: string | null
          field_type: string
          id: string
          key: string
          page: string
          section: string | null
          updated_at: string
          value: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          field_type?: string
          id?: string
          key: string
          page: string
          section?: string | null
          updated_at?: string
          value: string
        }
        Update: {
          created_at?: string
          description?: string | null
          field_type?: string
          id?: string
          key?: string
          page?: string
          section?: string | null
          updated_at?: string
          value?: string
        }
        Relationships: []
      }
      coach_availability: {
        Row: {
          created_at: string
          day_of_week: Database["public"]["Enums"]["day_of_week"]
          end_time: string
          id: string
          is_active: boolean
          start_time: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          day_of_week: Database["public"]["Enums"]["day_of_week"]
          end_time: string
          id?: string
          is_active?: boolean
          start_time: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          day_of_week?: Database["public"]["Enums"]["day_of_week"]
          end_time?: string
          id?: string
          is_active?: boolean
          start_time?: string
          updated_at?: string
        }
        Relationships: []
      }
      coach_blocked_dates: {
        Row: {
          blocked_date: string
          created_at: string
          id: string
          reason: string | null
        }
        Insert: {
          blocked_date: string
          created_at?: string
          id?: string
          reason?: string | null
        }
        Update: {
          blocked_date?: string
          created_at?: string
          id?: string
          reason?: string | null
        }
        Relationships: []
      }
      lead_magnets: {
        Row: {
          created_at: string
          email: string
          id: string
          name: string | null
          source: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          name?: string | null
          source?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          name?: string | null
          source?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      premium_credits: {
        Row: {
          created_at: string
          id: string
          total_credits: number
          updated_at: string
          used_credits: number
          user_id: string
          year: number
        }
        Insert: {
          created_at?: string
          id?: string
          total_credits?: number
          updated_at?: string
          used_credits?: number
          user_id: string
          year: number
        }
        Update: {
          created_at?: string
          id?: string
          total_credits?: number
          updated_at?: string
          used_credits?: number
          user_id?: string
          year?: number
        }
        Relationships: []
      }
      premium_kit_orders: {
        Row: {
          carrier: string | null
          created_at: string
          delivered_at: string | null
          id: string
          notes: string | null
          order_status: Database["public"]["Enums"]["kit_status"]
          shipped_at: string | null
          shipping_address: Json | null
          tracking_number: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          carrier?: string | null
          created_at?: string
          delivered_at?: string | null
          id?: string
          notes?: string | null
          order_status?: Database["public"]["Enums"]["kit_status"]
          shipped_at?: string | null
          shipping_address?: Json | null
          tracking_number?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          carrier?: string | null
          created_at?: string
          delivered_at?: string | null
          id?: string
          notes?: string | null
          order_status?: Database["public"]["Enums"]["kit_status"]
          shipped_at?: string | null
          shipping_address?: Json | null
          tracking_number?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          membership_expires_at: string | null
          membership_started_at: string | null
          membership_type: Database["public"]["Enums"]["membership_type"]
          months_unlocked: number
          purchased_hubs: Json | null
          stripe_customer_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          membership_expires_at?: string | null
          membership_started_at?: string | null
          membership_type?: Database["public"]["Enums"]["membership_type"]
          months_unlocked?: number
          purchased_hubs?: Json | null
          stripe_customer_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          membership_expires_at?: string | null
          membership_started_at?: string | null
          membership_type?: Database["public"]["Enums"]["membership_type"]
          months_unlocked?: number
          purchased_hubs?: Json | null
          stripe_customer_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      resources: {
        Row: {
          category_id: string | null
          created_at: string
          description: string | null
          download_count: number | null
          file_size_mb: number | null
          file_url: string
          id: string
          is_free: boolean
          min_membership: Database["public"]["Enums"]["membership_type"]
          resource_subtype: string | null
          resource_type: Database["public"]["Enums"]["resource_type"]
          sort_order: number
          title: string
          updated_at: string
          video_id: string | null
          week_number: number | null
        }
        Insert: {
          category_id?: string | null
          created_at?: string
          description?: string | null
          download_count?: number | null
          file_size_mb?: number | null
          file_url: string
          id?: string
          is_free?: boolean
          min_membership?: Database["public"]["Enums"]["membership_type"]
          resource_subtype?: string | null
          resource_type?: Database["public"]["Enums"]["resource_type"]
          sort_order?: number
          title: string
          updated_at?: string
          video_id?: string | null
          week_number?: number | null
        }
        Update: {
          category_id?: string | null
          created_at?: string
          description?: string | null
          download_count?: number | null
          file_size_mb?: number | null
          file_url?: string
          id?: string
          is_free?: boolean
          min_membership?: Database["public"]["Enums"]["membership_type"]
          resource_subtype?: string | null
          resource_type?: Database["public"]["Enums"]["resource_type"]
          sort_order?: number
          title?: string
          updated_at?: string
          video_id?: string | null
          week_number?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "resources_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "video_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "resources_video_id_fkey"
            columns: ["video_id"]
            isOneToOne: false
            referencedRelation: "videos"
            referencedColumns: ["id"]
          },
        ]
      }
      session_bookings: {
        Row: {
          booking_notes: string | null
          calendly_event_id: string | null
          cancellation_reason: string | null
          client_email: string | null
          client_name: string | null
          created_at: string
          duration_minutes: number
          end_time: string | null
          id: string
          is_premium_credit: boolean
          notes: string | null
          payment_expires_at: string | null
          price_cents: number | null
          session_date: string
          session_type: Database["public"]["Enums"]["session_type"]
          status: Database["public"]["Enums"]["session_status"]
          stripe_session_id: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          booking_notes?: string | null
          calendly_event_id?: string | null
          cancellation_reason?: string | null
          client_email?: string | null
          client_name?: string | null
          created_at?: string
          duration_minutes?: number
          end_time?: string | null
          id?: string
          is_premium_credit?: boolean
          notes?: string | null
          payment_expires_at?: string | null
          price_cents?: number | null
          session_date: string
          session_type: Database["public"]["Enums"]["session_type"]
          status?: Database["public"]["Enums"]["session_status"]
          stripe_session_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          booking_notes?: string | null
          calendly_event_id?: string | null
          cancellation_reason?: string | null
          client_email?: string | null
          client_name?: string | null
          created_at?: string
          duration_minutes?: number
          end_time?: string | null
          id?: string
          is_premium_credit?: boolean
          notes?: string | null
          payment_expires_at?: string | null
          price_cents?: number | null
          session_date?: string
          session_type?: Database["public"]["Enums"]["session_type"]
          status?: Database["public"]["Enums"]["session_status"]
          stripe_session_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      session_type_config: {
        Row: {
          available_for_premium_credit: boolean
          created_at: string
          description: string | null
          duration_minutes: number
          id: string
          is_active: boolean
          price_eur: number
          requires_payment: boolean
          session_type: Database["public"]["Enums"]["session_type"]
          sort_order: number
          title: string
          updated_at: string
        }
        Insert: {
          available_for_premium_credit?: boolean
          created_at?: string
          description?: string | null
          duration_minutes?: number
          id?: string
          is_active?: boolean
          price_eur?: number
          requires_payment?: boolean
          session_type: Database["public"]["Enums"]["session_type"]
          sort_order?: number
          title: string
          updated_at?: string
        }
        Update: {
          available_for_premium_credit?: boolean
          created_at?: string
          description?: string | null
          duration_minutes?: number
          id?: string
          is_active?: boolean
          price_eur?: number
          requires_payment?: boolean
          session_type?: Database["public"]["Enums"]["session_type"]
          sort_order?: number
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          created_at: string
          description: string | null
          id: string
          key: string
          updated_at: string
          value: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          key: string
          updated_at?: string
          value?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          key?: string
          updated_at?: string
          value?: string | null
        }
        Relationships: []
      }
      testimonials: {
        Row: {
          avatar_url: string | null
          content: string
          created_at: string
          id: string
          is_visible: boolean
          name: string
          rating: number | null
          role: string | null
          sort_order: number
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          content: string
          created_at?: string
          id?: string
          is_visible?: boolean
          name: string
          rating?: number | null
          role?: string | null
          sort_order?: number
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          content?: string
          created_at?: string
          id?: string
          is_visible?: boolean
          name?: string
          rating?: number | null
          role?: string | null
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      user_progress: {
        Row: {
          completed: boolean
          completed_at: string | null
          created_at: string
          id: string
          last_watched_at: string | null
          updated_at: string
          user_id: string
          video_id: string
          watch_time_seconds: number | null
        }
        Insert: {
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          id?: string
          last_watched_at?: string | null
          updated_at?: string
          user_id: string
          video_id: string
          watch_time_seconds?: number | null
        }
        Update: {
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          id?: string
          last_watched_at?: string | null
          updated_at?: string
          user_id?: string
          video_id?: string
          watch_time_seconds?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "user_progress_video_id_fkey"
            columns: ["video_id"]
            isOneToOne: false
            referencedRelation: "videos"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      video_categories: {
        Row: {
          created_at: string
          description: string | null
          hub_slug: string | null
          icon: string | null
          id: string
          is_additional_hub: boolean | null
          month_number: number
          name: string
          sort_order: number | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          hub_slug?: string | null
          icon?: string | null
          id?: string
          is_additional_hub?: boolean | null
          month_number: number
          name: string
          sort_order?: number | null
        }
        Update: {
          created_at?: string
          description?: string | null
          hub_slug?: string | null
          icon?: string | null
          id?: string
          is_additional_hub?: boolean | null
          month_number?: number
          name?: string
          sort_order?: number | null
        }
        Relationships: []
      }
      videos: {
        Row: {
          category_id: string
          created_at: string
          description: string | null
          duration_minutes: number | null
          id: string
          is_free: boolean
          is_intro: boolean
          min_membership: Database["public"]["Enums"]["membership_type"]
          sort_order: number
          thumbnail_url: string | null
          title: string
          video_type: Database["public"]["Enums"]["video_type"]
          video_url: string
          week_number: number | null
        }
        Insert: {
          category_id: string
          created_at?: string
          description?: string | null
          duration_minutes?: number | null
          id?: string
          is_free?: boolean
          is_intro?: boolean
          min_membership?: Database["public"]["Enums"]["membership_type"]
          sort_order?: number
          thumbnail_url?: string | null
          title: string
          video_type?: Database["public"]["Enums"]["video_type"]
          video_url: string
          week_number?: number | null
        }
        Update: {
          category_id?: string
          created_at?: string
          description?: string | null
          duration_minutes?: number | null
          id?: string
          is_free?: boolean
          is_intro?: boolean
          min_membership?: Database["public"]["Enums"]["membership_type"]
          sort_order?: number
          thumbnail_url?: string | null
          title?: string
          video_type?: Database["public"]["Enums"]["video_type"]
          video_url?: string
          week_number?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "videos_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "video_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      workshop_inquiries: {
        Row: {
          company: string | null
          created_at: string | null
          email: string
          group_size: string | null
          id: string
          message: string
          name: string
          workshop_id: string | null
        }
        Insert: {
          company?: string | null
          created_at?: string | null
          email: string
          group_size?: string | null
          id?: string
          message: string
          name: string
          workshop_id?: string | null
        }
        Update: {
          company?: string | null
          created_at?: string | null
          email?: string
          group_size?: string | null
          id?: string
          message?: string
          name?: string
          workshop_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "workshop_inquiries_workshop_id_fkey"
            columns: ["workshop_id"]
            isOneToOne: false
            referencedRelation: "blog_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      workshop_registrations: {
        Row: {
          created_at: string | null
          email: string
          id: string
          name: string
          note: string | null
          phone: string | null
          status: string
          workshop_id: string
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          name: string
          note?: string | null
          phone?: string | null
          status?: string
          workshop_id: string
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          name?: string
          note?: string | null
          phone?: string | null
          status?: string
          workshop_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workshop_registrations_workshop_id_fkey"
            columns: ["workshop_id"]
            isOneToOne: false
            referencedRelation: "blog_posts"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      add_purchased_hub: {
        Args: { _hub_slug: string; _user_id: string }
        Returns: undefined
      }
      get_session_price: {
        Args: { p_session_type: Database["public"]["Enums"]["session_type"] }
        Returns: number
      }
      get_user_purchased_hubs: {
        Args: { _user_id: string }
        Returns: {
          hub_description: string
          hub_name: string
          hub_slug: string
        }[]
      }
      has_role: { Args: { _role: string; _user_id: string }; Returns: boolean }
      user_has_hub_access: {
        Args: { _hub_slug: string; _user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
      day_of_week:
        | "monday"
        | "tuesday"
        | "wednesday"
        | "thursday"
        | "friday"
        | "saturday"
        | "sunday"
      kit_status:
        | "pending"
        | "processing"
        | "shipped"
        | "delivered"
        | "cancelled"
      membership_type: "free" | "basic" | "premium"
      resource_type:
        | "worksheet"
        | "meditation"
        | "pdf"
        | "audio"
        | "video"
        | "other"
      session_status:
        | "scheduled"
        | "completed"
        | "cancelled"
        | "no_show"
        | "pending_payment"
        | "expired"
        | "confirmed"
      session_type:
        | "discovery"
        | "one_on_one"
        | "family"
        | "premium_consultation"
        | "endometriosis_support"
        | "individual_eft_reiki_offer"
      video_type: "eft" | "art_therapy" | "meditation" | "other"
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
      app_role: ["admin", "user"],
      day_of_week: [
        "monday",
        "tuesday",
        "wednesday",
        "thursday",
        "friday",
        "saturday",
        "sunday",
      ],
      kit_status: [
        "pending",
        "processing",
        "shipped",
        "delivered",
        "cancelled",
      ],
      membership_type: ["free", "basic", "premium"],
      resource_type: [
        "worksheet",
        "meditation",
        "pdf",
        "audio",
        "video",
        "other",
      ],
      session_status: [
        "scheduled",
        "completed",
        "cancelled",
        "no_show",
        "pending_payment",
        "expired",
        "confirmed",
      ],
      session_type: [
        "discovery",
        "one_on_one",
        "family",
        "premium_consultation",
        "endometriosis_support",
        "individual_eft_reiki_offer",
      ],
      video_type: ["eft", "art_therapy", "meditation", "other"],
    },
  },
} as const

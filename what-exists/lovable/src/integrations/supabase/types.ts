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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      admin_ideas: {
        Row: {
          content: string
          created_at: string
          id: string
          tags: string[] | null
          title: string
          updated_at: string
        }
        Insert: {
          content?: string
          created_at?: string
          id?: string
          tags?: string[] | null
          title?: string
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          tags?: string[] | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      artifacts: {
        Row: {
          admin_reviewed: boolean
          artifact_type: string | null
          category: string | null
          collection_id: string | null
          created_at: string
          created_by: string | null
          creator_earnings: Json | null
          creator_handle: string
          creator_name: string | null
          description: string | null
          dimensions: string | null
          id: string
          image_url: string | null
          image_urls: string[] | null
          is_featured: boolean
          keywords: string[] | null
          made_to_order: boolean
          manufacturing_costs: Json | null
          materials: string[] | null
          model_url: string | null
          name: string
          prices: Json | null
          region: string | null
          review_notes: string | null
          seo_description: string | null
          seo_title: string | null
          size_surcharges: Json
          size_type: string
          sizes: string[]
          slug: string | null
          specs: string | null
          status: string
          tags: string[] | null
          updated_at: string
          weight_grams: number | null
        }
        Insert: {
          admin_reviewed?: boolean
          artifact_type?: string | null
          category?: string | null
          collection_id?: string | null
          created_at?: string
          created_by?: string | null
          creator_earnings?: Json | null
          creator_handle: string
          creator_name?: string | null
          description?: string | null
          dimensions?: string | null
          id?: string
          image_url?: string | null
          image_urls?: string[] | null
          is_featured?: boolean
          keywords?: string[] | null
          made_to_order?: boolean
          manufacturing_costs?: Json | null
          materials?: string[] | null
          model_url?: string | null
          name: string
          prices?: Json | null
          region?: string | null
          review_notes?: string | null
          seo_description?: string | null
          seo_title?: string | null
          size_surcharges?: Json
          size_type?: string
          sizes?: string[]
          slug?: string | null
          specs?: string | null
          status?: string
          tags?: string[] | null
          updated_at?: string
          weight_grams?: number | null
        }
        Update: {
          admin_reviewed?: boolean
          artifact_type?: string | null
          category?: string | null
          collection_id?: string | null
          created_at?: string
          created_by?: string | null
          creator_earnings?: Json | null
          creator_handle?: string
          creator_name?: string | null
          description?: string | null
          dimensions?: string | null
          id?: string
          image_url?: string | null
          image_urls?: string[] | null
          is_featured?: boolean
          keywords?: string[] | null
          made_to_order?: boolean
          manufacturing_costs?: Json | null
          materials?: string[] | null
          model_url?: string | null
          name?: string
          prices?: Json | null
          region?: string | null
          review_notes?: string | null
          seo_description?: string | null
          seo_title?: string | null
          size_surcharges?: Json
          size_type?: string
          sizes?: string[]
          slug?: string | null
          specs?: string | null
          status?: string
          tags?: string[] | null
          updated_at?: string
          weight_grams?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "artifacts_collection_id_fkey"
            columns: ["collection_id"]
            isOneToOne: false
            referencedRelation: "collections"
            referencedColumns: ["id"]
          },
        ]
      }
      collections: {
        Row: {
          cover_image_url: string | null
          created_at: string
          creator_handle: string
          description: string | null
          id: string
          name: string
          slug: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          cover_image_url?: string | null
          created_at?: string
          creator_handle: string
          description?: string | null
          id?: string
          name: string
          slug: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          cover_image_url?: string | null
          created_at?: string
          creator_handle?: string
          description?: string | null
          id?: string
          name?: string
          slug?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      commission_requests: {
        Row: {
          answers: Json
          budget: number | null
          created_at: string
          creator_handle: string
          customer_email: string
          customer_name: string
          description: string
          id: string
          intended_use: string | null
          reference_urls: string[] | null
          status: string
          timeline: string | null
          updated_at: string
        }
        Insert: {
          answers?: Json
          budget?: number | null
          created_at?: string
          creator_handle: string
          customer_email: string
          customer_name: string
          description: string
          id?: string
          intended_use?: string | null
          reference_urls?: string[] | null
          status?: string
          timeline?: string | null
          updated_at?: string
        }
        Update: {
          answers?: Json
          budget?: number | null
          created_at?: string
          creator_handle?: string
          customer_email?: string
          customer_name?: string
          description?: string
          id?: string
          intended_use?: string | null
          reference_urls?: string[] | null
          status?: string
          timeline?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      creator_docs_notes: {
        Row: {
          category: string | null
          created_at: string
          email: string | null
          id: string
          message: string
          subject: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string
          email?: string | null
          id?: string
          message: string
          subject?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string
          email?: string | null
          id?: string
          message?: string
          subject?: string | null
        }
        Relationships: []
      }
      creator_follows: {
        Row: {
          created_at: string
          creator_handle: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          creator_handle: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string
          creator_handle?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      creator_list_items: {
        Row: {
          created_at: string
          creator_handle: string
          id: string
          list_id: string
          note: string | null
        }
        Insert: {
          created_at?: string
          creator_handle: string
          id?: string
          list_id: string
          note?: string | null
        }
        Update: {
          created_at?: string
          creator_handle?: string
          id?: string
          list_id?: string
          note?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "creator_list_items_list_id_fkey"
            columns: ["list_id"]
            isOneToOne: false
            referencedRelation: "creator_lists"
            referencedColumns: ["id"]
          },
        ]
      }
      creator_lists: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          share_token: string
          updated_at: string
          user_id: string
          visibility: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          share_token?: string
          updated_at?: string
          user_id: string
          visibility?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          share_token?: string
          updated_at?: string
          user_id?: string
          visibility?: string
        }
        Relationships: []
      }
      creator_profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          commission_open: boolean
          created_at: string
          display_name: string | null
          hourly_rate: number | null
          id: string
          materials: string[] | null
          rush_available: boolean
          tools: string[] | null
          turnaround_time: string | null
          updated_at: string
          user_email: string
          user_id: string | null
          username: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          commission_open?: boolean
          created_at?: string
          display_name?: string | null
          hourly_rate?: number | null
          id?: string
          materials?: string[] | null
          rush_available?: boolean
          tools?: string[] | null
          turnaround_time?: string | null
          updated_at?: string
          user_email: string
          user_id?: string | null
          username: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          commission_open?: boolean
          created_at?: string
          display_name?: string | null
          hourly_rate?: number | null
          id?: string
          materials?: string[] | null
          rush_available?: boolean
          tools?: string[] | null
          turnaround_time?: string | null
          updated_at?: string
          user_email?: string
          user_id?: string | null
          username?: string
        }
        Relationships: []
      }
      manufacturers: {
        Row: {
          api_endpoint: string | null
          capabilities: string[]
          contact_email: string | null
          created_at: string
          credential_ref: string | null
          id: string
          is_default: boolean
          name: string
          notes: string | null
          region: string | null
          slug: string
          status: string
          supported_materials: string[]
          updated_at: string
        }
        Insert: {
          api_endpoint?: string | null
          capabilities?: string[]
          contact_email?: string | null
          created_at?: string
          credential_ref?: string | null
          id?: string
          is_default?: boolean
          name: string
          notes?: string | null
          region?: string | null
          slug: string
          status?: string
          supported_materials?: string[]
          updated_at?: string
        }
        Update: {
          api_endpoint?: string | null
          capabilities?: string[]
          contact_email?: string | null
          created_at?: string
          credential_ref?: string | null
          id?: string
          is_default?: boolean
          name?: string
          notes?: string | null
          region?: string | null
          slug?: string
          status?: string
          supported_materials?: string[]
          updated_at?: string
        }
        Relationships: []
      }
      market_accounts: {
        Row: {
          accent_color: string | null
          accent_color_secondary: string | null
          access_key_hash: string
          avatar_url: string | null
          banner_url: string | null
          bio: string | null
          commission_allow_commercial: boolean
          commission_allow_modifications: boolean
          commission_allow_resell: boolean
          commission_intake_questions: Json
          commission_intro: string | null
          commission_min_budget: number | null
          commission_open: boolean
          commission_terms: string | null
          coupons: Json | null
          created_at: string
          default_margin_pct: number | null
          display_name: string | null
          email: string
          faq_items: Json | null
          handle: string
          hourly_rate: number | null
          id: string
          insights_time_spent: number
          insights_tool_costs: number
          logo_url: string | null
          materials: string[] | null
          newsletter_enabled: boolean
          newsletter_label: string | null
          newsletter_signups: Json
          order_message: string | null
          payout_details: string | null
          payout_legal_name: string | null
          payout_method: string | null
          pricing_currency: string | null
          pricing_margin_pct: number | null
          review_notes: string | null
          rush_available: boolean
          slug: string
          social_discord: string | null
          social_instagram: string | null
          social_patreon: string | null
          social_tiktok: string | null
          social_twitter: string | null
          social_website: string | null
          social_youtube: string | null
          status: string
          store_heading: string | null
          store_icon: string | null
          store_subheading: string | null
          tip_jar_enabled: boolean
          tip_jar_label: string | null
          tip_jar_url: string | null
          tools: string[] | null
          total_orders: number
          total_revenue: number
          turnaround_time: string | null
          updated_at: string
          waitlist_enabled: boolean
          waitlist_message: string | null
        }
        Insert: {
          accent_color?: string | null
          accent_color_secondary?: string | null
          access_key_hash: string
          avatar_url?: string | null
          banner_url?: string | null
          bio?: string | null
          commission_allow_commercial?: boolean
          commission_allow_modifications?: boolean
          commission_allow_resell?: boolean
          commission_intake_questions?: Json
          commission_intro?: string | null
          commission_min_budget?: number | null
          commission_open?: boolean
          commission_terms?: string | null
          coupons?: Json | null
          created_at?: string
          default_margin_pct?: number | null
          display_name?: string | null
          email: string
          faq_items?: Json | null
          handle: string
          hourly_rate?: number | null
          id?: string
          insights_time_spent?: number
          insights_tool_costs?: number
          logo_url?: string | null
          materials?: string[] | null
          newsletter_enabled?: boolean
          newsletter_label?: string | null
          newsletter_signups?: Json
          order_message?: string | null
          payout_details?: string | null
          payout_legal_name?: string | null
          payout_method?: string | null
          pricing_currency?: string | null
          pricing_margin_pct?: number | null
          review_notes?: string | null
          rush_available?: boolean
          slug: string
          social_discord?: string | null
          social_instagram?: string | null
          social_patreon?: string | null
          social_tiktok?: string | null
          social_twitter?: string | null
          social_website?: string | null
          social_youtube?: string | null
          status?: string
          store_heading?: string | null
          store_icon?: string | null
          store_subheading?: string | null
          tip_jar_enabled?: boolean
          tip_jar_label?: string | null
          tip_jar_url?: string | null
          tools?: string[] | null
          total_orders?: number
          total_revenue?: number
          turnaround_time?: string | null
          updated_at?: string
          waitlist_enabled?: boolean
          waitlist_message?: string | null
        }
        Update: {
          accent_color?: string | null
          accent_color_secondary?: string | null
          access_key_hash?: string
          avatar_url?: string | null
          banner_url?: string | null
          bio?: string | null
          commission_allow_commercial?: boolean
          commission_allow_modifications?: boolean
          commission_allow_resell?: boolean
          commission_intake_questions?: Json
          commission_intro?: string | null
          commission_min_budget?: number | null
          commission_open?: boolean
          commission_terms?: string | null
          coupons?: Json | null
          created_at?: string
          default_margin_pct?: number | null
          display_name?: string | null
          email?: string
          faq_items?: Json | null
          handle?: string
          hourly_rate?: number | null
          id?: string
          insights_time_spent?: number
          insights_tool_costs?: number
          logo_url?: string | null
          materials?: string[] | null
          newsletter_enabled?: boolean
          newsletter_label?: string | null
          newsletter_signups?: Json
          order_message?: string | null
          payout_details?: string | null
          payout_legal_name?: string | null
          payout_method?: string | null
          pricing_currency?: string | null
          pricing_margin_pct?: number | null
          review_notes?: string | null
          rush_available?: boolean
          slug?: string
          social_discord?: string | null
          social_instagram?: string | null
          social_patreon?: string | null
          social_tiktok?: string | null
          social_twitter?: string | null
          social_website?: string | null
          social_youtube?: string | null
          status?: string
          store_heading?: string | null
          store_icon?: string | null
          store_subheading?: string | null
          tip_jar_enabled?: boolean
          tip_jar_label?: string | null
          tip_jar_url?: string | null
          tools?: string[] | null
          total_orders?: number
          total_revenue?: number
          turnaround_time?: string | null
          updated_at?: string
          waitlist_enabled?: boolean
          waitlist_message?: string | null
        }
        Relationships: []
      }
      orders: {
        Row: {
          artifact_id: string | null
          artifact_image_url: string | null
          artifact_name: string | null
          created_at: string
          creator_earnings: number
          creator_handle: string | null
          customer_email: string
          customer_name: string | null
          id: string
          manufacturer: string | null
          manufacturing_cost: number
          material: string | null
          notes: string | null
          paid_at: string | null
          payment_status: string
          price: number
          shipping_address: string | null
          size: string | null
          status: string
          stripe_payment_intent: string | null
          stripe_session_id: string | null
          tracking_number: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          artifact_id?: string | null
          artifact_image_url?: string | null
          artifact_name?: string | null
          created_at?: string
          creator_earnings?: number
          creator_handle?: string | null
          customer_email: string
          customer_name?: string | null
          id?: string
          manufacturer?: string | null
          manufacturing_cost?: number
          material?: string | null
          notes?: string | null
          paid_at?: string | null
          payment_status?: string
          price?: number
          shipping_address?: string | null
          size?: string | null
          status?: string
          stripe_payment_intent?: string | null
          stripe_session_id?: string | null
          tracking_number?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          artifact_id?: string | null
          artifact_image_url?: string | null
          artifact_name?: string | null
          created_at?: string
          creator_earnings?: number
          creator_handle?: string | null
          customer_email?: string
          customer_name?: string | null
          id?: string
          manufacturer?: string | null
          manufacturing_cost?: number
          material?: string | null
          notes?: string | null
          paid_at?: string | null
          payment_status?: string
          price?: number
          shipping_address?: string | null
          size?: string | null
          status?: string
          stripe_payment_intent?: string | null
          stripe_session_id?: string | null
          tracking_number?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_artifact_id_fkey"
            columns: ["artifact_id"]
            isOneToOne: false
            referencedRelation: "artifacts"
            referencedColumns: ["id"]
          },
        ]
      }
      platform_settings: {
        Row: {
          created_at: string
          default_manufacturer_id: string | null
          id: string
          maintenance_mode: boolean
          payout_mode: string
          sales_routing_mode: string
          settings: Json
          singleton: boolean
          support_email: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          default_manufacturer_id?: string | null
          id?: string
          maintenance_mode?: boolean
          payout_mode?: string
          sales_routing_mode?: string
          settings?: Json
          singleton?: boolean
          support_email?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          default_manufacturer_id?: string | null
          id?: string
          maintenance_mode?: boolean
          payout_mode?: string
          sales_routing_mode?: string
          settings?: Json
          singleton?: boolean
          support_email?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "platform_settings_default_manufacturer_id_fkey"
            columns: ["default_manufacturer_id"]
            isOneToOne: false
            referencedRelation: "manufacturers"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          email: string | null
          id: string
          is_demo: boolean
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          email?: string | null
          id: string
          is_demo?: boolean
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          email?: string | null
          id?: string
          is_demo?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "member"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      app_role: ["admin", "member"],
    },
  },
} as const

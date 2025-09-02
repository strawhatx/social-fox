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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      connections: {
        Row: {
          account_identifier: string | null
          config_public: Json
          created_at: string
          id: string
          integration_id: string
          is_active: boolean
          workspace_id: string | null
          secrets: Json | null
          status: Database["public"]["Enums"]["connection_status"]
          updated_at: string
        }
        Insert: {
          account_identifier?: string | null
          config_public?: Json
          created_at?: string
          id?: string
          integration_id: string
          is_active?: boolean
          workspace_id?: string | null
          secrets?: Json | null
          status?: Database["public"]["Enums"]["connection_status"]
          updated_at?: string
        }
        Update: {
          account_identifier?: string | null
          config_public?: Json
          created_at?: string
          id?: string
          integration_id?: string
          is_active?: boolean
          workspace_id?: string | null
          secrets?: Json | null
          status?: Database["public"]["Enums"]["connection_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "connections_integration_id_fkey"
            columns: ["integration_id"]
            isOneToOne: false
            referencedRelation: "integrations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "connections_integration_id_fkey"
            columns: ["integration_id"]
            isOneToOne: false
            referencedRelation: "integrations_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "connections_integration_id_fkey"
            columns: ["integration_id"]
            isOneToOne: false
            referencedRelation: "integrations_public_safe"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "connections_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      content_posts: {
        Row: {
          content: string
          created_at: string
          engagement: Json | null
          id: string
          metadata: Json | null
          platform: string
          posted_at: string | null
          workspace_id: string | null
          twitter_likes: number | null
          twitter_retweets: number | null
          twitter_replies: number | null
          twitter_url: string | null
          twitter_post_id: string | null
          scheduled_at: string | null
          status: string
          updated_at: string
        }
        Insert: {
          content: string
          created_at?: string
          engagement?: Json | null
          id?: string
          metadata?: Json | null
          platform: string
          posted_at?: string | null
          workspace_id?: string | null
          twitter_likes?: number | null
          twitter_retweets?: number | null
          twitter_replies?: number | null
          twitter_url?: string | null
          twitter_post_id?: string | null
          scheduled_at?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          engagement?: Json | null
          id?: string
          metadata?: Json | null
          platform?: string
          posted_at?: string | null
          workspace_id?: string | null
          twitter_likes?: number | null
          twitter_retweets?: number | null
          twitter_replies?: number | null
          twitter_url?: string | null
          twitter_post_id?: string | null
          scheduled_at?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      credit_transactions: {
        Row: {
          amount: number
          created_at: string
          description: string | null
          id: string
          stripe_session_id: string | null
          transaction_type: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          description?: string | null
          id?: string
          stripe_session_id?: string | null
          transaction_type: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          description?: string | null
          id?: string
          stripe_session_id?: string | null
          transaction_type?: string
          user_id?: string
        }
        Relationships: []
      }
      integrations: {
        Row: {
          config_public: Json
          created_at: string
          description: string | null
          icon: string | null
          id: string
          is_active: boolean | null
          name: string
          provider: string
          secrets: Json | null
          type: string
          updated_at: string
        }
        Insert: {
          config_public?: Json
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          provider: string
          secrets?: Json | null
          type: string
          updated_at?: string
        }
        Update: {
          config_public?: Json
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          provider?: string
          secrets?: Json | null
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      kv_store: {
        Row: {
          key: string
          updated_at: string
          value: Json
        }
        Insert: {
          key: string
          updated_at?: string
          value: Json
        }
        Update: {
          key?: string
          updated_at?: string
          value?: Json
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          current_period_end: string | null
          email: string | null
          full_name: string | null
          id: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          subscription_is_active: boolean | null
          subscription_price_id: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          current_period_end?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_is_active?: boolean | null
          subscription_price_id?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          current_period_end?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_is_active?: boolean | null
          subscription_price_id?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      user_credits: {
        Row: {
          additional_credits: number | null
          created_at: string
          credits: number
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          additional_credits?: number | null
          created_at?: string
          credits?: number
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          additional_credits?: number | null
          created_at?: string
          credits?: number
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      workspaces: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          owner_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          owner_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          owner_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "workspaces_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      connections_public: {
        Row: {
          access_expires_at: number | null
          account_identifier: string | null
          config_public: Json | null
          created_at: string | null
          id: string | null
          integration_id: string | null
          is_active: boolean | null
          refresh_token_expires_at: number | null
          status: Database["public"]["Enums"]["connection_status"] | null
          updated_at: string | null
        }
        Insert: {
          access_expires_at?: never
          account_identifier?: string | null
          config_public?: Json | null
          created_at?: string | null
          id?: string | null
          integration_id?: string | null
          is_active?: boolean | null
          refresh_token_expires_at?: never
          status?: Database["public"]["Enums"]["connection_status"] | null
          updated_at?: string | null
        }
        Update: {
          access_expires_at?: never
          account_identifier?: string | null
          config_public?: Json | null
          created_at?: string | null
          id?: string | null
          integration_id?: string | null
          is_active?: boolean | null
          refresh_token_expires_at?: never
          status?: Database["public"]["Enums"]["connection_status"] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "connections_integration_id_fkey"
            columns: ["integration_id"]
            isOneToOne: false
            referencedRelation: "integrations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "connections_integration_id_fkey"
            columns: ["integration_id"]
            isOneToOne: false
            referencedRelation: "integrations_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "connections_integration_id_fkey"
            columns: ["integration_id"]
            isOneToOne: false
            referencedRelation: "integrations_public_safe"
            referencedColumns: ["id"]
          },
        ]
      }
      github_connections_with_credits: {
        Row: {
          account_identifier: string | null
          config_public: Json | null
          connection_id: string | null
          created_at: string | null
          credits: number | null
          estimated_token_usage: number | null
          integration_id: string | null
          integration_name: string | null
          is_active: boolean | null
          last_fetched_at: string | null
          project_name: string | null
          provider: string | null
          status: Database["public"]["Enums"]["connection_status"] | null
          updated_at: string | null
          user_credits_id: string | null
          user_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "connections_integration_id_fkey"
            columns: ["integration_id"]
            isOneToOne: false
            referencedRelation: "integrations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "connections_integration_id_fkey"
            columns: ["integration_id"]
            isOneToOne: false
            referencedRelation: "integrations_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "connections_integration_id_fkey"
            columns: ["integration_id"]
            isOneToOne: false
            referencedRelation: "integrations_public_safe"
            referencedColumns: ["id"]
          },
        ]
      }
      integrations_public: {
        Row: {
          config_public: Json | null
          created_at: string | null
          description: string | null
          icon: string | null
          id: string | null
          is_active: boolean | null
          name: string | null
          provider: string | null
          type: string | null
          updated_at: string | null
        }
        Insert: {
          config_public?: Json | null
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string | null
          is_active?: boolean | null
          name?: string | null
          provider?: string | null
          type?: string | null
          updated_at?: string | null
        }
        Update: {
          config_public?: Json | null
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string | null
          is_active?: boolean | null
          name?: string | null
          provider?: string | null
          type?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      integrations_public_safe: {
        Row: {
          config_public: Json | null
          created_at: string | null
          description: string | null
          icon: string | null
          id: string | null
          is_active: boolean | null
          name: string | null
          provider: string | null
          type: string | null
          updated_at: string | null
        }
        Insert: {
          config_public?: Json | null
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string | null
          is_active?: boolean | null
          name?: string | null
          provider?: string | null
          type?: string | null
          updated_at?: string | null
        }
        Update: {
          config_public?: Json | null
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string | null
          is_active?: boolean | null
          name?: string | null
          provider?: string | null
          type?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      scheduled_content_posts_with_credits: {
        Row: {
          content: string | null
          created_at: string | null
          credits: number | null
          credits_needed: number | null
          engagement: Json | null
          id: string | null
          metadata: Json | null
          platform: string | null
          posted_at: string | null
          scheduled_at: string | null
          status: string | null
          total_scheduled_posts: number | null
          updated_at: string | null
          user_credits_id: string | null
          user_id: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      update_user_additional_credits: {
        Args: {
          p_amount: number
          p_description?: string
          p_stripe_session_id?: string
          p_transaction_type: string
          p_user_id: string
        }
        Returns: boolean
      }
      update_user_credits: {
        Args: {
          p_amount: number
          p_description?: string
          p_stripe_session_id?: string
          p_transaction_type: string
          p_user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      connection_status: "connected" | "revoked" | "expired"
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
      connection_status: ["connected", "revoked", "expired"],
    },
  },
} as const

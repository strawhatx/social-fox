export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
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
          project_id: string
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
          project_id: string
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
          project_id?: string
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
            referencedRelation: "integrations_flat"
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
            foreignKeyName: "connections_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "connections_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects_with_connections"
            referencedColumns: ["project_id"]
          },
          {
            foreignKeyName: "connections_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects_with_profiles"
            referencedColumns: ["project_id"]
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
          project_id: string
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
          project_id: string
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
          project_id?: string
          scheduled_at?: string | null
          status?: string
          updated_at?: string
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
      oauth_states: {
        Row: {
          created_at: string
          expires_at: string
          id: string
          pkce_verifier: string | null
          state_data: Json
          state_hash: string
        }
        Insert: {
          created_at?: string
          expires_at: string
          id?: string
          pkce_verifier?: string | null
          state_data?: Json
          state_hash: string
        }
        Update: {
          created_at?: string
          expires_at?: string
          id?: string
          pkce_verifier?: string | null
          state_data?: Json
          state_hash?: string
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
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      projects: {
        Row: {
          automation_enabled: boolean
          automation_frequency: string | null
          brand_voice: string | null
          content_sources: number | null
          created_at: string
          description: string | null
          id: string
          last_fetched_at: string | null
          last_generated: string | null
          name: string
          platforms: string[] | null
          target_audience: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          automation_enabled?: boolean
          automation_frequency?: string | null
          brand_voice?: string | null
          content_sources?: number | null
          created_at?: string
          description?: string | null
          id?: string
          last_fetched_at?: string | null
          last_generated?: string | null
          name: string
          platforms?: string[] | null
          target_audience?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          automation_enabled?: boolean
          automation_frequency?: string | null
          brand_voice?: string | null
          content_sources?: number | null
          created_at?: string
          description?: string | null
          id?: string
          last_fetched_at?: string | null
          last_generated?: string | null
          name?: string
          platforms?: string[] | null
          target_audience?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
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
          project_id: string | null
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
          project_id?: string | null
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
          project_id?: string | null
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
            referencedRelation: "integrations_flat"
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
            foreignKeyName: "connections_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "connections_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects_with_connections"
            referencedColumns: ["project_id"]
          },
          {
            foreignKeyName: "connections_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects_with_profiles"
            referencedColumns: ["project_id"]
          },
        ]
      }
      integrations_flat: {
        Row: {
          auth_url: string | null
          client_id: string | null
          client_secret: string | null
          code_challenge_required: boolean | null
          created_at: string | null
          description: string | null
          icon: string | null
          id: string | null
          is_active: boolean | null
          name: string | null
          provider: string | null
          redirect_url: string | null
          required_parameters: string[] | null
          scopes: string[] | null
          token_url: string | null
          type: string | null
          updated_at: string | null
        }
        Insert: {
          auth_url?: never
          client_id?: never
          client_secret?: never
          code_challenge_required?: never
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string | null
          is_active?: boolean | null
          name?: string | null
          provider?: string | null
          redirect_url?: never
          required_parameters?: never
          scopes?: never
          token_url?: never
          type?: string | null
          updated_at?: string | null
        }
        Update: {
          auth_url?: never
          client_id?: never
          client_secret?: never
          code_challenge_required?: never
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string | null
          is_active?: boolean | null
          name?: string | null
          provider?: string | null
          redirect_url?: never
          required_parameters?: never
          scopes?: never
          token_url?: never
          type?: string | null
          updated_at?: string | null
        }
        Relationships: []
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
      projects_with_connections: {
        Row: {
          connections: Json | null
          project_id: string | null
          project_name: string | null
        }
        Relationships: []
      }
      projects_with_profiles: {
        Row: {
          content_sources: number | null
          created_at: string | null
          description: string | null
          last_generated: string | null
          name: string | null
          platforms: string[] | null
          project_id: string | null
          updated_at: string | null
          user_avatar_url: string | null
          user_email: string | null
          user_full_name: string | null
          user_id: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      [_ in never]: never
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

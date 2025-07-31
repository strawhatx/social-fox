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
      agent_configs: {
        Row: {
          agent_type: string
          config_data: Json
          config_type: string
          created_at: string
          id: string
          integration_id: string | null
          project_id: string
          updated_at: string
        }
        Insert: {
          agent_type: string
          config_data?: Json
          config_type: string
          created_at?: string
          id?: string
          integration_id?: string | null
          project_id: string
          updated_at?: string
        }
        Update: {
          agent_type?: string
          config_data?: Json
          config_type?: string
          created_at?: string
          id?: string
          integration_id?: string | null
          project_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_agent_configs_integration"
            columns: ["integration_id"]
            isOneToOne: false
            referencedRelation: "integrations"
            referencedColumns: ["id"]
          },
        ]
      }
      cache: {
        Row: {
          created_at: string
          expires_at: string | null
          key: string
          value: Json
        }
        Insert: {
          created_at?: string
          expires_at?: string | null
          key: string
          value: Json
        }
        Update: {
          created_at?: string
          expires_at?: string | null
          key?: string
          value?: Json
        }
        Relationships: []
      }
      connectors: {
        Row: {
          config: Json
          created_at: string
          id: string
          name: string
          provider: string
          updated_at: string
        }
        Insert: {
          config?: Json
          created_at?: string
          id?: string
          name: string
          provider: string
          updated_at?: string
        }
        Update: {
          config?: Json
          created_at?: string
          id?: string
          name?: string
          provider?: string
          updated_at?: string
        }
        Relationships: []
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
      content_sources: {
        Row: {
          config: Json | null
          created_at: string
          id: string
          is_active: boolean | null
          name: string
          project_id: string
          type: string
          updated_at: string
          url: string | null
        }
        Insert: {
          config?: Json | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          name: string
          project_id: string
          type: string
          updated_at?: string
          url?: string | null
        }
        Update: {
          config?: Json | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          name?: string
          project_id?: string
          type?: string
          updated_at?: string
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "content_sources_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      export_configs: {
        Row: {
          config: Json | null
          created_at: string
          enabled: boolean | null
          id: string
          name: string
          project_id: string
          type: string
          updated_at: string
        }
        Insert: {
          config?: Json | null
          created_at?: string
          enabled?: boolean | null
          id?: string
          name: string
          project_id: string
          type: string
          updated_at?: string
        }
        Update: {
          config?: Json | null
          created_at?: string
          enabled?: boolean | null
          id?: string
          name?: string
          project_id?: string
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      integrations: {
        Row: {
          config_data: Json
          created_at: string
          description: string | null
          icon: string | null
          id: string
          is_active: boolean | null
          name: string
          provider: string
          type: string
          updated_at: string
        }
        Insert: {
          config_data?: Json
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          provider: string
          type: string
          updated_at?: string
        }
        Update: {
          config_data?: Json
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          provider?: string
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
      platform_configs: {
        Row: {
          character_limit: number | null
          config: Json | null
          created_at: string
          enabled: boolean | null
          id: string
          platform: string
          project_id: string
          template: string | null
          updated_at: string
        }
        Insert: {
          character_limit?: number | null
          config?: Json | null
          created_at?: string
          enabled?: boolean | null
          id?: string
          platform: string
          project_id: string
          template?: string | null
          updated_at?: string
        }
        Update: {
          character_limit?: number | null
          config?: Json | null
          created_at?: string
          enabled?: boolean | null
          id?: string
          platform?: string
          project_id?: string
          template?: string | null
          updated_at?: string
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
          brand_voice: string | null
          content_sources: number | null
          created_at: string
          description: string | null
          id: string
          last_generated: string | null
          name: string
          platforms: string[] | null
          role_analytics_tracker: boolean | null
          role_audience_researcher: boolean | null
          role_brand_builder: boolean | null
          role_campaign_planner: boolean | null
          role_channel_manager: boolean | null
          role_community_engager: boolean | null
          role_content_creator: boolean | null
          role_growth_hacker: boolean | null
          role_lead_generator: boolean | null
          status: string | null
          target_audience: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          brand_voice?: string | null
          content_sources?: number | null
          created_at?: string
          description?: string | null
          id?: string
          last_generated?: string | null
          name: string
          platforms?: string[] | null
          role_analytics_tracker?: boolean | null
          role_audience_researcher?: boolean | null
          role_brand_builder?: boolean | null
          role_campaign_planner?: boolean | null
          role_channel_manager?: boolean | null
          role_community_engager?: boolean | null
          role_content_creator?: boolean | null
          role_growth_hacker?: boolean | null
          role_lead_generator?: boolean | null
          status?: string | null
          target_audience?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          brand_voice?: string | null
          content_sources?: number | null
          created_at?: string
          description?: string | null
          id?: string
          last_generated?: string | null
          name?: string
          platforms?: string[] | null
          role_analytics_tracker?: boolean | null
          role_audience_researcher?: boolean | null
          role_brand_builder?: boolean | null
          role_campaign_planner?: boolean | null
          role_channel_manager?: boolean | null
          role_community_engager?: boolean | null
          role_content_creator?: boolean | null
          role_growth_hacker?: boolean | null
          role_lead_generator?: boolean | null
          status?: string | null
          target_audience?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const

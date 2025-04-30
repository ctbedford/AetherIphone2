export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      badge_definitions: {
        Row: {
          description: string | null
          icon: string
          id: string
          title: string
        }
        Insert: {
          description?: string | null
          icon: string
          id: string
          title: string
        }
        Update: {
          description?: string | null
          icon?: string
          id?: string
          title?: string
        }
        Relationships: []
      }
      goal_progress_notes: {
        Row: {
          created_at: string
          goal_id: string
          id: string
          note: string
          user_id: string
        }
        Insert: {
          created_at?: string
          goal_id: string
          id?: string
          note: string
          user_id: string
        }
        Update: {
          created_at?: string
          goal_id?: string
          id?: string
          note?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "goal_progress_notes_goal_id_fkey"
            columns: ["goal_id"]
            isOneToOne: false
            referencedRelation: "goals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "goal_progress_notes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      goal_values: {
        Row: {
          goal_id: string
          user_id: string
          value_id: string
        }
        Insert: {
          goal_id: string
          user_id: string
          value_id: string
        }
        Update: {
          goal_id?: string
          user_id?: string
          value_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "goal_values_goal_id_fkey"
            columns: ["goal_id"]
            isOneToOne: false
            referencedRelation: "goals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "goal_values_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "goal_values_value_id_fkey"
            columns: ["value_id"]
            isOneToOne: false
            referencedRelation: "values"
            referencedColumns: ["id"]
          },
        ]
      }
      goals: {
        Row: {
          archived_at: string | null
          created_at: string | null
          description: string | null
          id: string
          progress: number | null
          sort_order: number | null
          target_date: string | null
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          archived_at?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          progress?: number | null
          sort_order?: number | null
          target_date?: string | null
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          archived_at?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          progress?: number | null
          sort_order?: number | null
          target_date?: string | null
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "goals_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      habit_entries: {
        Row: {
          completed: boolean
          created_at: string
          date: string
          habit_id: string
          id: string
          notes: string | null
          quantity_value: number | null
          user_id: string
        }
        Insert: {
          completed?: boolean
          created_at?: string
          date: string
          habit_id: string
          id?: string
          notes?: string | null
          quantity_value?: number | null
          user_id: string
        }
        Update: {
          completed?: boolean
          created_at?: string
          date?: string
          habit_id?: string
          id?: string
          notes?: string | null
          quantity_value?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "habit_entries_habit_id_fkey"
            columns: ["habit_id"]
            isOneToOne: false
            referencedRelation: "habits"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "habit_entries_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      habit_values: {
        Row: {
          habit_id: string
          user_id: string
          value_id: string
        }
        Insert: {
          habit_id: string
          user_id: string
          value_id: string
        }
        Update: {
          habit_id?: string
          user_id?: string
          value_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "habit_values_habit_id_fkey"
            columns: ["habit_id"]
            isOneToOne: false
            referencedRelation: "habits"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "habit_values_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "habit_values_value_id_fkey"
            columns: ["value_id"]
            isOneToOne: false
            referencedRelation: "values"
            referencedColumns: ["id"]
          },
        ]
      }
      habits: {
        Row: {
          archived_at: string | null
          best_streak: number
          created_at: string
          cue: string | null
          frequency_period: Database["public"]["Enums"]["habit_frequency_period"]
          goal_frequency: number
          goal_quantity: number | null
          goal_unit: string | null
          habit_type: Database["public"]["Enums"]["habit_type"]
          id: string
          recurrence_end_date: string | null
          recurrence_rule: string | null
          reward: string | null
          routine: string | null
          streak: number
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          archived_at?: string | null
          best_streak?: number
          created_at?: string
          cue?: string | null
          frequency_period?: Database["public"]["Enums"]["habit_frequency_period"]
          goal_frequency?: number
          goal_quantity?: number | null
          goal_unit?: string | null
          habit_type?: Database["public"]["Enums"]["habit_type"]
          id?: string
          recurrence_end_date?: string | null
          recurrence_rule?: string | null
          reward?: string | null
          routine?: string | null
          streak?: number
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          archived_at?: string | null
          best_streak?: number
          created_at?: string
          cue?: string | null
          frequency_period?: Database["public"]["Enums"]["habit_frequency_period"]
          goal_frequency?: number
          goal_quantity?: number | null
          goal_unit?: string | null
          habit_type?: Database["public"]["Enums"]["habit_type"]
          id?: string
          recurrence_end_date?: string | null
          recurrence_rule?: string | null
          reward?: string | null
          routine?: string | null
          streak?: number
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "habits_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      key_results: {
        Row: {
          created_at: string
          goal_id: string
          id: string
          progress: number | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          goal_id: string
          id?: string
          progress?: number | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          goal_id?: string
          id?: string
          progress?: number | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "key_results_goal_id_fkey"
            columns: ["goal_id"]
            isOneToOne: false
            referencedRelation: "goals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "key_results_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      point_transactions: {
        Row: {
          created_at: string
          id: string
          points: number
          reason: string
          source_id: string | null
          source_type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          points: number
          reason: string
          source_id?: string | null
          source_type: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          points?: number
          reason?: string
          source_id?: string | null
          source_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "point_transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      principle_values: {
        Row: {
          principle_id: string
          user_id: string
          value_id: string
        }
        Insert: {
          principle_id: string
          user_id: string
          value_id: string
        }
        Update: {
          principle_id?: string
          user_id?: string
          value_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "principle_values_principle_id_fkey"
            columns: ["principle_id"]
            isOneToOne: false
            referencedRelation: "principles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "principle_values_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "principle_values_value_id_fkey"
            columns: ["value_id"]
            isOneToOne: false
            referencedRelation: "values"
            referencedColumns: ["id"]
          },
        ]
      }
      principles: {
        Row: {
          body: string
          created_at: string
          id: string
          sort_order: number | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          body: string
          created_at?: string
          id?: string
          sort_order?: number | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          sort_order?: number | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "principles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string | null
          email: string
          id: string
          lifetime_points: number
          points: number
          username: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id: string
          lifetime_points?: number
          points?: number
          username?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          lifetime_points?: number
          points?: number
          username?: string | null
        }
        Relationships: []
      }
      reminders: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          related_entity_id: string
          related_entity_type: string
          reminder_time: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          related_entity_id: string
          related_entity_type: string
          reminder_time: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          related_entity_id?: string
          related_entity_type?: string
          reminder_time?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reminders_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      rewards: {
        Row: {
          can_earn_multiple: boolean
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          metadata: Json | null
          name: string
          required_points: number
          type: Database["public"]["Enums"]["reward_type"]
          updated_at: string
        }
        Insert: {
          can_earn_multiple?: boolean
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          metadata?: Json | null
          name: string
          required_points?: number
          type: Database["public"]["Enums"]["reward_type"]
          updated_at?: string
        }
        Update: {
          can_earn_multiple?: boolean
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          metadata?: Json | null
          name?: string
          required_points?: number
          type?: Database["public"]["Enums"]["reward_type"]
          updated_at?: string
        }
        Relationships: []
      }
      state_entries: {
        Row: {
          definition_id: string
          entry_timestamp: string
          id: string
          notes: string | null
          user_id: string
          value_numeric: number | null
          value_text: string | null
        }
        Insert: {
          definition_id: string
          entry_timestamp?: string
          id?: string
          notes?: string | null
          user_id: string
          value_numeric?: number | null
          value_text?: string | null
        }
        Update: {
          definition_id?: string
          entry_timestamp?: string
          id?: string
          notes?: string | null
          user_id?: string
          value_numeric?: number | null
          value_text?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "state_entries_definition_id_fkey"
            columns: ["definition_id"]
            isOneToOne: false
            referencedRelation: "tracked_state_defs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "state_entries_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      task_values: {
        Row: {
          task_id: string
          user_id: string
          value_id: string
        }
        Insert: {
          task_id: string
          user_id: string
          value_id: string
        }
        Update: {
          task_id?: string
          user_id?: string
          value_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_values_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_values_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_values_value_id_fkey"
            columns: ["value_id"]
            isOneToOne: false
            referencedRelation: "values"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          archived_at: string | null
          created_at: string | null
          due: string | null
          goal_id: string | null
          id: string
          notes: string | null
          parent_task_id: string | null
          priority: Database["public"]["Enums"]["task_priority"] | null
          recurrence_end_date: string | null
          recurrence_rule: string | null
          sort_order: number | null
          status: Database["public"]["Enums"]["task_status"]
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          archived_at?: string | null
          created_at?: string | null
          due?: string | null
          goal_id?: string | null
          id?: string
          notes?: string | null
          parent_task_id?: string | null
          priority?: Database["public"]["Enums"]["task_priority"] | null
          recurrence_end_date?: string | null
          recurrence_rule?: string | null
          sort_order?: number | null
          status?: Database["public"]["Enums"]["task_status"]
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          archived_at?: string | null
          created_at?: string | null
          due?: string | null
          goal_id?: string | null
          id?: string
          notes?: string | null
          parent_task_id?: string | null
          priority?: Database["public"]["Enums"]["task_priority"] | null
          recurrence_end_date?: string | null
          recurrence_rule?: string | null
          sort_order?: number | null
          status?: Database["public"]["Enums"]["task_status"]
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_goal_id_fkey"
            columns: ["goal_id"]
            isOneToOne: false
            referencedRelation: "goals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_parent_task_id_fkey"
            columns: ["parent_task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      tracked_state_defs: {
        Row: {
          active: boolean
          created_at: string
          custom_labels: string[] | null
          id: string
          name: string
          priority: number
          scale: Database["public"]["Enums"]["tracked_state_scale"]
          target_max_value: number | null
          target_min_value: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          custom_labels?: string[] | null
          id?: string
          name: string
          priority?: number
          scale: Database["public"]["Enums"]["tracked_state_scale"]
          target_max_value?: number | null
          target_min_value?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          active?: boolean
          created_at?: string
          custom_labels?: string[] | null
          id?: string
          name?: string
          priority?: number
          scale?: Database["public"]["Enums"]["tracked_state_scale"]
          target_max_value?: number | null
          target_min_value?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tracked_state_defs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      tracked_state_values: {
        Row: {
          state_id: string
          user_id: string
          value_id: string
        }
        Insert: {
          state_id: string
          user_id: string
          value_id: string
        }
        Update: {
          state_id?: string
          user_id?: string
          value_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tracked_state_values_state_id_fkey"
            columns: ["state_id"]
            isOneToOne: false
            referencedRelation: "tracked_state_defs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tracked_state_values_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tracked_state_values_value_id_fkey"
            columns: ["value_id"]
            isOneToOne: false
            referencedRelation: "values"
            referencedColumns: ["id"]
          },
        ]
      }
      user_badges: {
        Row: {
          badge_id: string
          earned_at: string
          progress: number | null
          user_id: string
        }
        Insert: {
          badge_id: string
          earned_at?: string
          progress?: number | null
          user_id: string
        }
        Update: {
          badge_id?: string
          earned_at?: string
          progress?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_badges_badge_id_fkey"
            columns: ["badge_id"]
            isOneToOne: false
            referencedRelation: "badge_definitions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_badges_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_rewards: {
        Row: {
          created_at: string
          earned_at: string
          id: string
          metadata: Json | null
          points_spent: number
          reward_id: string
          reward_type: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          earned_at?: string
          id?: string
          metadata?: Json | null
          points_spent?: number
          reward_id: string
          reward_type?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          earned_at?: string
          id?: string
          metadata?: Json | null
          points_spent?: number
          reward_id?: string
          reward_type?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_rewards_reward_id_fkey"
            columns: ["reward_id"]
            isOneToOne: false
            referencedRelation: "rewards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_rewards_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_settings: {
        Row: {
          created_at: string
          id: string
          notification_preferences: Json
          ui_preferences: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          notification_preferences?: Json
          ui_preferences?: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          notification_preferences?: Json
          ui_preferences?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_settings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      values: {
        Row: {
          color: string | null
          created_at: string
          description: string | null
          domain_id: string | null
          id: string
          sort_order: number | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          description?: string | null
          domain_id?: string | null
          id?: string
          sort_order?: number | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          color?: string | null
          created_at?: string
          description?: string | null
          domain_id?: string | null
          id?: string
          sort_order?: number | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "values_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      habit_frequency_period: "day" | "week" | "month"
      habit_type: "boolean" | "quantity"
      reward_type: "badge" | "achievement" | "item" | "discount"
      task_priority: "low" | "medium" | "high"
      task_status: "todo" | "doing" | "done" | "blocked" | "pending"
      tracked_state_scale: "1-5" | "low-high" | "custom"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      habit_frequency_period: ["day", "week", "month"],
      habit_type: ["boolean", "quantity"],
      reward_type: ["badge", "achievement", "item", "discount"],
      task_priority: ["low", "medium", "high"],
      task_status: ["todo", "doing", "done", "blocked", "pending"],
      tracked_state_scale: ["1-5", "low-high", "custom"],
    },
  },
} as const

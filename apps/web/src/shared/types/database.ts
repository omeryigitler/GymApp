export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type SubscriptionTier = "free" | "pro" | "team";
export type WorkoutSetType = "normal" | "warmup" | "dropset";

type Table<Row, Insert = Row, Update = Partial<Insert>> = {
  Row: Row;
  Insert: Insert;
  Update: Update;
  Relationships: never[];
};

export interface Database {
  public: {
    Tables: {
      profiles: Table<{
        id: string;
        display_name: string;
        preferred_language: "tr" | "en";
        subscription_tier: SubscriptionTier;
        created_at: string;
        updated_at: string;
      }>;
      exercises: Table<{
        id: string;
        slug: string;
        name_tr: string;
        name_en: string;
        muscle_group_tr: string;
        muscle_group_en: string;
        created_at: string;
      }>;
      routines: Table<{
        id: string;
        user_id: string;
        name: string;
        created_at: string;
        updated_at: string;
      }>;
      workouts: Table<{
        id: string;
        user_id: string;
        routine_id: string | null;
        name: string;
        started_at: string;
        finished_at: string | null;
        notes: string | null;
        created_at: string;
        updated_at: string;
      }>;
      measurements: Table<{
        id: string;
        user_id: string;
        measured_at: string;
        weight_kg: number | null;
        chest_cm: number | null;
        shoulders_cm: number | null;
        arms_cm: number | null;
        legs_cm: number | null;
        waist_cm: number | null;
        body_fat_percent: number | null;
        created_at: string;
      }>;
      water_logs: Table<{
        id: string;
        user_id: string;
        log_date: string;
        glasses: number;
        created_at: string;
        updated_at: string;
      }>;
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      subscription_tier: SubscriptionTier;
      workout_set_type: WorkoutSetType;
    };
    CompositeTypes: Record<string, never>;
  };
}

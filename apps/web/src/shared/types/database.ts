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
      profiles: Table<
        {
          id: string;
          display_name: string;
          preferred_language: "tr" | "en";
          subscription_tier: SubscriptionTier;
          created_at: string;
          updated_at: string;
        },
        {
          id: string;
          display_name: string;
          preferred_language?: "tr" | "en";
          subscription_tier?: SubscriptionTier;
        }
      >;
      exercises: Table<
        {
          id: string;
          slug: string;
          name_tr: string;
          name_en: string;
          muscle_group_tr: string;
          muscle_group_en: string;
          created_at: string;
        },
        {
          id?: string;
          slug: string;
          name_tr: string;
          name_en: string;
          muscle_group_tr: string;
          muscle_group_en: string;
        }
      >;
      routines: Table<
        {
          id: string;
          user_id: string;
          name: string;
          created_at: string;
          updated_at: string;
        },
        {
          id?: string;
          user_id: string;
          name: string;
        }
      >;
      routine_exercises: Table<
        {
          id: string;
          routine_id: string;
          exercise_id: string;
          position: number;
          target_sets: number;
          target_reps: string;
          target_duration_seconds: number | null;
          rest_seconds: number;
          notes: string | null;
          superset_group_id: string | null;
          created_at: string;
        },
        {
          id?: string;
          routine_id: string;
          exercise_id: string;
          position: number;
          target_sets: number;
          target_reps: string;
          target_duration_seconds?: number | null;
          rest_seconds?: number;
          notes?: string | null;
          superset_group_id?: string | null;
        }
      >;
      workouts: Table<
        {
          id: string;
          user_id: string;
          routine_id: string | null;
          name: string;
          started_at: string;
          finished_at: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        },
        {
          id?: string;
          user_id: string;
          routine_id?: string | null;
          name: string;
          started_at: string;
          finished_at?: string | null;
          notes?: string | null;
        }
      >;
      workout_exercises: Table<
        {
          id: string;
          workout_id: string;
          exercise_id: string;
          position: number;
          rest_seconds: number;
          notes: string | null;
          superset_group_id: string | null;
          created_at: string;
        },
        {
          id?: string;
          workout_id: string;
          exercise_id: string;
          position: number;
          rest_seconds?: number;
          notes?: string | null;
          superset_group_id?: string | null;
        }
      >;
      workout_sets: Table<
        {
          id: string;
          workout_exercise_id: string;
          position: number;
          weight_kg: number | null;
          reps: number | null;
          duration_seconds: number | null;
          rpe: number | null;
          completed: boolean;
          set_type: WorkoutSetType;
          created_at: string;
        },
        {
          id?: string;
          workout_exercise_id: string;
          position: number;
          weight_kg?: number | null;
          reps?: number | null;
          duration_seconds?: number | null;
          rpe?: number | null;
          completed?: boolean;
          set_type?: WorkoutSetType;
        }
      >;
      measurements: Table<
        {
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
        },
        {
          id?: string;
          user_id: string;
          measured_at?: string;
          weight_kg?: number | null;
          chest_cm?: number | null;
          shoulders_cm?: number | null;
          arms_cm?: number | null;
          legs_cm?: number | null;
          waist_cm?: number | null;
          body_fat_percent?: number | null;
        }
      >;
      water_logs: Table<
        {
          id: string;
          user_id: string;
          log_date: string;
          glasses: number;
          created_at: string;
          updated_at: string;
        },
        {
          id?: string;
          user_id: string;
          log_date: string;
          glasses?: number;
        }
      >;
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

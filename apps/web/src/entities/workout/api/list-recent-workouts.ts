import type { createSupabaseServerClient } from "@/shared/lib/supabase/server-client";

type SupabaseServerClient = Awaited<ReturnType<typeof createSupabaseServerClient>>;

export type RecentWorkoutSummary = {
  id: string;
  name: string;
  started_at: string;
  finished_at: string | null;
  notes: string | null;
  setCount: number;
  totalReps: number;
  volumeKg: number;
};

export async function listRecentWorkouts(supabase: SupabaseServerClient, userId: string): Promise<RecentWorkoutSummary[]> {
  const { data: workouts, error } = await supabase
    .from("workouts")
    .select("id, name, started_at, finished_at, notes")
    .eq("user_id", userId)
    .order("started_at", { ascending: false })
    .limit(5);

  if (error) {
    throw new Error(error.message);
  }

  if (workouts.length === 0) {
    return [];
  }

  const workoutIds = workouts.map(workout => workout.id);

  const { data: workoutExercises, error: workoutExerciseError } = await supabase
    .from("workout_exercises")
    .select("id, workout_id")
    .in("workout_id", workoutIds);

  if (workoutExerciseError) {
    throw new Error(workoutExerciseError.message);
  }

  if (workoutExercises.length === 0) {
    return workouts.map(workout => ({
      ...workout,
      setCount: 0,
      totalReps: 0,
      volumeKg: 0
    }));
  }

  const exerciseToWorkout = new Map(workoutExercises.map(exercise => [exercise.id, exercise.workout_id]));
  const workoutExerciseIds = workoutExercises.map(exercise => exercise.id);

  const { data: sets, error: setsError } = await supabase
    .from("workout_sets")
    .select("workout_exercise_id, weight_kg, reps, completed")
    .in("workout_exercise_id", workoutExerciseIds)
    .eq("completed", true);

  if (setsError) {
    throw new Error(setsError.message);
  }

  const stats = new Map<string, { setCount: number; totalReps: number; volumeKg: number }>();

  for (const set of sets) {
    const workoutId = exerciseToWorkout.get(set.workout_exercise_id);

    if (!workoutId) {
      continue;
    }

    const current = stats.get(workoutId) ?? { setCount: 0, totalReps: 0, volumeKg: 0 };
    const reps = set.reps ?? 0;
    const weightKg = set.weight_kg ?? 0;

    stats.set(workoutId, {
      setCount: current.setCount + 1,
      totalReps: current.totalReps + reps,
      volumeKg: current.volumeKg + weightKg * reps
    });
  }

  return workouts.map(workout => {
    const workoutStats = stats.get(workout.id) ?? { setCount: 0, totalReps: 0, volumeKg: 0 };

    return {
      ...workout,
      ...workoutStats
    };
  });
}

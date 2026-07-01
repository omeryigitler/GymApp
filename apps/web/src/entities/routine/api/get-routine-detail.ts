import type { createSupabaseServerClient } from "@/shared/lib/supabase/server-client";

type SupabaseServerClient = Awaited<ReturnType<typeof createSupabaseServerClient>>;

export async function getRoutineDetail(supabase: SupabaseServerClient, userId: string, routineId: string) {
  const { data: routine, error: routineError } = await supabase
    .from("routines")
    .select("id, name, created_at, updated_at")
    .eq("id", routineId)
    .eq("user_id", userId)
    .maybeSingle();

  if (routineError) {
    throw new Error(routineError.message);
  }

  if (!routine) {
    return null;
  }

  const { data: routineExercises, error: routineExercisesError } = await supabase
    .from("routine_exercises")
    .select("id, exercise_id, position, target_sets, target_reps, target_duration_seconds, rest_seconds, notes")
    .eq("routine_id", routine.id)
    .order("position", { ascending: true });

  if (routineExercisesError) {
    throw new Error(routineExercisesError.message);
  }

  const exerciseIds = routineExercises.map(item => item.exercise_id);
  const { data: exercises, error: exercisesError } = await supabase
    .from("exercises")
    .select("id, name_tr, muscle_group_tr")
    .in("id", exerciseIds);

  if (exercisesError) {
    throw new Error(exercisesError.message);
  }

  const exerciseMap = new Map(exercises.map(item => [item.id, item]));
  const detailExercises = routineExercises.map(item => {
    const exercise = exerciseMap.get(item.exercise_id);

    return {
      id: item.id,
      exerciseId: item.exercise_id,
      nameTr: exercise?.name_tr ?? "Exercise",
      muscleGroupTr: exercise?.muscle_group_tr ?? "General",
      position: item.position,
      targetSets: item.target_sets,
      targetReps: item.target_reps,
      targetDurationSeconds: item.target_duration_seconds,
      restSeconds: item.rest_seconds,
      notes: item.notes
    };
  });

  return {
    ...routine,
    exerciseCount: detailExercises.length,
    totalTargetSets: detailExercises.reduce((total, item) => total + item.targetSets, 0),
    exercises: detailExercises
  };
}

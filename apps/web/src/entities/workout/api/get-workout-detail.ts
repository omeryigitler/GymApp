import type { createSupabaseServerClient } from "@/shared/lib/supabase/server-client";

type SupabaseServerClient = Awaited<ReturnType<typeof createSupabaseServerClient>>;

type WorkoutSet = {
  id: string;
  position: number;
  weight_kg: number | null;
  reps: number | null;
  duration_seconds: number | null;
  rpe: number | null;
  completed: boolean;
  set_type: string;
};

type WorkoutExercise = {
  id: string;
  exercise_id: string;
  position: number;
  rest_seconds: number | null;
};

type ExerciseCatalogItem = {
  id: string;
  name_tr: string;
  muscle_group_tr: string;
};

export type WorkoutDetail = {
  id: string;
  name: string;
  started_at: string;
  finished_at: string | null;
  notes: string | null;
  setCount: number;
  totalReps: number;
  volumeKg: number;
  exercises: Array<{
    id: string;
    exerciseId: string;
    nameTr: string;
    muscleGroupTr: string;
    position: number;
    restSeconds: number | null;
    sets: WorkoutSet[];
  }>;
};

export async function getWorkoutDetail(supabase: SupabaseServerClient, userId: string, workoutId: string): Promise<WorkoutDetail | null> {
  const { data: workout, error: workoutError } = await supabase
    .from("workouts")
    .select("id, name, started_at, finished_at, notes")
    .eq("id", workoutId)
    .eq("user_id", userId)
    .maybeSingle();

  if (workoutError) {
    throw new Error(workoutError.message);
  }

  if (!workout) {
    return null;
  }

  const { data: workoutExercises, error: workoutExercisesError } = await supabase
    .from("workout_exercises")
    .select("id, exercise_id, position, rest_seconds")
    .eq("workout_id", workout.id)
    .order("position", { ascending: true });

  if (workoutExercisesError) {
    throw new Error(workoutExercisesError.message);
  }

  const typedWorkoutExercises = workoutExercises as WorkoutExercise[];

  if (typedWorkoutExercises.length === 0) {
    return {
      ...workout,
      setCount: 0,
      totalReps: 0,
      volumeKg: 0,
      exercises: []
    };
  }

  const workoutExerciseIds = typedWorkoutExercises.map(exercise => exercise.id);
  const exerciseIds = typedWorkoutExercises.map(exercise => exercise.exercise_id);

  const [{ data: sets, error: setsError }, { data: exercises, error: exercisesError }] = await Promise.all([
    supabase
      .from("workout_sets")
      .select("id, workout_exercise_id, position, weight_kg, reps, duration_seconds, rpe, completed, set_type")
      .in("workout_exercise_id", workoutExerciseIds)
      .order("position", { ascending: true }),
    supabase
      .from("exercises")
      .select("id, name_tr, muscle_group_tr")
      .in("id", exerciseIds)
  ]);

  if (setsError) {
    throw new Error(setsError.message);
  }

  if (exercisesError) {
    throw new Error(exercisesError.message);
  }

  const typedSets = sets as Array<WorkoutSet & { workout_exercise_id: string }>;
  const typedExercises = exercises as ExerciseCatalogItem[];
  const exerciseCatalog = new Map(typedExercises.map(exercise => [exercise.id, exercise]));
  const setsByWorkoutExercise = new Map<string, WorkoutSet[]>();

  for (const set of typedSets) {
    const current = setsByWorkoutExercise.get(set.workout_exercise_id) ?? [];
    current.push(set);
    setsByWorkoutExercise.set(set.workout_exercise_id, current);
  }

  let setCount = 0;
  let totalReps = 0;
  let volumeKg = 0;

  for (const set of typedSets) {
    if (!set.completed) {
      continue;
    }

    const reps = set.reps ?? 0;
    const weightKg = set.weight_kg ?? 0;

    setCount += 1;
    totalReps += reps;
    volumeKg += reps * weightKg;
  }

  return {
    ...workout,
    setCount,
    totalReps,
    volumeKg,
    exercises: typedWorkoutExercises.map(workoutExercise => {
      const exercise = exerciseCatalog.get(workoutExercise.exercise_id);

      return {
        id: workoutExercise.id,
        exerciseId: workoutExercise.exercise_id,
        nameTr: exercise?.name_tr ?? "Unknown exercise",
        muscleGroupTr: exercise?.muscle_group_tr ?? "Unknown",
        position: workoutExercise.position,
        restSeconds: workoutExercise.rest_seconds,
        sets: setsByWorkoutExercise.get(workoutExercise.id) ?? []
      };
    })
  };
}

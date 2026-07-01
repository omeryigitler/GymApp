"use server";

import { redirect } from "next/navigation";
import { quickWorkoutSchema } from "@/features/workouts/model/quick-workout-schema";
import { createSupabaseServerClient } from "@/shared/lib/supabase/server-client";

function optionalNumber(value: FormDataEntryValue | null) {
  if (typeof value !== "string" || value.trim() === "") {
    return null;
  }

  return Number(value);
}

function optionalString(value: FormDataEntryValue | null) {
  if (typeof value !== "string" || value.trim() === "") {
    return null;
  }

  return value;
}

function readSet(formData: FormData, position: number) {
  const reps = optionalString(formData.get(`set${position}Reps`));

  if (!reps) {
    return null;
  }

  return {
    position,
    weightKg: optionalNumber(formData.get(`set${position}WeightKg`)),
    reps,
    rpe: optionalNumber(formData.get(`set${position}Rpe`))
  };
}

export async function createQuickWorkoutAction(formData: FormData) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    redirect("/auth");
  }

  const sets = [1, 2, 3]
    .map(position => readSet(formData, position))
    .filter((set): set is NonNullable<ReturnType<typeof readSet>> => set !== null);

  const input = quickWorkoutSchema.parse({
    name: formData.get("name"),
    exerciseId: formData.get("exerciseId"),
    restSeconds: formData.get("restSeconds") ?? 90,
    sets,
    notes: formData.get("notes")
  });

  const now = new Date().toISOString();
  const cleanNotes = input.notes && input.notes.length > 0 ? input.notes : null;

  const { data: workout, error: workoutError } = await supabase
    .from("workouts")
    .insert({
      user_id: data.user.id,
      name: input.name,
      started_at: now,
      finished_at: now,
      notes: cleanNotes
    })
    .select("id")
    .single();

  if (workoutError) {
    throw new Error(workoutError.message);
  }

  const { data: workoutExercise, error: exerciseError } = await supabase
    .from("workout_exercises")
    .insert({
      workout_id: workout.id,
      exercise_id: input.exerciseId,
      position: 1,
      rest_seconds: input.restSeconds
    })
    .select("id")
    .single();

  if (exerciseError) {
    await supabase.from("workouts").delete().eq("id", workout.id);
    throw new Error(exerciseError.message);
  }

  const setRows = input.sets.map(set => ({
    workout_exercise_id: workoutExercise.id,
    position: set.position,
    weight_kg: set.weightKg,
    reps: set.reps,
    rpe: set.rpe,
    completed: true,
    set_type: "normal" as const
  }));

  const { error: setError } = await supabase.from("workout_sets").insert(setRows);

  if (setError) {
    await supabase.from("workouts").delete().eq("id", workout.id);
    throw new Error(setError.message);
  }

  redirect("/dashboard");
}

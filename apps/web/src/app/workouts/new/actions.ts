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

export async function createQuickWorkoutAction(formData: FormData) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    redirect("/auth");
  }

  const input = quickWorkoutSchema.parse({
    name: formData.get("name"),
    exerciseId: formData.get("exerciseId"),
    weightKg: optionalNumber(formData.get("weightKg")),
    reps: formData.get("reps"),
    rpe: optionalNumber(formData.get("rpe")),
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
      rest_seconds: 90
    })
    .select("id")
    .single();

  if (exerciseError) {
    await supabase.from("workouts").delete().eq("id", workout.id);
    throw new Error(exerciseError.message);
  }

  const { error: setError } = await supabase.from("workout_sets").insert({
    workout_exercise_id: workoutExercise.id,
    position: 1,
    weight_kg: input.weightKg,
    reps: input.reps,
    rpe: input.rpe,
    completed: true,
    set_type: "normal"
  });

  if (setError) {
    await supabase.from("workouts").delete().eq("id", workout.id);
    throw new Error(setError.message);
  }

  redirect("/dashboard");
}

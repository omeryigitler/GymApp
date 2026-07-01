"use server";

import { redirect } from "next/navigation";
import { quickRoutineSchema } from "@/features/routines/model/quick-routine-schema";
import { createSupabaseServerClient } from "@/shared/lib/supabase/server-client";

export async function createQuickRoutineAction(formData: FormData) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    redirect("/auth");
  }

  const input = quickRoutineSchema.parse({
    name: formData.get("name"),
    exerciseId: formData.get("exerciseId"),
    targetSets: formData.get("targetSets"),
    targetReps: formData.get("targetReps"),
    restSeconds: formData.get("restSeconds"),
    notes: formData.get("notes")
  });

  const cleanNotes = input.notes && input.notes.length > 0 ? input.notes : null;

  const { data: routine, error: routineError } = await supabase
    .from("routines")
    .insert({
      user_id: data.user.id,
      name: input.name
    })
    .select("id")
    .single();

  if (routineError) {
    throw new Error(routineError.message);
  }

  const { error: exerciseError } = await supabase.from("routine_exercises").insert({
    routine_id: routine.id,
    exercise_id: input.exerciseId,
    position: 1,
    target_sets: input.targetSets,
    target_reps: input.targetReps,
    rest_seconds: input.restSeconds,
    notes: cleanNotes
  });

  if (exerciseError) {
    await supabase.from("routines").delete().eq("id", routine.id);
    throw new Error(exerciseError.message);
  }

  redirect("/dashboard");
}

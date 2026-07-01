import type { createSupabaseServerClient } from "@/shared/lib/supabase/server-client";

type SupabaseServerClient = Awaited<ReturnType<typeof createSupabaseServerClient>>;

export async function listExercises(supabase: SupabaseServerClient) {
  const { data, error } = await supabase
    .from("exercises")
    .select("id, slug, name_tr, name_en, muscle_group_tr, muscle_group_en")
    .order("muscle_group_tr", { ascending: true })
    .order("name_tr", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

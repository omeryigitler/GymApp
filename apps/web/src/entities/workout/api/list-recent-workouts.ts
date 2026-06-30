import type { createSupabaseServerClient } from "@/shared/lib/supabase/server-client";

type SupabaseServerClient = Awaited<ReturnType<typeof createSupabaseServerClient>>;

export async function listRecentWorkouts(supabase: SupabaseServerClient, userId: string) {
  const { data, error } = await supabase
    .from("workouts")
    .select("id, name, started_at, finished_at, notes")
    .eq("user_id", userId)
    .order("started_at", { ascending: false })
    .limit(5);

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

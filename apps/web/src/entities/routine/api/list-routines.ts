import type { createSupabaseServerClient } from "@/shared/lib/supabase/server-client";

type SupabaseServerClient = Awaited<ReturnType<typeof createSupabaseServerClient>>;

export async function listRoutines(supabase: SupabaseServerClient, userId: string) {
  const { data, error } = await supabase
    .from("routines")
    .select("id, name, created_at, updated_at")
    .eq("user_id", userId)
    .limit(5);

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

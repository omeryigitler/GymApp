import type { User } from "@supabase/supabase-js";
import type { createSupabaseServerClient } from "@/shared/lib/supabase/server-client";

type SupabaseServerClient = Awaited<ReturnType<typeof createSupabaseServerClient>>;

function displayNameFor(user: User) {
  const metadataName = user.user_metadata?.display_name;

  if (typeof metadataName === "string" && metadataName.trim().length > 0) {
    return metadataName.trim();
  }

  return user.email?.split("@")[0] ?? "User";
}

export async function bootstrapProfile(supabase: SupabaseServerClient, user: User) {
  const profile = {
    id: user.id,
    display_name: displayNameFor(user),
    preferred_language: "tr" as const,
    subscription_tier: "free" as const
  };

  const { error } = await supabase.from("profiles").upsert(profile, {
    onConflict: "id",
    ignoreDuplicates: true
  });

  if (error) {
    throw new Error(error.message);
  }
}

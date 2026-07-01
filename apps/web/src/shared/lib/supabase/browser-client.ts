import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/shared/types/database";

export function createSupabaseBrowserClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error("Supabase environment variables are missing.");
  }

  return createBrowserClient<Database>(url, anonKey);
}

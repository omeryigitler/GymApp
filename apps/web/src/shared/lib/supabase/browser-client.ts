import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/shared/types/database";
import { envKeys } from "@/shared/config/env";

export function createSupabaseBrowserClient() {
  const url = globalThis.process?.env?.[envKeys.supabaseUrl];
  const anonKey = globalThis.process?.env?.[envKeys.supabaseAnonKey];

  if (!url || !anonKey) {
    throw new Error("Supabase environment variables are missing.");
  }

  return createBrowserClient<Database>(url, anonKey);
}

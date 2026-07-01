import { createSupabaseBrowserClient } from "@/shared/lib/supabase/browser-client";
import { emailLinkSchema, type EmailLinkInput } from "../model/email-link-schema";

export async function requestEmailLink(input: EmailLinkInput) {
  const parsed = emailLinkSchema.parse(input);
  const supabase = createSupabaseBrowserClient();
  const redirectTo = `${window.location.origin}/auth/callback`;

  const { error } = await supabase.auth.signInWithOtp({
    email: parsed.email,
    options: {
      emailRedirectTo: redirectTo
    }
  });

  if (error) {
    throw new Error(error.message);
  }
}

import { NextResponse } from "next/server";
import { bootstrapProfile } from "@/features/auth/api/profile-bootstrap";
import { createSupabaseServerClient } from "@/shared/lib/supabase/server-client";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const origin = requestUrl.origin;

  if (!code) {
    return NextResponse.redirect(`${origin}/auth?error=missing_code`);
  }

  const supabase = await createSupabaseServerClient();
  const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

  if (exchangeError) {
    return NextResponse.redirect(`${origin}/auth?error=session_exchange_failed`);
  }

  const { data, error: userError } = await supabase.auth.getUser();

  if (userError || !data.user) {
    return NextResponse.redirect(`${origin}/auth?error=user_not_found`);
  }

  try {
    await bootstrapProfile(supabase, data.user);
  } catch {
    return NextResponse.redirect(`${origin}/auth?error=profile_bootstrap_failed`);
  }

  return NextResponse.redirect(`${origin}/dashboard`);
}

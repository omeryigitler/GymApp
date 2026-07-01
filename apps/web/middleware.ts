import type { NextRequest } from "next/server";
import { updateSession } from "./src/shared/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: ["/dashboard/:path*", "/auth/:path*", "/workouts/:path*", "/routines/:path*"]
};

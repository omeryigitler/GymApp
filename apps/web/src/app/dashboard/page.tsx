import Link from "next/link";
import { redirect } from "next/navigation";
import { listRoutines } from "@/entities/routine/api/list-routines";
import { getCurrentProfile } from "@/entities/user/api/get-current-profile";
import { listRecentWorkouts } from "@/entities/workout/api/list-recent-workouts";
import { createSupabaseServerClient } from "@/shared/lib/supabase/server-client";
import { ProductShell } from "@/widgets/product-shell/ui/product-shell";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("tr-TR", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(value));
}

function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div style={{ border: "1px dashed rgba(255,255,255,0.16)", borderRadius: 18, padding: 16 }}>
      <h3 style={{ color: "white", margin: 0, fontSize: 16 }}>{title}</h3>
      <p style={{ color: "var(--muted)", margin: "8px 0 0", lineHeight: 1.5, fontSize: 14 }}>{description}</p>
    </div>
  );
}

export default async function DashboardRoute() {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    redirect("/auth");
  }

  const [profile, workouts, routines] = await Promise.all([
    getCurrentProfile(supabase, data.user.id),
    listRecentWorkouts(supabase, data.user.id),
    listRoutines(supabase, data.user.id)
  ]);

  return (
    <ProductShell>
      <main style={{ padding: 24, display: "grid", gap: 16 }}>
        <section>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "flex-start" }}>
            <div>
              <p style={{ color: "var(--lime)", fontWeight: 900, letterSpacing: 2, fontSize: 12, textTransform: "uppercase" }}>Protected Dashboard</p>
              <h1 style={{ color: "white", fontSize: 40, lineHeight: 1, margin: "12px 0", letterSpacing: -3 }}>Hos geldin, {profile.display_name}.</h1>
            </div>
            <form method="post" action="/auth/logout">
              <button type="submit" style={{ border: "1px solid rgba(255,255,255,0.12)", borderRadius: 999, background: "transparent", color: "white", fontWeight: 800, padding: "10px 14px", cursor: "pointer" }}>Logout</button>
            </form>
          </div>
          <p style={{ color: "var(--muted)", lineHeight: 1.6 }}>This screen uses Supabase session, profile and user-owned tables.</p>
          <Link href="/workouts/new" style={{ display: "inline-block", marginTop: 10, borderRadius: 999, background: "var(--lime)", color: "#131313", fontWeight: 900, padding: "12px 16px" }}>Log workout</Link>
        </section>

        <section className="card">
          <h2 style={{ color: "white", marginTop: 0 }}>Account state</h2>
          <dl style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, margin: 0 }}>
            <div><dt style={{ color: "var(--muted)", fontSize: 12, textTransform: "uppercase", fontWeight: 800 }}>Plan</dt><dd style={{ color: "white", margin: "4px 0 0" }}>{profile.subscription_tier}</dd></div>
            <div><dt style={{ color: "var(--muted)", fontSize: 12, textTransform: "uppercase", fontWeight: 800 }}>Language</dt><dd style={{ color: "white", margin: "4px 0 0" }}>{profile.preferred_language}</dd></div>
          </dl>
        </section>

        <section className="card">
          <h2 style={{ color: "white", marginTop: 0 }}>Recent workouts</h2>
          {workouts.length === 0 ? <EmptyState title="No workouts yet" description="Log your first workout to see real Supabase data here." /> : (
            <div style={{ display: "grid", gap: 10 }}>{workouts.map(workout => <article key={workout.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.08)", paddingBottom: 10 }}><h3 style={{ color: "white", margin: 0, fontSize: 16 }}>{workout.name}</h3><p style={{ color: "var(--muted)", margin: "4px 0 0", fontSize: 13 }}>{formatDate(workout.started_at)}</p></article>)}</div>
          )}
        </section>

        <section className="card">
          <h2 style={{ color: "white", marginTop: 0 }}>Routines</h2>
          {routines.length === 0 ? <EmptyState title="No routines yet" description="Routine creation will be migrated after the workout save flow." /> : (
            <div style={{ display: "grid", gap: 10 }}>{routines.map(routine => <article key={routine.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.08)", paddingBottom: 10 }}><h3 style={{ color: "white", margin: 0, fontSize: 16 }}>{routine.name}</h3><p style={{ color: "var(--muted)", margin: "4px 0 0", fontSize: 13 }}>Updated: {formatDate(routine.updated_at)}</p></article>)}</div>
          )}
        </section>
      </main>
    </ProductShell>
  );
}

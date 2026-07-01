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

function formatVolume(value: number) {
  return new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 1 }).format(value);
}

function EmptyState({ title, description }: { title: string; description: string }) {
  return <div style={{ border: "1px dashed rgba(255,255,255,0.16)", borderRadius: 18, padding: 16 }}><h3 style={{ color: "white", margin: 0, fontSize: 16 }}>{title}</h3><p style={{ color: "var(--muted)", margin: "8px 0 0", lineHeight: 1.5, fontSize: 14 }}>{description}</p></div>;
}

function MetricBadge({ label, value }: { label: string; value: string }) {
  return <div style={{ border: "1px solid rgba(255,255,255,0.1)", borderRadius: 14, padding: "10px 12px", background: "rgba(255,255,255,0.03)" }}><p style={{ color: "var(--muted)", fontSize: 11, margin: 0, textTransform: "uppercase", fontWeight: 900 }}>{label}</p><p style={{ color: "white", margin: "4px 0 0", fontWeight: 900 }}>{value}</p></div>;
}

const ctaStyle = { display: "inline-block", marginTop: 10, borderRadius: 999, background: "var(--lime)", color: "#131313", fontWeight: 900, padding: "12px 16px" } as const;
const secondaryCtaStyle = { display: "inline-block", marginTop: 10, borderRadius: 999, border: "1px solid rgba(255,255,255,0.14)", color: "white", fontWeight: 900, padding: "12px 16px" } as const;

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
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <Link href="/workouts/new" style={ctaStyle}>Log workout</Link>
            <Link href="/routines/new" style={secondaryCtaStyle}>Create routine</Link>
          </div>
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
          {workouts.length === 0 ? <EmptyState title="No workouts yet" description="Log your first workout to see real Supabase data here." /> : <div style={{ display: "grid", gap: 14 }}>{workouts.map(workout => <Link key={workout.id} href={`/workouts/${workout.id}`} style={{ display: "block", textDecoration: "none", borderBottom: "1px solid rgba(255,255,255,0.08)", paddingBottom: 14 }}><article><div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "baseline" }}><h3 style={{ color: "white", margin: 0, fontSize: 16 }}>{workout.name}</h3><p style={{ color: "var(--muted)", margin: 0, fontSize: 12 }}>{formatDate(workout.started_at)}</p></div><div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, marginTop: 12 }}><MetricBadge label="Sets" value={`${workout.setCount}`} /><MetricBadge label="Reps" value={`${workout.totalReps}`} /><MetricBadge label="Volume" value={`${formatVolume(workout.volumeKg)} kg`} /></div>{workout.notes ? <p style={{ color: "var(--muted)", margin: "10px 0 0", fontSize: 13, lineHeight: 1.5 }}>{workout.notes}</p> : null}<p style={{ color: "var(--lime)", margin: "10px 0 0", fontSize: 12, fontWeight: 900 }}>View details</p></article></Link>)}</div>}
        </section>

        <section className="card">
          <h2 style={{ color: "white", marginTop: 0 }}>Routines</h2>
          {routines.length === 0 ? <EmptyState title="No routines yet" description="Create your first routine to see real Supabase data here." /> : <div style={{ display: "grid", gap: 10 }}>{routines.map(routine => <article key={routine.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.08)", paddingBottom: 10 }}><h3 style={{ color: "white", margin: 0, fontSize: 16 }}>{routine.name}</h3><p style={{ color: "var(--muted)", margin: "4px 0 0", fontSize: 13 }}>Updated: {formatDate(routine.updated_at)}</p></article>)}</div>}
        </section>
      </main>
    </ProductShell>
  );
}

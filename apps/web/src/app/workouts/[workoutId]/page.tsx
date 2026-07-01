import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getWorkoutDetail } from "@/entities/workout/api/get-workout-detail";
import { createSupabaseServerClient } from "@/shared/lib/supabase/server-client";
import { ProductShell } from "@/widgets/product-shell/ui/product-shell";

type PageProps = {
  params: Promise<{ workoutId: string }>;
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("tr-TR", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(value));
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 1 }).format(value);
}

function MetricBadge({ label, value }: { label: string; value: string }) {
  return <div style={{ border: "1px solid rgba(255,255,255,0.1)", borderRadius: 14, padding: "10px 12px", background: "rgba(255,255,255,0.03)" }}><p style={{ color: "var(--muted)", fontSize: 11, margin: 0, textTransform: "uppercase", fontWeight: 900 }}>{label}</p><p style={{ color: "white", margin: "4px 0 0", fontWeight: 900 }}>{value}</p></div>;
}

export default async function WorkoutDetailPage({ params }: PageProps) {
  const { workoutId } = await params;
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    redirect("/auth");
  }

  const workout = await getWorkoutDetail(supabase, data.user.id, workoutId);

  if (!workout) {
    notFound();
  }

  return (
    <ProductShell>
      <main style={{ padding: 24, display: "grid", gap: 16 }}>
        <section>
          <Link href="/dashboard" style={{ color: "var(--muted)", fontSize: 14, fontWeight: 800 }}>
            Back to dashboard
          </Link>
          <p style={{ color: "var(--lime)", fontWeight: 900, letterSpacing: 2, fontSize: 12, textTransform: "uppercase", marginTop: 18 }}>
            Workout Detail
          </p>
          <h1 style={{ color: "white", fontSize: 40, lineHeight: 1, margin: "12px 0", letterSpacing: -3 }}>
            {workout.name}
          </h1>
          <p style={{ color: "var(--muted)", lineHeight: 1.6, margin: 0 }}>
            {formatDate(workout.started_at)}
          </p>
        </section>

        <section className="card" style={{ display: "grid", gap: 12 }}>
          <h2 style={{ color: "white", margin: 0 }}>Summary</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
            <MetricBadge label="Sets" value={`${workout.setCount}`} />
            <MetricBadge label="Reps" value={`${workout.totalReps}`} />
            <MetricBadge label="Volume" value={`${formatNumber(workout.volumeKg)} kg`} />
          </div>
          {workout.notes ? <p style={{ color: "var(--muted)", margin: 0, lineHeight: 1.5 }}>{workout.notes}</p> : null}
        </section>

        <section className="card" style={{ display: "grid", gap: 14 }}>
          <h2 style={{ color: "white", margin: 0 }}>Exercises</h2>
          {workout.exercises.length === 0 ? <p style={{ color: "var(--muted)", margin: 0 }}>No exercises found for this workout.</p> : workout.exercises.map(exercise => (
            <article key={exercise.id} style={{ border: "1px solid rgba(255,255,255,0.1)", borderRadius: 18, padding: 14, display: "grid", gap: 12 }}>
              <div>
                <h3 style={{ color: "white", margin: 0, fontSize: 18 }}>{exercise.nameTr}</h3>
                <p style={{ color: "var(--muted)", margin: "4px 0 0", fontSize: 13 }}>{exercise.muscleGroupTr} · Rest {exercise.restSeconds ?? 0}s</p>
              </div>
              <div style={{ display: "grid", gap: 8 }}>
                {exercise.sets.map(set => (
                  <div key={set.id} style={{ display: "grid", gridTemplateColumns: "0.6fr 1fr 1fr 1fr", gap: 8, alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.08)", paddingBottom: 8 }}>
                    <span style={{ color: "var(--muted)", fontWeight: 900 }}>#{set.position}</span>
                    <span style={{ color: "white", fontWeight: 800 }}>{set.weight_kg ?? 0} kg</span>
                    <span style={{ color: "white", fontWeight: 800 }}>{set.reps ?? 0} reps</span>
                    <span style={{ color: "var(--muted)", fontWeight: 800 }}>RPE {set.rpe ?? "-"}</span>
                  </div>
                ))}
              </div>
            </article>
          ))}
        </section>
      </main>
    </ProductShell>
  );
}

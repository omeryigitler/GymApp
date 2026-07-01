import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getRoutineDetail } from "@/entities/routine/api/get-routine-detail";
import { createSupabaseServerClient } from "@/shared/lib/supabase/server-client";
import { ProductShell } from "@/widgets/product-shell/ui/product-shell";

type PageProps = {
  params: Promise<{ routineId: string }>;
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("tr-TR", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(value));
}

function MetricBadge({ label, value }: { label: string; value: string }) {
  return <div style={{ border: "1px solid rgba(255,255,255,0.1)", borderRadius: 14, padding: "10px 12px", background: "rgba(255,255,255,0.03)" }}><p style={{ color: "var(--muted)", fontSize: 11, margin: 0, textTransform: "uppercase", fontWeight: 900 }}>{label}</p><p style={{ color: "white", margin: "4px 0 0", fontWeight: 900 }}>{value}</p></div>;
}

export default async function RoutineDetailPage({ params }: PageProps) {
  const { routineId } = await params;
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    redirect("/auth");
  }

  const routine = await getRoutineDetail(supabase, data.user.id, routineId);

  if (!routine) {
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
            Routine Detail
          </p>
          <h1 style={{ color: "white", fontSize: 40, lineHeight: 1, margin: "12px 0", letterSpacing: -3 }}>
            {routine.name}
          </h1>
          <p style={{ color: "var(--muted)", lineHeight: 1.6, margin: 0 }}>
            Updated {formatDate(routine.updated_at)}
          </p>
        </section>

        <section className="card" style={{ display: "grid", gap: 12 }}>
          <h2 style={{ color: "white", margin: 0 }}>Summary</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 8 }}>
            <MetricBadge label="Exercises" value={`${routine.exerciseCount}`} />
            <MetricBadge label="Target sets" value={`${routine.totalTargetSets}`} />
          </div>
        </section>

        <section className="card" style={{ display: "grid", gap: 14 }}>
          <h2 style={{ color: "white", margin: 0 }}>Exercises</h2>
          {routine.exercises.length === 0 ? <p style={{ color: "var(--muted)", margin: 0 }}>No exercises found for this routine.</p> : routine.exercises.map(exercise => (
            <article key={exercise.id} style={{ border: "1px solid rgba(255,255,255,0.1)", borderRadius: 18, padding: 14, display: "grid", gap: 12 }}>
              <div>
                <h3 style={{ color: "white", margin: 0, fontSize: 18 }}>{exercise.nameTr}</h3>
                <p style={{ color: "var(--muted)", margin: "4px 0 0", fontSize: 13 }}>{exercise.muscleGroupTr}</p>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
                <MetricBadge label="Sets" value={`${exercise.targetSets}`} />
                <MetricBadge label="Reps" value={exercise.targetReps} />
                <MetricBadge label="Rest" value={`${exercise.restSeconds}s`} />
              </div>
              {exercise.notes ? <p style={{ color: "var(--muted)", margin: 0, fontSize: 13, lineHeight: 1.5 }}>{exercise.notes}</p> : null}
            </article>
          ))}
        </section>
      </main>
    </ProductShell>
  );
}

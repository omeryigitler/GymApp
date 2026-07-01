import Link from "next/link";
import { redirect } from "next/navigation";
import { listExercises } from "@/entities/exercise/api/list-exercises";
import { createSupabaseServerClient } from "@/shared/lib/supabase/server-client";
import { ProductShell } from "@/widgets/product-shell/ui/product-shell";
import { createQuickRoutineAction } from "./actions";

export default async function NewRoutinePage() {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    redirect("/auth");
  }

  const exercises = await listExercises(supabase);

  return (
    <ProductShell>
      <main style={{ padding: 24, display: "grid", gap: 16 }}>
        <section>
          <Link href="/dashboard" style={{ color: "var(--muted)", fontSize: 14, fontWeight: 800 }}>Back to dashboard</Link>
          <p style={{ color: "var(--lime)", fontWeight: 900, letterSpacing: 2, fontSize: 12, textTransform: "uppercase", marginTop: 18 }}>Quick Routine</p>
          <h1 style={{ color: "white", fontSize: 40, lineHeight: 1, margin: "12px 0", letterSpacing: -3 }}>Create a real routine.</h1>
          <p style={{ color: "var(--muted)", lineHeight: 1.6 }}>This form writes one routine and one routine exercise to Supabase.</p>
        </section>

        <form action={createQuickRoutineAction} className="card" style={{ display: "grid", gap: 14 }}>
          <label style={labelStyle}>Routine name<input name="name" required defaultValue="Starter routine" style={inputStyle} /></label>
          <label style={labelStyle}>Exercise<select name="exerciseId" required style={inputStyle} defaultValue=""><option value="" disabled>Select exercise</option>{exercises.map(exercise => <option key={exercise.id} value={exercise.id}>{exercise.muscle_group_tr} - {exercise.name_tr}</option>)}</select></label>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <label style={labelStyle}>Sets<input name="targetSets" type="number" min="1" step="1" required defaultValue="3" style={inputStyle} /></label>
            <label style={labelStyle}>Reps<input name="targetReps" required defaultValue="8-12" style={inputStyle} /></label>
          </div>
          <label style={labelStyle}>Rest seconds<input name="restSeconds" type="number" min="0" step="15" required defaultValue="90" style={inputStyle} /></label>
          <label style={labelStyle}>Notes<textarea name="notes" rows={3} placeholder="Optional notes" style={{ ...inputStyle, resize: "vertical" }} /></label>
          <button type="submit" style={{ border: 0, borderRadius: 999, background: "var(--lime)", color: "#131313", fontWeight: 900, padding: "14px 18px", cursor: "pointer" }}>Save routine</button>
        </form>
      </main>
    </ProductShell>
  );
}

const labelStyle = { display: "grid", gap: 8, color: "var(--muted)", fontSize: 13, fontWeight: 800 } as const;

const inputStyle = {
  width: "100%",
  border: "1px solid rgba(255,255,255,0.12)",
  borderRadius: 16,
  background: "#201f1f",
  color: "white",
  padding: "14px 16px",
  outline: "none"
} as const;

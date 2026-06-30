import Link from "next/link";
import { redirect } from "next/navigation";
import { listExercises } from "@/entities/exercise/api/list-exercises";
import { createSupabaseServerClient } from "@/shared/lib/supabase/server-client";
import { ProductShell } from "@/widgets/product-shell/ui/product-shell";
import { createQuickWorkoutAction } from "./actions";

export default async function NewWorkoutPage() {
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
          <Link href="/dashboard" style={{ color: "var(--muted)", fontSize: 14, fontWeight: 800 }}>
            Back to dashboard
          </Link>
          <p style={{ color: "var(--lime)", fontWeight: 900, letterSpacing: 2, fontSize: 12, textTransform: "uppercase", marginTop: 18 }}>
            Workout Builder
          </p>
          <h1 style={{ color: "white", fontSize: 40, lineHeight: 1, margin: "12px 0", letterSpacing: -3 }}>
            Save multiple sets.
          </h1>
          <p style={{ color: "var(--muted)", lineHeight: 1.6 }}>
            This writes one workout, one exercise and up to three completed sets to Supabase.
          </p>
        </section>

        <form action={createQuickWorkoutAction} className="card" style={{ display: "grid", gap: 14 }}>
          <label style={labelStyle}>
            Workout name
            <input name="name" required defaultValue="Today Workout" style={inputStyle} />
          </label>

          <label style={labelStyle}>
            Exercise
            <select name="exerciseId" required style={inputStyle} defaultValue="">
              <option value="" disabled>
                Select exercise
              </option>
              {exercises.map(exercise => (
                <option key={exercise.id} value={exercise.id}>
                  {exercise.muscle_group_tr} - {exercise.name_tr}
                </option>
              ))}
            </select>
          </label>

          <label style={labelStyle}>
            Rest seconds
            <input name="restSeconds" type="number" min="0" max="600" step="15" required defaultValue="90" style={inputStyle} />
          </label>

          <div style={{ display: "grid", gap: 10 }}>
            <p style={{ color: "white", fontWeight: 900, margin: 0 }}>Sets</p>
            {[1, 2, 3].map(position => (
              <fieldset key={position} style={{ border: "1px solid rgba(255,255,255,0.1)", borderRadius: 18, padding: 12 }}>
                <legend style={{ color: "var(--muted)", fontWeight: 900, padding: "0 6px" }}>Set {position}</legend>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
                  <label style={labelStyle}>
                    Kg
                    <input name={`set${position}WeightKg`} type="number" min="0" step="0.5" placeholder="60" style={inputStyle} />
                  </label>
                  <label style={labelStyle}>
                    Reps
                    <input name={`set${position}Reps`} type="number" min="1" step="1" required={position === 1} defaultValue={position === 1 ? "10" : undefined} placeholder="10" style={inputStyle} />
                  </label>
                  <label style={labelStyle}>
                    RPE
                    <input name={`set${position}Rpe`} type="number" min="1" max="10" step="0.5" placeholder="8" style={inputStyle} />
                  </label>
                </div>
              </fieldset>
            ))}
          </div>

          <label style={labelStyle}>
            Notes
            <textarea name="notes" rows={3} placeholder="Optional notes" style={{ ...inputStyle, resize: "vertical" }} />
          </label>

          <button type="submit" style={{ border: 0, borderRadius: 999, background: "var(--lime)", color: "#131313", fontWeight: 900, padding: "14px 18px", cursor: "pointer" }}>
            Save workout
          </button>
        </form>
      </main>
    </ProductShell>
  );
}

const labelStyle = {
  display: "grid",
  gap: 8,
  color: "var(--muted)",
  fontSize: 13,
  fontWeight: 800
} as const;

const inputStyle = {
  width: "100%",
  border: "1px solid rgba(255,255,255,0.12)",
  borderRadius: 16,
  background: "#201f1f",
  color: "white",
  padding: "14px 16px",
  outline: "none"
} as const;

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
            ← Dashboard
          </Link>
          <p style={{ color: "var(--lime)", fontWeight: 900, letterSpacing: 2, fontSize: 12, textTransform: "uppercase", marginTop: 18 }}>
            Quick Workout
          </p>
          <h1 style={{ color: "white", fontSize: 40, lineHeight: 1, margin: "12px 0", letterSpacing: -3 }}>
            İlk gerçek antrenman kaydını oluştur.
          </h1>
          <p style={{ color: "var(--muted)", lineHeight: 1.6 }}>
            Bu form Supabase'e gerçek workout, workout exercise ve workout set kaydı yazar.
          </p>
        </section>

        <form action={createQuickWorkoutAction} className="card" style={{ display: "grid", gap: 14 }}>
          <label style={{ display: "grid", gap: 8, color: "var(--muted)", fontSize: 13, fontWeight: 800 }}>
            Antrenman adı
            <input name="name" required defaultValue="Bugünkü Antrenman" style={inputStyle} />
          </label>

          <label style={{ display: "grid", gap: 8, color: "var(--muted)", fontSize: 13, fontWeight: 800 }}>
            Egzersiz
            <select name="exerciseId" required style={inputStyle} defaultValue="">
              <option value="" disabled>
                Egzersiz seç
              </option>
              {exercises.map(exercise => (
                <option key={exercise.id} value={exercise.id}>
                  {exercise.muscle_group_tr} — {exercise.name_tr}
                </option>
              ))}
            </select>
          </label>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <label style={{ display: "grid", gap: 8, color: "var(--muted)", fontSize: 13, fontWeight: 800 }}>
              Kilo
              <input name="weightKg" type="number" min="0" step="0.5" placeholder="60" style={inputStyle} />
            </label>
            <label style={{ display: "grid", gap: 8, color: "var(--muted)", fontSize: 13, fontWeight: 800 }}>
              Tekrar
              <input name="reps" type="number" min="1" step="1" required defaultValue="10" style={inputStyle} />
            </label>
          </div>

          <label style={{ display: "grid", gap: 8, color: "var(--muted)", fontSize: 13, fontWeight: 800 }}>
            RPE (opsiyonel)
            <input name="rpe" type="number" min="1" max="10" step="0.5" placeholder="8" style={inputStyle} />
          </label>

          <label style={{ display: "grid", gap: 8, color: "var(--muted)", fontSize: 13, fontWeight: 800 }}>
            Not
            <textarea name="notes" rows={3} placeholder="Bugün iyi hissettim..." style={{ ...inputStyle, resize: "vertical" }} />
          </label>

          <button type="submit" style={{ border: 0, borderRadius: 999, background: "var(--lime)", color: "#131313", fontWeight: 900, padding: "14px 18px", cursor: "pointer" }}>
            Antrenmanı kaydet
          </button>
        </form>
      </main>
    </ProductShell>
  );
}

const inputStyle = {
  width: "100%",
  border: "1px solid rgba(255,255,255,0.12)",
  borderRadius: 16,
  background: "#201f1f",
  color: "white",
  padding: "14px 16px",
  outline: "none"
} as const;

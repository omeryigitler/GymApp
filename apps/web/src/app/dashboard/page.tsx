import { redirect } from "next/navigation";
import { listRoutines } from "@/entities/routine/api/list-routines";
import { getCurrentProfile } from "@/entities/user/api/get-current-profile";
import { listRecentWorkouts } from "@/entities/workout/api/list-recent-workouts";
import { createSupabaseServerClient } from "@/shared/lib/supabase/server-client";
import { ProductShell } from "@/widgets/product-shell/ui/product-shell";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("tr-TR", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  }).format(new Date(value));
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
              <p style={{ color: "var(--lime)", fontWeight: 900, letterSpacing: 2, fontSize: 12, textTransform: "uppercase" }}>
                Protected Dashboard
              </p>
              <h1 style={{ color: "white", fontSize: 40, lineHeight: 1, margin: "12px 0", letterSpacing: -3 }}>
                Hoş geldin, {profile.display_name}.
              </h1>
            </div>
            <form method="post" action="/auth/logout">
              <button
                type="submit"
                style={{
                  border: "1px solid rgba(255,255,255,0.12)",
                  borderRadius: 999,
                  background: "transparent",
                  color: "white",
                  fontWeight: 800,
                  padding: "10px 14px",
                  cursor: "pointer"
                }}
              >
                Çıkış
              </button>
            </form>
          </div>
          <p style={{ color: "var(--muted)", lineHeight: 1.6 }}>
            Bu ekran Supabase session, RLS korumalı profil ve gerçek kullanıcı tabloları üzerinden çalışıyor.
          </p>
        </section>

        <section className="card">
          <h2 style={{ color: "white", marginTop: 0 }}>Account state</h2>
          <dl style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, margin: 0 }}>
            <div>
              <dt style={{ color: "var(--muted)", fontSize: 12, textTransform: "uppercase", fontWeight: 800 }}>Plan</dt>
              <dd style={{ color: "white", margin: "4px 0 0" }}>{profile.subscription_tier}</dd>
            </div>
            <div>
              <dt style={{ color: "var(--muted)", fontSize: 12, textTransform: "uppercase", fontWeight: 800 }}>Language</dt>
              <dd style={{ color: "white", margin: "4px 0 0" }}>{profile.preferred_language}</dd>
            </div>
          </dl>
        </section>

        <section className="card">
          <h2 style={{ color: "white", marginTop: 0 }}>Son antrenmanlar</h2>
          {workouts.length === 0 ? (
            <EmptyState title="Henüz antrenman yok" description="İlk gerçek workout save akışı eklendiğinde burada kullanıcının son antrenmanları görünecek." />
          ) : (
            <div style={{ display: "grid", gap: 10 }}>
              {workouts.map(workout => (
                <article key={workout.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.08)", paddingBottom: 10 }}>
                  <h3 style={{ color: "white", margin: 0, fontSize: 16 }}>{workout.name}</h3>
                  <p style={{ color: "var(--muted)", margin: "4px 0 0", fontSize: 13 }}>{formatDate(workout.started_at)}</p>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="card">
          <h2 style={{ color: "white", marginTop: 0 }}>Rutinler</h2>
          {routines.length === 0 ? (
            <EmptyState title="Henüz rutin yok" description="Rutin oluşturma akışı taşındığında burada kullanıcının kayıtlı rutinleri listelenecek." />
          ) : (
            <div style={{ display: "grid", gap: 10 }}>
              {routines.map(routine => (
                <article key={routine.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.08)", paddingBottom: 10 }}>
                  <h3 style={{ color: "white", margin: 0, fontSize: 16 }}>{routine.name}</h3>
                  <p style={{ color: "var(--muted)", margin: "4px 0 0", fontSize: 13 }}>Güncellendi: {formatDate(routine.updated_at)}</p>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>
    </ProductShell>
  );
}

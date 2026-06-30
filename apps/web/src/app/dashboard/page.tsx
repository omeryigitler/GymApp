import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/entities/user/api/get-current-profile";
import { createSupabaseServerClient } from "@/shared/lib/supabase/server-client";
import { ProductShell } from "@/widgets/product-shell/ui/product-shell";

export default async function DashboardRoute() {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    redirect("/auth");
  }

  const profile = await getCurrentProfile(supabase, data.user.id);

  return (
    <ProductShell>
      <main style={{ padding: 24, display: "grid", gap: 16 }}>
        <section>
          <p style={{ color: "var(--lime)", fontWeight: 900, letterSpacing: 2, fontSize: 12, textTransform: "uppercase" }}>
            Protected Dashboard
          </p>
          <h1 style={{ color: "white", fontSize: 40, lineHeight: 1, margin: "12px 0", letterSpacing: -3 }}>
            Hoş geldin, {profile.display_name}.
          </h1>
          <p style={{ color: "var(--muted)", lineHeight: 1.6 }}>
            Bu ekran artık Supabase session ve RLS korumalı profile verisi üzerinden çalışıyor.
          </p>
        </section>

        <section className="card">
          <h2 style={{ color: "white", marginTop: 0 }}>Account state</h2>
          <dl style={{ display: "grid", gap: 12, margin: 0 }}>
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
      </main>
    </ProductShell>
  );
}

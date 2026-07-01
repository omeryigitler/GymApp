import { EmailAuthCard } from "@/features/auth/ui/email-auth-card";
import { ProductShell } from "@/widgets/product-shell/ui/product-shell";

export default function AuthPage() {
  return (
    <ProductShell>
      <main style={{ padding: 24, display: "grid", gap: 20 }}>
        <section>
          <p style={{ color: "var(--lime)", fontWeight: 900, letterSpacing: 2, fontSize: 12, textTransform: "uppercase" }}>
            GymApp Account
          </p>
          <h1 style={{ color: "white", fontSize: 40, lineHeight: 1, margin: "12px 0", letterSpacing: -3 }}>
            Giriş yap ve verini senkronize et.
          </h1>
          <p style={{ color: "var(--muted)", lineHeight: 1.6 }}>
            Bu ekran v2'nin gerçek Supabase auth akışına geçiş başlangıcıdır.
          </p>
        </section>
        <EmailAuthCard />
      </main>
    </ProductShell>
  );
}

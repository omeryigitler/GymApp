import { ProductShell } from "@/widgets/product-shell/ui/product-shell";

export default function AuthCallbackPage() {
  return (
    <ProductShell>
      <main style={{ padding: 24 }}>
        <section className="card">
          <p style={{ color: "var(--lime)", fontWeight: 900, letterSpacing: 2, fontSize: 12, textTransform: "uppercase" }}>
            Auth Callback
          </p>
          <h1 style={{ color: "white", fontSize: 32, lineHeight: 1.1, margin: "12px 0", letterSpacing: -2 }}>
            Giriş işlemi yönlendiriliyor.
          </h1>
          <p style={{ color: "var(--muted)", lineHeight: 1.6 }}>
            Bu path normalde route handler tarafından işlenir ve başarılı girişten sonra dashboard ekranına yönlendirilir.
          </p>
        </section>
      </main>
    </ProductShell>
  );
}

import { Activity, Dumbbell, ShieldCheck, Zap } from "lucide-react";

const foundationCards = [
  {
    title: "Clean product foundation",
    description: "UI, business logic, server state and client state are separated from day one.",
    icon: ShieldCheck
  },
  {
    title: "Supabase ready",
    description: "Auth, Postgres and RLS will replace localStorage as the source of truth.",
    icon: Dumbbell
  },
  {
    title: "Fast data layer",
    description: "TanStack Query owns server data; lightweight client state stays isolated.",
    icon: Zap
  }
];

export function DashboardPage() {
  return (
    <main style={{ padding: 24 }}>
      <section style={{ marginBottom: 28 }}>
        <p style={{ color: "var(--lime)", fontWeight: 900, letterSpacing: 2, fontSize: 12, textTransform: "uppercase" }}>
          GymApp v2 Foundation
        </p>
        <h1 style={{ color: "white", fontSize: 44, lineHeight: 1, margin: "12px 0", letterSpacing: -3 }}>
          Build the product, not just the prototype.
        </h1>
        <p style={{ color: "var(--muted)", fontSize: 16, lineHeight: 1.6 }}>
          This branch keeps the original Vite MVP as a reference and starts a scalable Next.js architecture for the real product.
        </p>
      </section>

      <section className="card" style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 48, height: 48, borderRadius: 16, display: "grid", placeItems: "center", color: "#131313", background: "var(--lime)" }}>
            <Activity size={24} />
          </div>
          <div>
            <h2 style={{ margin: 0, color: "white", fontSize: 22 }}>Migration strategy</h2>
            <p style={{ margin: "6px 0 0", color: "var(--muted)", fontSize: 14 }}>Prototype UI first, production architecture underneath.</p>
          </div>
        </div>
      </section>

      <section style={{ display: "grid", gap: 12 }}>
        {foundationCards.map(card => {
          const Icon = card.icon;
          return (
            <article className="card" key={card.title}>
              <Icon size={22} color="var(--lime)" />
              <h3 style={{ color: "white", margin: "14px 0 6px", fontSize: 18 }}>{card.title}</h3>
              <p style={{ color: "var(--muted)", margin: 0, lineHeight: 1.5, fontSize: 14 }}>{card.description}</p>
            </article>
          );
        })}
      </section>
    </main>
  );
}

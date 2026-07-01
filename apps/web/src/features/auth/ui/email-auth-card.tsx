"use client";

import { useState } from "react";
import { requestEmailLink } from "../api/request-email-link";

export function EmailAuthCard() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "sent" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    setMessage("");

    try {
      await requestEmailLink({ email });
      setStatus("sent");
      setMessage("Giriş bağlantısı e-posta adresine gönderildi.");
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Giriş bağlantısı gönderilemedi.");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card" style={{ display: "grid", gap: 14 }}>
      <div>
        <h2 style={{ color: "white", margin: 0, fontSize: 22 }}>Gerçek giriş akışı</h2>
        <p style={{ color: "var(--muted)", margin: "8px 0 0", lineHeight: 1.5 }}>
          Supabase magic link ile passwordless authentication başlangıcı.
        </p>
      </div>

      <label style={{ display: "grid", gap: 8, color: "var(--muted)", fontSize: 13, fontWeight: 700 }}>
        E-posta
        <input
          type="email"
          value={email}
          onChange={event => setEmail(event.target.value)}
          placeholder="omer@example.com"
          required
          style={{
            width: "100%",
            border: "1px solid rgba(255,255,255,0.12)",
            borderRadius: 16,
            background: "#201f1f",
            color: "white",
            padding: "14px 16px",
            outline: "none"
          }}
        />
      </label>

      <button
        type="submit"
        disabled={status === "loading"}
        style={{
          border: 0,
          borderRadius: 999,
          background: "var(--lime)",
          color: "#131313",
          fontWeight: 900,
          padding: "14px 18px",
          cursor: status === "loading" ? "not-allowed" : "pointer"
        }}
      >
        {status === "loading" ? "Gönderiliyor..." : "Giriş bağlantısı gönder"}
      </button>

      {message && (
        <p style={{ margin: 0, color: status === "error" ? "var(--orange)" : "var(--lime)", fontSize: 13, lineHeight: 1.5 }}>
          {message}
        </p>
      )}
    </form>
  );
}

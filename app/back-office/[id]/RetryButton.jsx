"use client";
import { useState } from "react";

export default function RetryButton({ convId, fromStart, label }) {
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  async function go() {
    setBusy(true);
    setMsg("");
    try {
      const res = await fetch("/api/back-office/retry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ convId, fromStart }),
      });
      const j = await res.json().catch(() => ({}));
      setMsg(res.ok ? `Lanzado (etapa ${j.stage}). Recarga en unos minutos.` : j.error || "Error");
    } catch (e) {
      setMsg(String(e?.message || e));
    } finally {
      setBusy(false);
    }
  }
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
      <button className="bo-btn" onClick={go} disabled={busy}>{busy ? "…" : label}</button>
      {msg && <span className="bo-muted" style={{ fontSize: 12 }}>{msg}</span>}
    </span>
  );
}

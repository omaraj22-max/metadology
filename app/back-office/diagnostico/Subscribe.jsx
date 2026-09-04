"use client";
import { useState } from "react";

export default function Subscribe() {
  const [state, setState] = useState(null);
  const [busy, setBusy] = useState(false);
  async function go() {
    setBusy(true);
    setState(null);
    try {
      const r = await fetch("/api/back-office/subscribe", { method: "POST" });
      const j = await r.json();
      setState(j.ok ? { ok: j.message } : { err: j.error });
    } catch (e) {
      setState({ err: String(e?.message || e) });
    } finally {
      setBusy(false);
    }
  }
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
      <button className="bo-btn" onClick={go} disabled={busy}>{busy ? "Suscribiendo…" : "Suscribir la cuenta a esta app"}</button>
      {state?.ok && <span className="bo-test-msg ok">✓ {state.ok} — recarga la página</span>}
      {state?.err && <span className="bo-test-msg err">✕ {state.err}</span>}
    </span>
  );
}

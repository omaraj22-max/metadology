"use client";
import { useState } from "react";

export default function Simulator() {
  const [phone, setPhone] = useState("");
  const [text, setText] = useState("hola");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null);

  async function run() {
    setBusy(true);
    setMsg(null);
    try {
      const r = await fetch("/api/back-office/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, text, name: "Prueba" }),
      });
      const j = await r.json();
      setMsg(r.ok
        ? { ok: true, t: "Mensaje inyectado. Revisa el Inbox y tu WhatsApp: Aria debió contestarte." }
        : { ok: false, t: j.error || "Error" });
    } catch (e) {
      setMsg({ ok: false, t: String(e?.message || e) });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="bo-card" style={{ marginBottom: 20 }}>
      <h2>Simular un mensaje entrante</h2>
      <p className="bo-muted" style={{ fontSize: 13, marginTop: -4, marginBottom: 12 }}>
        Mete un mensaje al sistema saltándose a Meta. <b>Pon tu propio número de WhatsApp</b> (con código de país,
        solo dígitos, ej. <code>5213311234567</code>): si Aria te contesta en tu teléfono, el envío funciona y lo
        único roto es la entrega de Meta hacia este servidor.
      </p>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
        <input className="bo-in" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="5213311234567" style={{ width: 190 }} />
        <input className="bo-in" value={text} onChange={(e) => setText(e.target.value)} placeholder="hola" style={{ flex: 1, minWidth: 160 }} />
        <button className="bo-btn primary" onClick={run} disabled={busy || !phone}>{busy ? "Enviando…" : "Simular"}</button>
      </div>
      {msg && <div style={{ marginTop: 10, fontSize: 13, color: msg.ok ? "#15803D" : "#B91C1C" }}>{msg.ok ? "✓ " : "✕ "}{msg.t}</div>}
    </div>
  );
}

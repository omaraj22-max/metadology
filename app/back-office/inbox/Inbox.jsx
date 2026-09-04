"use client";
import { useEffect, useRef, useState, useCallback } from "react";

const H24 = 24 * 60 * 60 * 1000;
const ROLE = { user: "Usuario", aria: "Aria", human: "Equipo" };

function fmt(ts) {
  if (!ts) return "";
  const d = new Date(ts);
  const today = new Date().toDateString() === d.toDateString();
  return d.toLocaleString("es-MX", today ? { hour: "2-digit", minute: "2-digit" } : { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
}

function linkify(text) {
  const parts = String(text).split(/(https?:\/\/[^\s]+)/g);
  return parts.map((p, i) => (/^https?:\/\//.test(p) ? <a key={i} href={p} target="_blank" rel="noreferrer">{p}</a> : p));
}

export default function Inbox({ initialId }) {
  const [list, setList] = useState([]);
  const [openId, setOpenId] = useState(initialId || "");
  const [conv, setConv] = useState(null);
  const [result, setResult] = useState(null);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [err, setErr] = useState("");
  const [filter, setFilter] = useState("");
  const bodyRef = useRef(null);

  const loadList = useCallback(async () => {
    try {
      const r = await fetch("/api/back-office/conversations", { cache: "no-store" });
      const j = await r.json();
      setList(j.conversations || []);
    } catch {}
  }, []);

  const loadConv = useCallback(async (id, markRead) => {
    if (!id) return;
    try {
      const r = await fetch(`/api/back-office/conversations/${id}`, { cache: "no-store" });
      if (!r.ok) return;
      const j = await r.json();
      setConv(j.conversation);
      setResult(j.result);
      if (markRead && j.conversation?.unread) {
        await fetch(`/api/back-office/conversations/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ read: true }) });
        loadList();
      }
    } catch {}
  }, [loadList]);

  useEffect(() => { loadList(); const t = setInterval(loadList, 5000); return () => clearInterval(t); }, [loadList]);
  useEffect(() => {
    if (!openId) { setConv(null); return; }
    loadConv(openId, true);
    const t = setInterval(() => loadConv(openId, true), 4000);
    return () => clearInterval(t);
  }, [openId, loadConv]);
  useEffect(() => { if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight; }, [conv?.transcript?.length, openId]);

  async function send() {
    const t = text.trim();
    if (!t || !conv) return;
    setSending(true);
    setErr("");
    try {
      const r = await fetch("/api/back-office/send", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ convId: conv.id, text: t }) });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || "no se pudo enviar");
      setConv(j.conversation);
      setText("");
      loadList();
    } catch (e) {
      setErr(String(e?.message || e));
    } finally {
      setSending(false);
    }
  }

  async function toggleHuman() {
    if (!conv) return;
    const r = await fetch(`/api/back-office/conversations/${conv.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ humanMode: !conv.humanMode }) });
    if (r.ok) { loadConv(conv.id); loadList(); }
  }

  const shown = list.filter((c) => !filter || `${c.name} ${c.phone} ${c.producto}`.toLowerCase().includes(filter.toLowerCase()));
  const lastUserAt = conv ? [...(conv.transcript || [])].reverse().find((m) => m.role === "user")?.at : null;
  const windowClosed = lastUserAt ? Date.now() - lastUserAt > H24 : true;

  return (
    <div className={`bo-inbox ${openId ? "has-open" : ""}`}>
      <div className="bo-inbox-list">
        <div className="head">
          <span>{list.length} conversaciones · {list.reduce((n, c) => n + (c.unread || 0), 0)} sin leer</span>
          <input value={filter} onChange={(e) => setFilter(e.target.value)} placeholder="Buscar" style={{ border: "1px solid #E2E8F0", borderRadius: 8, padding: "4px 8px", fontSize: 12, width: 110, fontFamily: "inherit" }} />
        </div>
        {shown.length === 0 && <div className="bo-empty">Sin conversaciones todavía.</div>}
        {shown.map((c) => (
          <button key={c.id} className={`bo-conv ${c.id === openId ? "on" : ""}`} onClick={() => setOpenId(c.id)}>
            <span className="n">{c.name || "(sin nombre)"} <span className="bo-muted" style={{ fontWeight: 400 }}>+{c.phone}</span></span>
            <span className="t">{fmt(c.last?.at || c.updatedAt)}</span>
            <span className="p">{c.last ? <><b>{ROLE[c.last.role] || c.last.role}:</b> {c.last.text}</> : "—"}</span>
            <span className="tags">
              <span className={`bo-tag ${c.status}`}>{c.status}</span>
              {c.humanMode && <span className="bo-tag" style={{ background: "#DCFCE7", color: "#15803D" }}>equipo</span>}
              {c.unread > 0 && <span className="bo-unread">{c.unread}</span>}
            </span>
          </button>
        ))}
      </div>

      <div className="bo-chat-pane">
        {!conv ? (
          <div className="bo-empty">Elige una conversación para verla y contestar.</div>
        ) : (
          <>
            <div className="bo-chat-head">
              <div>
                <h2>{conv.name || "(sin nombre)"} · +{conv.phone}</h2>
                <div className="sub">
                  <span className={`bo-tag ${conv.status}`}>{conv.status}</span>
                  {conv.stage && conv.status === "generating" ? ` · etapa ${conv.stage}` : ""}
                  {conv.fields?.producto ? ` · ${conv.fields.producto.slice(0, 60)}` : ""}
                  {result?.brand?.marca ? ` · ${result.brand.marca}` : ""}
                </div>
              </div>
              <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                <span className={`bo-switch ${conv.humanMode ? "on" : ""}`} onClick={toggleHuman} role="switch" aria-checked={!!conv.humanMode}>
                  <i /> {conv.humanMode ? "Tomaste el control (Aria en pausa)" : "Aria contesta"}
                </span>
                <a className="bo-btn" href={`/back-office/${conv.id}`} style={{ textDecoration: "none" }}>Detalle</a>
                {conv.resultId && <a className="bo-btn" href={`/r/${conv.resultId}`} target="_blank" rel="noreferrer" style={{ textDecoration: "none" }}>Resultado ↗</a>}
                <button className="bo-btn" onClick={() => setOpenId("")} style={{ display: "none" }} id="bo-back">←</button>
              </div>
            </div>
            <div className="bo-chat-body" ref={bodyRef}>
              {(conv.transcript || []).map((m, i) => (
                <div key={i} className={`bo-msg ${m.role}`}>{linkify(m.text)}<small>{ROLE[m.role] || m.role} · {fmt(m.at)}</small></div>
              ))}
            </div>
            {windowClosed && (
              <div className="bo-note">Han pasado más de 24 h desde el último mensaje del lead: WhatsApp solo permite responder con una plantilla aprobada. El envío libre puede fallar.</div>
            )}
            {err && <div className="bo-note" style={{ color: "#B91C1C", background: "#FEF2F2", borderColor: "#FECACA" }}>{err}</div>}
            <div className="bo-compose">
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder={`Escribir a ${conv.name || "+" + conv.phone}… (Enter envía, Shift+Enter salto de línea)`}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
                rows={2}
              />
              <button className="bo-btn primary" onClick={send} disabled={sending || !text.trim()}>{sending ? "Enviando…" : "Enviar"}</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

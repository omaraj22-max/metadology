"use client";
import { useEffect, useState } from "react";

const TEST = { whatsapp: "whatsapp", ia: null, sheet: "sheet" };
const SRC = { store: "guardado aquí", env: "variable de Vercel", default: "valor por defecto", none: "sin configurar" };

export default function SettingsForm({ initialGroups }) {
  const [groups, setGroups] = useState(initialGroups);
  const [values, setValues] = useState({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState("");
  const [tests, setTests] = useState({});
  const [origin, setOrigin] = useState("");
  useEffect(() => { setOrigin(window.location.origin); }, []); // evita desajuste de hidratación

  const set = (k) => (e) => setValues((v) => ({ ...v, [k]: e.target.value }));

  async function save() {
    setSaving(true);
    setSaved("");
    try {
      const res = await fetch("/api/back-office/settings", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(values) });
      const j = await res.json();
      if (!res.ok || !j.ok) throw new Error(j.error || "error");
      setGroups(j.groups);
      setValues({});
      setSaved("Guardado ✓");
    } catch (e) {
      setSaved("Error: " + (e?.message || e));
    } finally {
      setSaving(false);
    }
  }

  async function runTest(service) {
    setTests((t) => ({ ...t, [service]: { busy: true } }));
    try {
      const res = await fetch(`/api/back-office/test/${service}`, { method: "POST" });
      const j = await res.json();
      setTests((t) => ({ ...t, [service]: j.ok ? { ok: j.message } : { err: j.error } }));
    } catch (e) {
      setTests((t) => ({ ...t, [service]: { err: String(e?.message || e) } }));
    }
  }

  const dirty = Object.keys(values).length > 0;

  return (
    <div className="bo-settings">
      {groups.map((g) => (
        <div className="bo-card" key={g.id}>
          <h2>
            <span>{g.title}</span>
            <span style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
              {g.id === "ia" ? (
                <>
                  <TestBtn label="Probar Claude" state={tests.claude} onClick={() => runTest("claude")} />
                  <TestBtn label="Probar OpenAI" state={tests.openai} onClick={() => runTest("openai")} />
                </>
              ) : TEST[g.id] ? (
                <TestBtn label={g.id === "whatsapp" ? "Probar WhatsApp" : "Probar Sheet"} state={tests[TEST[g.id]]} onClick={() => runTest(TEST[g.id])} />
              ) : null}
            </span>
          </h2>
          {g.fields.map((f) => (
            <div className="bo-field" key={f.key}>
              <label htmlFor={f.key}>{f.label}{f.hint && <small>{f.hint}</small>}</label>
              <div>
                <input
                  id={f.key}
                  type={f.secret ? "password" : "text"}
                  autoComplete="off"
                  placeholder={f.secret ? (f.set ? `Guardada (${f.display}) — escribe para reemplazar` : "Pegar aquí") : f.placeholder || ""}
                  value={values[f.key] ?? f.value ?? ""}
                  onChange={set(f.key)}
                />
                <div className="meta">
                  <span className={`bo-src ${f.source}`}>{SRC[f.source]}</span>
                  {!f.secret && f.source !== "store" && f.display ? <span>actual: {f.display}</span> : null}
                  {f.key === "SPREADSHEET_URL" && f.display ? <a href={f.display} target="_blank" rel="noreferrer" style={{ color: "#5A3AFF" }}>Abrir el Sheet ↗</a> : null}
                  {f.key === "META_WEBHOOK_VERIFY_TOKEN" && origin ? <span>Webhook: {origin}/api/whatsapp/webhook</span> : null}
                  {f.secret && f.source === "store" ? <button type="button" className="bo-btn" style={{ padding: "2px 8px", fontSize: 11 }} onClick={() => setValues((v) => ({ ...v, [f.key]: "__clear__" }))}>Borrar</button> : null}
                </div>
              </div>
            </div>
          ))}
        </div>
      ))}
      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <button className="bo-btn primary" onClick={save} disabled={saving || !dirty}>{saving ? "Guardando…" : "Guardar cambios"}</button>
        {saved && <span className="bo-muted" style={{ fontSize: 13 }}>{saved}</span>}
      </div>
    </div>
  );
}

function TestBtn({ label, state, onClick }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center" }}>
      <button type="button" className="bo-btn bo-test" onClick={onClick} disabled={state?.busy}>{state?.busy ? "Probando…" : label}</button>
      {state?.ok && <span className="bo-test-msg ok">✓ {state.ok}</span>}
      {state?.err && <span className="bo-test-msg err">✕ {state.err}</span>}
    </span>
  );
}

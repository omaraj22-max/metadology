"use client";

import React, { useState, useEffect } from "react";

// =================== CONFIG ===================
// Se leen de variables de entorno públicas (NEXT_PUBLIC_*). Ver .env.example.
const WEBHOOK_URL = process.env.NEXT_PUBLIC_WEBHOOK_URL || "";
const DEMO_URL = process.env.NEXT_PUBLIC_DEMO_URL || "";

const C = {
  bg: "#0A0E14",
  panel: "#11161F",
  border: "#1E2733",
  accent: "#22D3A6",
  accent2: "#0EA5E9",
  text: "#E8EDF2",
  dim: "#7E8A9A",
};

export default function CaperifLeadMagnet() {
  const [step, setStep] = useState("form"); // form | result
  const [form, setForm] = useState({
    nombre: "", correo: "", telefono: "", empresa: "",
    producto: "", link: "", problema: "",
  });
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const valid =
    form.nombre && /\S+@\S+\.\S+/.test(form.correo) && form.telefono &&
    form.empresa && form.producto && form.problema;

  const submit = async () => {
    if (!valid) { setError("Completa todos los campos obligatorios."); return; }
    setError(""); setSending(true);
    try {
      if (WEBHOOK_URL) {
        await fetch(WEBHOOK_URL, {
          method: "POST",
          mode: "no-cors",
          headers: { "Content-Type": "text/plain;charset=utf-8" },
          body: JSON.stringify({ ...form, fecha: new Date().toISOString() }),
        });
      }
      setStep("result");
    } catch (e) {
      setStep("result");
    } finally {
      setSending(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh", background: C.bg, color: C.text,
      fontFamily: "'Outfit', system-ui, sans-serif",
      display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
    }}>
      {step === "form" ? (
        <FormPanel form={form} set={set} submit={submit} sending={sending} error={error} />
      ) : (
        <ResultPanel form={form} />
      )}
    </div>
  );
}

// =================== FORM ===================
function FormPanel({ form, set, submit, sending, error }) {
  return (
    <div style={{
      width: "100%", maxWidth: 520, background: C.panel,
      border: `1px solid ${C.border}`, borderRadius: 18, padding: 32,
      animation: "pop .4s ease",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
        <span style={{ width: 9, height: 9, borderRadius: "50%", background: C.accent, boxShadow: `0 0 12px ${C.accent}` }} />
        <span style={{ fontFamily: "'Space Mono'", fontSize: 12, color: C.accent, letterSpacing: 1 }}>CAPERIF.AI</span>
      </div>
      <h1 style={{ fontSize: 26, fontWeight: 700, margin: "8px 0 6px", lineHeight: 1.2 }}>
        Tu buyer persona + ángulos de venta, gratis
      </h1>
      <p style={{ color: C.dim, fontSize: 14, margin: "0 0 24px", lineHeight: 1.5 }}>
        Cuéntanos sobre tu producto y nuestra IA te entrega el perfil de tu cliente
        ideal y los ángulos listos para tus campañas en Meta.
      </p>

      <div style={{ display: "grid", gap: 12 }}>
        <Row>
          <Field label="Nombre *"><input className="cap-in" value={form.nombre} onChange={set("nombre")} placeholder="Tu nombre" /></Field>
          <Field label="Empresa *"><input className="cap-in" value={form.empresa} onChange={set("empresa")} placeholder="Nombre de tu empresa" /></Field>
        </Row>
        <Row>
          <Field label="Correo *"><input className="cap-in" type="email" value={form.correo} onChange={set("correo")} placeholder="tu@correo.com" /></Field>
          <Field label="Teléfono *"><input className="cap-in" value={form.telefono} onChange={set("telefono")} placeholder="+52 ..." /></Field>
        </Row>
        <Field label="¿Qué producto/servicio vendes? *">
          <input className="cap-in" value={form.producto} onChange={set("producto")} placeholder="Ej. Curso de inversión, software CRM..." />
        </Field>
        <Field label="Link de tu landing o producto">
          <input className="cap-in" value={form.link} onChange={set("link")} placeholder="https://..." />
        </Field>
        <Field label="¿Qué problema resuelve? *">
          <textarea className="cap-in" rows={3} value={form.problema} onChange={set("problema")}
            placeholder="Describe el dolor principal de tu cliente..." style={{ resize: "vertical" }} />
        </Field>
      </div>

      {error && <p style={{ color: "#FF6B6B", fontSize: 13, margin: "12px 0 0" }}>{error}</p>}

      <button onClick={submit} disabled={sending} style={{
        width: "100%", marginTop: 20, padding: "14px", borderRadius: 10, border: "none",
        background: `linear-gradient(135deg, ${C.accent}, ${C.accent2})`,
        color: "#04110D", fontWeight: 700, fontSize: 15, cursor: "pointer",
        opacity: sending ? .6 : 1, fontFamily: "inherit",
      }}>
        {sending ? "Generando..." : "Generar mi análisis →"}
      </button>
      <p style={{ color: C.dim, fontSize: 11, textAlign: "center", marginTop: 12 }}>
        Tus datos se guardan de forma segura. No spam.
      </p>
    </div>
  );
}

function Row({ children }) {
  return <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>{children}</div>;
}
function Field({ label, children }) {
  return (
    <label style={{ display: "block" }}>
      <span style={{ display: "block", fontSize: 12, color: C.dim, marginBottom: 6 }}>{label}</span>
      {children}
    </label>
  );
}

// =================== RESULT ===================
function ResultPanel({ form }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        if (!res.ok) throw new Error("bad status");
        const json = await res.json();
        if (json.error) throw new Error(json.error);
        setData(json);
      } catch (e) {
        setErr(true);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const goDemo = () => {
    if (DEMO_URL) window.open(DEMO_URL, "_blank");
    else alert("Configura NEXT_PUBLIC_DEMO_URL con tu link de agenda.");
  };

  return (
    <div style={{
      width: "100%", maxWidth: 760, background: C.panel,
      border: `1px solid ${C.border}`, borderRadius: 18, padding: 32,
      animation: "pop .4s ease", maxHeight: "90vh", overflowY: "auto",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
        <span style={{ width: 9, height: 9, borderRadius: "50%", background: C.accent, boxShadow: `0 0 12px ${C.accent}` }} />
        <span style={{ fontFamily: "'Space Mono'", fontSize: 12, color: C.accent, letterSpacing: 1 }}>CAPERIF.AI · ANÁLISIS</span>
      </div>
      <h1 style={{ fontSize: 23, fontWeight: 700, margin: "0 0 4px" }}>
        Listo, {form.nombre.split(" ")[0]} 👋
      </h1>
      <p style={{ color: C.dim, fontSize: 14, margin: "0 0 24px" }}>
        Esto es lo que nuestra IA detectó para <b style={{ color: C.text }}>{form.empresa}</b>.
      </p>

      {loading && (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "40px 0", gap: 16 }}>
          <span style={{ width: 32, height: 32, border: `3px solid ${C.border}`, borderTopColor: C.accent, borderRadius: "50%", animation: "spin .8s linear infinite" }} />
          <span style={{ color: C.dim, fontSize: 13 }}>Analizando producto y construyendo ángulos…</span>
        </div>
      )}

      {err && (
        <p style={{ color: "#FF6B6B", fontSize: 14, padding: "20px 0" }}>
          Hubo un error generando el análisis. Recarga e intenta de nuevo.
        </p>
      )}

      {data && (
        <>
          <SectionTitle n="01" t="Tu cliente ideal (buyer persona)" />
          <div style={tableWrap}>
            <table style={tableStyle}>
              <tbody>
                {[
                  ["Perfil", data.persona.nombre],
                  ["Edad", data.persona.edad],
                  ["Rol / decisión", data.persona.rol],
                  ["Dolor principal", data.persona.dolor],
                  ["Lo que desea", data.persona.deseo],
                  ["Objeción clave", data.persona.objecion],
                  ["Dónde alcanzarlo", data.persona.donde],
                ].map(([k, v], i) => (
                  <tr key={i} style={{ borderTop: i ? `1px solid ${C.border}` : "none" }}>
                    <td style={{ ...td, color: C.dim, width: 150, fontWeight: 500 }}>{k}</td>
                    <td style={td}>{v}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ height: 28 }} />

          <SectionTitle n="02" t="Tus ángulos de venta" />
          <div style={tableWrap}>
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={th}>Ángulo</th>
                  <th style={th}>Temp.</th>
                  <th style={th}>Dolor que ataca</th>
                  <th style={th}>Hooks (0-3s)</th>
                </tr>
              </thead>
              <tbody>
                {data.angulos.map((a, i) => (
                  <tr key={i} style={{ borderTop: `1px solid ${C.border}` }}>
                    <td style={{ ...td, verticalAlign: "top" }}>
                      <b>{a.nombre}</b>
                      <div style={{ color: C.dim, fontSize: 11, marginTop: 3 }}>{a.conciencia}</div>
                    </td>
                    <td style={{ ...td, verticalAlign: "top" }}>
                      <span style={{
                        fontSize: 11, padding: "2px 8px", borderRadius: 20, whiteSpace: "nowrap",
                        background: a.temperatura === "frío" ? "rgba(14,165,233,.15)" : "rgba(34,211,166,.15)",
                        color: a.temperatura === "frío" ? C.accent2 : C.accent,
                      }}>{a.temperatura}</span>
                    </td>
                    <td style={{ ...td, verticalAlign: "top", color: C.dim }}>{a.dolor}</td>
                    <td style={{ ...td, verticalAlign: "top" }}>
                      {a.hooks.map((h, j) => (
                        <div key={j} style={{ marginBottom: 6, paddingLeft: 12, position: "relative" }}>
                          <span style={{ position: "absolute", left: 0, color: C.accent }}>›</span>{h}
                        </div>
                      ))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ height: 28 }} />

          <SectionTitle n="03" t="2 anuncios de muestra (listos para producir)" />
          <div style={{ display: "grid", gap: 16 }}>
            {(data.anuncios || []).map((ad, i) => (
              <div key={i} style={{ border: `1px solid ${C.border}`, borderRadius: 12, overflow: "hidden" }}>
                <div style={{ padding: "10px 16px", background: "#0A0E14", borderBottom: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 12, color: C.dim }}>Anuncio {i + 1}</span>
                  <span style={{ fontSize: 11, color: C.accent }}>Ángulo: {ad.angulo}</span>
                </div>
                <div style={{ padding: 16, display: "grid", gap: 14 }}>
                  <AdField label="Título">
                    <div style={{ fontWeight: 600, fontSize: 15 }}>{ad.titulo}</div>
                  </AdField>
                  <AdField label="Copy del anuncio">
                    <div style={{ fontSize: 13.5, lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{ad.copy_out}</div>
                  </AdField>
                  <AdField label="Prompt para generar el estático">
                    <div style={{
                      fontSize: 12.5, lineHeight: 1.55, color: C.dim, whiteSpace: "pre-wrap",
                      fontFamily: "'Space Mono', monospace", background: "#0A0E14",
                      border: `1px solid ${C.border}`, borderRadius: 8, padding: "10px 12px",
                    }}>{ad.prompt}</div>
                  </AdField>
                </div>
              </div>
            ))}
          </div>

          <div style={{
            marginTop: 28, padding: 24, borderRadius: 14,
            background: "linear-gradient(135deg, rgba(34,211,166,.08), rgba(14,165,233,.08))",
            border: `1px solid ${C.border}`, textAlign: "center",
          }}>
            <h3 style={{ fontSize: 18, fontWeight: 700, margin: "0 0 6px" }}>
              ¿Quieres la campaña completa?
            </h3>
            <p style={{ color: C.dim, fontSize: 13, margin: "0 0 18px", lineHeight: 1.5 }}>
              Te dimos 2 anuncios de muestra de tus {(data.angulos || []).length} ángulos.
              En una demo te armamos la campaña completa: creativos para cada ángulo,
              estructura de Entity IDs y plan de lanzamiento en Meta.
            </p>
            <button onClick={goDemo} style={{
              padding: "14px 32px", borderRadius: 10, border: "none",
              background: `linear-gradient(135deg, ${C.accent}, ${C.accent2})`,
              color: "#04110D", fontWeight: 700, fontSize: 15, cursor: "pointer", fontFamily: "inherit",
            }}>
              Agendar una demo →
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function SectionTitle({ n, t }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
      <span style={{ fontFamily: "'Space Mono'", fontSize: 12, color: C.accent }}>{n}</span>
      <span style={{ fontSize: 16, fontWeight: 600 }}>{t}</span>
    </div>
  );
}

function AdField({ label, children }) {
  return (
    <div>
      <div style={{ fontSize: 11, color: C.dim, textTransform: "uppercase", letterSpacing: .5, marginBottom: 6, fontWeight: 600 }}>{label}</div>
      {children}
    </div>
  );
}

const tableWrap = { border: `1px solid ${C.border}`, borderRadius: 12, overflow: "hidden" };
const tableStyle = { width: "100%", borderCollapse: "collapse", fontSize: 13.5, lineHeight: 1.5 };
const td = { padding: "12px 14px", textAlign: "left", verticalAlign: "middle" };
const th = { padding: "10px 14px", textAlign: "left", fontSize: 11, color: C.dim, fontWeight: 600, textTransform: "uppercase", letterSpacing: .5, background: "#0A0E14" };

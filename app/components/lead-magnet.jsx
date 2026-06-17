"use client";

import React, { useState, useEffect, useRef } from "react";
import { Sparkles, ArrowLeft, ArrowRight, Check, Building2, Target, Send, Loader2 } from "lucide-react";

// Config
const DEMO_URL = process.env.NEXT_PUBLIC_DEMO_URL || "";
const LS_KEY = "caperif_lead_v1"; // 1 uso por navegador

const C = {
  violet: "#5A3AFF",
  blue: "#2563EB",
  cyan: "#00D4FF",
  emerald: "#2DD4A8",
  navy: "#0B1437",
  ink: "#0F172A",
  slate: "#64748B",
  border: "#E2E8F0",
  borderSoft: "#EEF2F7",
  bg: "#FFFFFF",
  bgAlt: "#F8FAFC",
  surfaceAlt: "#FBFCFE",
};

const STEPS = [
  { id: 1, title: "Tu empresa", desc: "Cuéntanos qué vendes", icon: Building2 },
  { id: 2, title: "El problema", desc: "Qué resuelve tu oferta", icon: Target },
  { id: 3, title: "Anuncios Ganadores", desc: "Listos para copiar y pegar", icon: Send },
];

function Wordmark({ height = 28, dark }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/logo.png"
      alt="Caperifai"
      style={{ height, width: "auto", display: "block", filter: dark ? "brightness(0) invert(1)" : "none" }}
    />
  );
}

function Eyebrow({ children }) {
  return <span style={{ fontSize: 12.5, fontWeight: 700, color: C.violet, textTransform: "uppercase", letterSpacing: ".08em" }}>{children}</span>;
}

const h2 = { fontSize: 30, fontWeight: 700, color: C.navy, margin: "14px 0 0", lineHeight: 1.2, letterSpacing: "-0.02em" };
const lead = { fontSize: 16.5, lineHeight: 1.6, color: C.slate, maxWidth: 620 };
const tableWrap = { border: `1px solid ${C.border}`, borderRadius: 16, overflowX: "auto", WebkitOverflowScrolling: "touch" };
const tableStyle = { width: "100%", borderCollapse: "collapse", fontSize: 13.5, lineHeight: 1.5 };
const tdc = { padding: "12px 15px", textAlign: "left", verticalAlign: "middle" };
const thc = { padding: "11px 15px", textAlign: "left", fontSize: 11, color: C.slate, fontWeight: 600, textTransform: "uppercase", letterSpacing: .5, background: C.surfaceAlt };

// =================== LEAD MAGNET ===================
// `wrapped` (default true) envuelve el form en una <section> con fondo.
// En landing-2 lo montamos dentro de su propia sección, así que pasamos wrapped={false}.
export function LeadMagnet({ wrapped = true, competitive = false } = {}) {
  const [stage, setStage] = useState("form");
  const [form, setForm] = useState({ nombre: "", correo: "", telefono: "", empresa: "", producto: "", link: "", problema: "" });
  const [savedData, setSavedData] = useState(null);
  const [savedBlocked, setSavedBlocked] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && (parsed.data || parsed.blocked)) {
          setForm((f) => ({ ...f, ...(parsed.form || {}) }));
          if (parsed.data) setSavedData(parsed.data);
          if (parsed.blocked) setSavedBlocked(true);
          setStage("result");
        }
      }
    } catch (e) {}
    setReady(true);
  }, []);

  const submit = () => {
    try {
      if (typeof window !== "undefined") {
        if (typeof window.fbq === "function") window.fbq("track", "Lead");
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({ event: "lead_submit" });
      }
    } catch (e) {}
    setStage("result");
  };

  const handleComplete = (data) => {
    setSavedData(data);
    try { localStorage.setItem(LS_KEY, JSON.stringify({ form, data })); } catch (e) {}
  };

  const handleBlocked = () => {
    setSavedBlocked(true);
    try { localStorage.setItem(LS_KEY, JSON.stringify({ form, blocked: true })); } catch (e) {}
  };

  const inner = !ready ? (
    <div style={{ maxWidth: 820, margin: "0 auto" }}>
      <div className="cap-pop" style={{ background: "#fff", border: `1px solid ${C.border}`, borderRadius: 22, padding: 48, boxShadow: "0 1px 2px rgba(15,23,42,.04), 0 30px 60px -30px rgba(15,23,42,.2)", display: "flex", justifyContent: "center" }}><span className="cap-spin" /></div>
    </div>
  ) : stage === "form" ? (
    <MultiStepForm form={form} setForm={setForm} onSubmit={submit} />
  ) : (
    <div style={{ maxWidth: 820, margin: "0 auto" }}>
      <div style={{ textAlign: "center", marginBottom: 32 }}>
        <Eyebrow>Tu análisis</Eyebrow>
        <h2 className="cap-display" style={{ ...h2, fontSize: 34 }}>Descubre tus ángulos de venta</h2>
        <p style={{ ...lead, margin: "14px auto 0" }}>Tu análisis gratis ya está listo. Agenda una demo para la campaña completa.</p>
      </div>
      <ResultCard form={form} initialData={savedData} initialBlocked={savedBlocked} onComplete={handleComplete} onBlocked={handleBlocked} competitive={competitive} />
    </div>
  );

  if (!wrapped) return <div id="cap-leadmagnet" style={{ scrollMarginTop: 70 }}>{inner}</div>;

  return (
    <section id="cap-leadmagnet" style={{ background: `linear-gradient(180deg, ${C.bg}, ${C.bgAlt})`, padding: "72px 24px", scrollMarginTop: 70 }}>
      {inner}
    </section>
  );
}

// =================== MULTISTEP FORM ===================
function MultiStepForm({ form, setForm, onSubmit }) {
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const set = (k) => (e) => {
    setForm((d) => ({ ...d, [k]: e.target.value }));
    setErrors((er) => ({ ...er, [k]: undefined }));
  };

  const validate = (s) => {
    const er = {};
    if (s === 1 && !form.producto.trim()) er.producto = "Cuéntanos qué producto o servicio vendes.";
    if (s === 2 && !form.problema.trim()) er.problema = "Describe el problema que resuelves.";
    if (s === 3) {
      if (!form.nombre.trim()) er.nombre = "Necesitamos tu nombre.";
      if (!form.correo.trim()) er.correo = "Necesitamos tu correo.";
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.correo)) er.correo = "Ese correo no parece válido.";
    }
    setErrors(er);
    return Object.keys(er).length === 0;
  };

  const startedRef = useRef(false);
  const track = (event, extra) => {
    try {
      if (typeof window !== "undefined") {
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({ event, ...(extra || {}) });
      }
    } catch (e) {}
  };

  const next = () => {
    if (!validate(step)) return;
    const target = Math.min(3, step + 1);
    if (target === 2 && !startedRef.current) {
      startedRef.current = true;
      track("form_start");
      try { if (typeof window !== "undefined" && typeof window.fbq === "function") window.fbq("trackCustom", "FormStart"); } catch (e) {}
    }
    if (target === 3) track("form_step_3");
    setStep(target);
  };
  const back = () => setStep((s) => Math.max(1, s - 1));
  const submit = () => {
    if (!validate(3)) return;
    setSubmitting(true);
    onSubmit();
  };

  const pct = Math.round(((step - 1) / 3) * 100) + 8;

  return (
    <div style={{ maxWidth: 960, margin: "0 auto" }}>
      <div className="cf-card cap-pop" style={{ background: C.bg, borderRadius: 28, boxShadow: "0 40px 80px -30px rgba(15,23,42,.30), 0 2px 8px rgba(15,23,42,.04)", overflow: "hidden", display: "grid", gridTemplateColumns: "300px 1fr", border: `1px solid ${C.border}` }}>
        <aside className="cf-aside" style={{ background: C.bgAlt, borderRight: `1px solid ${C.border}`, padding: "32px 28px", display: "flex", flexDirection: "column" }}>
          <div><Wordmark height={28} /></div>
          <div style={{ marginTop: 40, flex: 1 }}>
            {STEPS.map((s, i) => {
              const active = step === s.id;
              const complete = step > s.id;
              const Icon = s.icon;
              return (
                <div key={s.id} style={{ display: "flex", gap: 14, position: "relative" }}>
                  {i < STEPS.length - 1 && (
                    <div style={{ position: "absolute", left: 17, top: 38, bottom: -10, width: 2, background: complete ? `linear-gradient(${C.violet}, ${C.blue})` : C.border }} />
                  )}
                  <div style={{ width: 36, height: 36, borderRadius: 12, flexShrink: 0, display: "grid", placeItems: "center", color: active || complete ? "#fff" : C.slate, background: active || complete ? `linear-gradient(135deg, ${C.violet}, ${C.blue})` : C.bg, border: active || complete ? "none" : `1.5px solid ${C.border}`, boxShadow: active || complete ? "0 6px 14px -4px rgba(90,58,255,.5)" : "none", transition: "all .25s" }}>
                    {complete ? <Check size={16} /> : <Icon size={16} />}
                  </div>
                  <div style={{ paddingBottom: 28 }}>
                    <div style={{ fontWeight: 600, fontSize: 14.5, color: active || complete ? C.ink : C.slate }}>{s.title}</div>
                    <div style={{ fontSize: 12.5, color: "#94A3B8", marginTop: 2 }}>{s.desc}</div>
                  </div>
                </div>
              );
            })}
          </div>
          <AriaCard step={step} />
        </aside>

        <main className="cf-main" style={{ padding: "30px 44px 38px", display: "flex", flexDirection: "column", minHeight: 560 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <button className="cf-btn cf-btn--ghost" onClick={back} disabled={step === 1} style={{ padding: "9px 16px", fontSize: 14, opacity: step === 1 ? 0.4 : 1 }}>
              <ArrowLeft size={16} /> Atrás
            </button>
            <span style={{ fontSize: 13, color: C.slate, fontWeight: 500 }}>Paso {step} de 3</span>
          </div>

          <div style={{ marginTop: 18, height: 6, borderRadius: 99, background: "#EDF1F7", overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${pct}%`, borderRadius: 99, background: `linear-gradient(90deg, ${C.violet}, ${C.blue}, ${C.cyan})`, transition: "width .4s cubic-bezier(.2,.8,.2,1)" }} />
          </div>

          <div className="cf-mobile-steps" style={{ marginTop: 20, alignItems: "flex-start" }}>
            {STEPS.map((s, i) => {
              const active = step === s.id;
              const complete = step > s.id;
              const Icon = s.icon;
              return (
                <React.Fragment key={s.id}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, flexShrink: 0, width: 64 }}>
                    <div style={{ width: 34, height: 34, borderRadius: 11, display: "grid", placeItems: "center", color: active || complete ? "#fff" : C.slate, background: active || complete ? `linear-gradient(135deg, ${C.violet}, ${C.blue})` : C.bg, border: active || complete ? "none" : `1.5px solid ${C.border}`, transition: "all .25s" }}>
                      {complete ? <Check size={15} /> : <Icon size={15} />}
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 600, textAlign: "center", lineHeight: 1.2, color: active || complete ? C.ink : C.slate }}>{s.title}</span>
                  </div>
                  {i < STEPS.length - 1 && <div style={{ flex: 1, height: 2, marginTop: 16, borderRadius: 2, background: complete ? `linear-gradient(90deg, ${C.violet}, ${C.blue})` : C.border }} />}
                </React.Fragment>
              );
            })}
          </div>

          <div style={{ flex: 1, marginTop: 36 }}>
            {step === 1 && (
              <StepShell eyebrow="Paso 1" title="Cuéntanos de tu empresa" subtitle="Aria necesita saber qué ofreces para generar ángulos de venta que conviertan.">
                <Field label="¿Qué producto o servicio vendes?" required error={errors.producto}>
                  <textarea className={`cf-input ${errors.producto ? "err" : ""}`} placeholder="Ej. Software de facturación para pymes en México, consultoría de marketing, cursos de inglés online..." value={form.producto} onChange={set("producto")} />
                </Field>
                <Field label="Link de tu landing, producto o página web">
                  <input className="cf-input" placeholder="https://tuempresa.com" value={form.link} onChange={set("link")} />
                </Field>
              </StepShell>
            )}
            {step === 2 && (
              <StepShell eyebrow="Paso 2" title="¿Qué problema resuelve?" subtitle="El dolor que eliminas es la materia prima de un buen ángulo. Sé específico.">
                <Field label="¿Qué problema resuelve tu producto o servicio?" required error={errors.problema}>
                  <textarea className={`cf-input ${errors.problema ? "err" : ""}`} placeholder="Ej. Los dueños de pyme pierden horas haciendo facturas a mano y cometen errores fiscales que les cuestan multas..." value={form.problema} onChange={set("problema")} style={{ minHeight: 180 }} />
                </Field>
              </StepShell>
            )}
            {step === 3 && (
              <StepShell eyebrow="Paso 3" title="Antes de finalizar" subtitle="¿A quién le mandamos los ángulos de venta?">
                <div className="cf-grid2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
                  <Field label="Nombre" required error={errors.nombre}>
                    <input className={`cf-input ${errors.nombre ? "err" : ""}`} placeholder="Tu nombre" value={form.nombre} onChange={set("nombre")} />
                  </Field>
                  <Field label="Empresa">
                    <input className="cf-input" placeholder="Nombre de tu empresa" value={form.empresa} onChange={set("empresa")} />
                  </Field>
                  <Field label="Correo" required error={errors.correo}>
                    <input className={`cf-input ${errors.correo ? "err" : ""}`} placeholder="tucorreo@empresa.com" type="email" value={form.correo} onChange={set("correo")} />
                  </Field>
                  <Field label="Teléfono">
                    <input className="cf-input" placeholder="+52 ..." value={form.telefono} onChange={set("telefono")} />
                  </Field>
                </div>
              </StepShell>
            )}
          </div>

          <div style={{ marginTop: 28, display: "flex", justifyContent: "flex-end" }}>
            {step < 3 ? (
              <button className="cf-btn cf-btn--primary" onClick={next}>Continuar <ArrowRight size={16} /></button>
            ) : (
              <button className="cf-btn cf-btn--primary" onClick={submit} disabled={submitting}>
                {submitting ? (<><Loader2 size={16} className="cf-spin" /> Generando…</>) : (<>Generar mis ángulos <Sparkles size={16} /></>)}
              </button>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

function StepShell({ eyebrow, title, subtitle, children }) {
  return (
    <div className="cf-fade" key={title}>
      <span style={{ fontSize: 12.5, fontWeight: 600, textTransform: "uppercase", letterSpacing: ".08em", color: C.violet }}>{eyebrow}</span>
      <h1 className="cap-display" style={{ fontSize: 30, fontWeight: 700, margin: "8px 0 6px", color: C.ink, letterSpacing: "-0.02em" }}>{title}</h1>
      <p style={{ margin: "0 0 30px", fontSize: 15, color: C.slate, lineHeight: 1.5, maxWidth: 520 }}>{subtitle}</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>{children}</div>
    </div>
  );
}

function Field({ label, required, error, children }) {
  return (
    <label style={{ display: "block" }}>
      <span style={{ display: "block", fontSize: 13.5, fontWeight: 600, color: C.ink, marginBottom: 8 }}>
        {label}{required && <span style={{ color: C.violet }}> *</span>}
      </span>
      {children}
      {error && <span style={{ display: "block", marginTop: 6, fontSize: 12.5, color: "#EF4444", fontWeight: 500 }}>{error}</span>}
    </label>
  );
}

function AriaCard({ step }) {
  const msgs = [
    "Voy leyendo lo que vendes para encontrar el ángulo más fuerte.",
    "Con el problema claro puedo apuntar al dolor real de tu cliente.",
    "Listo. En cuanto envíes, preparo tus ángulos de venta.",
  ];
  return (
    <div style={{ marginTop: 24, background: C.bg, border: `1px solid ${C.border}`, borderRadius: 16, padding: 16 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
        <Sparkles size={15} color={C.violet} />
        <span style={{ fontWeight: 700, fontSize: 13.5, color: C.ink }}>Aria</span>
        <span style={{ fontSize: 11, color: C.slate, background: C.bgAlt, padding: "2px 8px", borderRadius: 99 }}>AI Copilot</span>
      </div>
      <p style={{ margin: 0, fontSize: 13, lineHeight: 1.5, color: C.slate }}>{msgs[step - 1]}</p>
    </div>
  );
}

function ResultCard({ form, initialData, initialBlocked, onComplete, onBlocked, competitive }) {
  const [data, setData] = useState(initialData || null);
  const [blocked, setBlocked] = useState(!!initialBlocked);
  const [loading, setLoading] = useState(!initialData && !initialBlocked);
  const [err, setErr] = useState(false);
  useEffect(() => {
    if (initialData || initialBlocked) return;
    (async () => {
      try {
        const res = await fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...form, competitive: !!competitive }),
        });
        if (!res.ok) throw new Error("bad status");
        const json = await res.json();
        if (json.blocked) { setBlocked(true); if (onBlocked) onBlocked(); return; }
        if (json.error) throw new Error(json.error);
        setData(json);
        if (onComplete) onComplete(json);
      } catch (e) { setErr(true); } finally { setLoading(false); }
    })();
  }, []);
  const goDemo = () => { if (DEMO_URL) window.open(DEMO_URL, "_blank"); else alert("Configura NEXT_PUBLIC_DEMO_URL con tu link de agenda."); };

  return (
    <div className="cap-pop" style={{ background: "#fff", border: `1px solid ${C.border}`, borderRadius: 22, padding: 32, boxShadow: "0 1px 2px rgba(15,23,42,.04), 0 30px 60px -30px rgba(15,23,42,.2)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 18 }}>
        <span style={{ width: 22, height: 22, borderRadius: 6, background: `linear-gradient(135deg, ${C.violet}, ${C.blue})`, display: "grid", placeItems: "center", color: "#fff", fontSize: 12, fontWeight: 700 }}>A</span>
        <span style={{ fontWeight: 600, fontSize: 14, color: C.navy }}>Aria · tu análisis para {form.empresa || "tu negocio"}</span>
      </div>
      {loading && <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "48px 0", gap: 16 }}><span className="cap-spin" /><span style={{ color: C.slate, fontSize: 13.5 }}>Analizando tu producto y construyendo ángulos…</span></div>}
      {err && <p style={{ color: "#E11D48", fontSize: 14, padding: "20px 0" }}>Hubo un error generando el análisis. Recarga e intenta de nuevo.</p>}
      {blocked && (
        <div style={{ textAlign: "center", padding: "20px 8px 4px" }}>
          <div style={{ fontSize: 38, marginBottom: 10 }}>🔒</div>
          <h3 className="cap-display" style={{ fontSize: 20, fontWeight: 700, color: C.navy, margin: "0 0 8px" }}>Ya usaste tu análisis gratis</h3>
          <p style={{ fontSize: 14.5, color: C.slate, lineHeight: 1.6, maxWidth: 460, margin: "0 auto 22px" }}>
            El análisis gratuito es uno por persona. Para llevar tus ángulos a una campaña completa
            —creativos por ángulo, Entity IDs y lanzamiento en Meta— agenda una demo con Aria.
          </p>
          <button className="cap-btn cap-btn-primary" onClick={goDemo} style={{ padding: "14px 34px", borderRadius: 12, border: "none", background: `linear-gradient(135deg, ${C.violet}, ${C.blue})`, color: "#fff", fontWeight: 700, fontSize: 15, cursor: "pointer", fontFamily: "inherit" }}>Solicita tu demo →</button>
        </div>
      )}
      {data && (
        <div className="cap-stagger">
          <div>
            <SectionTitle n="01" t="Tu cliente ideal" />
            <div style={tableWrap}><table style={tableStyle}><tbody>
              {[["Perfil", data.persona.nombre], ["Edad", data.persona.edad], ["Rol / decisión", data.persona.rol], ["Dolor principal", data.persona.dolor], ["Lo que desea", data.persona.deseo], ["Objeción clave", data.persona.objecion], ["Dónde alcanzarlo", data.persona.donde]].map(([k, v], i) => (
                <tr key={i} className="cap-row" style={{ borderTop: i ? `1px solid ${C.borderSoft}` : "none" }}><td style={{ ...tdc, color: C.slate, width: 150, fontWeight: 500 }}>{k}</td><td style={{ ...tdc, color: C.ink }}>{v}</td></tr>
              ))}
            </tbody></table></div>
          </div>
          <div>
            <SectionTitle n="02" t="Tus ángulos de venta" />
            <div className="cap-angulos-table" style={tableWrap}><table style={{ ...tableStyle, minWidth: 460 }}>
              <thead><tr><th style={thc}>Ángulo</th><th style={thc}>Temp.</th><th style={thc}>Dolor</th><th style={thc}>Hooks (0-3s)</th></tr></thead>
              <tbody>{data.angulos.map((a, i) => (
                <tr key={i} className="cap-row" style={{ borderTop: `1px solid ${C.borderSoft}` }}>
                  <td style={{ ...tdc, verticalAlign: "top" }}><b style={{ color: C.navy }}>{a.nombre}</b><div style={{ color: C.slate, fontSize: 11, marginTop: 3 }}>{a.conciencia}</div></td>
                  <td style={{ ...tdc, verticalAlign: "top" }}><Temp t={a.temperatura} /></td>
                  <td style={{ ...tdc, verticalAlign: "top", color: C.slate }}>{a.dolor}</td>
                  <td style={{ ...tdc, verticalAlign: "top", color: C.ink }}>{a.hooks.map((h, j) => (<div key={j} style={{ marginBottom: 6, paddingLeft: 14, position: "relative" }}><span style={{ position: "absolute", left: 0, color: C.violet }}>›</span>{h}</div>))}</td>
                </tr>
              ))}</tbody>
            </table></div>
            <div className="cap-angulos-cards" style={{ gap: 12 }}>
              {data.angulos.map((a, i) => (
                <div key={i} style={{ border: `1px solid ${C.border}`, borderRadius: 14, padding: 16 }}>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10 }}>
                    <div>
                      <b style={{ color: C.navy, fontSize: 14.5 }}>{a.nombre}</b>
                      <div style={{ color: C.slate, fontSize: 11, marginTop: 3 }}>{a.conciencia}</div>
                    </div>
                    <Temp t={a.temperatura} />
                  </div>
                  <div style={{ marginTop: 12 }}>
                    <div style={{ fontSize: 10.5, color: C.slate, textTransform: "uppercase", letterSpacing: .5, fontWeight: 600, marginBottom: 4 }}>Dolor que ataca</div>
                    <div style={{ fontSize: 13.5, color: C.slate, lineHeight: 1.5 }}>{a.dolor}</div>
                  </div>
                  <div style={{ marginTop: 12 }}>
                    <div style={{ fontSize: 10.5, color: C.slate, textTransform: "uppercase", letterSpacing: .5, fontWeight: 600, marginBottom: 4 }}>Hooks (0-3s)</div>
                    {a.hooks.map((h, j) => (
                      <div key={j} style={{ marginBottom: 5, paddingLeft: 14, position: "relative", fontSize: 13.5, color: C.ink, lineHeight: 1.5 }}>
                        <span style={{ position: "absolute", left: 0, color: C.violet }}>›</span>{h}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div>
            <SectionTitle n="03" t="2 anuncios de muestra" />
            <div style={{ display: "grid", gap: 16 }}>{(data.anuncios || []).map((ad, i) => (
              <div key={i} className="cap-adcard" style={{ border: `1px solid ${C.border}`, borderRadius: 16, overflow: "hidden" }}>
                <div style={{ padding: "11px 16px", background: C.surfaceAlt, borderBottom: `1px solid ${C.borderSoft}`, display: "flex", justifyContent: "space-between" }}><span style={{ fontSize: 12, color: C.slate, fontWeight: 500 }}>Anuncio {i + 1}</span><span style={{ fontSize: 11, color: C.violet, fontWeight: 600 }}>Ángulo: {ad.angulo}</span></div>
                <div style={{ padding: 18, display: "grid", gap: 14 }}>
                  <AdField label="Título"><div className="cap-display" style={{ fontWeight: 600, fontSize: 16, color: C.navy }}>{ad.titulo}</div></AdField>
                  <AdField label="Copy"><div style={{ fontSize: 13.5, lineHeight: 1.6, whiteSpace: "pre-wrap", color: "#334155" }}>{ad.copy_out}</div></AdField>
                  <AdField label="Prompt del estático" copy={ad.prompt}><div style={{ fontSize: 12.5, lineHeight: 1.55, color: "#475569", whiteSpace: "pre-wrap", fontFamily: "ui-monospace, 'SF Mono', monospace", background: C.surfaceAlt, border: `1px solid ${C.borderSoft}`, borderRadius: 10, padding: "11px 13px" }}>{ad.prompt}</div></AdField>
                </div>
              </div>
            ))}</div>
          </div>
          {data.competitivo && (
            <div>
              <SectionTitle n="04" t="Análisis competitivo (Meta Ads)" />
              <p style={{ fontSize: 14, color: C.slate, lineHeight: 1.6, margin: "0 0 14px" }}>{data.competitivo.resumen}</p>
              <div className="cf-grid2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
                <div style={{ border: `1px solid ${C.border}`, borderRadius: 12, padding: 14 }}>
                  <div style={{ fontSize: 10.5, color: C.slate, textTransform: "uppercase", letterSpacing: .5, fontWeight: 700, marginBottom: 8 }}>Ya está saturado</div>
                  {(data.competitivo.saturado || []).map((s, i) => (
                    <div key={i} style={{ marginBottom: 5, paddingLeft: 16, position: "relative", fontSize: 13, color: C.slate, lineHeight: 1.5 }}><span style={{ position: "absolute", left: 0, color: "#E11D48" }}>×</span>{s}</div>
                  ))}
                </div>
                <div style={{ border: `1px solid ${C.border}`, borderRadius: 12, padding: 14 }}>
                  <div style={{ fontSize: 10.5, color: C.slate, textTransform: "uppercase", letterSpacing: .5, fontWeight: 700, marginBottom: 8 }}>Tu oportunidad</div>
                  {(data.competitivo.oportunidades || []).map((s, i) => (
                    <div key={i} style={{ marginBottom: 5, paddingLeft: 16, position: "relative", fontSize: 13, color: C.ink, lineHeight: 1.5 }}><span style={{ position: "absolute", left: 0, color: "#0E9F77" }}>✓</span>{s}</div>
                  ))}
                </div>
              </div>
              <div style={{ fontSize: 11, color: C.slate, textTransform: "uppercase", letterSpacing: .5, fontWeight: 600, margin: "4px 0 8px" }}>Anuncios reales de la competencia (los que llevan más tiempo corriendo)</div>
              <div style={{ display: "grid", gap: 10 }}>
                {(data.competitivo.anuncios || []).map((ad, i) => (
                  <div key={i} style={{ border: `1px solid ${C.border}`, borderRadius: 12, padding: 14 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8, marginBottom: 6 }}>
                      <b style={{ color: C.navy, fontSize: 13.5 }}>{ad.pagina || "Anunciante"}</b>
                      <span style={{ fontSize: 11, color: C.slate, whiteSpace: "nowrap" }}>desde {ad.inicio || "n/d"}</span>
                    </div>
                    {ad.titulo && <div style={{ fontSize: 13, fontWeight: 600, color: C.ink, marginBottom: 3 }}>{ad.titulo}</div>}
                    {ad.copy && <div style={{ fontSize: 12.5, color: C.slate, lineHeight: 1.5, whiteSpace: "pre-wrap" }}>{ad.copy}</div>}
                    {ad.link && <a href={ad.link} target="_blank" rel="noopener noreferrer" style={{ fontSize: 11.5, color: C.violet, fontWeight: 600, display: "inline-block", marginTop: 6 }}>Ver en Ad Library →</a>}
                  </div>
                ))}
              </div>
            </div>
          )}
          <div style={{ marginTop: 16, padding: 28, borderRadius: 18, background: `linear-gradient(135deg, ${C.violet}, ${C.blue})`, textAlign: "center", color: "#fff" }}>
            <h3 className="cap-display" style={{ fontSize: 20, fontWeight: 700, margin: "0 0 8px" }}>¿Quieres la campaña completa?</h3>
            <p style={{ fontSize: 13.5, margin: "0 0 20px", lineHeight: 1.55, color: "rgba(255,255,255,.85)" }}>Te di 2 anuncios de muestra de tus {(data.angulos || []).length} ángulos. En una demo, Aria te arma la campaña completa: creativos para cada ángulo, Entity IDs y lanzamiento en Meta.</p>
            <button className="cap-btn" onClick={goDemo} style={{ padding: "14px 34px", borderRadius: 12, border: "none", background: "#fff", color: C.violet, fontWeight: 700, fontSize: 15, cursor: "pointer", fontFamily: "inherit" }}>Solicita tu demo →</button>
          </div>
        </div>
      )}
    </div>
  );
}

function Temp({ t }) { const cold = t === "frío"; return <span style={{ fontSize: 11, padding: "3px 10px", borderRadius: 20, whiteSpace: "nowrap", fontWeight: 600, background: cold ? "#E8F0FF" : "#EAFBF5", color: cold ? C.blue : "#0E9F77", border: `1px solid ${cold ? "#D6E4FF" : "#CFF3E7"}` }}>{t}</span>; }
function SectionTitle({ n, t }) { return <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}><span className="cap-display" style={{ fontSize: 11, color: C.violet, background: "#F1EEFF", border: "1px solid #E5DEFF", borderRadius: 7, padding: "3px 7px", fontWeight: 700 }}>{n}</span><span className="cap-display" style={{ fontSize: 16.5, fontWeight: 600, color: C.navy }}>{t}</span></div>; }
function AdField({ label, children, copy }) {
  const [copied, setCopied] = useState(false);
  const doCopy = () => { try { navigator.clipboard.writeText(copy); setCopied(true); setTimeout(() => setCopied(false), 1400); } catch (e) {} };
  return <div><div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}><div style={{ fontSize: 11, color: C.slate, textTransform: "uppercase", letterSpacing: .5, fontWeight: 600 }}>{label}</div>{copy && <button className="cap-ghost" onClick={doCopy} style={{ fontSize: 11, color: copied ? C.violet : C.slate, background: "transparent", border: `1px solid ${C.border}`, borderRadius: 7, padding: "3px 10px", cursor: "pointer", fontFamily: "inherit", fontWeight: 500 }}>{copied ? "Copiado ✓" : "Copiar"}</button>}</div>{children}</div>;
}

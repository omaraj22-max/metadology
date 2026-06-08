"use client";

import React, { useState, useEffect, useRef } from "react";
import { Sparkles, ArrowLeft, ArrowRight, Check, Building2, Target, Send, Loader2 } from "lucide-react";

// =================== CONFIG ===================
// El registro del lead y el candado por correo viven en /api/analyze (server-side).
const DEMO_URL = process.env.NEXT_PUBLIC_DEMO_URL || "";

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

// =================== LOGO ===================
function Wordmark({ height = 28, dark }) {
  // Logo horizontal real (isotipo + wordmark). En fondo oscuro se invierte a blanco.
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/logo.png"
      alt="Caperifai"
      style={{
        height, width: "auto", display: "block",
        filter: dark ? "brightness(0) invert(1)" : "none",
      }}
    />
  );
}

const scrollToForm = () => {
  const el = document.getElementById("cap-leadmagnet");
  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
};

// =================== APP ===================
export default function CaperifLanding() {
  return (
    <div style={{ background: C.bg, color: C.ink, fontFamily: "'Inter', system-ui, sans-serif", WebkitFontSmoothing: "antialiased" }}>
      <Nav />
      <Hero />
      <LeadMagnet />
      <LogosStrip />
      <Problem />
      <HowItWorks />
      <WhatYouGet />
      <Proof />
      <Footer />
    </div>
  );
}

// =================== NAV ===================
function Nav() {
  return (
    <nav style={{
      position: "sticky", top: 0, zIndex: 50, background: "rgba(255,255,255,.8)",
      backdropFilter: "blur(12px)", borderBottom: `1px solid ${C.borderSoft}`,
    }}>
      <div style={{ maxWidth: 1120, margin: "0 auto", padding: "14px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Wordmark height={26} />
        <button className="cap-btn cap-btn-primary cap-nav-cta" onClick={scrollToForm} style={{ ...btnPrimary(13, "9px 18px"), whiteSpace: "nowrap" }}>
          <span className="cap-cta-full">Generar mis ángulos gratis</span>
          <span className="cap-cta-short">Probar gratis</span>
        </button>
      </div>
    </nav>
  );
}

// =================== HERO ===================
function Hero() {
  return (
    <header style={{
      position: "relative", overflow: "hidden",
      background: `radial-gradient(900px 480px at 78% -8%, #ECEBFF 0%, ${C.bg} 55%)`,
    }}>
      <div style={{ maxWidth: 1120, margin: "0 auto", padding: "76px 24px 64px", display: "grid", gridTemplateColumns: "1.05fr .95fr", gap: 56, alignItems: "center" }} className="cap-hero-grid">
        <div className="cap-fade">
          <span style={pill}>Tu copiloto de IA para Meta Ads</span>
          <h1 className="cap-display" style={{ fontSize: "clamp(33px, 8.5vw, 46px)", lineHeight: 1.08, fontWeight: 700, color: C.navy, margin: "18px 0 0", letterSpacing: "-0.03em" }}>
            Tu agencia te cobra cada mes.<br /><span style={{ background: `linear-gradient(120deg, ${C.violet}, ${C.cyan})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>¿Y los resultados?</span>
          </h1>
          <p style={{ fontSize: 17.5, lineHeight: 1.55, color: C.slate, margin: "20px 0 0", maxWidth: 480 }}>
            Antes de pagar otra factura, descubre gratis los ángulos de venta que tus
            anuncios deberían estar usando. Te los da Aria en menos de 2 minutos.
          </p>
          <div style={{ display: "flex", gap: 12, marginTop: 30, flexWrap: "wrap" }}>
            <button className="cap-btn cap-btn-primary" onClick={scrollToForm} style={btnPrimary(15, "14px 26px")}>
              Descubre tus ángulos →
            </button>
            <button className="cap-btn cap-btn-ghost" onClick={() => { if (DEMO_URL) window.open(DEMO_URL, "_blank"); else scrollToForm(); }} style={btnGhost(15, "14px 26px")}>
              Ver cómo funciona
            </button>
          </div>
          <p style={{ fontSize: 12.5, color: C.slate, marginTop: 16 }}>Sin tarjeta · Sin contratos · Resultado en 2 min</p>
        </div>
        <div className="cap-fade cap-fade-2">
          <HeroCard />
        </div>
      </div>
    </header>
  );
}

function HeroCard() {
  return (
    <div style={{
      background: "#fff", border: `1px solid ${C.border}`, borderRadius: 20, padding: 20,
      boxShadow: "0 30px 70px -30px rgba(15,23,42,.3)",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, paddingBottom: 14, borderBottom: `1px solid ${C.borderSoft}` }}>
        <span style={{ width: 22, height: 22, borderRadius: 6, background: `linear-gradient(135deg, ${C.violet}, ${C.blue})`, display: "grid", placeItems: "center", color: "#fff", fontSize: 12, fontWeight: 700 }}>A</span>
        <span style={{ fontWeight: 600, fontSize: 14, color: C.navy }}>Aria</span>
        <span style={{ fontSize: 11.5, color: C.slate }}>· copiloto</span>
        <span style={{ marginLeft: "auto", fontSize: 11, color: C.emerald, fontWeight: 600 }}>● en línea</span>
      </div>
      <div style={{ padding: "16px 4px 4px", fontSize: 13.5, color: C.slate, lineHeight: 1.5 }}>
        Analicé tu producto y encontré <b style={{ color: C.navy }}>4 ángulos</b> que tus anuncios no están usando:
      </div>
      <div style={{ display: "grid", gap: 9, marginTop: 12 }}>
        {[
          ["Frío", "El que ya se cansó de la agencia", C.blue],
          ["Frío", "Estás pagando por adivinar", C.blue],
          ["Medio", "Tu competencia ya entendió a su cliente", C.emerald],
          ["Medio", "Lo que tu reporte no te dice", C.emerald],
        ].map(([t, txt, col], i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", background: C.surfaceAlt, border: `1px solid ${C.borderSoft}`, borderRadius: 10 }}>
            <span style={{ fontSize: 10, fontWeight: 700, color: col, background: `${col}14`, padding: "2px 8px", borderRadius: 12 }}>{t}</span>
            <span style={{ fontSize: 13, color: C.ink }}>{txt}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// =================== LOGOS STRIP ===================
function LogosStrip() {
  return (
    <div style={{ borderTop: `1px solid ${C.borderSoft}`, borderBottom: `1px solid ${C.borderSoft}`, background: C.bgAlt }}>
      <div style={{ maxWidth: 1120, margin: "0 auto", padding: "22px 24px", display: "flex", alignItems: "center", justifyContent: "center", gap: 40, flexWrap: "wrap" }}>
        <span style={{ fontSize: 12.5, color: C.slate, fontWeight: 500 }}>Construido sobre la metodología que Meta premia hoy:</span>
        {["Diversidad de ángulos", "Entity IDs", "Advantage+", "Message match"].map((t, i) => (
          <span key={i} style={{ fontSize: 13, color: C.navy, fontWeight: 600, opacity: .75 }}>{t}</span>
        ))}
      </div>
    </div>
  );
}

// =================== PROBLEM ===================
function Problem() {
  return (
    <Section>
      <div style={{ maxWidth: 720, margin: "0 auto", textAlign: "center" }}>
        <Eyebrow>El problema real</Eyebrow>
        <h2 className="cap-display" style={h2}>
          El 80% del dinero que tiras en anuncios no se pierde por tu presupuesto. Se pierde por el mensaje.
        </h2>
        <p style={{ ...lead, margin: "18px auto 0" }}>
          Meta ya no premia al que puja más, sino al que le habla a cada persona con el ángulo
          correcto. Si tus anuncios dicen lo mismo que los de tu competencia, estás compitiendo
          por precio en una subasta que nunca vas a ganar.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 18, marginTop: 48 }} className="cap-3col">
        {[
          ["Llega el reporte", "Números bonitos, gráficas que suben. Abres tu banco y la historia es otra."],
          ["Pides explicaciones", "Te responden con jerga y un “hay que esperar al algoritmo”. La mensualidad, esa sí, nunca falla."],
          ["Sigues adivinando", "Sin saber qué ángulo mueve a tu cliente, no puedes corregir. Ni tú, ni la agencia, ni el próximo freelancer."],
        ].map(([t, d], i) => (
          <div key={i} style={card}>
            <span style={{ fontSize: 13, fontWeight: 700, color: C.violet }}>0{i + 1}</span>
            <h3 className="cap-display" style={{ fontSize: 17, fontWeight: 600, color: C.navy, margin: "10px 0 8px" }}>{t}</h3>
            <p style={{ fontSize: 14, color: C.slate, lineHeight: 1.55, margin: 0 }}>{d}</p>
          </div>
        ))}
      </div>
    </Section>
  );
}

// =================== HOW IT WORKS ===================
function HowItWorks() {
  return (
    <Section alt>
      <div style={{ textAlign: "center", maxWidth: 640, margin: "0 auto" }}>
        <Eyebrow>Cómo funciona</Eyebrow>
        <h2 className="cap-display" style={h2}>Lo que tu agencia debió darte hace meses, en 2 minutos</h2>
        <p style={{ ...lead, margin: "16px auto 0" }}>
          Le dices a Aria qué vendes y a quién. Ella hace el resto. Sin contratos, sin esperar
          al “aprendizaje del algoritmo”, sin pagar una mensualidad para averiguarlo.
        </p>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 18, marginTop: 44 }} className="cap-3col">
        {[
          ["Cuéntale a Aria", "Tu producto, tu cliente y el problema que resuelves. Un formulario corto, nada más."],
          ["Aria analiza", "Cruza tu negocio con la metodología que Meta premia y construye los ángulos correctos."],
          ["Recibes tu plan", "Buyer persona, ángulos y 2 anuncios listos para copiar y pegar. Gratis."],
        ].map(([t, d], i) => (
          <div key={i} style={{ ...card, background: "#fff" }}>
            <span style={{ display: "grid", placeItems: "center", width: 38, height: 38, borderRadius: 11, background: `linear-gradient(135deg, ${C.violet}, ${C.blue})`, color: "#fff", fontWeight: 700, fontSize: 16 }}>{i + 1}</span>
            <h3 className="cap-display" style={{ fontSize: 17.5, fontWeight: 600, color: C.navy, margin: "14px 0 8px" }}>{t}</h3>
            <p style={{ fontSize: 14, color: C.slate, lineHeight: 1.55, margin: 0 }}>{d}</p>
          </div>
        ))}
      </div>
    </Section>
  );
}

// =================== WHAT YOU GET ===================
function WhatYouGet() {
  const items = [
    ["Tu buyer persona real", "Quién decide la compra y qué dolor lo mueve, para que dejes de hablarle a “todo el mundo”.", "Cada peso de tu presupuesto pega donde importa."],
    ["4 a 5 ángulos distintos", "No variaciones del mismo anuncio: ángulos que atacan motivaciones diferentes.", "Dejas de competir por precio y compites por mensaje."],
    ["Hooks de los primeros 3s", "La frase exacta que detiene el scroll y filtra al cliente correcto.", "Enganchas a quien sí te compra, no a curiosos."],
    ["2 anuncios completos", "Con copy, título y hasta el prompt para generar la imagen.", "Sales con algo que puedes lanzar hoy, no con teoría."],
  ];
  return (
    <Section>
      <div style={{ textAlign: "center", maxWidth: 640, margin: "0 auto" }}>
        <Eyebrow>Lo que recibes</Eyebrow>
        <h2 className="cap-display" style={h2}>Sólo llena el formulario</h2>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18, marginTop: 44 }} className="cap-2col">
        {items.map(([t, d, m], i) => (
          <div key={i} style={{ ...card, display: "flex", gap: 16, alignItems: "flex-start" }}>
            <span style={{ flexShrink: 0, width: 26, height: 26, borderRadius: 8, background: "#EAFBF5", display: "grid", placeItems: "center", color: C.emerald, fontWeight: 800, fontSize: 14 }}>✓</span>
            <div>
              <h3 className="cap-display" style={{ fontSize: 17, fontWeight: 600, color: C.navy, margin: "2px 0 6px" }}>{t}</h3>
              <p style={{ fontSize: 14, color: C.slate, lineHeight: 1.55, margin: "0 0 6px" }}>{d}</p>
              <p style={{ fontSize: 13, color: C.violet, fontWeight: 500, margin: 0 }}>→ {m}</p>
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}

// =================== PROOF / WHY FREE ===================
function Proof() {
  return (
    <Section alt>
      <div style={{ maxWidth: 720, margin: "0 auto", textAlign: "center" }}>
        <Eyebrow>¿Cuál es la trampa?</Eyebrow>
        <h2 className="cap-display" style={h2}>¿Por qué te lo damos gratis?</h2>
        <p style={{ ...lead, margin: "18px auto 0" }}>
          Sencillo: la mayoría nunca ha visto lo que es trabajar con una IA que de verdad entiende
          su negocio. Te mostramos una probada. Si te sirve, y te va a servir ya sabrás dónde
          encontrarnos. Sin compromiso, sin tarjeta, sin letra chica.
        </p>
      </div>
    </Section>
  );
}

// =================== LEAD MAGNET ===================
const LS_KEY = "caperif_lead_v1"; // 1 uso por navegador

const STEPS = [
  { id: 1, title: "Tu empresa", desc: "Cuéntanos qué vendes", icon: Building2 },
  { id: 2, title: "El problema", desc: "Qué resuelve tu oferta", icon: Target },
  { id: 3, title: "Contacto", desc: "A dónde mandamos los ángulos", icon: Send },
];

function LeadMagnet() {
  const [stage, setStage] = useState("form");
  const [form, setForm] = useState({ nombre: "", correo: "", telefono: "", empresa: "", producto: "", link: "", problema: "" });
  const [savedData, setSavedData] = useState(null);
  const [savedBlocked, setSavedBlocked] = useState(false);
  const [ready, setReady] = useState(false); // evita flash del form en lo que revisamos localStorage
  const locked = stage === "result";

  // Al montar: si ya lo usó en este navegador, restaura su estado y bloquea el form
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

  // Llamado al terminar el paso 3 del multistep (datos ya validados)
  const submit = () => {
    // Evento de conversión al enviar el formulario
    try {
      if (typeof window !== "undefined") {
        if (typeof window.fbq === "function") window.fbq("track", "Lead");
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({ event: "lead_submit" });
      }
    } catch (e) {}
    setStage("result"); // ResultCard hace el resto vía /api/analyze: check Sheet → generar → registrar
  };

  // Análisis generado: lo persistimos. A partir de aquí queda bloqueado aunque refresque.
  const handleComplete = (data) => {
    setSavedData(data);
    try { localStorage.setItem(LS_KEY, JSON.stringify({ form, data })); } catch (e) {}
  };

  // El servidor detectó que el correo ya usó su análisis: bloqueo local también.
  const handleBlocked = () => {
    setSavedBlocked(true);
    try { localStorage.setItem(LS_KEY, JSON.stringify({ form, blocked: true })); } catch (e) {}
  };

  return (
    <section id="cap-leadmagnet" style={{ background: `linear-gradient(180deg, ${C.bg}, ${C.bgAlt})`, padding: "72px 24px", scrollMarginTop: 70 }}>
      {!ready ? (
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
          <ResultCard form={form} initialData={savedData} initialBlocked={savedBlocked} onComplete={handleComplete} onBlocked={handleBlocked} />
        </div>
      )}
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
    // Embudo: el usuario completó el paso 1 (empezó el formulario)
    if (target === 2 && !startedRef.current) {
      startedRef.current = true;
      track("form_start");
      try { if (typeof window !== "undefined" && typeof window.fbq === "function") window.fbq("trackCustom", "FormStart"); } catch (e) {}
    }
    // Embudo: llegó al último paso (contacto)
    if (target === 3) track("form_step_3");
    setStep(target);
  };
  const back = () => setStep((s) => Math.max(1, s - 1));
  const submit = () => {
    if (!validate(3)) return;
    setSubmitting(true);
    onSubmit(); // dispara fbq + pasa a ResultCard (que llama /api/analyze)
  };

  const pct = Math.round(((step - 1) / 3) * 100) + 8;

  return (
    <div style={{ maxWidth: 960, margin: "0 auto" }}>
      <div className="cf-card cap-pop" style={{ background: C.bg, borderRadius: 28, boxShadow: "0 40px 80px -30px rgba(15,23,42,.30), 0 2px 8px rgba(15,23,42,.04)", overflow: "hidden", display: "grid", gridTemplateColumns: "300px 1fr", border: `1px solid ${C.border}` }}>
        {/* ASIDE / STEPPER */}
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

        {/* MAIN PANEL */}
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

          {/* Stepper compacto: solo visible en mobile (el aside se oculta) */}
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
                  <textarea className={`cf-input ${errors.producto ? "err" : ""}`} placeholder="Ej. Software de facturación para pymes en México, consultoría de marketing, cursos de inglés online..." value={form.producto} onChange={set("producto")} autoFocus />
                </Field>
                <Field label="Link de tu landing, producto o página web">
                  <input className="cf-input" placeholder="https://tuempresa.com" value={form.link} onChange={set("link")} />
                </Field>
              </StepShell>
            )}
            {step === 2 && (
              <StepShell eyebrow="Paso 2" title="¿Qué problema resuelve?" subtitle="El dolor que eliminas es la materia prima de un buen ángulo. Sé específico.">
                <Field label="¿Qué problema resuelve tu producto o servicio?" required error={errors.problema}>
                  <textarea className={`cf-input ${errors.problema ? "err" : ""}`} placeholder="Ej. Los dueños de pyme pierden horas haciendo facturas a mano y cometen errores fiscales que les cuestan multas..." value={form.problema} onChange={set("problema")} autoFocus style={{ minHeight: 180 }} />
                </Field>
              </StepShell>
            )}
            {step === 3 && (
              <StepShell eyebrow="Paso 3" title="Antes de finalizar" subtitle="¿A quién le mandamos los ángulos de venta?">
                <div className="cf-grid2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
                  <Field label="Nombre" required error={errors.nombre}>
                    <input className={`cf-input ${errors.nombre ? "err" : ""}`} placeholder="Tu nombre" value={form.nombre} onChange={set("nombre")} autoFocus />
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

function ResultCard({ form, initialData, initialBlocked, onComplete, onBlocked }) {
  const [data, setData] = useState(initialData || null);
  const [blocked, setBlocked] = useState(!!initialBlocked);
  const [loading, setLoading] = useState(!initialData && !initialBlocked);
  const [err, setErr] = useState(false);
  useEffect(() => {
    if (initialData || initialBlocked) return; // restaurado de localStorage: no llamar a la API
    (async () => {
      try {
        const res = await fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
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
            {/* Desktop: tabla */}
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
            {/* Mobile: tarjetas apiladas */}
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

// =================== FOOTER ===================
function Footer() {
  return (
    <footer style={{ background: C.navy, color: "rgba(255,255,255,.7)", padding: "40px 24px" }}>
      <div style={{ maxWidth: 1120, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
        <Wordmark height={24} dark />
        <span style={{ fontSize: 12.5 }}>© Caperifai 2026 · El copiloto de IA para tus campañas</span>
      </div>
    </footer>
  );
}

// =================== PRIMITIVES ===================
function Section({ children, alt }) {
  return <section style={{ background: alt ? C.bgAlt : C.bg, padding: "72px 24px", borderTop: alt ? `1px solid ${C.borderSoft}` : "none", borderBottom: alt ? `1px solid ${C.borderSoft}` : "none" }}><div style={{ maxWidth: 1080, margin: "0 auto" }}>{children}</div></section>;
}
function Eyebrow({ children }) {
  return <span style={{ fontSize: 12.5, fontWeight: 700, color: C.violet, textTransform: "uppercase", letterSpacing: ".08em" }}>{children}</span>;
}
function Temp({ t }) { const cold = t === "frío"; return <span style={{ fontSize: 11, padding: "3px 10px", borderRadius: 20, whiteSpace: "nowrap", fontWeight: 600, background: cold ? "#E8F0FF" : "#EAFBF5", color: cold ? C.blue : "#0E9F77", border: `1px solid ${cold ? "#D6E4FF" : "#CFF3E7"}` }}>{t}</span>; }
function SectionTitle({ n, t }) { return <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}><span className="cap-display" style={{ fontSize: 11, color: C.violet, background: "#F1EEFF", border: "1px solid #E5DEFF", borderRadius: 7, padding: "3px 7px", fontWeight: 700 }}>{n}</span><span className="cap-display" style={{ fontSize: 16.5, fontWeight: 600, color: C.navy }}>{t}</span></div>; }
function AdField({ label, children, copy }) {
  const [copied, setCopied] = useState(false);
  const doCopy = () => { try { navigator.clipboard.writeText(copy); setCopied(true); setTimeout(() => setCopied(false), 1400); } catch (e) {} };
  return <div><div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}><div style={{ fontSize: 11, color: C.slate, textTransform: "uppercase", letterSpacing: .5, fontWeight: 600 }}>{label}</div>{copy && <button className="cap-ghost" onClick={doCopy} style={{ fontSize: 11, color: copied ? C.violet : C.slate, background: "transparent", border: `1px solid ${C.border}`, borderRadius: 7, padding: "3px 10px", cursor: "pointer", fontFamily: "inherit", fontWeight: 500 }}>{copied ? "Copiado ✓" : "Copiar"}</button>}</div>{children}</div>;
}

// shared styles
const h2 = { fontSize: 30, fontWeight: 700, color: C.navy, margin: "14px 0 0", lineHeight: 1.2, letterSpacing: "-0.02em" };
const lead = { fontSize: 16.5, lineHeight: 1.6, color: C.slate, maxWidth: 620 };
const card = { background: C.bg, border: `1px solid ${C.border}`, borderRadius: 16, padding: 24 };
const pill = { display: "inline-block", fontSize: 12.5, fontWeight: 600, color: C.violet, background: "#F1EEFF", border: "1px solid #E5DEFF", padding: "6px 13px", borderRadius: 20 };
const btnPrimary = (fs, pad) => ({ border: "none", borderRadius: 12, background: `linear-gradient(135deg, ${C.violet}, ${C.blue})`, color: "#fff", fontWeight: 600, fontSize: fs, padding: pad, cursor: "pointer", fontFamily: "inherit" });
const btnGhost = (fs, pad) => ({ border: `1px solid ${C.border}`, borderRadius: 12, background: "#fff", color: C.navy, fontWeight: 600, fontSize: fs, padding: pad, cursor: "pointer", fontFamily: "inherit" });
const tableWrap = { border: `1px solid ${C.border}`, borderRadius: 16, overflowX: "auto", WebkitOverflowScrolling: "touch" };
const tableStyle = { width: "100%", borderCollapse: "collapse", fontSize: 13.5, lineHeight: 1.5 };
const tdc = { padding: "12px 15px", textAlign: "left", verticalAlign: "middle" };
const thc = { padding: "11px 15px", textAlign: "left", fontSize: 11, color: C.slate, fontWeight: 600, textTransform: "uppercase", letterSpacing: .5, background: C.surfaceAlt };

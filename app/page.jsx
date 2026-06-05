"use client";

import React, { useState, useEffect } from "react";

// =================== CONFIG ===================
const WEBHOOK_URL = process.env.NEXT_PUBLIC_WEBHOOK_URL || "";
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
      <LogosStrip />
      <Problem />
      <HowItWorks />
      <WhatYouGet />
      <Proof />
      <LeadMagnet />
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

function LeadMagnet() {
  const [stage, setStage] = useState("form");
  const [form, setForm] = useState({ nombre: "", correo: "", telefono: "", empresa: "", producto: "", link: "", problema: "" });
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [savedData, setSavedData] = useState(null);
  const [ready, setReady] = useState(false); // evita flash del form en lo que revisamos localStorage
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const valid = form.nombre && /\S+@\S+\.\S+/.test(form.correo) && form.telefono && form.empresa && form.producto && form.problema;
  const locked = stage === "result";

  // Al montar: si ya lo usó en este navegador, restaura su análisis y bloquea el form
  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && parsed.data) {
          setForm((f) => ({ ...f, ...(parsed.form || {}) }));
          setSavedData(parsed.data);
          setStage("result");
        }
      }
    } catch (e) {}
    setReady(true);
  }, []);

  const submit = async () => {
    if (!valid) { setError("Completa todos los campos obligatorios."); return; }
    setError(""); setSending(true);
    try {
      if (WEBHOOK_URL) {
        await fetch(WEBHOOK_URL, { method: "POST", mode: "no-cors", headers: { "Content-Type": "text/plain;charset=utf-8" }, body: JSON.stringify({ ...form, fecha: new Date().toISOString() }) });
      }
      setStage("result");
    } catch (e) { setStage("result"); } finally { setSending(false); }
  };

  // Cuando Aria termina el análisis, lo persistimos: a partir de aquí queda bloqueado aunque refresque
  const handleComplete = (data) => {
    setSavedData(data);
    try { localStorage.setItem(LS_KEY, JSON.stringify({ form, data })); } catch (e) {}
  };

  return (
    <section id="cap-leadmagnet" style={{ background: `linear-gradient(180deg, ${C.bg}, ${C.bgAlt})`, padding: "72px 24px", scrollMarginTop: 70 }}>
      <div style={{ maxWidth: 820, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <Eyebrow>{locked ? "Tu análisis" : "Pruébalo ahora"}</Eyebrow>
          <h2 className="cap-display" style={{ ...h2, fontSize: 34 }}>Descubre tus ángulos de venta</h2>
          <p style={{ ...lead, margin: "14px auto 0" }}>
            {locked
              ? "Ya generaste tu análisis gratis. Esto es lo que Aria encontró para ti."
              : "Llena el formulario. Aria hace el resto en menos de 2 minutos."}
          </p>
        </div>
        {!ready
          ? <div className="cap-pop" style={{ background: "#fff", border: `1px solid ${C.border}`, borderRadius: 22, padding: 48, boxShadow: "0 1px 2px rgba(15,23,42,.04), 0 30px 60px -30px rgba(15,23,42,.2)", display: "flex", justifyContent: "center" }}><span className="cap-spin" /></div>
          : stage === "form"
            ? <FormCard form={form} set={set} submit={submit} sending={sending} error={error} valid={valid} />
            : <ResultCard form={form} initialData={savedData} onComplete={handleComplete} />}
      </div>
    </section>
  );
}

function FormCard({ form, set, submit, sending, error, valid }) {
  return (
    <div className="cap-pop" style={{ background: "#fff", border: `1px solid ${C.border}`, borderRadius: 22, padding: 32, boxShadow: "0 1px 2px rgba(15,23,42,.04), 0 30px 60px -30px rgba(15,23,42,.2)" }}>
      <div style={{ display: "grid", gap: 13 }}>
        <Row>
          <Field label="Nombre *"><input className="cap-in" value={form.nombre} onChange={set("nombre")} placeholder="Tu nombre" /></Field>
          <Field label="Empresa *"><input className="cap-in" value={form.empresa} onChange={set("empresa")} placeholder="Tu empresa" /></Field>
        </Row>
        <Row>
          <Field label="Correo *"><input className="cap-in" type="email" value={form.correo} onChange={set("correo")} placeholder="tu@correo.com" /></Field>
          <Field label="Teléfono *"><input className="cap-in" value={form.telefono} onChange={set("telefono")} placeholder="+52 ..." /></Field>
        </Row>
        <Field label="¿Qué producto/servicio vendes? *"><input className="cap-in" value={form.producto} onChange={set("producto")} placeholder="Ej. Curso de inversión, software CRM..." /></Field>
        <Field label="Link de tu landing o producto"><input className="cap-in" value={form.link} onChange={set("link")} placeholder="https://..." /></Field>
        <Field label="¿Qué problema resuelve? *"><textarea className="cap-in" rows={3} value={form.problema} onChange={set("problema")} placeholder="Describe el dolor principal de tu cliente..." style={{ resize: "vertical", lineHeight: 1.5 }} /></Field>
      </div>
      <div style={{ overflow: "hidden", maxHeight: error ? 40 : 0, opacity: error ? 1 : 0, transition: "max-height 220ms var(--ease-out), opacity 220ms var(--ease-out)" }}>
        <p style={{ color: "#E11D48", fontSize: 13, margin: "12px 0 0" }}>{error}</p>
      </div>
      <button className="cap-btn cap-btn-primary" onClick={submit} disabled={sending} style={{ ...btnPrimary(15, "14px"), width: "100%", marginTop: 20, background: valid && !sending ? `linear-gradient(135deg, ${C.violet}, ${C.blue})` : "#E2E8F0", color: valid && !sending ? "#fff" : "#94A3B8" }}>
        {sending ? "Generando…" : "Generar mi análisis con Aria →"}
      </button>
      <p style={{ color: C.slate, fontSize: 11.5, textAlign: "center", marginTop: 13 }}>Sin tarjeta. Sin contratos. Solo los ángulos que tus anuncios necesitan.</p>
    </div>
  );
}

function ResultCard({ form, initialData, onComplete }) {
  const [data, setData] = useState(initialData || null);
  const [loading, setLoading] = useState(!initialData);
  const [err, setErr] = useState(false);
  useEffect(() => {
    if (initialData) return; // ya restaurado de localStorage: no volver a llamar a la API
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
        if (onComplete) onComplete(json);
      } catch (e) { setErr(true); } finally { setLoading(false); }
    })();
  }, []);
  const goDemo = () => { if (DEMO_URL) window.open(DEMO_URL, "_blank"); else alert("Configura NEXT_PUBLIC_DEMO_URL con tu link de agenda."); };

  return (
    <div className="cap-pop" style={{ background: "#fff", border: `1px solid ${C.border}`, borderRadius: 22, padding: 32, boxShadow: "0 1px 2px rgba(15,23,42,.04), 0 30px 60px -30px rgba(15,23,42,.2)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 18 }}>
        <span style={{ width: 22, height: 22, borderRadius: 6, background: `linear-gradient(135deg, ${C.violet}, ${C.blue})`, display: "grid", placeItems: "center", color: "#fff", fontSize: 12, fontWeight: 700 }}>A</span>
        <span style={{ fontWeight: 600, fontSize: 14, color: C.navy }}>Aria · tu análisis para {form.empresa}</span>
      </div>
      {loading && <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "48px 0", gap: 16 }}><span className="cap-spin" /><span style={{ color: C.slate, fontSize: 13.5 }}>Analizando tu producto y construyendo ángulos…</span></div>}
      {err && <p style={{ color: "#E11D48", fontSize: 14, padding: "20px 0" }}>Hubo un error generando el análisis. Recarga e intenta de nuevo.</p>}
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
            <div style={tableWrap}><table style={{ ...tableStyle, minWidth: 460 }}>
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
function Row({ children }) { return <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 13 }}>{children}</div>; }
function Field({ label, children }) { return <label style={{ display: "block" }}><span style={{ display: "block", fontSize: 12, color: C.slate, marginBottom: 6, fontWeight: 500 }}>{label}</span>{children}</label>; }
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

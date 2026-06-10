"use client";

import React from "react";
import { LeadMagnet } from "../components/lead-magnet";

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

// shared styles
const h2 = { fontSize: 30, fontWeight: 700, color: C.navy, margin: "14px 0 0", lineHeight: 1.2, letterSpacing: "-0.02em" };
const lead = { fontSize: 16.5, lineHeight: 1.6, color: C.slate, maxWidth: 620 };
const card = { background: C.bg, border: `1px solid ${C.border}`, borderRadius: 16, padding: 24 };
const pill = { display: "inline-block", fontSize: 12.5, fontWeight: 600, color: C.violet, background: "#F1EEFF", border: "1px solid #E5DEFF", padding: "6px 13px", borderRadius: 20 };
const btnPrimary = (fs, pad) => ({ border: "none", borderRadius: 12, background: `linear-gradient(135deg, ${C.violet}, ${C.blue})`, color: "#fff", fontWeight: 600, fontSize: fs, padding: pad, cursor: "pointer", fontFamily: "inherit" });
const btnGhost = (fs, pad) => ({ border: `1px solid ${C.border}`, borderRadius: 12, background: "#fff", color: C.navy, fontWeight: 600, fontSize: fs, padding: pad, cursor: "pointer", fontFamily: "inherit" });

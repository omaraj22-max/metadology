"use client";

import React, { useState } from "react";
import "./referrals.css";

// Landing de referidos. Importada de Claude Design ("Caperifai Startups Landing.dc.html",
// rediseño de sep-2026). Los props replican los del diseño: referredMode, partner,
// pricePiloto, priceLista, offerCondition. En /referrals se llenan desde el query string.

// Logo real de Caperifai (public/logo.png, 2672x449). `logo-mark.png` es solo el
// isotipo recortado y `logo-white.png` el lockup con el wordmark en blanco, porque
// el azul marino original desaparece sobre el footer oscuro.
const LOCKUP_RATIO = 2672 / 449;

/** Lockup horizontal completo. */
function Logo({ height = 28, white = false }) {
  return (
    /* eslint-disable-next-line @next/next/no-img-element */
    <img
      className="ref-logo-lockup"
      src={white ? "/logo-white.png" : "/logo.png"}
      alt="Caperifai"
      width={Math.round(height * LOCKUP_RATIO)}
      height={height}
      style={{ height, width: "auto" }}
    />
  );
}

/** Solo el isotipo — se usa como avatar de Aria. */
function Mark({ size = 28 }) {
  return (
    /* eslint-disable-next-line @next/next/no-img-element */
    <img
      className="ref-mark"
      src="/logo-mark.png"
      alt=""
      aria-hidden="true"
      width={size}
      height={size}
      style={{ width: size, height: size }}
    />
  );
}

// Mismos logos que el home de caperif.ai ("Creado por el equipo de:").
const LOGOS = [
  { src: "/logos-equipo/spotify.svg", alt: "Spotify", w: 397, h: 119 },
  { src: "/logos-equipo/amazon.svg", alt: "Amazon", w: 375, h: 113 },
  { src: "/logos-equipo/yaydoo.svg", alt: "Yaydoo", w: 447, h: 109 },
  { src: "/logos-equipo/huawei.svg", alt: "Huawei", w: 375, h: 83 },
  { src: "/logos-equipo/xepelin.svg", alt: "Xepelin", w: 473, h: 112 },
];

const KPIS = [
  { l: "Total Spend", n: "$2.45M", d: "↑ 12.5% vs últimos 30 días" },
  { l: "Total Pipeline", n: "$18.6M", d: "↑ 28.3% vs últimos 30 días" },
  { l: "ROAS", n: "4.32x", d: "↑ 18.7% vs últimos 30 días" },
];

const BARS = [
  { h: "38%", c: "#DDD7FF" },
  { h: "52%", c: "#DDD7FF" },
  { h: "44%", c: "#DDD7FF" },
  { h: "66%", c: "#C4B8FF" },
  { h: "58%", c: "#C4B8FF" },
  { h: "78%", c: "#8C74FF" },
  { h: "70%", c: "#8C74FF" },
  { h: "92%", c: "#5A3AFF" },
  { h: "84%", c: "#5A3AFF" },
];

const TOP_CAMPAIGNS = [
  ["US | Google Search | Brand", "$4.2M", "4.8x"],
  ["US | Meta | Prospecting", "$3.8M", "4.1x"],
  ["US | LinkedIn | Retargeting", "$2.9M", "3.9x"],
];

const PAINS = [
  {
    n: "Pain 01",
    t: "Cada plataforma te cuenta una historia distinta.",
    p: "Meta se cuelga 40 conversiones, Google se cuelga 35, y tu CRM registró 18 leads reales. ¿Cuál es la verdad? Nadie en la empresa lo sabe con certeza.",
  },
  {
    n: "Pain 02",
    t: "El presupuesto se sigue gastando aunque nadie esté viendo.",
    p: "Un anuncio con fatiga, una audiencia mal excluida, un conjunto que se comió el 70% del gasto. Cada día sin revisar es runway que se quema sin aviso.",
  },
  {
    n: "Pain 03",
    t: "Tu única persona de marketing se volvió operadora.",
    p: "Contrataste a alguien para pensar en crecimiento. Hoy pasa 15 horas a la semana exportando CSVs y armando reportes.",
  },
  {
    n: "Pain 04",
    t: "El consejo pregunta CAC y payback, y tú contestas con impresiones.",
    p: "No porque no sepas: porque la data para contestar bien está partida en seis herramientas.",
  },
  {
    n: "Pain 05",
    t: "Cotizaste una agencia y era más cara que un ingeniero.",
    p: "Retainer, fee sobre pauta, 12 meses de contrato — y cuando te vas, la data y el aprendizaje se quedan con ellos.",
  },
];

const NOT_CARDS = [
  { t: "No es un dashboard más", p: "Los dashboards te muestran el problema. Caperifai lo corrige." },
  {
    t: "No es un generador de copy",
    p: "Escribir anuncios es el 10% del trabajo. El otro 90% es decidir dónde va cada peso.",
  },
  {
    t: "No es una agencia con retainer",
    p: "No hay contrato de 12 meses ni fee sobre tu pauta. La plataforma es tuya.",
  },
  {
    t: "No te quita el control",
    p: "Nada se ejecuta sin tus reglas. Empiezas en modo Copilot: tú autorizas cada cambio.",
  },
];

const CONNECT_CHIPS = [
  "Sync en tiempo real",
  "Sin datos aislados",
  "Audiencias unificadas",
  "Attribution Hub",
  "Conexión segura",
];

const METERS = [
  { l: "Efectividad de anuncios", v: "78%", c: "#5A3AFF" },
  { l: "Atribución directa", v: "64%", c: "#2563EB" },
  { l: "Eficiencia de gasto", v: "91%", c: "#0F172A" },
];

const ARIA_ACTIONS = [
  { t: "Escalar presupuesto", d: "Reasignar +20% a alto ROAS." },
  { t: "Pausar anuncio", d: "Evitar ad waste activo." },
  { t: "Rotar creativos", d: "Prevenir fatiga publicitaria." },
];

const SIDE_AGENTS = [
  { name: "Neo", kind: "SEO", p: "Trabaja tu visibilidad orgánica para que no dependas al 100% de lo que pagas." },
  {
    name: "Nova",
    kind: "Contenido",
    p: "Produce y adapta piezas para tus canales con el contexto de tu marca y tus audiencias.",
  },
  {
    name: "Ada",
    kind: "Análisis",
    p: "Convierte la data cruda en reportes y lecturas listas para tu consejo o tu inversionista.",
  },
];

const BULLETS = [
  ["Revisa tu cuenta todos los días", " para que ningún anuncio quemado siga gastando tres semanas, ", "lo que significa que dejas de descubrir el error cuando ya te costó el mes."],
  ["Unifica la atribución de todos tus canales", " para que sepas de dónde salió cada cliente, ", "lo que significa que puedes contestar “¿cuál es nuestro CAC?” sin abrir seis pestañas."],
  ["Rebalancea el presupuesto hacia lo que convierte", " para que tu inversión se mueva sola hacia lo que funciona, ", "lo que significa más clientes con el mismo dinero."],
  ["Detecta fatiga creativa antes del desplome", " para que rotes a tiempo, ", "lo que significa que dejas de vivir en el ciclo de “iba increíble y de la nada se murió”."],
  ["Genera el reporte ejecutivo solo", " para que tu junta de consejo se prepare en minutos, ", "lo que significa que marketing deja de ser el área que nadie puede defender con números."],
  ["Aprende de tu historial completo de campañas", " para que cada mes decida mejor que el anterior, ", "lo que significa que el conocimiento se queda en tu empresa y no en la cabeza de quien renuncie."],
  ["Escala tu ejecución sin contratar", " para que tres personas rindan como un departamento, ", "lo que significa que metes tu siguiente hire en producto, no en operación."],
  ["Te entrega la plataforma funcionando", " para que no dependas de nadie, ", "lo que significa que lo que pagas construye un activo tuyo, no el de tu proveedor."],
];

const COMPARE = [
  ["Contratar growth in-house", "Nómina senior + prestaciones", "2–3 meses de rampa", "Una persona, 8 horas al día", "Depende de que no renuncie"],
  ["Agencia", "Retainer + fee sobre pauta", "4–6 semanas de onboarding", "Un ejecutivo con 8 cuentas más", "Nada: la data y el aprendizaje se quedan allá"],
  ["Stack de herramientas", "Suma de 4–6 suscripciones", "Inmediato", "Tú, otra vez", "Más pestañas, misma carga"],
];

const DAYS = [
  {
    label: "Días 1–2",
    t: "Conexión",
    p: "Conectas tus cuentas de anuncios, CRM y sitio. Caperifai ingiere tu historial completo de campañas.",
  },
  {
    label: "Días 3–7",
    t: "Diagnóstico",
    p: "Recibes la primera lectura real: dónde se está yendo el presupuesto, qué campañas sí atribuyen ingreso y qué está roto en tu medición.",
  },
  {
    label: "Semanas 2–3",
    t: "Copilot",
    p: "Aria empieza a proponerte acciones concretas todos los días. Tú apruebas las que quieras y ves el efecto.",
  },
  {
    label: "Semana 4",
    t: "Decisión",
    p: "Comparas contra tu línea base. Si te está haciendo ganar, pasas al piloto. Si no, cancelas y te llevas tu data.",
  },
];

const FAQ = [
  {
    q: "¿Sirve si mi presupuesto de pauta todavía es chico?",
    a: "Sí, y normalmente ahí pega más fuerte: mientras menos presupuesto tienes, más caro te sale cada peso mal asignado. Lo que sí necesitas es historial —campañas corriendo, aunque sean pocas— porque Aria aprende de tu data.",
  },
  {
    q: "¿Reemplaza a mi persona de marketing?",
    a: "No. La libera. Deja de exportar CSVs y armar reportes, y se dedica a ofertas, posicionamiento y canales nuevos.",
  },
  {
    q: "¿Qué pasa con mi agencia actual?",
    a: "Muchos equipos las conservan y usan Caperifai como capa de control: por primera vez pueden auditar con números qué está haciendo la agencia y exigir sobre datos, no sobre reportes.",
  },
  { q: "¿Qué plataformas conecta?", a: "[PLATAFORMAS — llenar antes de publicar]", placeholder: true },
  {
    q: "¿Cuánto tarda en ser útil?",
    a: "El diagnóstico llega en la primera semana. Las recomendaciones fuertes salen cuando ya digirió tu historial — por eso el piloto es de tres meses y no de tres semanas.",
  },
  {
    q: "¿Mis datos quedan seguros?",
    a: "La conexión es segura y los datos son tuyos. No se comparten ni se usan para entrenar el modelo de nadie más.",
  },
  {
    q: "¿Me quedo con algo si me voy?",
    a: "Al cerrar el piloto, la plataforma queda entregada y funcionando con tu contexto adentro.",
  },
  {
    q: "¿Necesito a un desarrollador para instalarlo?",
    a: "No. Conectar cuentas toma unos 15 minutos y es por permisos, no por código.",
  },
];

const CANALES = ["Meta", "Google", "TikTok", "LinkedIn", "Aún no invierto"];

export default function ReferralsView({
  partner = "[PARTNER]",
  partnerCode = "",
  referredMode = true,
  pricePiloto = "Precio preferencial",
  priceLista = "",
  offerCondition = "3 meses de precio especial",
  demoUrl = "",
}) {
  const eyebrow = referredMode
    ? `${partner} te recomendó Caperifai · acceso de 30 días activo`
    : "Caperifai for Startups";
  const offerHeadline = referredMode
    ? `30 días gratis porque ${partner} te mandó`
    : "30 días gratis, sin contrato de agencia";

  const [state, setState] = useState("idle"); // idle | sending | done
  const [error, setError] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    if (state === "sending") return;
    setError("");
    setState("sending");
    const fd = new FormData(e.currentTarget);
    const payload = {
      nombre: (fd.get("nombre") || "").toString().trim(),
      correo: (fd.get("correo") || "").toString().trim(),
      empresa: (fd.get("empresa") || "").toString().trim(),
      rol: (fd.get("rol") || "").toString(),
      etapa: (fd.get("etapa") || "").toString(),
      presupuesto: (fd.get("presupuesto") || "").toString(),
      canales: fd.getAll("canales").join(", "),
      problema: (fd.get("problema") || "").toString(),
      referido: (fd.get("referido") || "").toString().trim(),
      origen: typeof window !== "undefined" ? window.location.href : "/referrals",
    };
    try {
      const res = await fetch("/api/referrals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) throw new Error(data.error || "No se pudo enviar.");
      if (typeof window !== "undefined") {
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({ event: "lead_submit", form: "referrals", partner: payload.referido });
        if (typeof window.fbq === "function") window.fbq("track", "Lead");
      }
      setState("done");
    } catch (err) {
      setError(err?.message || "No se pudo enviar. Intenta de nuevo.");
      setState("idle");
    }
  }

  const demoProps = demoUrl ? { target: "_blank", rel: "noopener noreferrer" } : {};

  return (
    <div className="ref">
      {/* NAV */}
      <nav className="ref-nav">
        <div className="ref-nav-in">
          <a className="ref-brand" href="#" aria-label="Caperifai">
            <Logo height={30} />
          </a>
          <div className="ref-nav-links">
            <a href="#como-funciona">Cómo funciona</a>
            <a href="#agentes">Agentes</a>
            <a href="#precio">Planes</a>
          </div>
          <a href="#form" className="ref-btn ref-btn--primary ref-btn--nav">
            Empezar ahora
          </a>
        </div>
      </nav>

      {/* HERO */}
      <header className="ref-hero">
        <div className="ref-hero-in">
          <div className="ref-badge">
            <span />
            <span>{eyebrow}</span>
          </div>
          <h1 className="ref-h1">El equipo de growth que todavía no puedes contratar</h1>
          <p className="ref-hero-lede">
            Caperifai conecta tus canales, tu CRM y tu web en un solo cerebro, entiende qué está
            moviendo tu crecimiento y ejecuta los cambios en tus campañas todos los días. Tú
            apruebas. Él opera. Sin nómina nueva, sin retainer de 12 meses.
          </p>
          <div className="ref-cta-row">
            <a href="#form" className="ref-btn ref-btn--primary ref-btn--hero">
              Empezar gratis 30 días
            </a>
            <a href="#como-funciona" className="ref-btn ref-btn--outline ref-btn--hero2">
              Cómo funciona
            </a>
          </div>
          <p className="ref-reassure">
            Sin tarjeta. Conectas tus cuentas en 15 minutos. Si no te sirve, te vas y tu data se va
            contigo.
          </p>
          <div className="ref-statpills">
            <div className="ref-statpill">
              <b style={{ color: "#5A3AFF" }}>+40%*</b> en conversiones
            </div>
            <div className="ref-statpill">
              <b style={{ color: "#2563EB" }}>−65%*</b> de presupuesto desperdiciado
            </div>
            <div className="ref-statpill">
              <b style={{ color: "#0F172A" }}>+30%*</b> de ROAS
            </div>
          </div>
        </div>

        {/* PRODUCT SHOT */}
        <div className="ref-shot-out">
          <div className="ref-shot-frame">
            <div className="ref-shot">
              <div className="ref-shot-side">
                <div className="ref-shot-brand">
                  <Logo height={18} />
                </div>
                <div className="ref-shot-nav">
                  <span className="is-on">Overview</span>
                  <span>Campañas</span>
                  <span>Canales</span>
                  <span>Atribución</span>
                  <span>Automatización</span>
                  <span>Reportes</span>
                </div>
              </div>
              <div className="ref-shot-main">
                <div className="ref-shot-head">
                  <span>Marketing Overview</span>
                  <span className="ref-shot-range">Últimos 30 días</span>
                </div>
                <div className="ref-kpis">
                  {KPIS.map((k) => (
                    <div className="ref-kpi" key={k.l}>
                      <div className="ref-kpi-l">{k.l}</div>
                      <div className="ref-kpi-n">{k.n}</div>
                      <div className="ref-kpi-d">{k.d}</div>
                    </div>
                  ))}
                </div>
                <div className="ref-chartbox">
                  <div className="ref-chart-head">
                    <span>Pipeline over time</span>
                    <span>$18.6M</span>
                  </div>
                  <div className="ref-bars">
                    {BARS.map((b, i) => (
                      <div key={i}>
                        <i style={{ height: b.h, background: b.c }} />
                      </div>
                    ))}
                  </div>
                </div>
                <div className="ref-toptable">
                  <div className="ref-toprow ref-toprow--head">
                    <span>Top campañas</span>
                    <span>Spend</span>
                    <span>ROAS</span>
                  </div>
                  {TOP_CAMPAIGNS.map(([n, s, r]) => (
                    <div className="ref-toprow" key={n}>
                      <span>{n}</span>
                      <span>{s}</span>
                      <span>{r}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="ref-logos">
            <div className="ref-logos-label">Creado por el equipo de:</div>
            <div className="ref-logos-row">
              {LOGOS.map((l) => (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  key={l.alt}
                  className="ref-logo"
                  src={l.src}
                  alt={l.alt}
                  width={l.w}
                  height={l.h}
                  loading="lazy"
                />
              ))}
            </div>
          </div>
          <p className="ref-footnote">
            *Basado en referencias de la industria. Los resultados pueden variar.
          </p>
        </div>
      </header>

      {/* STATEMENT */}
      <section className="ref-statement">
        <div className="ref-wrap ref-wrap--1000">
          <h2>
            En una startup, el marketing no falla por falta de estrategia. Falla por falta de quien
            lo opere el martes a las 4 de la tarde.
          </h2>
          <p>
            La estrategia la tienes clara. El problema es que entre el release, la junta con
            inversionistas y el cliente que se está por ir, nadie entró a Ads Manager en nueve días.
            Las campañas siguieron gastando. Nadie las pausó. Nadie las escaló. Y el lunes, el
            reporte se arma a mano en un Sheet que ya nadie cree.
          </p>
        </div>
      </section>

      {/* PROBLEMA */}
      <section className="ref-sec--surface" style={{ borderBottom: "1px solid #E2E8F0" }}>
        <div className="ref-wrap">
          <div className="ref-pill ref-pill--onSurface">Problema</div>
          <h2 className="ref-h2 ref-h2--26">La realidad del marketing en una startup</h2>
          <p className="ref-lede" style={{ maxWidth: "62ch", marginBottom: 48 }}>
            Cinco cosas que pasan en todo equipo que invierte en pauta sin un sistema que la opere.
          </p>
          <div className="ref-grid ref-grid--300">
            {PAINS.map((x) => (
              <div className="ref-pain" key={x.n}>
                <div className="ref-pain-n">{x.n}</div>
                <h3>{x.t}</h3>
                <p>{x.p}</p>
              </div>
            ))}
            <div className="ref-pain ref-pain--cta">
              <h3>Quiero ver mi data unificada.</h3>
              <a href="#form" className="ref-btn ref-btn--invert ref-btn--card">
                Empezar gratis 30 días
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* SOLUCIÓN */}
      <section style={{ background: "#fff" }}>
        <div className="ref-wrap">
          <div className="ref-pill ref-pill--onWhite">Solución</div>
          <div className="ref-split">
            <h2 className="ref-h2">
              Marketing necesita un centro de inteligencia, no otra herramienta
            </h2>
            <div>
              <p className="ref-sol-body">
                Caperifai es un <strong>Marketing Neural Center</strong>: se conecta a tus cuentas
                publicitarias, tu CRM, tu sitio y tu analítica, y unifica todo en un solo modelo de
                tu negocio. Sobre ese modelo trabaja un equipo de agentes de IA que analiza tus
                campañas, detecta oportunidades y problemas antes de que escalen, y ejecuta los
                ajustes —presupuesto, pujas, audiencias, pacing, creativos— dentro de los límites que
                tú definas.
              </p>
              <p className="ref-sol-quote">
                En corto: conectas tus cuentas, y a partir de ahí tienes a alguien revisando y
                optimizando tu inversión todos los días, no cuando te acuerdas.
              </p>
            </div>
          </div>
          <div className="ref-grid ref-grid--250" style={{ marginTop: 52 }}>
            {NOT_CARDS.map((x) => (
              <div className="ref-notcard" key={x.t}>
                <h3>{x.t}</h3>
                <p>{x.p}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CÓMO FUNCIONA */}
      <section id="como-funciona" className="ref-sec--surface">
        <div className="ref-wrap ref-how-wrap">
          <div className="ref-pill ref-pill--onSurface" style={{ marginBottom: 0 }}>
            Cómo funciona
          </div>
          <h2 className="ref-h2" style={{ marginBottom: 20 }}>
            Conecta. Interpreta. Activa.
          </h2>

          <div className="ref-step">
            <div>
              <div className="ref-step-n">01</div>
              <h3>Conecta tu ecosistema</h3>
              <p>
                Integras canales, audiencias, CRM y sitio en una sola fuente de verdad. Se sincroniza
                en tiempo real, con atribución unificada, para que dejes de operar a ciegas por
                canal.
              </p>
              <p className="ref-step-note">Toma 15 minutos y no necesitas a un dev.</p>
            </div>
            <div className="ref-panel">
              <div className="ref-panel-t">Ecosistema unificado</div>
              <div className="ref-panel-s">4 de 4 canales sincronizados en tiempo real</div>
              <div className="ref-chips">
                {CONNECT_CHIPS.map((c) => (
                  <span className="ref-chip" key={c}>
                    {c}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="ref-step">
            <div>
              <div className="ref-step-n">02</div>
              <h3>Interpreta lo que sí importa</h3>
              <p>
                Analiza patrones, desempeño y señales de intención para separar lo que genera
                crecimiento de lo que solo genera fricción: efectividad real de anuncios, atribución
                directa y eficiencia de gasto.
              </p>
              <p className="ref-step-note">
                Sabes qué campaña te trae clientes y cuál te trae ruido.
              </p>
            </div>
            <div className="ref-panel ref-panel--bars">
              <div className="ref-panel-t" style={{ marginBottom: 0 }}>
                Desempeño y visibilidad
              </div>
              {METERS.map((m) => (
                <div key={m.l}>
                  <div className="ref-meter-head">
                    <span>{m.l}</span>
                    <b style={{ color: m.c }}>{m.v}</b>
                  </div>
                  <div className="ref-meter">
                    <i style={{ width: m.v, background: m.c }} />
                  </div>
                </div>
              ))}
              <div className="ref-minis">
                <div className="ref-mini">
                  <div className="ref-mini-l">ROAS</div>
                  <div className="ref-mini-n">+3.4x</div>
                </div>
                <div className="ref-mini">
                  <div className="ref-mini-l">CTR</div>
                  <div className="ref-mini-n">+40%</div>
                </div>
              </div>
            </div>
          </div>

          <div className="ref-step">
            <div>
              <div className="ref-step-n">03</div>
              <h3>Activa decisiones con IA</h3>
              <p>
                Convierte esa inteligencia en acciones priorizadas: rebalancear presupuesto, ajustar
                pujas, pausar lo que quema, escalar lo que rinde, rotar creativos antes de la fatiga.
              </p>
              <p className="ref-step-note">
                Tú autorizas con un clic — o dejas que se ejecuten solas bajo tus reglas.
              </p>
            </div>
            <div className="ref-aria">
              <div className="ref-aria-head">
                <Mark size={24} />
                <span className="ref-aria-name">Aria</span>
                <span className="ref-aria-role">· AI Copilot</span>
                <span className="ref-aria-tag">Copilot</span>
              </div>
              <div className="ref-aria-body">
                <p>
                  Hola, Mateo. Detectamos una oportunidad para transferir el{" "}
                  <strong>15% del presupuesto</strong> a los anuncios con mejor conversión.
                </p>
                <div className="ref-aria-actions">
                  <span className="ref-aria-btn ref-aria-btn--solid">Autorizar</span>
                  <span className="ref-aria-btn ref-aria-btn--ghost">Revisar</span>
                </div>
                <div className="ref-aria-list">
                  {ARIA_ACTIONS.map((a) => (
                    <div className="ref-aria-item" key={a.t}>
                      <b>{a.t}</b>
                      <span>{a.d}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* AGENTES */}
      <section id="agentes" className="ref-sec--white">
        <div className="ref-wrap">
          <div className="ref-pill ref-pill--onWhite">Agentes</div>
          <h2 className="ref-h2 ref-h2--28">
            Un equipo de agentes de IA trabajando sobre el mismo sistema de Growth
          </h2>
          <p className="ref-lede">
            Cada agente resuelve una parte clave de tu operación —performance, SEO, contenido y
            análisis— y todos leen la misma data. No son cuatro herramientas: es un equipo.
          </p>
          <div className="ref-grid ref-grid--320">
            <div className="ref-agent-main">
              <div className="ref-agent-head">
                <Mark size={30} />
                <span className="ref-agent-name">Aria</span>
                <span className="ref-agent-tag">Agente principal</span>
              </div>
              <div className="ref-agent-kind">Performance</div>
              <p>
                Mejora el rendimiento de tus canales de adquisición: analiza señales de performance,
                detecta ineficiencias y convierte tus objetivos en acciones sobre inversión,
                audiencias y pacing.
              </p>
              <ul className="ref-agent-list">
                <li>Analiza campañas, audiencias, presupuesto y señales de conversión.</li>
                <li>Detecta oportunidades, anomalías e ineficiencias antes de que escalen.</li>
                <li>Recomienda o ejecuta optimizaciones con límites claros.</li>
              </ul>
            </div>
            <div className="ref-agents-side">
              {SIDE_AGENTS.map((a) => (
                <div className="ref-agent-sm" key={a.name}>
                  <div className="ref-agent-sm-head">
                    <span className="ref-agent-sm-name">{a.name}</span>
                    <span className="ref-agent-sm-kind">{a.kind}</span>
                  </div>
                  <p>{a.p}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CONTROL */}
      <section className="ref-sec--surface ref-control">
        <div className="ref-wrap ref-wrap--1040">
          <h2>“¿Y si la IA se gasta mi presupuesto sola?”</h2>
          <div className="ref-grid ref-grid--280">
            <div className="ref-mode">
              <div className="ref-mode-tag ref-mode-tag--copilot">Copilot</div>
              <p>
                Caperifai detecta la oportunidad y te la propone. Nada se mueve hasta que tú das clic
                en autorizar. Así empieza el 100% de las cuentas.
              </p>
            </div>
            <div className="ref-mode">
              <div className="ref-mode-tag ref-mode-tag--autopilot">Autopilot</div>
              <p>
                Cuando ya viste que sus decisiones son mejores que las tuyas a las 11 de la noche,
                activas ejecución automática — con topes de presupuesto, reglas y checklist de
                lanzamiento definidos por ti.
              </p>
            </div>
          </div>
          <p className="ref-control-note">
            El paso de uno a otro lo decides tú, cuando quieras, campaña por campaña.
          </p>
        </div>
      </section>

      {/* BENEFICIOS */}
      <section className="ref-sec--white">
        <div className="ref-wrap">
          <h2 className="ref-h2 ref-h2--26" style={{ marginBottom: 44 }}>
            Lo que deja de pasar a partir del día uno
          </h2>
          <div className="ref-grid ref-grid--340">
            {BULLETS.map(([strong, mid, em]) => (
              <div className="ref-bullet" key={strong}>
                <span />
                <p>
                  <strong>{strong}</strong>
                  {mid}
                  <em>{em}</em>
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* COMPARATIVA */}
      <section className="ref-sec--surface">
        <div className="ref-wrap">
          <h2 className="ref-h2 ref-h2--28" style={{ marginBottom: 36 }}>
            Las cuatro salidas que tiene una startup, honestamente
          </h2>
          <div className="ref-table-scroll">
            <table className="ref-table">
              <thead>
                <tr>
                  <th>Opción</th>
                  <th>Costo mensual</th>
                  <th>Tiempo a resultados</th>
                  <th>Quién opera</th>
                  <th>Qué te queda</th>
                </tr>
              </thead>
              <tbody>
                {COMPARE.map((row) => (
                  <tr key={row[0]}>
                    <td className="is-name">{row[0]}</td>
                    <td>{row[1]}</td>
                    <td>{row[2]}</td>
                    <td className={row[0] === "Stack de herramientas" ? "is-strong" : undefined}>
                      {row[3]}
                    </td>
                    <td>{row[4]}</td>
                  </tr>
                ))}
                <tr className="is-us">
                  <td className="is-name">Caperifai</td>
                  <td className="is-price">1 Suscripción</td>
                  <td>15 min para conectar · 30 días para ver</td>
                  <td>Agentes + tu aprobación</td>
                  <td>Plataforma, data y modelo entrenado con tu negocio</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* 30 DÍAS */}
      <section className="ref-sec--white">
        <div className="ref-wrap">
          <h2 className="ref-h2" style={{ marginBottom: 44 }}>
            Qué pasa en tu prueba de 30 días
          </h2>
          <div className="ref-grid ref-grid--240">
            {DAYS.map((d) => (
              <div className="ref-day" key={d.label}>
                <div className="ref-day-label">{d.label}</div>
                <h3>{d.t}</h3>
                <p>{d.p}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* OFERTA */}
      <section id="precio" className="ref-sec--surface ref-offer">
        <div className="ref-wrap ref-wrap--1040">
          <h2 className="ref-h2">{offerHeadline}</h2>
          <div className="ref-offer-grid">
            <div className="ref-offer-a">
              <div className="ref-offer-n">01</div>
              <h3>30 días completamente gratis</h3>
              <p>
                Acceso total a la plataforma y a Aria. Conectas tus cuentas, corres el diagnóstico y
                operas en modo Copilot. Sin tarjeta.
              </p>
            </div>
            <div className="ref-offer-b">
              <div className="ref-offer-n">02</div>
              <h3>Piloto Caperifai a precio de startup</h3>
              <p>Tres meses para ver resultados reales, sin compromiso a largo plazo. Incluye:</p>
              <ul className="ref-offer-list">
                <li>Diagnóstico y entendimiento de todas tus campañas</li>
                <li>Estrategia y acompañamiento en la ejecución</li>
                <li>Entrenamiento progresivo de Aria con tu marca, audiencias y objetivos</li>
                <li>Reportes y sesiones de seguimiento</li>
                <li>
                  <strong>La plataforma entregada lista al cierre del piloto</strong> — Aria se queda
                  trabajando sola, con tu contexto adentro
                </li>
              </ul>
              <div className="ref-price">
                {priceLista ? <span className="ref-price-old">{priceLista}</span> : null}
                <span className="ref-price-now">{pricePiloto}</span>
              </div>
              <p className="ref-price-cond">{offerCondition}</p>
            </div>
          </div>
          <div className="ref-offer-cta">
            <a href="#form" className="ref-btn ref-btn--primary ref-btn--xl">
              Activar mis 30 días gratis
            </a>
          </div>
          <p className="ref-offer-risk">
            Lo único que arriesgas son 15 minutos de conexión: los primeros 30 días no cuestan nada y
            no piden tarjeta, el piloto son tres meses —no un año— y si decides salirte, tu data es
            tuya y se va contigo.
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section className="ref-sec--white ref-faq">
        <div className="ref-wrap ref-wrap--900">
          <h2 className="ref-h2">Preguntas que siempre nos hacen</h2>
          <div className="ref-faq-list">
            {FAQ.map((f) => (
              <details className="ref-faq-item" key={f.q}>
                <summary>
                  <span>{f.q}</span>
                  <span className="ref-faq-plus">+</span>
                </summary>
                <p className={f.placeholder ? "is-ph" : undefined}>{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* FORM */}
      <section id="form" className="ref-sec--surface">
        <div className="ref-form-in">
          <div>
            <h2 className="ref-h2">
              Tu pauta ya está corriendo. La pregunta es si alguien la está viendo.
            </h2>
            <p className="ref-form-lede">
              Activa tus 30 días gratis, conecta tus cuentas y en una semana tienes la primera
              lectura real de dónde se va tu presupuesto.
            </p>
            <div className="ref-form-row">
              <a href="#form" className="ref-btn ref-btn--primary ref-btn--hero2">
                Empezar ahora
              </a>
              <a
                href={demoUrl || "#form"}
                className="ref-btn ref-btn--outline ref-btn--hero2"
                {...demoProps}
              >
                Solicita tu demo
              </a>
            </div>
            <p className="ref-ps">
              <strong>P.S.</strong> Si llegaste hasta aquí es porque algo de esto te sonó conocido. La
              prueba no cuesta nada y no pide tarjeta — el único costo de posponerla es un mes más de
              pauta corriendo sin que nadie la revise.
            </p>
          </div>

          <div className="ref-formcard">
            {state === "done" ? (
              <div className="ref-thanks">
                <div className="ref-thanks-mark">✓</div>
                <h3>Listo, ya quedó registrado</h3>
                <p>
                  Te contactamos el mismo día hábil para conectar tus cuentas y arrancar tus 30 días.
                </p>
              </div>
            ) : (
              <>
                <h3>Activa tus 30 días</h3>
                <p>Aproximadamente 2 minutos.</p>
                <form className="ref-form" onSubmit={onSubmit}>
                  <label className="ref-field">
                    Nombre completo *
                    <input type="text" name="nombre" required disabled={state === "sending"} />
                  </label>
                  <label className="ref-field">
                    Email de trabajo *
                    <input type="email" name="correo" required disabled={state === "sending"} />
                  </label>
                  <label className="ref-field">
                    Nombre de tu startup *
                    <input type="text" name="empresa" required disabled={state === "sending"} />
                  </label>
                  <div className="ref-field-row">
                    <label className="ref-field">
                      Tu rol *
                      <select name="rol" required disabled={state === "sending"}>
                        <option>Founder</option>
                        <option>Growth o Marketing</option>
                        <option>Otro</option>
                      </select>
                    </label>
                    <label className="ref-field">
                      Etapa *
                      <select name="etapa" required disabled={state === "sending"}>
                        <option>Pre-seed</option>
                        <option>Seed</option>
                        <option>Serie A</option>
                        <option>Serie B+</option>
                      </select>
                    </label>
                  </div>
                  <label className="ref-field">
                    Presupuesto mensual de pauta (MXN) *
                    <select name="presupuesto" required disabled={state === "sending"}>
                      <option>0–20K</option>
                      <option>20K–50K</option>
                      <option>50K–100K</option>
                      <option>100K–500K</option>
                      <option>+500K</option>
                    </select>
                  </label>
                  <div className="ref-checks">
                    <span className="ref-checks-label">¿Dónde inviertes hoy? *</span>
                    <div className="ref-checks-row">
                      {CANALES.map((c) => (
                        <label className="ref-check" key={c}>
                          <input
                            type="checkbox"
                            name="canales"
                            value={c}
                            disabled={state === "sending"}
                          />
                          {c}
                        </label>
                      ))}
                    </div>
                  </div>
                  <label className="ref-field">
                    ¿Cuál es el dolor principal? *
                    <select name="problema" required disabled={state === "sending"}>
                      <option>No sé qué campaña me trae clientes</option>
                      <option>Siento que desperdicio presupuesto</option>
                      <option>Nadie tiene tiempo de operar la pauta</option>
                      <option>Dependo de una agencia</option>
                      <option>Necesito reportar resultados al consejo</option>
                    </select>
                  </label>
                  <label className="ref-field ref-field--ref">
                    Código de referido
                    <input
                      type="text"
                      name="referido"
                      defaultValue={partnerCode}
                      disabled={state === "sending"}
                    />
                  </label>
                  {error ? <p className="ref-form-error">{error}</p> : null}
                  <button type="submit" className="ref-submit" disabled={state === "sending"}>
                    {state === "sending" ? "Enviando…" : "Activar mis 30 días"}
                  </button>
                  <p className="ref-form-note">Sin tarjeta. Te contactamos el mismo día hábil.</p>
                </form>
              </>
            )}
          </div>
        </div>
      </section>

      {/* CIERRE */}
      <section className="ref-sec--white ref-close">
        <div className="ref-wrap ref-wrap--close">
          <h2>Impulsa tu rendimiento con IA, empieza hoy.</h2>
          <p>Mejores resultados, menos esfuerzo, sin más contrataciones.</p>
          <div className="ref-cta-row" style={{ marginBottom: 0 }}>
            <a href="#form" className="ref-btn ref-btn--primary ref-btn--hero">
              Empezar ahora
            </a>
            <a
              href={demoUrl || "#form"}
              className="ref-btn ref-btn--outline ref-btn--hero2"
              {...demoProps}
            >
              Solicita tu demo
            </a>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="ref-footer">
        <div className="ref-footer-in">
          <div className="ref-footer-brand">
            <Logo height={28} white />
          </div>
          <div className="ref-footer-links">
            <a href="#precio">Planes</a>
            <a href="#agentes">Agentes</a>
            <a href="#form">Contáctanos</a>
            <a href="/privacidad">Aviso de privacidad</a>
          </div>
          <span>© Caperifai {new Date().getFullYear()} · *Resultados basados en referencias de la industria.</span>
        </div>
      </footer>
    </div>
  );
}

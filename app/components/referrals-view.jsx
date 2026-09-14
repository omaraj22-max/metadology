"use client";

import React, { useState } from "react";
import "./referrals.css";

// Landing de referidos. Importada de Claude Design ("Caperifai Startups Landing.dc.html").
// Los props replican los del diseño: referredMode, partner, pricePiloto, priceLista,
// offerCondition. En la ruta /referrals se llenan desde el query string.

const PAINS = [
  {
    n: "01",
    t: "Cada plataforma te cuenta una historia distinta.",
    p: "Meta se cuelga 40 conversiones, Google se cuelga 35, y tu CRM registró 18 leads reales. ¿Cuál es la verdad? Nadie en la empresa lo sabe con certeza.",
  },
  {
    n: "02",
    t: "El presupuesto se sigue gastando aunque nadie esté viendo.",
    p: "Un anuncio con fatiga, una audiencia mal excluida, un conjunto que se comió el 70% del gasto. Cada día sin revisar es runway que se quema sin aviso.",
  },
  {
    n: "03",
    t: "Tu única persona de marketing se volvió operadora.",
    p: "Contrataste a alguien para pensar en crecimiento. Hoy pasa 15 horas a la semana exportando CSVs y armando reportes.",
  },
  {
    n: "04",
    t: "El consejo pregunta CAC y payback, y tú contestas con impresiones.",
    p: "No porque no sepas: porque la data para contestar bien está partida en seis herramientas.",
  },
  {
    n: "05",
    t: "Cotizaste una agencia y era más cara que un ingeniero.",
    p: "Retainer, fee sobre pauta, 12 meses de contrato — y cuando te vas, la data y el aprendizaje se quedan con ellos.",
  },
];

const NOT_CARDS = [
  { t: "No es un dashboard más", p: "Los dashboards te muestran el problema. Caperifai lo corrige." },
  {
    t: "No es un generador de copy con IA",
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

const STEPS = [
  {
    n: "01",
    t: "Conecta tu ecosistema",
    p: "Integras canales, audiencias, CRM y sitio en una sola fuente de verdad. Se sincroniza en tiempo real, con atribución unificada, para que dejes de operar a ciegas por canal.",
    note: "Toma 15 minutos y no necesitas a un dev.",
  },
  {
    n: "02",
    t: "Interpreta lo que sí importa",
    p: "Analiza patrones, desempeño y señales de intención para separar lo que genera crecimiento de lo que solo genera fricción: efectividad real de anuncios, atribución directa y eficiencia de gasto.",
    note: "El resultado: sabes qué campaña te trae clientes y cuál te trae ruido.",
  },
  {
    n: "03",
    t: "Activa decisiones",
    p: "Convierte esa inteligencia en acciones priorizadas: rebalancear presupuesto, ajustar pujas, pausar lo que quema, escalar lo que rinde, rotar creativos antes de la fatiga.",
    note: "Tú autorizas con un clic — o dejas que se ejecuten solas bajo tus reglas.",
  },
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
    color: "#5A3AFF",
    t: "Conexión",
    p: "Conectas tus cuentas de anuncios, CRM y sitio. Caperifai ingiere tu historial completo de campañas.",
  },
  {
    label: "Días 3–7",
    color: "#4A55F5",
    t: "Diagnóstico",
    p: "Recibes la primera lectura real: dónde se está yendo el presupuesto, qué campañas sí atribuyen ingreso y qué está roto en tu medición.",
  },
  {
    label: "Semanas 2–3",
    color: "#2563EB",
    t: "Copilot",
    p: "Aria empieza a proponerte acciones concretas todos los días. Tú apruebas las que quieras y ves el efecto.",
  },
  {
    label: "Semana 4",
    color: "#0090B0",
    borderColor: "#00A8CC",
    t: "Decisión",
    p: "Comparas contra tu línea base. Si te está haciendo ganar, pasas al piloto. Si no, cancelas y te llevas tu data.",
  },
];

const QUOTES = [
  {
    q: "“Lanzamos campañas muchísimo más rápido y optimizamos mejor la inversión de nuestros clientes. Es como escalar la operación sin necesidad de agrandar el equipo.”",
    name: "Francisco Leitao",
    role: "CEO, Portuñol Agency",
  },
  {
    q: "“Usar Caperifai se siente como multiplicar el equipo sin aumentar la nómina. Nos dio una capacidad operativa que simplemente no teníamos.”",
    name: "Carlos Franco",
    role: "CEO, Fyware",
  },
  {
    q: "“Lo que antes nos tomaba días, con Caperifai sucede en minutos.”",
    name: "Francisco López",
    role: "Marketing Director, Inc MTY",
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
  {
    q: "¿Qué plataformas conecta?",
    a: "[PLATAFORMAS — llenar antes de publicar]",
    placeholder: true,
  },
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
  referredMode = true,
  pricePiloto = "[PRECIO PILOTO]",
  priceLista = "[PRECIO LISTA]",
  offerCondition = "[CONDICIÓN: cupos / vigencia / etapa máxima]",
  demoUrl = "",
}) {
  const eyebrow = referredMode
    ? `${partner} te recomendó Caperifai. Tu acceso de 30 días ya está activo.`
    : "Caperifai for Startups";
  const offerHeadline = referredMode
    ? `Precio de startup, porque ${partner} te mandó`
    : "Precio de startup, sin contrato de agencia";

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

  return (
    <div className="ref">
      {/* NAV */}
      <nav className="ref-nav">
        <div className="ref-nav-in">
          <div className="ref-brand">
            <div className="ref-brand-mark" />
            <span className="ref-brand-name">Caperifai</span>
          </div>
          <div className="ref-nav-links">
            <a href="#como-funciona">Cómo funciona</a>
            <a href="#agentes">Los agentes</a>
            <a href="#precio">Precio para startups</a>
          </div>
          <a href="#form" className="ref-btn ref-btn--primary ref-btn--nav">
            Empezar gratis 30 días
          </a>
        </div>
      </nav>

      {/* HERO */}
      <header className="ref-hero">
        <div className="ref-hero-in">
          <div className="ref-hero-col">
            <div className="ref-badge">
              <span className="ref-badge-dot" />
              <span>{eyebrow}</span>
            </div>
            <h1 className="ref-h1">El equipo de growth que todavía no puedes contratar.</h1>
            <p className="ref-lede">
              Caperifai conecta tus canales, tu CRM y tu web en un solo cerebro, entiende qué está
              moviendo tu crecimiento y ejecuta los cambios en tus campañas todos los días. Tú
              apruebas. Él opera. Sin nómina nueva, sin retainer de 12 meses.
            </p>
            <div className="ref-cta-row">
              <a href="#form" className="ref-btn ref-btn--primary ref-btn--lg ref-btn--hero">
                Empezar gratis 30 días
              </a>
              <a href="#como-funciona" className="ref-btn ref-btn--ghost">
                Ver cómo funciona (4 min)
              </a>
            </div>
            <p className="ref-reassure">
              Sin tarjeta. Conectas tus cuentas en 15 minutos. Si no te sirve, te vas y tu data se va
              contigo.
            </p>
            <div className="ref-stats">
              <div className="ref-stat">
                <div className="ref-stat-n" style={{ color: "#5A3AFF" }}>
                  +40%<sup>*</sup>
                </div>
                <div className="ref-stat-l">en conversiones</div>
              </div>
              <div className="ref-stat">
                <div className="ref-stat-n" style={{ color: "#2563EB" }}>
                  −65%<sup>*</sup>
                </div>
                <div className="ref-stat-l">de presupuesto desperdiciado</div>
              </div>
              <div className="ref-stat">
                <div className="ref-stat-n" style={{ color: "#0F172A" }}>
                  +30%<sup>*</sup>
                </div>
                <div className="ref-stat-l">de ROAS</div>
              </div>
            </div>
            <p className="ref-footnote">
              *Basado en referencias de la industria. Los resultados pueden variar.
            </p>
            <div className="ref-logos">
              <div className="ref-logos-label">Creado por el equipo detrás de</div>
              <div className="ref-logos-row">
                <div className="ref-ph ref-ph--logo">logo 01</div>
                <div className="ref-ph ref-ph--logo">logo 02</div>
                <div className="ref-ph ref-ph--logo">logo 03</div>
              </div>
            </div>
          </div>

          {/* Hero visual: mock de Aria */}
          <div className="ref-hero-visual">
            <div className="ref-card-aria">
              <div className="ref-card-aria-head">
                <div className="ref-card-aria-mark" />
                <span className="ref-card-aria-name">Aria</span>
                <span className="ref-card-aria-role">· AI Copilot</span>
                <span className="ref-pill-copilot">Copilot</span>
              </div>
              <div className="ref-card-aria-body">
                <p>
                  Hola, Mateo. Detectamos una oportunidad para transferir el{" "}
                  <strong>15% del presupuesto</strong> a los anuncios con mejor conversión.
                </p>
                <div className="ref-aria-actions">
                  <span className="ref-aria-btn ref-aria-btn--solid">Autorizar</span>
                  <span className="ref-aria-btn ref-aria-btn--outline">Revisar</span>
                </div>
                <div className="ref-aria-list">
                  <div className="ref-aria-item">
                    <span className="ref-dot" style={{ background: "#5A3AFF" }} />
                    Subir presupuesto en Google Search Brand 20%
                  </div>
                  <div className="ref-aria-item">
                    <span className="ref-dot" style={{ background: "#2563EB" }} />
                    Pausar ad sets con fatiga en Meta Prospecting
                  </div>
                  <div className="ref-aria-item">
                    <span className="ref-dot" style={{ background: "#00D4FF" }} />
                    Expandir audiencia de LinkedIn Retargeting
                  </div>
                </div>
              </div>
            </div>
            <div className="ref-ph ref-ph--shot">
              <span>
                screenshot del Marketing Overview
                <br />
                (spend · pipeline · ROAS)
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* SHOCKING STATEMENT */}
      <section className="ref-dark ref-statement">
        <div className="ref-wrap ref-wrap--sm">
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

      {/* AGITACIÓN */}
      <section className="ref-agit">
        <div className="ref-wrap">
          <div className="ref-eyebrow">Si algo de esto te suena, estás en el lugar correcto</div>
          <h2 className="ref-h2 ref-h2--tight">
            Cinco cosas que pasan en toda startup que invierte en pauta
          </h2>
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
              <a href="#form" className="ref-btn ref-btn--invert">
                Empezar gratis 30 días
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* SOLUCIÓN */}
      <section>
        <div className="ref-wrap">
          <div className="ref-split">
            <div>
              <div className="ref-eyebrow">La solución</div>
              <h2>No es otro dashboard. Es la capa que decide y ejecuta.</h2>
            </div>
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
          <div className="ref-grid ref-grid--250" style={{ marginTop: 48 }}>
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
      <section id="como-funciona" className="ref-how">
        <div className="ref-wrap">
          <h2>Conecta. Interpreta. Activa.</h2>
          <div className="ref-grid ref-grid--290">
            {STEPS.map((x) => (
              <div className="ref-step" key={x.n}>
                <div className="ref-step-n">{x.n}</div>
                <h3>{x.t}</h3>
                <p>{x.p}</p>
                <p className="ref-step-note">{x.note}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AGENTES */}
      <section id="agentes" className="ref-dark ref-agents">
        <div className="ref-wrap">
          <h2>Un equipo de agentes trabajando sobre el mismo sistema</h2>
          <p className="ref-agents-lede">
            Cada agente resuelve una parte de tu operación y todos leen la misma data. No son cuatro
            herramientas: es un equipo.
          </p>
          <div className="ref-grid ref-grid--320">
            <div className="ref-agent-main">
              <div className="ref-agent-head">
                <div className="ref-agent-mark" />
                <span className="ref-agent-name">Aria</span>
                <span className="ref-agent-tag">Agente principal</span>
              </div>
              <div className="ref-agent-kind">Performance</div>
              <p>
                Analiza campañas, audiencias, presupuesto y señales de conversión. Detecta anomalías
                e ineficiencias antes de que escalen. Recomienda o ejecuta optimizaciones con lógica
                de performance y límites claros.
              </p>
              <div className="ref-agent-quote">
                <p>
                  “Hola, Mateo. Detectamos una oportunidad para transferir el 15% del presupuesto a
                  los anuncios con mejor conversión.”
                </p>
                <div>
                  <span className="ref-chip ref-chip--solid">Autorizar</span>
                  <span className="ref-chip ref-chip--outline">Revisar</span>
                </div>
              </div>
            </div>
            <div className="ref-agents-side">
              {SIDE_AGENTS.map((a) => (
                <div className="ref-agent-sm" key={a.name}>
                  <div className="ref-agent-sm-head">
                    <span className="ref-agent-sm-name">{a.name}</span>
                    <span className="ref-agent-kind" style={{ marginBottom: 0 }}>
                      {a.kind}
                    </span>
                  </div>
                  <p>{a.p}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CONTROL */}
      <section className="ref-control">
        <div className="ref-wrap ref-wrap--md">
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

      {/* BULLETS */}
      <section className="ref-bullets">
        <div className="ref-wrap">
          <h2 className="ref-h2 ref-h2--tight">Lo que deja de pasar a partir del día uno</h2>
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
      <section className="ref-compare">
        <div className="ref-wrap">
          <h2 className="ref-h2 ref-h2--wide" style={{ marginBottom: 36 }}>
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
                  <td className="is-price">{pricePiloto}</td>
                  <td>15 min para conectar · 30 días para ver</td>
                  <td>Agentes + tu aprobación</td>
                  <td>Plataforma, data y modelo entrenado con tu negocio</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* PRIMEROS 30 DÍAS */}
      <section className="ref-days">
        <div className="ref-wrap">
          <h2 className="ref-h2">Qué pasa en tu prueba de 30 días</h2>
          <div className="ref-grid ref-grid--240">
            {DAYS.map((d) => (
              <div className="ref-day" key={d.label} style={{ borderTopColor: d.borderColor || d.color }}>
                <div className="ref-day-label" style={{ color: d.color }}>
                  {d.label}
                </div>
                <h3>{d.t}</h3>
                <p>{d.p}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRUEBA */}
      <section className="ref-proof">
        <div className="ref-wrap">
          <h2 className="ref-h2">Equipos que ya operan así</h2>
          <div className="ref-grid ref-grid--280">
            {QUOTES.map((q) => (
              <figure className="ref-quote" key={q.name}>
                <blockquote>{q.q}</blockquote>
                <figcaption>
                  <strong>{q.name}</strong>
                  <br />
                  {q.role}
                </figcaption>
              </figure>
            ))}
            <figure className="ref-quote ref-quote--ph">
              <figcaption>
                [TESTIMONIAL STARTUP]
                <br />
                founder seed / Serie A —
                <br />
                pieza de mayor impacto en esta página
              </figcaption>
            </figure>
          </div>
          <div className="ref-metrics">
            <div className="ref-metric">
              <div className="ref-metric-n" style={{ color: "#5A3AFF" }}>
                [X]
              </div>
              <div className="ref-metric-l">horas ahorradas</div>
            </div>
            <div className="ref-metric">
              <div className="ref-metric-n" style={{ color: "#2563EB" }}>
                $[X]M
              </div>
              <div className="ref-metric-l">de pauta administrada</div>
            </div>
            <div className="ref-metric">
              <div className="ref-metric-n" style={{ color: "#0F172A" }}>
                [X]
              </div>
              <div className="ref-metric-l">campañas lanzadas</div>
            </div>
            <div className="ref-metric">
              <div className="ref-metric-n" style={{ color: "#0090B0" }}>
                [X]
              </div>
              <div className="ref-metric-l">equipos en piloto automático</div>
            </div>
          </div>
        </div>
      </section>

      {/* OFERTA */}
      <section id="precio" className="ref-dark ref-offer">
        <div className="ref-wrap ref-wrap--md">
          <h2>{offerHeadline}</h2>
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
              <p>
                Tres meses para ver resultados reales, sin compromiso a largo plazo. Incluye:
              </p>
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
                <span className="ref-price-old">{priceLista}</span>
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
        </div>
      </section>

      {/* RIESGO INVERTIDO */}
      <section className="ref-risk">
        <div className="ref-wrap ref-wrap--risk">
          <h2>Lo único que arriesgas son 15 minutos de conexión</h2>
          <p>
            Los primeros 30 días no cuestan nada y no piden tarjeta. El piloto son tres meses, no un
            año. Y si decides salirte, tu data es tuya y se va contigo.
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section className="ref-faq">
        <div className="ref-wrap ref-wrap--faq">
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

      {/* CTA FINAL + FORM */}
      <section id="form" className="ref-dark ref-final">
        <div className="ref-final-in">
          <div>
            <h2>Tu pauta ya está corriendo. La pregunta es si alguien la está viendo.</h2>
            <p className="ref-final-lede">
              Activa tus 30 días gratis, conecta tus cuentas y en una semana tienes la primera
              lectura real de dónde se va tu presupuesto.
            </p>
            <div className="ref-final-row">
              <a href="#form" className="ref-btn ref-btn--primary ref-btn--lg">
                Empezar gratis 30 días
              </a>
              <a
                href={demoUrl || "#form"}
                className="ref-btn ref-btn--onDark"
                {...(demoUrl ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              >
                Agendar demo de 15 min
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
                      defaultValue={partner}
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

      {/* FOOTER */}
      <footer className="ref-footer">
        <div className="ref-footer-in">
          <div className="ref-footer-brand">
            <div className="ref-footer-mark" />
            <span className="ref-footer-name">Caperifai</span>
          </div>
          <span>*Basado en referencias de la industria. Los resultados pueden variar.</span>
          <span>
            © {new Date().getFullYear()} Caperifai · <a href="/privacidad">Aviso de privacidad</a>
          </span>
        </div>
      </footer>
    </div>
  );
}

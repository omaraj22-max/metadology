"use client";

import { useEffect, useRef, useState } from "react";
import { OPTIONS } from "@/lib/temporada-icp";

// Número de WhatsApp del equipo (solo dígitos, con lada: 52155…). Si no está
// configurado, el botón de WhatsApp lleva al formulario en vez de abrir un chat vacío.
const WA_NUMBER = (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "").replace(/\D/g, "");
const WA_TEXT = "Hola, vi la campaña de temporada de Caperifai y quiero más clientes para mi negocio.";

const HERO_TILES = [
  ["01", "Posadas empresariales"],
  ["02", "Eventos especiales"],
  ["03", "Reuniones de fin de año"],
  ["04", "Y más eventos"],
];

const circle = (x, y, r) => `M${x - r} ${y}a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0 ${-2 * r} 0`;

const GIROS = [
  ["Banquetes y catering", "M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2M7 2v20M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"],
  ["Meseros y personal para eventos", "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" + circle(9, 7, 4) + "M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"],
  ["Salones y organización de eventos", "M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2ZM16 2v4M8 2v4M3 10h18"],
  ["Mobiliario, carpas e iluminación", "M3.5 21 14 3M20.5 21 10 3M15.5 21 12 15l-3.5 6M2 21h20"],
  ["Audio, DJ y entretenimiento", "M9 18V5l12-2v13" + circle(6, 18, 3) + circle(18, 16, 3)],
  ["Foto y video", "M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" + circle(12, 13, 3)],
  ["Decoración y ambientación", "M12 3l1.9 5.8L20 10.5l-6.1 1.7L12 18l-1.9-5.8L4 10.5l6.1-1.7zM19 3v4M21 5h-4"],
  ["Otros servicios", "M5 12h14M12 5v14"],
];

const STEPS = [
  ["Le hablamos a quien está organizando su evento.", "Empresas, organizadores, familias y planners que están buscando un servicio como el tuyo."],
  ["Creamos anuncios nuevos cada semana.", "Tu campaña no se cansa: cambiamos los creativos según la etapa de la temporada."],
  ["Te llegan leads con todo lo que necesitas para cotizar.", "Fecha del evento, número de personas, presupuesto aproximado y contacto directo."],
  ["Optimizamos diario y te reportamos cada semana.", "Ves cuántos leads llegaron, cuánto costó cada uno y qué está funcionando."],
];

const PLAN_LEAD = [
  "Pagas solo por los clientes que te piden cotización",
  "Lead calificado = fecha del evento, número de personas y presupuesto",
  "Tú validas cada lead en 48 horas",
  "Tope de 40 leads en la temporada",
];
const PLAN_FULL = [
  "Estrategia y campañas en Meta y Google",
  "Creativos nuevos cada semana",
  "Optimización diaria",
  "Reporte semanal y reporte final con propuesta para enero",
];

const FAQS = [
  ["¿Tengo que dejar a mi agencia actual?", "No. Esta es una campaña de temporada aparte. Puedes seguir con tu equipo o tu agencia en lo demás."],
  ["¿Cuánto tengo que invertir en anuncios?", "Mínimo $10,000 en la temporada con la campaña completa y $15,000 con pago por lead. Ese dinero va directo a Meta y Google, no a nosotros."],
  ["¿Qué es un lead calificado?", "Alguien que te pide cotización con fecha del evento, número de personas y un presupuesto aproximado. Si no cumple, no se cobra."],
  ["¿Cuándo arranca mi campaña?", "En cuanto nos des acceso a tus cuentas y los materiales de tu negocio. La temporada corre hasta el 6 de enero."],
  ["¿Qué necesito darles?", "Acceso a tu cuenta publicitaria, fotos o videos de tu servicio, tus paquetes o precios de referencia y a quién le llegan los leads."],
  ["¿Por qué hay cupos limitados?", "Porque cada campaña la operamos y optimizamos a diario. Para hacerlo bien tomamos pocos negocios por temporada."],
];

// Preguntas de calificación (ICP). Las opciones y la regla viven en lib/temporada-icp.js.
const SELECTS = [
  ["rol", "¿Cuál es tu puesto?"],
  ["pais", "¿Dónde opera tu empresa?"],
  ["giro", "Giro"],
  ["tamano", "Tamaño de la empresa"],
  ["canales", "¿Dónde te anuncias hoy?"],
  ["inversion", "Inversión mensual en anuncios (MXN)"],
  ["operador", "¿Quién opera tus campañas hoy?"],
  ["resultados", "¿Sabes cuánto te cuesta cada cliente que te traen tus anuncios?", true],
  ["medicion", "¿Puedes medir cuántos leads o ventas te dejan tus anuncios?", true],
];

const UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "gclid", "fbclid"];

function track(event, extra = {}) {
  try {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ event, ...extra });
  } catch {}
}

function fbq(...args) {
  try {
    if (typeof window.fbq === "function") window.fbq(...args);
  } catch {}
}

// Fuente legible para el Sheet: Google, Meta u otra, a partir de UTMs / click ids / referrer.
function detectFuente(p, ref) {
  const src = (p.utm_source || "").toLowerCase();
  if (p.gclid || /google|adwords|gads/.test(src)) return "Google";
  if (p.fbclid || /facebook|instagram|meta|^fb$|^ig$/.test(src)) return "Meta";
  if (src) return p.utm_source;
  if (/google\./.test(ref)) return "Google (orgánico)";
  if (/facebook\.|instagram\./.test(ref)) return "Meta (orgánico)";
  return ref ? "Referido" : "Directo";
}

function ChatIcon({ color }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
    </svg>
  );
}

export default function TemporadaView() {
  const [open, setOpen] = useState(0);
  const [plan, setPlan] = useState("");
  const [status, setStatus] = useState("idle"); // idle | sending | done
  const [error, setError] = useState("");
  const [showSticky, setShowSticky] = useState(false);
  const attribution = useRef({});
  const started = useRef(false);

  useEffect(() => {
    const qs = new URLSearchParams(window.location.search);
    const p = {};
    UTM_KEYS.forEach((k) => {
      const v = qs.get(k);
      if (v) p[k] = v;
    });
    // Conserva la atribución de la primera visita de la sesión aunque naveguen sin UTMs.
    try {
      const saved = JSON.parse(sessionStorage.getItem("cap_temporada_attr") || "null");
      if (!Object.keys(p).length && saved) Object.assign(p, saved);
      else sessionStorage.setItem("cap_temporada_attr", JSON.stringify(p));
    } catch {}
    attribution.current = { ...p, referrer: document.referrer || "", fuente: detectFuente(p, document.referrer || "") };

    // CTA fijo en celular: aparece al bajar y se esconde mientras el formulario está en pantalla.
    const onScroll = () => {
      const r = document.getElementById("formulario")?.getBoundingClientRect();
      const formVisible = r ? r.top < window.innerHeight && r.bottom > 0 : false;
      setShowSticky(window.innerWidth < 720 && window.scrollY > 500 && !formVisible);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  const scrollForm = () => {
    const el = document.getElementById("formulario");
    if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 80, behavior: "smooth" });
  };

  const pick = (p) => (e) => {
    e.preventDefault();
    setPlan(p);
    track("temporada_plan_click", { plan: p });
    scrollForm();
  };

  const openWhatsApp = (where) => (e) => {
    track("whatsapp_click", { placement: where });
    fbq("track", "Contact");
    if (!WA_NUMBER) {
      e.preventDefault();
      scrollForm();
    }
  };
  const waHref = WA_NUMBER ? `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(WA_TEXT)}` : "#formulario";

  const onFormFocus = () => {
    if (started.current) return;
    started.current = true;
    track("form_start", { form: "temporada" });
    fbq("trackCustom", "FormStart");
  };

  async function submit(e) {
    e.preventDefault();
    if (status === "sending") return;
    const fd = new FormData(e.currentTarget);
    const data = Object.fromEntries(fd.entries());
    setStatus("sending");
    setError("");
    try {
      const res = await fetch("/api/temporada", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, ...attribution.current, pagina: window.location.href }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.ok) throw new Error(json.error || "No pudimos enviar tus datos. Intenta de nuevo.");
      // Conversión (Pixel Lead + lead_submit para GTM/Google Ads) SOLO si el servidor
      // confirma que cumple el ICP. Los demás quedan en el Sheet, pero no alimentan a
      // los algoritmos de Meta/Google como si fueran clientes buenos.
      if (json.calificado) {
        track("lead_submit", { form: "temporada", icp: true, plan: data.modalidad, giro: data.giro });
        fbq("track", "Lead", { content_name: "temporada", content_category: data.modalidad });
      } else {
        track("temporada_lead_no_calificado", { form: "temporada", icp: false });
      }
      setStatus("done");
      scrollForm();
    } catch (err) {
      setError(err.message || "No pudimos enviar tus datos. Intenta de nuevo.");
      setStatus("idle");
    }
  }

  const reset = () => {
    setStatus("idle");
    setPlan("");
  };

  return (
    <div className="tp">
      <div className="tp-glow" aria-hidden="true" />
      <div className="tp-wrap">
        <header className="tp-nav">
          <img src="/logo.png" alt="Caperifai" className="tp-nav-logo" />
          <a href="#formulario" className="tp-btn tp-btn-sm">Quiero más clientes</a>
        </header>

        {/* 1 · Hero */}
        <section className="tp-hero">
          <div className="tp-hero-copy">
            <span className="tp-eyebrow-pill">PARA NEGOCIOS DE SERVICIOS</span>
            <h1 className="tp-h1">Más clientes para tu negocio esta temporada</h1>
            <p className="tp-lead">
              Hacemos y operamos tus campañas en Meta y Google para que te lleguen más cotizaciones en posadas, eventos y reuniones de fin de año.
            </p>
            <div className="tp-hero-cta">
              <a href="#formulario" className="tp-btn tp-btn-lg">
                Quiero más clientes <span aria-hidden="true">→</span>
              </a>
              <div className="tp-fine">Cupos limitados · Paga por lead calificado o por campaña completa</div>
            </div>
          </div>
          <div className="tp-hero-card">
            <div className="tp-hero-card-top">
              <span className="tp-hero-card-label">TEMPORADA DE FIN DE AÑO</span>
              <span className="tp-mint-pill"><span className="tp-dot" />Hasta el 6 de enero</span>
            </div>
            <div className="tp-tiles">
              {HERO_TILES.map(([n, label]) => (
                <div className="tp-tile" key={n}>
                  <span className="tp-tile-n">{n}</span>
                  <span className="tp-tile-label">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 2 · Problema */}
        <section className="tp-dark tp-problem">
          <h2 className="tp-h2-dark">
            Diciembre es tu temporada fuerte. <span className="tp-mint">¿Te están cotizando a ti?</span>
          </h2>
          <div className="tp-problem-body">
            <p>
              Posadas, cenas de fin de año, fiestas de empresa: en esta temporada se contratan cientos de servicios. Y el trabajo se lo queda el negocio que aparece cuando la gente está buscando a quién contratar.
            </p>
            <p className="tp-strong">Si tus campañas dan los mismos resultados de siempre, esta temporada puede ser distinta.</p>
          </div>
        </section>

        {/* 3 · Para quién es */}
        <section className="tp-section">
          <h2 className="tp-h2 tp-h2-narrow">Si tu negocio vive de cotizaciones, esto es para ti</h2>
          <div className="tp-giros">
            {GIROS.map(([label, icon]) => (
              <div className="tp-giro" key={label}>
                <span className="tp-giro-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#5A3AFF" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d={icon} />
                  </svg>
                </span>
                <span className="tp-giro-label">{label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* 4 · Cómo lo hacemos */}
        <section className="tp-section">
          <h2 className="tp-h2">Así te conseguimos más clientes</h2>
          <div className="tp-steps">
            {STEPS.map(([title, body], i) => (
              <div className="tp-step" key={title}>
                <span className="tp-step-n">{i + 1}</span>
                <h3 className="tp-step-title">{title}</h3>
                <p className="tp-step-body">{body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 5 · Precios */}
        <section className="tp-section">
          <div className="tp-section-head">
            <span className="tp-eyebrow">TÚ ELIGES CÓMO PAGAR</span>
            <h2 className="tp-h2">Dos formas de trabajar con nosotros</h2>
          </div>
          <div className="tp-plans">
            <div className="tp-plan tp-plan-lead">
              <div className="tp-plan-head">
                <h3 className="tp-plan-name">Pago por lead</h3>
                <span className="tp-plan-tag tp-plan-tag-light">PAGAS POR RESULTADO</span>
              </div>
              <div className="tp-plan-price">
                <div className="tp-price-row">
                  <span className="tp-price">$200</span>
                  <span className="tp-price-unit">+ IVA por lead calificado</span>
                </div>
                <div className="tp-price-sub">Arranque de $2,900 + IVA</div>
              </div>
              <ul className="tp-checks">
                {PLAN_LEAD.map((b) => (
                  <li key={b}><span className="tp-check tp-check-mint">✓</span><span>{b}</span></li>
                ))}
              </ul>
              <a href="#formulario" onClick={pick("Pago por lead")} className="tp-plan-btn tp-plan-btn-white">Quiero pagar por lead</a>
            </div>

            <div className="tp-plan tp-plan-full">
              <div className="tp-plan-head">
                <h3 className="tp-plan-name">Campaña completa</h3>
                <span className="tp-plan-tag tp-plan-tag-gray">PRECIO CERRADO</span>
              </div>
              <div className="tp-plan-price">
                <div className="tp-price-row">
                  <span className="tp-price">$12,900</span>
                  <span className="tp-price-unit tp-muted">+ IVA</span>
                </div>
                <div className="tp-price-sub tp-muted">Precio cerrado por toda la temporada</div>
              </div>
              <ul className="tp-checks tp-checks-light">
                {PLAN_FULL.map((b) => (
                  <li key={b}><span className="tp-check tp-check-violet">✓</span><span>{b}</span></li>
                ))}
              </ul>
              <a href="#formulario" onClick={pick("Campaña completa")} className="tp-plan-btn tp-plan-btn-ink">Quiero la campaña completa</a>
            </div>
          </div>
          <p className="tp-note">
            La inversión en anuncios se paga directo a Meta y Google: mínimo $10,000 en la temporada en campaña completa y $15,000 en pago por lead. Cupos limitados: operamos cada campaña a diario.
          </p>
        </section>

        {/* 6 · FAQ */}
        <section className="tp-faq">
          <h2 className="tp-h2">Preguntas frecuentes</h2>
          <div className="tp-faq-list">
            {FAQS.map(([q, a], i) => {
              const isOpen = open === i;
              return (
                <div className="tp-faq-item" key={q}>
                  <button
                    type="button"
                    className="tp-faq-q"
                    aria-expanded={isOpen}
                    aria-controls={`tp-faq-${i}`}
                    onClick={() => setOpen(isOpen ? -1 : i)}
                  >
                    <span>{q}</span>
                    <span className="tp-faq-sign" aria-hidden="true">{isOpen ? "−" : "+"}</span>
                  </button>
                  {isOpen && <p className="tp-faq-a" id={`tp-faq-${i}`}>{a}</p>}
                </div>
              );
            })}
          </div>
        </section>

        {/* 7 · Formulario */}
        <section id="formulario" className="tp-dark tp-form-section">
          <div className="tp-form-copy">
            <h2 className="tp-h2-dark">Quiero más clientes esta temporada</h2>
            <p className="tp-form-text">
              Déjanos tus datos y te contactamos por WhatsApp para platicar de tu campaña. <span className="tp-mint tp-strong-mint">Cupos limitados.</span>
            </p>
            <a href={waHref} target={WA_NUMBER ? "_blank" : undefined} rel="noopener noreferrer" onClick={openWhatsApp("form_side")} className="tp-btn-ghost">
              <ChatIcon color="#0EF3B5" />Escríbenos por WhatsApp
            </a>
          </div>

          {status !== "done" ? (
            <form className="tp-form" onSubmit={submit} onFocus={onFormFocus}>
              <label className="tp-field">Nombre<input name="nombre" required autoComplete="name" maxLength={120} /></label>
              <label className="tp-field">Empresa<input name="empresa" required autoComplete="organization" maxLength={120} /></label>
              <label className="tp-field">WhatsApp<input name="whatsapp" type="tel" required autoComplete="tel" inputMode="tel" placeholder="55 1234 5678" pattern="[0-9+()\s-]{8,20}" title="Escribe un número de 10 dígitos" /></label>
              <label className="tp-field">Correo<input name="correo" type="email" required autoComplete="email" maxLength={160} /></label>
              {SELECTS.map(([name, label, full]) => (
                <label className={full ? "tp-field tp-field-full" : "tp-field"} key={name}>{label}
                  <select name={name} required defaultValue="">
                    <option value="" disabled>Elige una opción</option>
                    {OPTIONS[name].map((o) => <option key={o} value={o}>{o}</option>)}
                  </select>
                </label>
              ))}
              <label className="tp-field">¿Cómo te gustaría trabajar?
                <select name="modalidad" required value={plan} onChange={(e) => setPlan(e.target.value)}>
                  <option value="" disabled>Elige una opción</option>
                  {OPTIONS.modalidad.map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
              </label>
              <label className="tp-field tp-field-full">
                <span>¿Algo que debamos saber? <span className="tp-optional">(opcional)</span></span>
                <textarea name="notas" rows={3} maxLength={1000} />
              </label>
              <div className="tp-form-foot">
                {error && <div className="tp-error" role="alert">{error}</div>}
                <button type="submit" className="tp-btn tp-btn-submit" disabled={status === "sending"}>
                  {status === "sending" ? "Enviando…" : "Quiero más clientes"}
                </button>
                <div className="tp-legal">
                  Al enviar aceptas que te contactemos por WhatsApp o correo. <a href="/privacidad" target="_blank" rel="noopener">Aviso de privacidad</a>
                </div>
              </div>
            </form>
          ) : (
            <div className="tp-done" role="status">
              <span className="tp-done-icon">✓</span>
              <h3 className="tp-done-title">¡Listo! Recibimos tus datos.</h3>
              <p className="tp-done-text">
                Alguien del equipo de Caperifai te va a escribir por WhatsApp en los próximos minutos para platicar de tu campaña de temporada.
              </p>
              <a href={waHref} target={WA_NUMBER ? "_blank" : undefined} rel="noopener noreferrer" onClick={openWhatsApp("thank_you")} className="tp-btn tp-btn-wa">
                <ChatIcon color="#fff" />Escríbenos por WhatsApp
              </a>
              <button type="button" onClick={reset} className="tp-link-btn">Enviar otra solicitud</button>
            </div>
          )}
        </section>

        <footer className="tp-footer">
          <img src="/logo.png" alt="Caperifai" className="tp-footer-logo" />
          <div className="tp-footer-links">
            <a href="/privacidad">Aviso de privacidad</a>
            <span>© 2026 Caperifai</span>
          </div>
        </footer>
      </div>

      {showSticky && status !== "done" && (
        <div className="tp-sticky">
          <a href="#formulario" className="tp-btn tp-sticky-btn">Quiero más clientes</a>
        </div>
      )}
    </div>
  );
}

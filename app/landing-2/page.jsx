"use client";

import React, { useEffect } from "react";
import "./landing2.css";
import { LeadMagnet } from "../components/lead-magnet";

export default function Landing2() {
  // Reveal on scroll
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      document.querySelectorAll(".reveal").forEach((el) => el.classList.add("in"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -24px 0px" }
    );
    document.querySelectorAll(".reveal").forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <>
      {/* NAV */}
      <nav className="nav">
        <div className="wrap nav-inner">
          <a href="/landing-2" className="nav-logo" aria-label="Caperifai inicio">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="Caperifai" style={{ height: 28, width: "auto", display: "block" }} />
          </a>
          <nav className="nav-links" aria-label="Menu principal">
            <a href="#problema">El problema</a>
            <a href="#funciona">Cómo funciona</a>
            <a href="#beneficios">Qué recibes</a>
          </nav>
          <a href="#cta" className="btn btn-primary btn-sm" style={{ whiteSpace: "nowrap" }}>
            <span className="nav-cta-full">Generar mis ángulos gratis</span>
            <span className="nav-cta-short">Probar gratis</span>
          </a>
        </div>
      </nav>

      {/* HERO */}
      <section className="hero">
        <div className="wrap">
          <div className="hero-grid">
            <div>
              <div className="hero-eyebrow">
                <span className="eyebrow-dot" aria-hidden="true"></span>
                <span>Para pymes que corren Meta Ads sin resultados</span>
              </div>

              <h1 className="t-display hero-h1">
                Tus anuncios no fallan<br />
                por el algoritmo.<br />
                <span className="grad-text">Fallan porque no le hablan a nadie.</span>
              </h1>

              <p className="t-body-lg hero-sub">
                Dile a Aria qué vendes. Ella te dice exactamente qué ángulo mueve a tu cliente, en dos minutos, sin contrato, sin tarjeta.
              </p>

              <div className="hero-actions">
                <a href="#cta" className="btn btn-primary">
                  Descubrir mis ángulos
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                    <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </a>
                <a href="#funciona" className="btn btn-outline">Ver cómo funciona</a>
              </div>

              <div className="hero-trust">
                <span className="trust-item">
                  <span className="trust-check" aria-hidden="true">
                    <svg width="9" height="9" viewBox="0 0 9 9" fill="none"><path d="M1.5 4.5L3.5 6.5L7.5 2.5" stroke="#2563EB" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  </span>
                  Sin tarjeta
                </span>
                <span className="trust-item">
                  <span className="trust-check" aria-hidden="true">
                    <svg width="9" height="9" viewBox="0 0 9 9" fill="none"><path d="M1.5 4.5L3.5 6.5L7.5 2.5" stroke="#2563EB" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  </span>
                  Sin contratos
                </span>
                <span className="trust-item">
                  <span className="trust-check" aria-hidden="true">
                    <svg width="9" height="9" viewBox="0 0 9 9" fill="none"><path d="M1.5 4.5L3.5 6.5L7.5 2.5" stroke="#2563EB" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  </span>
                  Resultado en 2 min
                </span>
              </div>
            </div>

            {/* Aria card */}
            <div className="aria-wrap">
              <div className="aria-card">
                <div className="aria-header">
                  <h3 style={{ fontFamily: "var(--font-display)", fontSize: "1.0625rem", fontWeight: 700, color: "var(--text-900)", letterSpacing: "-0.01em" }}>
                    Esto es lo que obtienes gratis
                  </h3>
                </div>

                <p className="aria-msg">
                  Análisis de tu negocio y <strong>4 ángulos</strong> que tus anuncios no están usando.
                </p>

                <ul className="angles-list" aria-label="Ángulos de venta">
                  <li className="angle-chip">
                    <span className="chip-temp cold">Frío</span>
                    <span className="chip-label">El que ya se cansó de la agencia</span>
                  </li>
                  <li className="angle-chip">
                    <span className="chip-temp cold">Frío</span>
                    <span className="chip-label">Estás pagando por adivinar</span>
                  </li>
                  <li className="angle-chip">
                    <span className="chip-temp warm">Medio</span>
                    <span className="chip-label">Tu competencia ya entendió a su cliente</span>
                  </li>
                  <li className="angle-chip">
                    <span className="chip-temp warm">Medio</span>
                    <span className="chip-label">Lo que tu reporte no te dice</span>
                  </li>
                </ul>

                <div className="method-row" aria-label="Metodología">
                  <span className="method-pill">Diversidad de ángulos</span>
                  <span className="method-pill">Entity IDs</span>
                  <span className="method-pill">Advantage+</span>
                  <span className="method-pill">Message match</span>
                </div>
              </div>

              <p style={{ fontSize: "0.75rem", color: "var(--text-400)", textAlign: "center", margin: "2px 0 0" }}>
                Resultado promedio que obtienen nuestros clientes*
              </p>
              <div className="metrics-row" aria-label="Resultados de referencia">
                <div className="metric-box">
                  <div className="metric-val green">4.3x</div>
                  <div className="metric-lbl">ROAS promedio</div>
                </div>
                <div className="metric-box">
                  <div className="metric-val red">-38%</div>
                  <div className="metric-lbl">Costo por lead</div>
                </div>
                <div className="metric-box">
                  <div className="metric-val blue">2 min</div>
                  <div className="metric-lbl">Para tu diagnóstico</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PROBLEMA */}
      <section id="problema" className="section sec-soft">
        <div className="wrap">
          <div className="problema-grid">
            <div>
              <div className="sec-header">
                <span className="t-label reveal">El diagnóstico que nadie te hace</span>
                <h2 className="t-h2 reveal" data-d="1">Cada mes sin el ángulo correcto estás financiando los experimentos de tu competencia.</h2>
              </div>
              <div className="problema-copy reveal" data-d="2">
                <p>Llevas meses corriendo campañas. Subes el presupuesto cuando baja el costo por clic, lo bajas cuando el CPM se dispara. Cambias la imagen, pruebas otro texto, ajustas la segmentación. El resultado no cambia.</p>
                <p>Lo que pasa es que ningún anuncio puede funcionar si no parte del problema real de quien lo ve. No del problema que tú crees que tiene tu cliente, el que él mismo no siempre sabe nombrar, pero que lo lleva a comprar.</p>
                <p><strong>Sin eso, da igual cuánto subas el presupuesto.</strong> Estás compitiendo en precio contra todos los demás que tampoco saben qué decir.</p>
              </div>
            </div>
            <div>
              <span className="t-label reveal" style={{ display: "block", marginBottom: "var(--s4)" }}>El ciclo del dolor</span>
              <ul className="pain-steps" aria-label="Ciclo de frustración">
                <li className="pain-step reveal" data-d="1">
                  <div className="pain-num" aria-hidden="true">01</div>
                  <div className="pain-content">
                    <h4>El reporte llega puntual</h4>
                    <p>Alcance, impresiones, flechas verdes. Abres tu cuenta de banco y los números no cuadran con ninguna de esas gráficas.</p>
                  </div>
                </li>
                <li className="pain-step reveal" data-d="2">
                  <div className="pain-num" aria-hidden="true">02</div>
                  <div className="pain-content">
                    <h4>Preguntas qué pasó</h4>
                    <p>El algoritmo. El periodo de aprendizaje. La estacionalidad. Siempre hay una razón que no puedes verificar. La mensualidad, esa sí es puntual.</p>
                  </div>
                </li>
                <li className="pain-step reveal" data-d="3">
                  <div className="pain-num" aria-hidden="true">03</div>
                  <div className="pain-content">
                    <h4>Pruebas otra cosa</h4>
                    <p>Otro creativo, otro freelancer, otra agencia. Sin el ángulo correcto, cualquier cambio es otra apuesta. Y las apuestas salen caras.</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* POLARIZACION */}
      <section className="section">
        <div className="wrap">
          <div className="sec-header">
            <span className="t-label reveal">Dos formas de hacer anuncios en Meta</span>
            <h2 className="t-h2 reveal" data-d="1" style={{ maxWidth: "22ch" }}>Una es adivinar. La otra es saber.</h2>
            <p className="t-body-lg reveal" data-d="2">La mayoría corre variaciones del mismo mensaje y espera que algo pegue. Meta premia al que conecta, al que le habla a una motivación específica con el ángulo exacto.</p>
          </div>
          <div className="polar-grid reveal" data-d="1">
            <div className="polar-card bad">
              <span className="polar-tag bad">Los que adivinan</span>
              <h3 className="t-h3">El mismo anuncio con distintas fotos</h3>
              <p>Compiten por precio en una subasta sin fondo. En el fondo dicen lo mismo en cada anuncio: cómprame. Y Meta los castiga con CPMs más altos.</p>
            </div>
            <div className="polar-card good">
              <span className="polar-tag good">Los que saben</span>
              <h3 className="t-h3">Un ángulo para cada motivación</h3>
              <p>Un ángulo distinto no es otra versión del anuncio: es hablarle a una razón diferente de compra. Eso es exactamente lo que Meta premia con menor costo por resultado.</p>
            </div>
          </div>
          <p className="polar-note reveal" data-d="2">Metadology es para los segundos. Si buscas optimizar lo que ya tienes sin cuestionarlo, esto no es para ti.</p>
        </div>
      </section>

      {/* BAB */}
      <section className="section sec-soft">
        <div className="wrap">
          <div className="sec-header">
            <span className="t-label reveal">Antes y después</span>
            <h2 className="t-h2 reveal" data-d="1" style={{ maxWidth: "24ch" }}>Hoy estás adivinando. En 2 minutos puedes saber exactamente qué decir.</h2>
          </div>
          <div className="bab-card reveal" data-d="1">
            <div className="bab-sides">
              <div className="bab-side">
                <span className="bab-tag before">Antes</span>
                <h3 className="t-h3">Cada campaña empieza desde cero</h3>
                <p>Pruebas creativos, cambias copys, esperas resultados. Nadie sabe con certeza qué ángulo mueve a tu cliente.</p>
              </div>
              <div className="bab-arrow" aria-hidden="true">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M4 10h12M12 6l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div className="bab-side">
                <span className="bab-tag after">Después</span>
                <h3 className="t-h3">Tienes un mapa</h3>
                <p>Sabes quién decide la compra. Qué miedo lo frena, qué aspiración lo empuja. Cada anuncio tiene un propósito claro. No estás adivinando.</p>
              </div>
            </div>
            <p className="bab-bridge"><strong>El puente es Aria.</strong> En un formulario corto le dices qué vendes y a quién. Ella cruza esa información con la metodología que Meta premia hoy y te regresa los ángulos que tus campañas necesitan.</p>
          </div>
        </div>
      </section>

      {/* COMO FUNCIONA */}
      <section id="funciona" className="section">
        <div className="wrap">
          <div className="sec-header">
            <span className="t-label reveal">El proceso</span>
            <h2 className="t-h2 reveal" data-d="1" style={{ maxWidth: "26ch" }}>Un formulario corto. Un diagnóstico real. Algo que puedes lanzar hoy.</h2>
          </div>
          <div className="steps-grid">
            <div className="step-card reveal">
              <div className="step-num" aria-hidden="true">1</div>
              <h3 className="t-h3">Le dices qué vendes</h3>
              <p>Tu producto, tu cliente, el problema que resuelves. Sin reuniones ni formularios interminables.</p>
            </div>
            <div className="step-card reveal" data-d="1">
              <div className="step-num" aria-hidden="true">2</div>
              <h3 className="t-h3">Aria hace el diagnóstico</h3>
              <p>Mapea quién decide la compra y por qué. Construye tu buyer persona real y diseña los ángulos que atacan motivaciones distintas.</p>
            </div>
            <div className="step-card reveal" data-d="2">
              <div className="step-num" aria-hidden="true">3</div>
              <h3 className="t-h3">Recibes tu plan listo</h3>
              <p>Buyer persona, 4-5 ángulos, hooks para los primeros 3 segundos y 2 anuncios completos. Listo para lanzar hoy, no teoría.</p>
            </div>
          </div>
        </div>
      </section>

      {/* BENEFICIOS */}
      <section id="beneficios" className="section sec-soft">
        <div className="wrap">
          <div className="sec-header">
            <span className="t-label reveal">Lo que entra a tu negocio</span>
            <h2 className="t-h2 reveal" data-d="1">Concreto. Sin teoría que nunca ejecutas.</h2>
          </div>
          <div className="bento-grid reveal" data-d="1">
            <div className="bc span-7 featured">
              <div className="bc-icon" aria-hidden="true">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <circle cx="10" cy="7" r="3" stroke="#2563EB" strokeWidth="1.5" />
                  <path d="M4 18c0-3.3 2.7-6 6-6s6 2.7 6 6" stroke="#2563EB" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </div>
              <h3 className="t-h3">Tu buyer persona de verdad</h3>
              <p>No &quot;hombres de 30 a 50 interesados en tu categoría&quot;. El perfil de quien toma la decisión de compra: qué lo mantiene frenado, qué lo activa, qué objeción tiene antes de pagar. Para que dejes de hablarle a todo el mundo.</p>
              <div className="bc-result">Cada peso pega donde importa</div>
            </div>

            <div className="bc span-5" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <div>
                <div className="t-stat grad-text" aria-label="4 a 5 ángulos">4-5</div>
                <h3 className="t-h3" style={{ marginTop: "var(--s3)" }}>Ángulos diferenciados</h3>
              </div>
              <p style={{ marginTop: "var(--s3)" }}>Cada uno apunta a una motivación distinta. Tu cliente no es una sola persona, es varios estados de ánimo que merecen mensajes distintos.</p>
            </div>

            <div className="bc span-4">
              <div className="bc-icon" aria-hidden="true">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M3 5h14M3 10h8M3 15h5" stroke="#2563EB" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </div>
              <h3 className="t-h3">Hooks de los primeros 3 segundos</h3>
              <p>La frase que detiene el scroll y filtra al cliente correcto. No al curioso, al que ya tiene el problema que tú resuelves.</p>
              <div className="bc-result">Enganchas a quien sí compra</div>
            </div>

            <div className="bc span-8">
              <div className="bc-icon" aria-hidden="true">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <rect x="3" y="4" width="14" height="12" rx="2" stroke="#2563EB" strokeWidth="1.5" />
                  <path d="M7 8h6M7 11.5h4" stroke="#2563EB" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </div>
              <h3 className="t-h3">2 anuncios completos listos para lanzar</h3>
              <p>Copy, titular, llamada a la acción y prompt de imagen. Algo que puedes poner a correr hoy, no un PDF de estrategia que termina en tu carpeta de descargas.</p>
              <div className="bc-result">Lanzas hoy, no mañana</div>
            </div>
          </div>
        </div>
      </section>

      {/* POR QUE GRATIS */}
      <section className="section">
        <div className="wrap">
          <div className="gratis-split">
            <div>
              <span className="t-label reveal" style={{ display: "block", marginBottom: "var(--s3)" }}>La pregunta obvia</span>
              <h2 className="t-h2 reveal" data-d="1" style={{ marginBottom: "var(--s6)" }}>¿Por qué gratis?</h2>
              <div className="gratis-copy reveal" data-d="2">
                <p>Porque la mayoría nunca ha visto cómo se ve esto bien hecho.</p>
                <p>No un reporte de métricas. No un &quot;análisis&quot; que es básicamente un copy-paste de tu brief. Un diagnóstico real de quién compra tu producto y por qué, con los ángulos específicos que tus campañas necesitan.</p>
                <p>Te lo mostramos sin que pongas un peso. Si te sirve, y te va a servir, ya sabes dónde estamos cuando quieras ir más lejos.</p>
                <p><strong>Lo único que cuesta seguir sin esto es lo que ya estás pagando cada mes en campañas que no convierten.</strong></p>
              </div>
              <a href="#cta" className="btn btn-primary reveal" data-d="3" style={{ marginTop: "var(--s8)" }}>
                Empezar ahora, es gratis
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </a>
            </div>

            <div className="cost-card reveal" data-d="1">
              <p className="cost-header">Lo que ya estás pagando por no saber</p>
              <div className="cost-row">
                <span className="cost-lbl">Mensualidad agencia</span>
                <span className="cost-val red">$15,000-$30,000</span>
              </div>
              <div className="cost-row">
                <span className="cost-lbl">Presupuesto quemado</span>
                <span className="cost-val red">Variable / mes</span>
              </div>
              <div className="cost-row">
                <span className="cost-lbl">Horas en reportes sin retorno</span>
                <span className="cost-val red">Sin resultado claro</span>
              </div>
              <div className="cost-row">
                <span className="cost-lbl">Diagnóstico de Aria</span>
                <span className="cost-val blue">Gratis. Ahora.</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA FINAL + FORMULARIO */}
      <section id="cta" className="sec-cta">
        <div className="wrap" style={{ position: "relative", zIndex: 1 }}>
          <h2 className="t-h2 cta-h2 reveal" style={{ maxWidth: "24ch", marginInline: "auto" }}>
            Deja de adivinar.<br />
            <span className="grad-text">Empieza a saber.</span>
          </h2>
          <p className="t-body-lg cta-sub reveal" data-d="1">
            Cada semana que corres campañas sin el ángulo correcto estás pagando el costo de no saber. Y ese costo, en publicidad, nunca para.
          </p>
          <div className="reveal" data-d="2" style={{ textAlign: "left", marginTop: "var(--s12)" }}>
            <LeadMagnet wrapped={false} />
          </div>
          <p className="cta-micro reveal" data-d="3" style={{ marginTop: "var(--s12)" }}>
            Metadology no es para el que busca que alguien más le resuelva la vida. Es para el que quiere entender su negocio y moverlo con criterio.
          </p>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="footer">
        <div className="wrap footer-inner">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="Caperifai" style={{ height: 24, width: "auto", display: "block" }} />
          <p className="footer-copy">2026 Caperifai. El copiloto de IA para tus campañas en Meta.</p>
          <nav className="footer-links" aria-label="Links de footer">
            <a href="#">Privacidad</a>
            <a href="#">Términos</a>
            <a href="mailto:hola@caperif.ai">Contacto</a>
          </nav>
        </div>
        <p className="wrap" style={{ marginTop: "var(--s4)", fontSize: "0.6875rem", lineHeight: 1.5, color: "var(--text-200)" }}>
          *Resultados obtenidos promedio, Aria no asegura ningún resultado y puede haber variabilidad por diferentes factores.
        </p>
      </footer>
    </>
  );
}

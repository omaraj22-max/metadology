"use client";

import React, { useEffect } from "react";
import "./caperifai-landing.css";
import { LeadMagnetLab } from "../components/lead-magnet-lab";

export default function Landing3Page() {
  // Reveal on scroll
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      document.querySelectorAll(".cfl3 .reveal").forEach((el) => el.classList.add("in"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    document.querySelectorAll(".cfl3 .reveal").forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  const copyPrompt = (e) => {
    const pre = e.currentTarget.closest(".ad-prompt")?.querySelector("pre");
    if (!pre) return;
    try {
      navigator.clipboard.writeText(pre.textContent || "");
      const btn = e.currentTarget;
      const prev = btn.textContent;
      btn.textContent = "Copiado ✓";
      setTimeout(() => { btn.textContent = prev; }, 1400);
    } catch (err) {}
  };

  return (
    <div className="cfl3">
      {/* NAV */}
      <header className="nav">
        <div className="wrap nav-in">
          <a className="logo" href="/" aria-label="Caperifai inicio">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="logo-img" src="/logo.png" alt="Caperifai" />
          </a>
          <nav className="nav-links">
            <a href="#problema">El problema</a>
            <a href="#funciona">Cómo funciona</a>
            <a href="#gratis">Qué te llevas gratis</a>
            <a href="#muestra">Ver una muestra real</a>
          </nav>
          <div className="nav-cta">
            <a href="#funciona" className="btn btn-ghost">Ver cómo funciona</a>
            <a href="#cta" className="btn btn-primary">
              <span className="nav-cta-full">Generar mis ángulos gratis</span>
              <span className="nav-cta-short">Probar gratis</span>
            </a>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="hero">
        <div className="wrap hero-grid">
          <div className="hero-copy">
            <span className="tag"><span className="dot"></span>Para pymes que corren Meta Ads y no ven el retorno</span>
            <h1>Tus anuncios no fallan por el algoritmo. <span className="grad-text">Fallan porque no le hablan a nadie.</span></h1>
            <p className="sub">Dile a Aria qué vendes y en 2 minutos te regresa tu buyer persona real, los ángulos que mueven a tu cliente y 2 anuncios completos listos para lanzar. Gratis, sin tarjeta. Tuyo aunque nunca vuelvas.</p>
            <div className="hero-cta">
              <a href="#cta" className="btn btn-primary btn-lg">Quiero mi diagnóstico gratis</a>
              <a href="#funciona" className="btn btn-ghost btn-lg">Ver cómo funciona</a>
            </div>
            <div className="trust">
              <span><span className="chk">✓</span>Sin tarjeta</span>
              <span><span className="chk">✓</span>Sin contratos</span>
              <span><span className="chk">✓</span>Lo tienes en 2 minutos</span>
            </div>
          </div>

          <div className="hero-visual">
            <div className="orb" aria-hidden="true"></div>
            <div className="dash">
              <div className="aria-bar">
                <span className="aria-avatar">A</span>
                <span className="aria-name">Aria</span>
                <span className="aria-sub">· tu análisis para Fernández</span>
              </div>
              <div className="deliv-head"><span className="dh-num">01</span><span className="dh-t">Tu cliente ideal</span></div>
              <div className="atable">
                <div className="arow"><span className="ak">Perfil</span><span className="av">Valentina M., buscadora espiritual autodidacta</span></div>
                <div className="arow"><span className="ak">Edad</span><span className="av">28-42</span></div>
                <div className="arow"><span className="ak">Dolor principal</span><span className="av">“Llevo años visualizando y repitiendo afirmaciones… y nada cambia. Siento que me falta algo.”</span></div>
                <div className="arow"><span className="ak">Objeción clave</span><span className="av">¿Esto es otro ebook genérico lleno de frases bonitas? Ya gasté en cursos que no funcionaron.</span></div>
              </div>
              <div className="dash-foot"><span className="fdot"></span>Generado en 2 min · vista previa del entregable real</div>
            </div>
          </div>
        </div>
      </section>

      {/* FREE VALUE */}
      <section className="free reveal" id="gratis">
        <div className="wrap">
          <div className="sec-head">
            <span className="eyebrow">No es una muestra recortada</span>
            <h2>Esto es lo que entra a tu negocio, sin pagar un peso.</h2>
            <p className="lead">Un plan que copias, pegas y pones a correr hoy. No teoría, no un reporte de métricas que ya tienes.</p>
          </div>

          <div className="free-cards">
            <div className="fcard">
              <div className="num">01</div>
              <h3>Buyer persona real</h3>
              <p>Quién saca la tarjeta: qué lo frena, qué lo activa y qué objeción tiene antes de pagar. No “hombres de 30 a 50”.</p>
            </div>
            <div className="fcard">
              <div className="num">02</div>
              <h3>Los ángulos que te faltan</h3>
              <p>Aria detecta varias motivaciones de compra distintas en tu mercado. En el diagnóstico te entrega 2, ya listos.</p>
              <div className="micro">Cada uno le habla a una razón distinta</div>
            </div>
            <div className="fcard">
              <div className="num">03</div>
              <h3>Hooks de los 3 segundos</h3>
              <p>La frase que detiene el scroll y filtra al curioso del que sí tiene el problema que resuelves.</p>
            </div>
            <div className="fcard">
              <div className="num">04</div>
              <h3>2 anuncios completos</h3>
              <p>Copy, titular, llamada a la acción y prompt de imagen. Algo que pones a correr hoy, no un PDF en descargas.</p>
              <div className="micro">Listos para lanzar</div>
            </div>
          </div>

          <div className="free-bridge">
            <p><b>Estos 2 ángulos y estos 2 anuncios son la primera parte de tu sistema.</b> Cuando los veas funcionando, el resto del mapa (todos tus ángulos y todos tus anuncios listos para montar) está a un paso. Pero eso lo decides después. Primero, llévate esto.</p>
            <a href="#cta" className="btn btn-primary">Generar mi diagnóstico gratis</a>
          </div>

          <div className="statband">
            <div className="stat"><div className="n">4.3x</div><div className="d">ROAS promedio*</div></div>
            <div className="stat"><div className="n">−38%</div><div className="d">costo por lead*</div></div>
            <div className="stat"><div className="n">2 min</div><div className="d">para tu diagnóstico</div></div>
          </div>
          <p className="statnote">*Resultado promedio de clientes. Aria no garantiza resultados; hay variabilidad por múltiples factores.</p>
        </div>
      </section>

      {/* SHOWCASE */}
      <section className="showcase reveal" id="muestra">
        <div className="wrap">
          <div className="sec-head center">
            <span className="eyebrow">Esto no es teoría. Esto es lo que recibes.</span>
            <h2>Una muestra real del diagnóstico que Aria entrega.</h2>
            <p className="lead">Tomado de un negocio real (un ebook de manifestación en LATAM). Tu cliente ideal, tus ángulos con hooks y un anuncio completo listo para copiar y pegar.</p>
          </div>

          <div className="show-stack">
            {/* 01 cliente ideal */}
            <div className="panel">
              <div className="panel-top">
                <div className="pt-l"><span className="pt-num">01</span><span className="pt-t">Tu cliente ideal</span></div>
                <span className="pt-tag">Buyer persona</span>
              </div>
              <div className="panel-body">
                <div className="atable" style={{ borderRadius: "var(--radius-sm)" }}>
                  <div className="arow"><span className="ak">Perfil</span><span className="av">Valentina M., buscadora espiritual autodidacta</span></div>
                  <div className="arow"><span className="ak">Edad</span><span className="av">28-42</span></div>
                  <div className="arow"><span className="ak">Rol / decisión</span><span className="av">Ella decide sola; siente el dolor a diario cuando ve que su vida no cambia a pesar de que “hace todo bien”.</span></div>
                  <div className="arow"><span className="ak">Dolor principal</span><span className="av">“Llevo años leyendo sobre la ley de atracción, visualizo, repito afirmaciones… y nada cambia. Siento que me falta algo o que no soy de las que logran manifestar.”</span></div>
                  <div className="arow"><span className="ak">Lo que desea</span><span className="av">Sentir que tiene el control de su vida, atraer lo que desea de verdad y dejar de vivir en modo supervivencia esperando que algo cambie.</span></div>
                  <div className="arow"><span className="ak">Objeción clave</span><span className="av">¿Esto es otro ebook genérico lleno de frases bonitas que no me da nada práctico? Ya gasté en cursos que no me funcionaron.</span></div>
                  <div className="arow"><span className="ak">Dónde alcanzarlo</span><span className="av">Instagram Reels y TikTok consumiendo contenido de bienestar y desarrollo personal; también en grupos de Facebook de mujeres emprendedoras.</span></div>
                </div>
              </div>
            </div>

            {/* 02 angulos */}
            <div className="panel">
              <div className="panel-top">
                <div className="pt-l"><span className="pt-num">02</span><span className="pt-t">Tus ángulos de venta</span></div>
                <span className="pt-tag">Con hooks de 0-3s</span>
              </div>
              <div className="panel-body">
                <table className="angles">
                  <thead><tr><th>Ángulo</th><th>Temp.</th><th>Dolor</th><th>Hooks (0-3s)</th></tr></thead>
                  <tbody>
                    <tr>
                      <td><div className="a-name">El paso que nadie te enseñó</div><div className="a-sub">No consciente del producto, sí del problema</div></td>
                      <td><span className="temp frio">frío</span></td>
                      <td className="a-pain">Hace todo lo que dicen los gurús y aun así no ve resultados concretos en su vida.</td>
                      <td className="a-hooks">
                        <div><span className="chev">›</span><span>Si visualizas todos los días y nada cambia, esto te explica por qué.</span></div>
                        <div><span className="chev">›</span><span>El 90% que practica la ley de atracción comete este error sin saberlo.</span></div>
                      </td>
                    </tr>
                    <tr>
                      <td><div className="a-name">La identidad que bloquea</div><div className="a-sub">Consciente del dolor emocional profundo</div></td>
                      <td><span className="temp frio">frío</span></td>
                      <td className="a-pain">En el fondo cree que “no es de las que tienen suerte” o que no merece más.</td>
                      <td className="a-hooks">
                        <div><span className="chev">›</span><span>¿Y si el problema no es tu técnica, sino lo que crees que mereces?</span></div>
                        <div><span className="chev">›</span><span>Tu mente tiene un techo invisible que cancela todo lo que manifiestas.</span></div>
                      </td>
                    </tr>
                    <tr>
                      <td><div className="a-name">Prueba real, no promesas</div><div className="a-sub">Consciente de soluciones; compara opciones</div></td>
                      <td><span className="temp medio">medio</span></td>
                      <td className="a-pain">Ya invirtió en cursos que la dejaron igual; desconfía de lo que suene a magia.</td>
                      <td className="a-hooks">
                        <div><span className="chev">›</span><span>Esto no es otro ebook de frases bonitas. Te explico qué lo hace diferente.</span></div>
                        <div><span className="chev">›</span><span>Miles de mujeres en LATAM ya manifestaron con este método. Aquí está la diferencia.</span></div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* 03 anuncio */}
            <div className="panel">
              <div className="panel-top">
                <div className="pt-l"><span className="pt-num">03</span><span className="pt-t">Anuncio completo</span></div>
                <span className="pt-tag">Copy + prompt de imagen</span>
              </div>
              <div className="panel-body">
                <div className="ad">
                  <div className="ad-meta"><span className="lbl">Anuncio 1</span><span className="ang">Ángulo: El paso que nadie te enseñó</span></div>
                  <h4 className="ad-title">¿Por qué no te funciona la manifestación?</h4>
                  <div className="ad-copy">
                    <p>Si visualizas todos los días y nada cambia, esto te explica por qué.</p>
                    <p>No es tu culpa. La mayoría de los métodos te enseñan la mitad del proceso y omiten el paso que activa la manifestación de verdad.</p>
                    <p>El Ebook de Manifestación de Fernández te muestra, de forma práctica y paso a paso, qué estás haciendo bien y qué debes ajustar para empezar a ver resultados reales, sin rituales complicados ni años de práctica.</p>
                    <p>Más de 5,000 mujeres en LATAM ya lo aplicaron. Tú puedes ser la siguiente.</p>
                  </div>
                  <div className="ad-link">→ Accede ahora antes de que suba el precio</div>
                  <div className="ad-prompt">
                    <div className="pp-top"><span className="pp-lbl">Prompt del estático</span><button type="button" className="pp-copy" onClick={copyPrompt}>Copiar</button></div>
                    <pre>Fotografía lifestyle premium, luz natural cálida y aireada, fondo blanco roto con destellos dorados suaves. En el centro, una mujer latina de unos 30-35 años sentada en un escritorio minimalista, mirando hacia arriba con expresión de revelación y calma, sosteniendo un journal abierto. Detrás, en tipografía gigante ghosted color dorado muy tenue, la palabra ‘MANIFESTAR’. En la parte inferior, titular baked-in en sans-serif moderna, negrita, color carbón: ‘¿Por qué no te funciona la manifestación?’ con la palabra ‘funciona’ resaltada en dorado.</pre>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <p className="show-note"><b>Esto es lo que recibes gratis</b>, con tu propio producto y tu propio cliente. Los primeros 2 ángulos y 2 anuncios, listos para lanzar hoy.</p>
          <div style={{ textAlign: "center", marginTop: 24 }}>
            <a href="#cta" className="btn btn-primary btn-lg">Quiero el mío, es gratis</a>
          </div>
        </div>
      </section>

      {/* PAIN / DIAGNOSIS */}
      <section className="reveal" id="problema">
        <div className="wrap">
          <div className="sec-head">
            <span className="eyebrow">El diagnóstico que nadie te hace</span>
            <h2>Cada mes sin el ángulo correcto, estás financiando los experimentos de tu competencia.</h2>
          </div>
          <div style={{ maxWidth: 760, marginBottom: 8 }}>
            <p style={{ fontSize: "16.5px", color: "var(--slate)", marginBottom: 16 }}>Llevas meses corriendo campañas. Subes el presupuesto cuando baja el costo por clic, lo bajas cuando el CPM se dispara. Cambias la imagen, pruebas otro texto, ajustas la segmentación. El resultado no se mueve.</p>
            <p style={{ fontSize: "16.5px", color: "var(--slate)", marginBottom: 16 }}>Ningún anuncio funciona si no parte del problema real de quien lo ve. No el que tú crees que tiene tu cliente: el que él mismo no sabe nombrar, pero que lo lleva a comprar.</p>
          </div>

          <div className="cycle">
            <div className="step"><div className="s-n">01</div><h4>El reporte llega puntual</h4><p>Alcance, impresiones, flechas verdes. Abres tu cuenta de banco y los números no cuadran con ninguna de esas gráficas.</p></div>
            <div className="step"><div className="s-n">02</div><h4>Preguntas qué pasó</h4><p>El algoritmo. El aprendizaje. La estacionalidad. Siempre hay una razón que no puedes verificar. La mensualidad, esa sí es puntual.</p></div>
            <div className="step"><div className="s-n">03</div><h4>Pruebas otra cosa</h4><p>Otro creativo, otro freelancer, otra agencia. Sin el ángulo correcto, cualquier cambio es otra apuesta. Y las apuestas salen caras.</p></div>
          </div>
          <p className="agita"><b>Sin eso, da igual cuánto subas el presupuesto.</b> Estás compitiendo por precio contra todos los que tampoco saben qué decir.</p>
        </div>
      </section>

      {/* COMPARE */}
      <section className="bg-soft reveal">
        <div className="wrap">
          <div className="sec-head">
            <span className="eyebrow">Dos formas de hacer anuncios en Meta</span>
            <h2>Una es adivinar. La otra es saber.</h2>
            <p className="lead">Meta premia al que conecta: al que le habla a una motivación específica con el ángulo exacto.</p>
          </div>
          <div className="compare">
            <div className="col bad">
              <div className="label">Los que adivinan</div>
              <h3>El mismo anuncio con distintas fotos</h3>
              <p>Compiten por precio en una subasta sin fondo. En el fondo, cada anuncio dice lo mismo: cómprame. Y Meta los castiga con CPMs más altos.</p>
            </div>
            <div className="col good">
              <div className="label">Los que saben</div>
              <h3>Un ángulo para cada motivación</h3>
              <p>Un ángulo distinto no es otra versión del anuncio: es hablarle a una razón de compra diferente. Eso es lo que Meta premia con menor costo por resultado.</p>
            </div>
          </div>
          <p className="flag">Caperifai es para los segundos. Si buscas solo retocar lo que ya tienes sin cuestionarlo, esto no es para ti.</p>
        </div>
      </section>

      {/* BEFORE / AFTER */}
      <section className="reveal">
        <div className="wrap">
          <div className="sec-head">
            <span className="eyebrow">Antes y después</span>
            <h2>Hoy estás adivinando. En 2 minutos puedes tener el mapa.</h2>
          </div>
          <div className="ba">
            <div className="b"><div className="tagn">Antes</div><h3>Cada campaña empieza desde cero</h3><p>Pruebas creativos, cambias copys, esperas. Nadie sabe con certeza qué ángulo mueve a tu cliente.</p></div>
            <div className="b after"><div className="tagn">Después</div><h3>Tienes un mapa</h3><p>Sabes quién decide la compra. Qué miedo lo frena, qué aspiración lo empuja. Cada anuncio tiene un propósito. Dejas de adivinar.</p></div>
          </div>
          <p className="bridge-line"><b>El puente es Aria.</b> En un formulario corto le dices qué vendes y a quién. Ella lo cruza con la metodología que Meta premia hoy y te regresa los ángulos que tus campañas necesitan, y los primeros 2 anuncios ya armados.</p>
        </div>
      </section>

      {/* PROCESS */}
      <section className="bg-soft reveal" id="funciona">
        <div className="wrap">
          <div className="sec-head">
            <span className="eyebrow">El proceso</span>
            <h2>Un formulario corto. Un diagnóstico real. Algo que lanzas hoy.</h2>
          </div>
          <div className="proc">
            <div className="pstep"><div className="pn">1</div><h4>Le dices qué vendes</h4><p>Tu producto, tu cliente, el problema que resuelves. Sin reuniones ni formularios eternos.</p></div>
            <div className="pstep"><div className="pn">2</div><h4>Aria hace el diagnóstico</h4><p>Mapea quién decide la compra y por qué. Construye tu buyer persona real y diseña ángulos que atacan motivaciones distintas.</p></div>
            <div className="pstep"><div className="pn">3</div><h4>Recibes tu plan listo</h4><p>Buyer persona, tus ángulos, hooks de los primeros 3 segundos y 2 anuncios completos. Para lanzar hoy, no teoría.</p></div>
          </div>
          <p className="seed">Y cuando quieras el set completo (todos los ángulos y todos los anuncios listos para montar), Aria ya lo tiene preparado para ti.</p>
        </div>
      </section>

      {/* DELIVERABLES */}
      <section className="reveal">
        <div className="wrap">
          <div className="sec-head">
            <span className="eyebrow">Lo que entra a tu negocio</span>
            <h2>Concreto. Sin teoría que nunca ejecutas.</h2>
          </div>
          <div className="deliv">
            <div className="dcard feature">
              <h3>Tu buyer persona de verdad</h3>
              <p>No “hombres de 30 a 50 interesados en tu categoría”. El perfil de quien toma la decisión: qué lo frena, qué lo activa, qué objeción tiene antes de pagar. Para que dejes de hablarle a todo el mundo.</p>
              <div className="foot">Cada peso pega donde importa</div>
            </div>
            <div className="dcard">
              <div className="big">2</div>
              <h3>Ángulos en acción</h3>
              <p>Cada uno apunta a una motivación distinta. Tu cliente es varios estados de ánimo que merecen mensajes distintos.</p>
              <div className="foot">Dejas de competir por precio</div>
            </div>
            <div className="dcard">
              <h3>Hooks de 3 segundos</h3>
              <p>La frase que detiene el scroll y filtra al cliente correcto. No al curioso: al que ya tiene el problema.</p>
              <div className="foot">Enganchas a quien sí compra</div>
            </div>
            <div className="dcard span2">
              <h3>2 anuncios completos, listos para lanzar</h3>
              <p>Copy, titular, llamada a la acción y prompt de imagen. Algo que pones a correr hoy, no un PDF que termina en tu carpeta de descargas.</p>
              <div className="foot">Lanzas hoy, no mañana</div>
            </div>
          </div>
        </div>
      </section>

      {/* WHY FREE */}
      <section className="why reveal">
        <div className="wrap inner">
          <span className="eyebrow">La pregunta obvia</span>
          <h2>¿Por qué te lo damos gratis?</h2>
          <p>Porque la mayoría nunca ha visto cómo se ve esto bien hecho.</p>
          <p>No un reporte de métricas. No un “análisis” que es tu mismo brief copiado y pegado. Un diagnóstico real de quién compra tu producto y por qué, con ángulos y anuncios que puedes lanzar hoy.</p>
          <p>Te entregamos la primera parte completa para que la veas funcionar con tu propio dinero. Si te sirve, y te va a servir, ya sabrás que el set completo está a un paso, el día que quieras montarlo todo.</p>
          <p className="big"><b>Lo único que cuesta seguir sin esto es lo que ya pagas cada mes en campañas que no convierten.</b></p>
          <a href="#cta" className="btn btn-primary btn-lg">Empezar ahora, es gratis</a>

          <div className="cost">
            <div className="cost-row"><span className="k">Mensualidad de agencia</span><span className="v">$15,000 a $30,000</span></div>
            <div className="cost-row"><span className="k">Presupuesto quemado</span><span className="v">Variable / mes</span></div>
            <div className="cost-row"><span className="k">Horas en reportes sin retorno</span><span className="v">Sin resultado claro</span></div>
            <div className="cost-row free-row"><span className="k">Diagnóstico de Aria</span><span className="v">Gratis. Ahora.</span></div>
          </div>
        </div>
      </section>

      {/* FINAL CTA + FORM */}
      <section className="final reveal" id="cta">
        <div className="wrap inner">
          <h2>Deja de adivinar. Empieza a vender.</h2>
          <p>Cada semana que corres campañas sin el ángulo correcto pagas el costo de no saber. Y ese costo, en publicidad, nunca para.</p>
          <p>Caperifai no es para quien busca que alguien más le resuelva la vida. Es para quien quiere entender su negocio y moverlo con criterio.</p>
        </div>
        <div className="wrap l3-form">
          <LeadMagnetLab wrapped={false} />
        </div>
      </section>

      {/* FOOTER */}
      <footer>
        <div className="wrap">
          <div className="foot-in">
            <a className="logo" href="/" aria-label="Caperifai inicio">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className="logo-img" src="/logo.png" alt="Caperifai" />
            </a>
            <nav className="foot-links">
              <a href="/privacidad">Privacidad</a>
              <a href="/terminos">Términos</a>
              <a href="mailto:hola@caperif.ai">Contacto</a>
            </nav>
          </div>
          <p className="legal">2026 Caperifai · El copiloto de IA para tus campañas en Meta. *Resultados promedio. Aria no asegura ningún resultado; puede haber variabilidad por distintos factores.</p>
        </div>
      </footer>
    </div>
  );
}

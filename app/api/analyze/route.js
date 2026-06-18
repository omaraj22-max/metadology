import Anthropic from "@anthropic-ai/sdk";

export const runtime = "nodejs";
export const maxDuration = 120; // Fluid Compute activo permite más margen (Hobby: hasta 300s)

// URL del Web App de Apps Script (Sheet). La env var tiene prioridad; si no está
// configurada en Vercel, usamos este fallback para que los leads SIEMPRE se registren.
const SHEET_URL =
  process.env.APPS_SCRIPT_URL ||
  process.env.NEXT_PUBLIC_WEBHOOK_URL ||
  "https://script.google.com/macros/s/AKfycbyzmGS0QC27C9WNsaD7rKmEebPnQSGIA0TS6YXBIzFdmOCPqPZR2fFLE0h6iNgvF-JU/exec";

// ¿El correo ya generó un análisis antes? (revisión contra el Sheet)
// Fail-open: si el Sheet no responde, NO bloqueamos (no romper el producto por una caída).
async function sheetFetch(body, ms) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  try {
    return await fetch(SHEET_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      redirect: "follow",
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timer);
  }
}

async function emailAlreadyUsed(correo) {
  if (!SHEET_URL || !correo) return false;
  try {
    const res = await sheetFetch({ action: "check", correo }, 8000);
    if (!res.ok) return false;
    const json = await res.json();
    return json && json.used === true;
  } catch (e) {
    return false;
  }
}

// Registra el lead en el Sheet (con dedup del lado de Apps Script).
async function recordLead(form) {
  if (!SHEET_URL) return;
  try {
    await sheetFetch({ action: "lead", ...form, fecha: new Date().toISOString() }, 8000);
  } catch (e) {
    // registrar no debe romper la respuesta del análisis
  }
}

// ===== Apify · Facebook Ads Library (análisis competitivo) =====
const APIFY_TOKEN = process.env.APIFY_TOKEN || "";
const APIFY_ACTOR = "automation-lab~facebook-ads-library";

// Trae hasta 10 anuncios activos de la competencia (México) para el nicho del producto.
// Fail-soft: si no hay token o falla, devuelve [] y el análisis competitivo se omite.
async function fetchCompetitorAds(producto) {
  if (!APIFY_TOKEN || !producto) return [];
  const controller = new AbortController();
  // Timeout ajustado para dejar margen al análisis competitivo dentro del límite de Vercel (60s Hobby).
  const timer = setTimeout(() => controller.abort(), 35000);
  try {
    const res = await fetch(
      `https://api.apify.com/v2/acts/${APIFY_ACTOR}/run-sync-get-dataset-items?token=${APIFY_TOKEN}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          searchQueries: [String(producto).slice(0, 80)],
          country: "MX",
          activeStatus: "active",
          mediaType: "all",
          maxAds: 10,
        }),
        signal: controller.signal,
      }
    );
    if (!res.ok) return [];
    const items = await res.json();
    if (!Array.isArray(items)) return [];
    const clean = items
      .map((it) => ({
        pagina: it.pageName || "",
        inicio: it.startDate || "",
        activo: it.isActive !== false,
        titulo: it.title || "",
        copy: String(it.bodyText || "").slice(0, 400),
        cta: it.ctaText || "",
        link: it.adLibraryUrl || "",
        plataformas: Array.isArray(it.platforms) ? it.platforms : [],
      }))
      .filter((a) => a.copy || a.titulo);
    // Más antiguos primero = los que llevan más tiempo corriendo (probables ganadores)
    clean.sort((a, b) => (a.inicio || "9999").localeCompare(b.inicio || "9999"));
    return clean.slice(0, 10);
  } catch (e) {
    return [];
  } finally {
    clearTimeout(timer);
  }
}

function competitiveSystem(ads, { producto, problema }) {
  const adsText = ads
    .map(
      (a, i) =>
        `#${i + 1} [${a.pagina || "anunciante"}, activo desde ${a.inicio || "n/d"}] ${
          a.titulo ? a.titulo + " — " : ""
        }${a.copy}`
    )
    .join("\n");
  return `Eres Aria, estratega de Caperifai. Te paso anuncios REALES de la competencia en Meta (México) para el nicho "${producto}", ordenados del más antiguo al más nuevo. Los más antiguos llevan más tiempo corriendo, así que probablemente son ganadores que ya pasaron la prueba del mercado.

ANUNCIOS DE LA COMPETENCIA:
${adsText}

Cliente: vende "${producto}"; resuelve "${problema}".

TAREA: Devuelve ÚNICAMENTE JSON válido (sin markdown, sin backticks):
{
  "resumen": "1-2 líneas: qué patrón se repite en la competencia y qué te dice",
  "saturado": ["mensaje/ángulo que ya usan varios (evítalo o supéralo)", "..."],
  "oportunidades": ["hueco que nadie ataca y el cliente sí puede explotar", "..."]
}
Sé concreto y accionable. Español LATAM cercano. 3-4 ítems máximo por lista.`;
}

// Descarga una imagen y la devuelve como bloque base64 para Claude (visión). Falla suave.
async function toImageBlock(url) {
  if (!url || !/^https?:\/\//i.test(url)) return null;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 6000);
  try {
    const res = await fetch(url, { signal: controller.signal, headers: { "User-Agent": "Mozilla/5.0" } });
    if (!res.ok) return null;
    const ct = (res.headers.get("content-type") || "").split(";")[0].trim();
    if (!["image/jpeg", "image/png", "image/gif", "image/webp"].includes(ct)) return null;
    const buf = Buffer.from(await res.arrayBuffer());
    if (!buf.length || buf.length > 4_500_000) return null; // límite ~5MB de Anthropic
    return { type: "image", source: { type: "base64", media_type: ct, data: buf.toString("base64") } };
  } catch (e) {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

// Junta el "moodboard" de la marca del usuario: logo, og:image e imágenes destacadas del sitio.
// Devuelve una lista de URLs candidatas (luego toImageBlock valida cada una).
async function fetchSiteVisuals(link) {
  if (!link || !/^https?:\/\//i.test(link)) return [];
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 7000);
  try {
    const res = await fetch(link, { signal: controller.signal, headers: { "User-Agent": "Mozilla/5.0" } });
    if (!res.ok) return [];
    const base = res.url || link;
    const html = (await res.text()).slice(0, 300000);
    const urls = [];
    const push = (u) => {
      if (!u) return;
      u = u.trim();
      if (!u || u.startsWith("data:")) return;
      try { u = new URL(u, base).href; } catch (e) { return; }
      if (/\.svg(\?|$)/i.test(u)) return; // Claude no soporta SVG
      if (!urls.includes(u)) urls.push(u);
    };
    // og/twitter image
    let m = html.match(/<meta[^>]+(?:property|name)=["'](?:og:image|twitter:image)["'][^>]+content=["']([^"']+)["']/i);
    if (m) push(m[1]);
    // logo / apple-touch-icon
    m = html.match(/<link[^>]+rel=["'][^"']*apple-touch-icon[^"']*["'][^>]+href=["']([^"']+)["']/i);
    if (m) push(m[1]);
    // <img> del sitio: prioriza los que parecen logo, luego los primeros destacados
    const logos = [];
    const others = [];
    const imgRe = /<img\b[^>]*>/gi;
    let im;
    let n = 0;
    while ((im = imgRe.exec(html)) && n < 50) {
      n++;
      const tag = im[0];
      const src = (tag.match(/\bsrc=["']([^"']+)["']/i) || [])[1] || (tag.match(/\bdata-src=["']([^"']+)["']/i) || [])[1];
      if (!src) continue;
      if (/logo/i.test(tag)) logos.push(src);
      else others.push(src);
    }
    logos.slice(0, 1).forEach(push);
    others.slice(0, 3).forEach(push);
    return urls.slice(0, 4);
  } catch (e) {
    return [];
  } finally {
    clearTimeout(timer);
  }
}

function adsReference(selectedAds) {
  if (!selectedAds || !selectedAds.length) return "";
  const list = selectedAds
    .map(
      (a, i) =>
        `#${i + 1} [${a.pagina || "anunciante"}${a.inicio ? ", desde " + a.inicio : ""}] ${
          a.titulo ? a.titulo + " — " : ""
        }${a.copy || ""}`
    )
    .join("\n");
  return `

REFERENCIA DE LA COMPETENCIA: el usuario seleccionó estos anuncios de su competencia que le gustaron (su copy abajo). La DIRECCIÓN VISUAL de los prompts la tomas de las IMÁGENES de referencia adjuntas; aquí enfócate en DIFERENCIAR el mensaje y el ángulo del cliente (no copies su copy). Supéralos.
ANUNCIOS DE REFERENCIA (copy):
${list}`;
}

function promptFieldInstruction(visualRefs) {
  if (visualRefs) {
    return `prompt self-contained para generar el estático. La DIRECCIÓN VISUAL debe combinar: (a) el MOODBOARD de la marca del cliente —paleta, tipografía, estilo y mood que infieres del logo e imágenes de su sitio adjuntas— y (b) el formato/composición de los anuncios de la competencia que eligió. El estático debe verse ON-BRAND (con la identidad del cliente) y a la altura de esos anuncios, adaptado al mensaje del cliente (no copies sus textos). Describe la escena/composición, la paleta exacta, la tipografía y el titular, e incluye TODO el texto que va baked-in entre comillas tal cual. Cierra con: No inventes textos extra.`;
  }
  return `prompt self-contained para generar el estático: escena fotográfica premium (NO vector plano, NO fondo oscuro salvo marca), luminoso y aireado; describe la composición, la palabra-fantasma gigante ghosted de fondo si aplica, el titular limpio con keyword en color de acento, y TODO el texto que va baked-in entre comillas tal cual. Cierra con: No inventes textos extra.`;
}

function buildSystem({ producto, empresa, problema, link }, selectedAds, visualRefs) {
  return `Eres Aria, el copiloto de IA de Caperifai, operando con la metodología METADOLOGY ADS para campañas de Meta.

PREMISA CENTRAL: Meta premia darle a la IA muchos ángulos GENUINAMENTE distintos para emparejar cada mensaje con el usuario correcto. Un concepto realmente distinto = 1 Entity ID = 1 boleto a la subasta. Todo empieza en el mensaje.

EL MOTOR (3 preguntas que estructuran cada ángulo):
1. ¿Por qué necesito esto? → HOOK + VALOR (agitación del dolor).
2. ¿Por qué contigo y no con otros? → VALOR (prueba/autoridad).
3. ¿Por qué ahora? → OFERTA (urgencia).
Fórmula del ad: HOOK (0-3s, engancha Y FILTRA) → VALOR → OFERTA.

Contexto del cliente:
- Producto/servicio: ${producto}
- Empresa: ${empresa}
- Problema que resuelve: ${problema}
- Link: ${link || "no proporcionado"}
- Mercado: LATAM (español). Trato cercano, adaptar — no traducir literal.

TAREA: Devuelve (a) un BUYER PERSONA y (b) 4-5 ÁNGULOS DE VENTA genuinamente distintos (cada uno ataca motivación/dolor/nivel de conciencia diferente, NO variaciones del mismo; cubre embudo frío y medio).

Los hooks deben FILTRAR al cliente correcto (frase directa 0-3s, sin intro).

RESPONDE ÚNICAMENTE CON JSON VÁLIDO, sin markdown, sin backticks, sin texto antes o después. Estructura EXACTA:
{
  "persona": {
    "nombre": "nombre ficticio + rol",
    "edad": "rango",
    "rol": "quién decide / quién siente el dolor",
    "dolor": "dolor principal en voz del cliente",
    "deseo": "transformación que compra",
    "objecion": "principal objeción de compra",
    "donde": "dónde está / cómo lo alcanzas (canal)"
  },
  "angulos": [
    {
      "nombre": "nombre del ángulo",
      "temperatura": "frío | medio",
      "conciencia": "nivel de conciencia",
      "dolor": "dolor que ataca, una línea",
      "porque": "por qué convierte, una línea",
      "hooks": ["hook 1", "hook 2"]
    }
  ],
  "anuncios": [
    {
      "angulo": "nombre del ángulo del que sale este anuncio (debe ser uno de los de arriba)",
      "copy_out": "copy del anuncio siguiendo Hook→Valor→Oferta: arranca con el hook que filtra, agita el dolor, mata una objeción con autoridad/bandera, cierra con urgencia + CTA. 3-5 líneas, español LATAM, listo para pegar en Meta.",
      "titulo": "titular corto del anuncio (headline del placement, máx ~40 caracteres)",
      "prompt": "${promptFieldInstruction(visualRefs)}",
      "prompt_chatgpt": "prompt en español para que el USUARIO lo pegue en ChatGPT SUBIENDO una foto de su producto. Debe empezar con algo como 'Con la foto de mi producto que adjunto, crea un anuncio estático para Meta...' y describir: cómo integrar EL PRODUCTO DE LA FOTO en la escena (no inventar otro producto), la composición, el estilo on-brand, el titular y TODO el texto baked-in entre comillas. Cierra con: usa exactamente el producto de la foto adjunta, no lo reemplaces."
    }
  ]
}

REGLA ANUNCIOS: genera EXACTAMENTE 2 anuncios estáticos de muestra, de 2 ángulos distintos (uno frío, uno medio). El copy_out aplica la fórmula completa Hook→Valor→Oferta. Son muestra: NO generes anuncios para todos los ángulos.${adsReference(selectedAds)}`;
}

export async function POST(req) {
  let form;
  try {
    form = await req.json();
  } catch {
    return Response.json({ error: "Body inválido." }, { status: 400 });
  }

  const { producto, problema, correo } = form || {};
  if (!producto || !problema) {
    return Response.json(
      { error: "Faltan campos: producto o problema." },
      { status: 400 }
    );
  }

  // CANDADO SERVER-SIDE: si este correo ya usó su análisis gratis, bloquear.
  // form.test (solo /landing-3 en modo prueba) salta el candado para poder probar repetido.
  if (!form.test && (await emailAlreadyUsed(correo))) {
    return Response.json({ blocked: true });
  }

  // Capturamos el lead en PARALELO con la generación (no antes), para no sumar su latencia
  // al presupuesto de tiempo. Si falta la key o Claude falla, el contacto igual queda guardado.
  const leadPromise = recordLead({
    nombre: form.nombre,
    correo: form.correo,
    telefono: form.telefono,
    empresa: form.empresa,
    producto: form.producto,
    link: form.link,
    problema: form.problema,
  });

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    await leadPromise.catch(() => {});
    return Response.json(
      { error: "Falta ANTHROPIC_API_KEY en el servidor." },
      { status: 500 }
    );
  }

  // maxRetries bajo: evita que un reintento del SDK estire la llamada más allá del límite de Vercel.
  const client = new Anthropic({ apiKey, maxRetries: 1 });
  const model = process.env.ANTHROPIC_MODEL || "claude-sonnet-4-6";

  // Anuncios de competencia que el usuario seleccionó (vienen del paso de selección).
  const selectedAds = Array.isArray(form.selectedAds)
    ? form.selectedAds.slice(0, 12)
    : [];

  // Extrae el primer objeto JSON del texto (tolerante a texto extra alrededor).
  const parseJson = (s) => {
    const t = String(s || "").replace(/```json|```/g, "").trim();
    const a = t.indexOf("{");
    const b = t.lastIndexOf("}");
    return JSON.parse(a >= 0 && b > a ? t.slice(a, b + 1) : t);
  };
  const textOf = (msg) =>
    msg.content.filter((b) => b.type === "text").map((b) => b.text).join("\n");

  // Imágenes de referencia (solo /landing-3): anuncios elegidos + look&feel del sitio del cliente.
  // Se le pasan a Claude (visión) para que base la dirección visual de los prompts en ese estilo.
  let adBlocks = [];
  let brandBlocks = [];
  if (selectedAds.length) {
    const adUrls = selectedAds.map((a) => a.imagen).filter((u) => u && /^https?:/i.test(u)).slice(0, 3);
    const siteUrls = (await fetchSiteVisuals(form.link)).slice(0, 3);
    [adBlocks, brandBlocks] = await Promise.all([
      Promise.all(adUrls.map(toImageBlock)).then((a) => a.filter(Boolean)),
      Promise.all(siteUrls.map(toImageBlock)).then((a) => a.filter(Boolean)),
    ]);
  }
  const visualRefs = adBlocks.length > 0 || brandBlocks.length > 0;
  const mainUserContent = visualRefs
    ? [
        {
          type: "text",
          text:
            "Genera el buyer persona y los ángulos en el JSON especificado.\n\nIMÁGENES DE REFERENCIA:\n• Marca del cliente (logo e imágenes de su sitio): infiere un MOODBOARD —paleta, tipografía, estilo y mood— de estas imágenes.\n• Anuncios de la competencia que el cliente eligió: úsalos como referencia de formato/composición.\nBasa la dirección visual de cada 'prompt' en el moodboard de la marca + el estilo de esos anuncios, para que el estático se vea on-brand y a la altura de la competencia.",
        },
        ...(brandBlocks.length ? [{ type: "text", text: "— Marca del cliente:" }, ...brandBlocks] : []),
        ...(adBlocks.length ? [{ type: "text", text: "— Anuncios de la competencia seleccionados:" }, ...adBlocks] : []),
      ]
    : "Genera el buyer persona y los ángulos en el JSON especificado.";

  try {
    // El análisis principal y el competitivo corren EN PARALELO. El competitivo nunca
    // tumba al principal: si falla, su promesa resuelve a null.
    const mainPromise = client.messages.create({
      model,
      max_tokens: 3000,
      system: buildSystem(form, selectedAds, visualRefs),
      messages: [{ role: "user", content: mainUserContent }],
    });
    const compPromise = selectedAds.length
      ? client.messages
          .create({
            model: process.env.ANTHROPIC_COMPETITIVE_MODEL || "claude-haiku-4-5-20251001",
            max_tokens: 1200,
            system: competitiveSystem(selectedAds, form),
            messages: [
              { role: "user", content: "Genera el análisis competitivo en el JSON especificado." },
            ],
          })
          .catch(() => null)
      : Promise.resolve(null);

    // leadPromise va en el all para garantizar que se registre (recordLead nunca rechaza
    // y termina antes que Claude, así que no suma tiempo).
    const [msg, compMsg] = await Promise.all([mainPromise, compPromise, leadPromise]);

    let data;
    try {
      data = parseJson(textOf(msg));
    } catch {
      return Response.json(
        { error: "La IA no devolvió JSON válido. Intenta de nuevo." },
        { status: 502 }
      );
    }

    if (compMsg) {
      try {
        const comp = parseJson(textOf(compMsg));
        data.competitivo = { ...comp, anuncios: selectedAds };
      } catch (e) {
        // sin sección competitiva, pero el análisis principal va igual
      }
    }

    return Response.json(data);
  } catch (e) {
    return Response.json(
      { error: e?.message || "Error llamando a Claude." },
      { status: 502 }
    );
  }
}

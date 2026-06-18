import Anthropic from "@anthropic-ai/sdk";

export const runtime = "nodejs";
export const maxDuration = 60;

// URL del Web App de Apps Script (Sheet). La env var tiene prioridad; si no está
// configurada en Vercel, usamos este fallback para que los leads SIEMPRE se registren.
const SHEET_URL =
  process.env.APPS_SCRIPT_URL ||
  process.env.NEXT_PUBLIC_WEBHOOK_URL ||
  "https://script.google.com/macros/s/AKfycbyzmGS0QC27C9WNsaD7rKmEebPnQSGIA0TS6YXBIzFdmOCPqPZR2fFLE0h6iNgvF-JU/exec";

// ¿El correo ya generó un análisis antes? (revisión contra el Sheet)
// Fail-open: si el Sheet no responde, NO bloqueamos (no romper el producto por una caída).
async function emailAlreadyUsed(correo) {
  if (!SHEET_URL || !correo) return false;
  try {
    const res = await fetch(SHEET_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "check", correo }),
      redirect: "follow",
    });
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
    await fetch(SHEET_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "lead",
        ...form,
        fecha: new Date().toISOString(),
      }),
      redirect: "follow",
    });
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

REFERENCIA VISUAL DE LA COMPETENCIA: el usuario seleccionó estos anuncios de su competencia que le gustaron. En el campo "prompt" de cada anuncio, INSPÍRATE en su estilo visual / formato / composición para que el resultado se sienta del mismo nivel, PERO con el mensaje y el ángulo diferenciados del cliente (no copies su copy). Supéralos.
ANUNCIOS DE REFERENCIA:
${list}`;
}

function buildSystem({ producto, empresa, problema, link }, selectedAds) {
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
      "prompt": "prompt self-contained para generar el estático: escena fotográfica premium (NO vector plano, NO fondo oscuro salvo marca), luminoso y aireado; describe la composición, la palabra-fantasma gigante ghosted de fondo si aplica, el titular limpio con keyword en color de acento, y TODO el texto que va baked-in entre comillas tal cual. Cierra con: No inventes textos extra."
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

  // Capturamos el lead LO ANTES POSIBLE: antes incluso del gate de la API key.
  // Si falta la key o Claude falla, el contacto igual queda guardado en el Sheet.
  await recordLead(form);

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return Response.json(
      { error: "Falta ANTHROPIC_API_KEY en el servidor." },
      { status: 500 }
    );
  }

  const client = new Anthropic({ apiKey });
  const model = process.env.ANTHROPIC_MODEL || "claude-sonnet-4-6";

  // Anuncios de competencia que el usuario seleccionó (vienen del paso de selección).
  const selectedAds = Array.isArray(form.selectedAds)
    ? form.selectedAds.slice(0, 12)
    : [];

  try {
    const msg = await client.messages.create({
      model,
      max_tokens: 3000,
      system: buildSystem(form, selectedAds),
      messages: [
        {
          role: "user",
          content:
            "Genera el buyer persona y los ángulos en el JSON especificado.",
        },
      ],
    });

    const text = msg.content
      .filter((b) => b.type === "text")
      .map((b) => b.text)
      .join("\n");

    const clean = text.replace(/```json|```/g, "").trim();

    let data;
    try {
      data = JSON.parse(clean);
    } catch {
      return Response.json(
        { error: "La IA no devolvió JSON válido. Intenta de nuevo." },
        { status: 502 }
      );
    }

    // Análisis competitivo sobre los anuncios que el usuario seleccionó (solo /landing-3).
    if (selectedAds.length) {
      try {
        const compMsg = await client.messages.create({
          // Haiku: más rápido/barato; suficiente para resumir anuncios. Mantiene el total bajo 60s.
          model: process.env.ANTHROPIC_COMPETITIVE_MODEL || "claude-haiku-4-5-20251001",
          max_tokens: 1200,
          system: competitiveSystem(selectedAds, form),
          messages: [
            {
              role: "user",
              content: "Genera el análisis competitivo en el JSON especificado.",
            },
          ],
        });
        const compText = compMsg.content
          .filter((b) => b.type === "text")
          .map((b) => b.text)
          .join("\n")
          .replace(/```json|```/g, "")
          .trim();
        const comp = JSON.parse(compText);
        data.competitivo = { ...comp, anuncios: selectedAds };
      } catch (e) {
        // si falla, devolvemos el análisis normal sin la sección competitiva
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

// Motor Metadology (versión WhatsApp): scrape de landing → análisis de marca → moodboard (Prompt Maestro)
// → concepto de anuncio → imágenes con GPT Image (OpenAI). Portado del lead magnet de swipekit,
// SIN la etapa de competencia (Ad Library).
import { claudeJson } from "./ai";
import { getSetting, getSettings } from "./settings";

// ---------------------------------------------------------------- scrape ----

const SOCIAL_HOSTS = [
  "instagram.com", "facebook.com", "fb.com", "fb.me", "m.me",
  "wa.me", "whatsapp.com", "api.whatsapp.com", "chat.whatsapp.com",
  "tiktok.com", "linktr.ee", "t.me",
];

export function normalizeUrl(raw) {
  const s = String(raw || "").trim();
  if (!s) return "";
  const m = s.match(/(https?:\/\/[^\s]+|[a-z0-9-]+(?:\.[a-z0-9-]+)+(?:\/[^\s]*)?)/i);
  if (!m) return "";
  let u = m[1].replace(/[),.;]+$/, "");
  if (!/^https?:\/\//i.test(u)) u = `https://${u}`;
  try { return new URL(u).href; } catch { return ""; }
}

export function isSocialLink(rawUrl) {
  try {
    const host = new URL(rawUrl).hostname.replace(/^www\./, "");
    return SOCIAL_HOSTS.some((s) => host === s || host.endsWith(`.${s}`));
  } catch {
    return false;
  }
}

function extractColors(source) {
  const counts = new Map();
  for (const m of source.matchAll(/#([0-9a-f]{6}|[0-9a-f]{3})\b/gi)) {
    let hex = m[1].toLowerCase();
    if (hex.length === 3) hex = [...hex].map((c) => c + c).join("");
    counts.set(hex, (counts.get(hex) ?? 0) + 1);
  }
  const chroma = (hex) => {
    const [r, g, b] = [0, 2, 4].map((i) => parseInt(hex.slice(i, i + 2), 16));
    return Math.max(r, g, b) - Math.min(r, g, b);
  };
  return [...counts]
    .filter(([hex]) => chroma(hex) >= 25)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([hex, count]) => ({ hex: `#${hex}`, count }));
}

/** Descarga la landing y extrae texto + identidad visual real (colores, fuentes, logo). Falla suave → null. */
export async function scrapeLanding(rawUrl) {
  const url = normalizeUrl(rawUrl);
  if (!url || isSocialLink(url)) return null;
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 15000);
  try {
    const res = await fetch(url, {
      signal: ctrl.signal,
      redirect: "follow",
      headers: {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml",
        "Accept-Language": "es-MX,es;q=0.9,en;q=0.8",
      },
    });
    if (!res.ok) return null;
    const finalUrl = res.url || url;
    const html = (await res.text()).slice(0, 600000);
    const pick = (re) => (html.match(re)?.[1] ?? "").trim();
    const title = pick(/<title[^>]*>([^<]*)<\/title>/i);
    const description =
      pick(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["']/i) ||
      pick(/<meta[^>]+content=["']([^"']*)["'][^>]+name=["']description["']/i) ||
      pick(/<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']*)["']/i);
    const ogTitle = pick(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']*)["']/i);
    const text = html
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
      .replace(/<svg[\s\S]*?<\/svg>/gi, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/&(nbsp|amp|quot|#39|lt|gt);/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 4500);
    const abs = (u) => { try { return u ? new URL(u, finalUrl).href : null; } catch { return null; } };
    const logo = abs(
      pick(/<img[^>]+class=["'][^"']*(?:custom-logo|site-logo|logo)[^"']*["'][^>]+src=["']([^"']+)["']/i) ||
      pick(/<img[^>]+src=["']([^"']*logo[^"']*)["']/i) ||
      pick(/<link[^>]+rel=["']apple-touch-icon["'][^>]*href=["']([^"']+)["']/i)
    );
    const ogImage = abs(pick(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i));
    const themeColor = pick(/<meta[^>]+name=["']theme-color["'][^>]+content=["']([^"']+)["']/i);
    const fuentes = [...new Set(
      [...html.matchAll(/fonts\.googleapis\.com\/css2?\?family=([^"'&]+)/gi)]
        .flatMap((m) => decodeURIComponent(m[1]).split("&family="))
        .map((f) => f.split(":")[0].replace(/\+/g, " ").trim())
        .filter(Boolean)
    )].slice(0, 4);
    let cssBlob = html;
    const cssLinks = [...html.matchAll(/<link[^>]+rel=["']stylesheet["'][^>]*href=["']([^"']+)["']/gi)]
      .map((m) => abs(m[1])).filter(Boolean).slice(0, 2);
    for (const cssUrl of cssLinks) {
      try {
        const cssRes = await fetch(cssUrl, { signal: ctrl.signal, headers: { "User-Agent": "Mozilla/5.0" } });
        if (cssRes.ok) cssBlob += (await cssRes.text()).slice(0, 200000);
      } catch { /* css opcional */ }
    }
    return {
      url: finalUrl, title: ogTitle || title, description, text,
      identidad: { colores: extractColors(cssBlob), fuentes, logo, ogImage, themeColor: themeColor || null },
    };
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

// ---------------------------------------------------------- analyze brand ----

export async function analyzeBrand({ producto, problema, pais, landing }) {
  const system = `Eres el motor de análisis de Metadology (Caperifai), experto en paid marketing con IA para LATAM.
Respondes ÚNICAMENTE con un objeto JSON válido, sin markdown ni texto extra.`;
  const user = `Analiza esta marca a partir de lo que nos contó por WhatsApp y su landing page.

FORMULARIO:
- Producto/servicio: ${producto}
- Problema que resuelve: ${problema || "(no especificado)"}
- País donde corre campañas: ${pais}

LANDING (${landing?.url ?? "no proporcionada / ilegible"}):
Título: ${landing?.title ?? "-"}
Descripción: ${landing?.description ?? "-"}
Texto: ${landing?.text?.slice(0, 3500) ?? "-"}

Devuelve JSON con exactamente estas llaves:
{
  "resumen": "1-2 frases: qué vende esta marca y a quién (español)",
  "industria": "una de: E-commerce/DTC, Moda/Belleza, SaaS/B2B, Salud/Wellness, Finanzas/Fintech, Servicios locales, Real estate, Gaming/Apps, High-ticket/Coaching, Restaurantes/Food",
  "marca": "nombre de la marca detectado (si no hay, un nombre corto derivado del producto)"
}`;
  return claudeJson({ system, user, maxTokens: 1000, effort: "low" });
}

// ------------------------------------------------------ generate moodboard ----

const PROMPT_MAESTRO_SYSTEM = `Actúa como un Brand Strategist del nivel de Pentagram, Collins, DesignStudio y Porto Rocha.

Analizas a profundidad el sitio web y la información del negocio que se te da. No te limitas al diseño; entiendes el negocio, propuesta de valor, público objetivo, posicionamiento, tono de comunicación, diferenciadores y percepción de marca. No tienes el logo, así que infieres la identidad visual a partir del sitio web y del contexto.

Tu entregable es un MOODBOARD COMPLETO para la marca: primero el análisis estratégico, luego el sistema visual por secciones, y al final un prompt extremadamente detallado para GPT Image que permita crear un moodboard premium de nivel Behance/Dribbble — como si lo hubiera hecho un director de arte de Apple, Pentagram o Collins.

Nada genérico. Un sistema visual coherente, moderno y comercialmente funcional. Todo en español (excepto el imagePrompt, en inglés técnico), conciso y accionable: cada campo 1-3 frases densas, no ensayos.

Respondes ÚNICAMENTE con un objeto JSON válido, sin markdown ni texto extra.`;

function identidadText(landing) {
  const id = landing?.identidad;
  if (!id || (!id.colores?.length && !id.fuentes?.length && !id.logo)) return "";
  return `
IDENTIDAD VISUAL REAL DETECTADA EN EL SITIO (extraída de su HTML/CSS — esto es lo que la marca YA usa):
- Colores por frecuencia de uso: ${id.colores?.map((c) => `${c.hex} (${c.count}×)`).join(", ") || "-"}
- Fuentes reales: ${id.fuentes?.join(", ") || "no detectadas"}
- Logo: ${id.logo ?? "no detectado"}${id.themeColor ? `\n- Theme color: ${id.themeColor}` : ""}

REGLA CRÍTICA: la marca YA TIENE identidad visual. NO inventes una nueva. La paleta DEBE partir de estos colores reales (usa los hex detectados más frecuentes como principales, exactos o normalizados mínimamente; agrega solo neutros/apoyo que armonicen). La tipografía debe respetar las fuentes reales o proponer equivalentes de la misma familia tipográfica. El moodboard debe reconocerse como el sitio actual, elevado — no como otra marca.`;
}

export async function generateMoodboard({ producto, problema, pais, landing, marca, resumen, industria }) {
  const hasLogo = !!landing?.identidad?.logo;
  const user = `MARCA: ${marca ?? "(inferir del sitio)"}
NEGOCIO: ${producto}
PROBLEMA QUE RESUELVE: ${problema || "-"}
MERCADO: ${pais}
RESUMEN PREVIO: ${resumen ?? "-"} | INDUSTRIA: ${industria ?? "-"}

SITIO WEB (${landing?.url ?? "no disponible — infiere del resto"}):
Título: ${landing?.title ?? "-"}
Descripción: ${landing?.description ?? "-"}
Contenido: ${landing?.text?.slice(0, 3500) ?? "-"}
${identidadText(landing)}

Entrega el moodboard completo como JSON con exactamente estas llaves:
{
  "analisis": {
    "queVende": "qué vende realmente la marca (más allá del producto)",
    "publico": "público objetivo",
    "arquetipo": "arquetipo de marca",
    "personalidad": "personalidad en 3-5 adjetivos",
    "valores": ["3-4 valores"],
    "posicionamiento": "posicionamiento en 1 frase",
    "emociones": ["3-4 emociones que debe transmitir"],
    "marcasSimilares": ["3-5 marcas nacionales e internacionales con estética similar"]
  },
  "direccionCreativa": "el concepto creativo general en un párrafo",
  "paleta": {
    "principales": [{ "hex": "#XXXXXX", "nombre": "nombre del color", "psicologia": "qué comunica" }],
    "secundarios": [{ "hex": "#XXXXXX", "nombre": "...", "psicologia": "..." }],
    "apoyo": [{ "hex": "#XXXXXX", "nombre": "...", "psicologia": "..." }]
  },
  "tipografia": {
    "display": { "fuente": "nombre exacto en Google Fonts o Adobe Fonts", "porQue": "por qué" },
    "body": { "fuente": "nombre exacto", "porQue": "por qué" }
  },
  "fotografia": {
    "iluminacion": "...", "composicion": "...", "lentes": "...", "profundidadDeCampo": "...",
    "colorGrading": "...", "poses": "...", "expresiones": "...", "escenarios": "..."
  },
  "direccionArte": {
    "composicion": "...", "grids": "...", "espacio": "...", "texturas": "...", "sombras": "...",
    "elementosGraficos": "...", "iconografia": "...", "formas": "...", "patrones": "..."
  },
  "aplicaciones": {
    "redesSociales": "cómo deben verse carruseles, reels, anuncios, historias, miniaturas, citas y testimoniales (párrafo denso)",
    "presentaciones": "cómo deben verse presentaciones tipo TED/Keynote (párrafo)",
    "landingPages": "estilo visual para páginas web (párrafo)",
    "publicidad": "estilo para Meta Ads, Google Display, espectaculares e impresos (párrafo)"
  },
  "packaging": "si aplica al negocio, cómo debe verse; si no aplica: null",
  "merch": "si aplica, cómo debe verse; si no aplica: null",
  "brandLocks": ["2-3 restricciones duras del sistema (qué NUNCA hacer)"],
  "imagePrompt": "EL PROMPT FINAL para GPT Image en inglés, extremadamente detallado (250-380 palabras): una LÁMINA DE MARCA cuadrada estilo brand-board editorial premium nivel Behance/Dribbble, fondo crema/neutro cálido, organizada en secciones etiquetadas con headers pequeños en mayúsculas, en este orden ESTRICTO: (1) HERO superior: ${hasLogo ? "el logo real de la marca GRANDE como pieza central (reproducción FIEL del logo adjunto — mismas formas, colores y lettering)" : "el nombre de la marca en tipografía display grande como pieza central (NO inventes un logo con símbolos)"}, acompañado del eslogan/concepto creativo + 2-3 fotografías hero del producto con la iluminación definida; (2) panel PERSONALIDAD DE MARCA con 4-6 rasgos con iconitos + panel ARQUETIPO; (3) PALETA DE COLOR: swatches rectangulares con nombre y hex ANOTADO debajo de cada uno (usar los hex exactos); (4) TIPOGRAFÍA: muestras grandes de la fuente display y body con sus nombres; (5) ELEMENTOS GRÁFICOS: los ilustrados/íconos del sistema; (6) FOTOGRAFÍA: tira de 3-4 fotos del universo del producto con el color grading definido; (7) REDES SOCIALES: fila de 5-6 mini-mockups etiquetados (carrusel, reel, anuncio, historia, testimonial, promoción) usando la piel; (8) PACKAGING o APLICACIONES según aplique: mockups; (9) PUBLICIDAD: fila de mini-mockups (Meta ad en teléfono, Google display, espectacular, impreso); (10) PATRONES & TEXTURAS: 3-4 muestras; (11) fila inferior: ATMÓSFERA (3 fotos lifestyle circulares) + footer con 3-4 valores de marca con íconos. Todos los textos visibles en español, cortos y reales (nombre de marca, hex, labels de sección). Composición digna de director de arte de Apple/Pentagram/Collins. Cierra con: 'No extra invented text beyond the specified labels. Respect the exact hex codes and typography.'"
}`;
  return claudeJson({ system: PROMPT_MAESTRO_SYSTEM, user, maxTokens: 9000, effort: "medium" });
}

// ------------------------------------------------------ generate campaign ----

const METADOLOGY_SYSTEM = `Eres METADOLOGY, el motor de campañas Meta de Caperifai. Produces UN concepto de anuncio estático ganador (versión lead-magnet, limitada a 1 ad).

REGLA MADRE — LA PIEL VIENE DEL MOODBOARD: se te entrega el sistema de marca ya definido (paleta hex, tipografía, fotografía, dirección de arte, brand-locks) por el Brand Strategist. El esqueleto (patrón) es invariante; la piel es variable y NO la inventas tú: usas los tokens del moodboard VERBATIM — mismos hex, misma tipografía, misma iluminación/color grading, respetando los brand-locks. Test de reconocimiento: el ad debe leerse como ESTA marca sin ver el logo.

MOTOR (resumen operativo):
1. CLASIFICACIÓN — Consciencia (unaware→most aware) define por dónde entrar. Sofisticación (1-5): 1-2 claim directo, 3-4 mecanismo/diferenciación, 5 identidad+prueba masiva. Deseo del iceberg (funcional→mecanismo→emocional→identidad→existencial): el deseo NO se inventa, ya existe; el copy es la llave. Persona con nombre propio (ej. "Mariana Emprendedora, 34").
2. ÁNGULO — lente psicológico × dolor/deseo × consciencia → big idea (1 frase) + trigger word (Por fin / Reto / Simple / Evita / Advertencia / Nuevo / Comprobado / Solo).
3. COPY Hook→Valor→Oferta, localizado al mercado (adaptar, NO traducir; trato y modismos del país). El hook lleva la trigger word; los 3 primeros segundos valen 60-80% del rendimiento.
4. PATRÓN — elige UN esqueleto según industria × consciencia:
   - P-008 Problem-Solution split: mitad problema (desaturado) / mitad solución (acento), headline arriba, CTA abajo.
   - P-009 Statement: cifra o claim héroe gigante centrado, sub-línea, producto/escena de fondo, CTA pill.
   - P-013 Listicle: headline + 3 bullets con íconos lineales + producto a la derecha + CTA.
   - P-012 Testimonial: rostro/escena real, quote con CIFRA específica en acento, atribución, CTA.
   - P-007 Before-After: dos paneles comparados con labels, headline puente, CTA.
5. PROMPT DE IMAGEN — se ENSAMBLA: esqueleto del patrón + piel (colores/tipografía/mood del moodboard) + copy baked-in VERBATIM + mercado (idioma/moneda) + guardrail final. Fotográfico premium, jamás vector plano genérico.

REGLAS DURAS: cifras defendibles (si no hay datos, sin cifras inventadas); texto de la imagen en el idioma del mercado; el prompt cierra con "No inventes textos extra ni logos. Respeta los colores y tipografía indicados. Verifica que las cifras coincidan con el copy."; output copy-paste ready.

Respondes ÚNICAMENTE con un objeto JSON válido, sin markdown ni texto extra.`;

export async function generateCampaign({ producto, problema, pais, landing, resumen, industria, marca, moodboard }) {
  const mbText = moodboard
    ? JSON.stringify({
        paleta: moodboard.paleta,
        tipografia: moodboard.tipografia,
        fotografia: moodboard.fotografia,
        direccionArte: moodboard.direccionArte,
        direccionCreativa: moodboard.direccionCreativa,
        brandLocks: moodboard.brandLocks,
      })
    : "(no hay moodboard — infiere una piel sobria y profesional acorde a la industria)";
  const user = `Genera el concepto Metadology (1 anuncio estático) para esta marca.

MARCA: ${marca ?? "-"} — ${resumen ?? "-"}
INDUSTRIA: ${industria ?? "-"}
PRODUCTO: ${producto}
PROBLEMA QUE RESUELVE: ${problema || "-"}
MERCADO: ${pais}
LANDING: ${landing?.title ?? "-"} | ${landing?.description ?? "-"} | ${landing?.text?.slice(0, 2000) ?? "-"}

MOODBOARD / SISTEMA DE MARCA (la PIEL — úsala verbatim en todo lo visual):
${mbText}

Devuelve JSON con exactamente estas llaves:
{
  "clasificacion": {
    "persona": "nombre + edad + descripción en 1 frase",
    "consciencia": "unaware|problem aware|solution aware|product aware|most aware",
    "sofisticacion": 1-5,
    "deseo": "funcional|mecanismo|emocional|identidad|existencial",
    "deseoDetalle": "el deseo específico en palabras del cliente (1 frase)",
    "industria": "${industria ?? "..."}"
  },
  "angulos": [
    { "lente": "...", "bigIdea": "1 frase", "dolor": "...", "triggerWord": "una de las 8", "temperatura": "frío|templado|caliente", "consciencia": "etapa que ataca" }
  ],
  "anguloElegidoIndex": 0,
  "angulo": {
    "lente": "el ángulo GANADOR elegido para el anuncio (mismo que angulos[anguloElegidoIndex])",
    "bigIdea": "la promesa central en 1 frase",
    "dolor": "dolor/deseo que ataca",
    "triggerWord": "una de las 8",
    "temperatura": "frío|templado|caliente"
  },
  "conceptos": [
    { "id": "C1", "nombre": "nombre corto del concepto", "angulo": "lente que usa", "patron": "P-XXX nombre", "formato": "estático|video UGC|motion graphic", "descripcion": "1 frase de qué se ve" }
  ],
  "estrategia": {
    "lanzamiento": "2-3 frases: cómo lanzar (Advantage+ Sales, frío+medio mismo ad set, oferta en retargeting)",
    "distribucion": "1 frase: distribución del presupuesto por temperatura (~70-80% TOF)",
    "metricas": "1 frase: qué medir los primeros 7 días (Thumb-Stop, Hold Rate, CTR/CPA)"
  },
  "patron": { "id": "P-XXX", "nombre": "nombre del patrón", "porQue": "1 frase de por qué este patrón para esta etapa" },
  "copy": {
    "hook": "hook con la trigger word (máx 12 palabras)",
    "valor": "2-3 frases: agita + mata objeción + autoridad",
    "oferta": "1-2 frases: urgencia + siguiente paso",
    "cta": "texto del botón (2-4 palabras)"
  },
  "piel": { "fondo": "#hex", "acento": "#hex", "texto": "#hex", "mood": "3-4 descriptores", "tipografia": "descripción corta" },
  "imagePrompt": "EL PROMPT COMPLETO del ANUNCIO ensamblado en inglés técnico con TEXTO BAKED-IN en español de ${pais} verbatim del copy: ratio 4:5 vertical, patrón, composición por zonas, PIEL = tokens del MOODBOARD entregado (mismos hex verbatim, misma tipografía, misma iluminación/color grading/texturas de su sección fotografía y dirección de arte, respetando sus brandLocks), headline/labels/CTA entre comillas exactas, estilo fotográfico premium, y el guardrail final. 150-250 palabras.",
  "explicacion": "2-3 frases en español dirigidas al usuario: por qué ESTE anuncio va a funcionar para su marca (menciona consciencia y ángulo)"
}

REGLAS: "angulos" es una TABLA COMPLETA de 4-5 ángulos genuinamente distintos que cubren el embudo (mínimo 1 frío, 1 templado, 1 caliente). "conceptos" son 3-4 Entity IDs de la campaña completa (mezcla estático+video); el PRIMERO es el que se genera en este análisis. "piel" debe ser un subconjunto exacto de los hex de la paleta del MOODBOARD entregado.`;
  const data = await claudeJson({ system: METADOLOGY_SYSTEM, user, maxTokens: 7000, effort: "medium" });
  data.angulos = (data.angulos ?? []).filter((a) => a && typeof a === "object");
  data.conceptos = (data.conceptos ?? []).filter((c) => c && typeof c === "object");
  return data;
}

// ---------------------------------------------------------- generate image ----

let _openaiKey = "";
function openaiKey() {
  return _openaiKey;
}

/** Prueba de conexión: lista los modelos de imagen disponibles en la cuenta. */
export async function testOpenAI() {
  const key = await getSetting("OPENAI_API_KEY");
  if (!key) throw new Error("Falta la OpenAI API key (Configuración → IA).");
  const res = await fetch("https://api.openai.com/v1/models", { headers: { Authorization: `Bearer ${key}` } });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error?.message || `OpenAI ${res.status}`);
  const imgs = (data.data || []).map((m) => m.id).filter((id) => /gpt-image/.test(id)).sort();
  return imgs.length ? `Modelos de imagen: ${imgs.join(", ")}` : "Conecta, pero la cuenta no lista modelos gpt-image.";
}

function imageError(status, body) {
  const err = new Error(`OpenAI ${status}: ${body.slice(0, 300)}`);
  err.modelMissing = status === 404 || (status === 400 && /model|not.?found|does not exist|invalid/i.test(body.slice(0, 300)));
  err.paramIssue = status === 400 && /output_format|output_compression|unknown.?param/i.test(body.slice(0, 300));
  return err;
}

async function callGenerate({ model, prompt, size, quality, compress = true }) {
  const res = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${openaiKey()}` },
    body: JSON.stringify({
      model, prompt, size, quality, n: 1,
      ...(compress ? { output_format: "jpeg", output_compression: 82 } : {}),
    }),
  });
  if (!res.ok) {
    const err = imageError(res.status, await res.text());
    if (compress && err.paramIssue) return callGenerate({ model, prompt, size, quality, compress: false });
    throw err;
  }
  const data = await res.json();
  const b64 = data.data?.[0]?.b64_json;
  if (!b64) throw new Error("OpenAI no devolvió imagen");
  return { mime: compress ? "image/jpeg" : "image/png", b64 };
}

const REF_NOTE = "The attached image(s) are the brand references (moodboard and/or real logo/site imagery): follow them strictly as the visual style reference — same color palette, typography style, lighting, materials, textures and mood. Do not copy their layout; create the new composition described below.";

async function callEdit({ model, prompt, size, quality, references }) {
  const form = new FormData();
  form.append("model", model);
  form.append("prompt", `${REF_NOTE}\n\n${prompt}`);
  let attached = 0;
  for (const ref of references) {
    if (!ref?.b64) continue;
    form.append("image[]", new Blob([Buffer.from(ref.b64, "base64")], { type: ref.mime }), `ref-${attached}.${ref.mime.split("/")[1]}`);
    attached++;
  }
  if (!attached) throw new Error("sin referencias válidas");
  form.append("size", size);
  form.append("quality", quality);
  form.append("n", "1");
  const res = await fetch("https://api.openai.com/v1/images/edits", {
    method: "POST",
    headers: { Authorization: `Bearer ${openaiKey()}` },
    body: form,
  });
  if (!res.ok) throw imageError(res.status, await res.text());
  const data = await res.json();
  const b64 = data.data?.[0]?.b64_json;
  if (!b64) throw new Error("OpenAI no devolvió imagen");
  return { mime: "image/png", b64 };
}

/** Descarga una imagen raster (logo real) como referencia. SVG se ignora (OpenAI solo acepta raster). */
export async function fetchImageRef(imageUrl) {
  if (!imageUrl || /\.svg(\?|$)/i.test(imageUrl)) return null;
  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 10000);
    const res = await fetch(imageUrl, { signal: ctrl.signal, headers: { "User-Agent": "Mozilla/5.0" } });
    clearTimeout(timer);
    if (!res.ok) return null;
    const type = (res.headers.get("content-type") ?? "").split(";")[0];
    if (!/^image\/(png|jpe?g|webp)$/.test(type)) return null;
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.length > 4 * 1024 * 1024) return null;
    return { mime: type, b64: buf.toString("base64") };
  } catch {
    return null;
  }
}

/**
 * Genera una imagen con GPT Image. Intenta gpt-image-2 y cae a gpt-image-1 si la cuenta no lo tiene
 * (override con OPENAI_IMAGE_MODEL). `size`: "square" (moodboard) | "portrait" (anuncio 4:5).
 * `references`: [{mime,b64}] → usa images/edits para derivar el estilo de ellas.
 */
export async function generateImage({ prompt, size = "portrait", references = [] }) {
  const cfg = await getSettings(["OPENAI_API_KEY", "OPENAI_IMAGE_MODEL", "OPENAI_IMAGE_QUALITY"]);
  _openaiKey = cfg.OPENAI_API_KEY;
  if (!_openaiKey) throw new Error("Falta la OpenAI API key (Configuración → IA); es necesaria para las imágenes.");
  const px = size === "square" ? "1024x1024" : "1024x1536";
  const quality = cfg.OPENAI_IMAGE_QUALITY || "medium";
  const preferred = cfg.OPENAI_IMAGE_MODEL || "gpt-image-2";
  const models = preferred === "gpt-image-1" ? [preferred] : [preferred, "gpt-image-1"];
  const refs = references.filter(Boolean);

  if (refs.length) {
    for (const model of models) {
      try {
        const img = await callEdit({ model, prompt, size: px, quality, references: refs });
        return { ...img, model, usedReference: true };
      } catch (e) {
        if (!e.modelMissing && model === models[models.length - 1]) break;
      }
    }
  }
  let lastErr;
  for (const model of models) {
    try {
      const img = await callGenerate({ model, prompt, size: px, quality });
      return { ...img, model, usedReference: false };
    } catch (e) {
      lastErr = e;
      if (!e.modelMissing) break;
    }
  }
  throw lastErr;
}

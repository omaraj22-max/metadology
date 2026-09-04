// Motor Metadology (versión WhatsApp): scrape de landing → análisis de marca → moodboard (Prompt Maestro)
// → concepto de anuncio → imágenes con GPT Image (OpenAI). Portado del lead magnet de swipekit,
// SIN la etapa de competencia (Ad Library).
import { claudeJson } from "./ai";
import { getSetting, getSettings } from "./settings";
import { PATRONES_ESTATICOS, FIT_LOGIC, ANGULOS_28, COPY_FRAMEWORK, SEGMENTACION } from "./metadology-refs";

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

const METADOLOGY_SYSTEM = `Eres METADOLOGY V5, el motor de campañas Meta de Caperifai. Produces UN concepto de anuncio estático ganador (versión lead-magnet: 1 Entity ID completo) con la profundidad de una campaña profesional.

REGLA MADRE — ESQUELETO DEL DESIGN SYSTEM, PIEL DEL MOODBOARD: el esqueleto (patrón) es INVARIANTE y sale de la biblioteca; la piel es VARIABLE y sale VERBATIM del moodboard entregado (mismos hex, misma tipografía, misma luz/color grading/texturas, respetando sus brand-locks). Nada visual se decide «al gusto». Test de reconocimiento: el ad debe leerse como ESTA marca sin ver el logo.

PREMISA POST-ANDROMEDA: Meta premia conceptos genuinamente distintos que declaran a quién le hablan. El anuncio ES la segmentación.

MOTOR (en orden): (1) CLASIFICACIÓN — persona con nombre propio, consciencia (unaware→most aware), sofisticación 1-5, deseo del iceberg (funcional→mecanismo→emocional→identidad→existencial; el deseo no se inventa, ya existe), industria. (2) PCOR en voz literal del cliente. (3) SEGMENTO con filtro de copy y filtro visual. (4) ÁNGULOS: 4-5 mezclas de 2-3 tipos de la librería, cubriendo frío/templado/caliente; elegir el GANADOR para este anuncio. (5) PATRÓN del Design System por fit logic (industria ∩ consciencia). (6) COPY completo (5 titulares con H1★, texto principal PAS/BAB con cierre sigiloso, campos de Meta). (7) VISUAL ensamblado por zonas: esqueleto × piel × filtro visual × texto baked-in.
${PATRONES_ESTATICOS}
${FIT_LOGIC}
${ANGULOS_28}
${COPY_FRAMEWORK}
${SEGMENTACION}

REGLAS DURAS: cifras solo si son defendibles (si no hay datos, sin cifras); el texto que va en la imagen es en el idioma del mercado y VERBATIM del copy; todo copy-paste ready; español del mercado, adaptado, no traducido. Respondes ÚNICAMENTE con un objeto JSON válido, sin markdown ni texto extra.`;

function moodboardTokens(moodboard) {
  if (!moodboard) return "(no hay moodboard — infiere una piel sobria y profesional acorde a la industria y decláralo)";
  return JSON.stringify({
    paleta: moodboard.paleta,
    tipografia: moodboard.tipografia,
    fotografia: moodboard.fotografia,
    direccionArte: moodboard.direccionArte,
    direccionCreativa: moodboard.direccionCreativa,
    brandLocks: moodboard.brandLocks,
    arquetipo: moodboard.analisis?.arquetipo,
    personalidad: moodboard.analisis?.personalidad,
  });
}

export async function generateCampaign({ producto, problema, pais, landing, resumen, industria, marca, moodboard }) {
  const user = `Genera el concepto Metadology (1 anuncio estático, 4:5) para esta marca.

MARCA: ${marca ?? "-"} — ${resumen ?? "-"}
INDUSTRIA: ${industria ?? "-"}
PRODUCTO: ${producto}
PROBLEMA QUE RESUELVE (voz del cliente): ${problema || "-"}
MERCADO: ${pais}
LANDING: ${landing?.title ?? "-"} | ${landing?.description ?? "-"} | ${landing?.text?.slice(0, 2000) ?? "-"}

MOODBOARD / SISTEMA DE MARCA (la PIEL — úsala verbatim en todo lo visual):
${moodboardTokens(moodboard)}

Devuelve JSON con exactamente estas llaves:
{
  "clasificacion": {
    "persona": "nombre propio + edad + situación en 1 frase (ej. «Mariana Emprendedora, 34, dueña de una pyme de servicios»)",
    "consciencia": "unaware|problem aware|solution aware|product aware|most aware",
    "sofisticacion": 1-5,
    "deseo": "funcional|mecanismo|emocional|identidad|existencial",
    "deseoDetalle": "el deseo específico en palabras del cliente (1 frase)",
    "industria": "${industria ?? "..."}"
  },
  "pcor": { "problemas": ["2-3 bullets, voz literal"], "cuestionamientos": ["2-3"], "obstaculos": ["2-3"], "resultados": ["2-3"] },
  "segmento": {
    "nombre": "nombre corto del segmento (ej. «Rentero eterno PV»)",
    "quienEs": "persona + edad + situación",
    "temperatura": "frío|templado|caliente",
    "filtroCopy": { "mecanismo": "direct address|dolor identitario|exclusión explícita", "linea": "la línea exacta del hook que nombra al segmento" },
    "filtroVisual": { "casting": "edad/género/look/vestuario", "locacion": "dónde vive ese segmento", "props": "objetos que reconoce como suyos", "marcador": "marcador de segmento que va baked-in en la zona superior (rol, ciudad, cifra o etapa de vida)" }
  },
  "postura": "línea de postura del batch: enemigo común (creencia/táctica obsoleta, nunca personas) + a quién sirve",
  "angulos": [
    { "lente": "nombre corto del ángulo (2-4 palabras)", "mezcla": ["B2", "C3"], "bigIdea": "promesa central en 1 frase", "dolor": "dolor/deseo que ataca, voz del cliente", "talonAquiles": "fisura que ataca", "triggerWord": "una de las 8", "temperatura": "frío|templado|caliente", "consciencia": "etapa que ataca" }
  ],
  "anguloElegidoIndex": 0,
  "angulo": { "lente": "= angulos[anguloElegidoIndex].lente", "mezcla": ["..."], "bigIdea": "...", "dolor": "...", "talonAquiles": "...", "triggerWord": "...", "temperatura": "..." },
  "patron": { "id": "P-XXX", "nombre": "nombre del patrón", "familia": "gráfico/data|fotográfico/escena|nativo|testimonial", "porQue": "1 frase: por qué este patrón para esta industria × consciencia (cita la regla 4C)" },
  "titulares": [
    { "texto": "H1 con la fórmula [gran resultado] + [atajo/tiempo] − [dolor], con la trigger word y el marcador de segmento", "regla": "eclipsa a la masa|siembra el enigma|toma postura|adopta autoridad|usa el contraste" }
  ],
  "h1Index": 0,
  "estructuraCopy": "PAS|BAB",
  "textoPrincipal": "TEXTO PRINCIPAL completo listo para pegar en Meta: línea 1 = H1★ adaptado + filtro de segmento (≤125 caracteres antes del corte); \\n\\n bloque de valor (agitación/After + mecanismo + autoridad + bandera); \\n\\n cierre sigiloso en 3 pasos (brecha de sinceridad → efecto espejo → cierre por valor de liberación); \\n\\n un solo CTA. 90-160 palabras. Saltos de línea reales.",
  "copy": {
    "hook": "= H1★ (verbatim)",
    "valor": "2-3 frases: el bloque de valor comprimido (agita + mata objeción + autoridad + bandera)",
    "oferta": "1-2 frases: el cierre comprimido (razón para actuar ya + siguiente paso)",
    "cta": "texto del botón/acción (2-4 palabras)"
  },
  "meta": { "titulo": "≤40 caracteres, H1★ comprimido, sin punto final", "descripcion": "≤30 caracteres: reversal de riesgo, escasez con razón o ancla de precio", "cta": "literal del enum de Meta" },
  "checks": { "interesPropio": ["2+ del checklist que pasa"], "claimsFuente": "de dónde salen las cifras o «sin cifras»" },
  "conceptos": [
    { "id": "C1", "nombre": "nombre corto", "angulo": "lente + mezcla", "patron": "P-XXX nombre", "formato": "estático|video UGC|motion graphic", "temperatura": "frío|templado|caliente", "descripcion": "1 frase de qué se ve" }
  ],
  "estrategia": {
    "lanzamiento": "2-3 frases: Advantage+ Sales, un solo ad set frío+templado sin intereses, oferta en retargeting aparte",
    "distribucion": "1 frase: ~70-80% TOF",
    "metricas": "1 frase: qué medir los primeros 7 días (Thumb-Stop, Hold Rate, CTR/CPA) y qué variable iterar primero (el titular)"
  },
  "piel": { "fondo": "#hex", "acento": "#hex", "neutros": ["#hex", "#hex"], "texto": "#hex", "display": "fuente display del moodboard", "body": "fuente body", "mood": "3-5 descriptores del moodboard", "luz": "descriptor de iluminación del moodboard", "texturas": "texturas/materiales del moodboard o «ninguna»", "nunca": ["brand-locks del moodboard"] },
  "visual": {
    "ratio": "4:5",
    "estilo": "1 frase: familia del patrón + dirección fotográfica (lente, encuadre, profundidad de campo) tomada del moodboard",
    "composicion": ["zona 1 (arriba): qué va, qué texto, qué tratamiento", "zona 2: ...", "zona 3: ...", "zona final (abajo): CTA ..."],
    "escena": "descripción concreta de la escena/sujeto/producto: qué se ve, quién (según filtro visual), dónde, haciendo qué; nítido y específico, sin stock genérico",
    "textoBakedIn": [
      { "zona": "headline", "texto": "H1★ verbatim", "nota": "keyword «trigger» en color de acento; tipografía display" },
      { "zona": "label/subtítulo/fila", "texto": "texto exacto", "nota": "tratamiento" },
      { "zona": "cta", "texto": "texto del CTA", "nota": "pill en acento" }
    ],
    "referencia": "cómo usar la imagen del moodboard adjunta (paleta, luz, materiales) y en qué zona va el producto/persona"
  },
  "explicacion": "2-3 frases en español al usuario: por qué ESTE anuncio va a funcionar para su marca (consciencia, ángulo, patrón y a quién filtra)"
}

REGLAS DEL JSON: «angulos» = 4-5 ángulos genuinamente distintos (mínimo 1 frío, 1 templado, 1 caliente; ninguno es G1 puro; ≥1 usa D3 si el producto es demostrable). «titulares» = exactamente 5, cada uno con una regla de oro distinta. «conceptos» = 3-4 Entity IDs (el primero es este anuncio; mezcla estático + video). «piel» = subconjunto exacto de los hex y fuentes del moodboard. «visual.composicion» sigue el esqueleto del patrón elegido zona por zona, con el marcador de segmento en la zona superior. Todo el texto de «visual.textoBakedIn» debe existir verbatim en el copy.`;

  const data = await claudeJson({ system: METADOLOGY_SYSTEM, user, maxTokens: 10000, effort: "high" });
  data.angulos = (data.angulos ?? []).filter((a) => a && typeof a === "object");
  data.conceptos = (data.conceptos ?? []).filter((c) => c && typeof c === "object");
  data.titulares = (data.titulares ?? []).filter((t) => t && typeof t === "object" && t.texto);
  if (!Number.isInteger(data.h1Index) || !data.titulares[data.h1Index]) data.h1Index = 0;
  data.copy = data.copy || {};
  if (!data.copy.hook && data.titulares[data.h1Index]) data.copy.hook = data.titulares[data.h1Index].texto;
  data.imagePrompt = assembleImagePrompt({ campaign: data, producto, pais, marca });
  return data;
}

/**
 * Ensambla el prompt del anuncio de forma determinista (prompt-assembly.md):
 * ESQUELETO + PIEL + FILTRO VISUAL + COPY baked-in + MERCADO + REFERENCIA + GUARDRAIL.
 * Así ningún bloque se pierde aunque el modelo se quede corto.
 */
export function assembleImagePrompt({ campaign: c, producto, pais, marca }) {
  const v = c.visual || {};
  const p = c.piel || {};
  const seg = c.segmento || {};
  const fv = seg.filtroVisual || {};
  const pat = c.patron || {};
  const h1 = c.titulares?.[c.h1Index]?.texto || c.copy?.hook || "";
  const trigger = c.angulo?.triggerWord || "";
  const cta = c.meta?.cta && c.copy?.cta ? c.copy.cta : c.copy?.cta || "";
  const baked = (v.textoBakedIn || []).filter((t) => t && t.texto);
  if (!baked.some((t) => /headline|titular/i.test(t.zona || "")) && h1) baked.unshift({ zona: "headline", texto: h1, nota: `keyword «${trigger}» en color de acento; tipografía display` });
  if (!baked.some((t) => /cta/i.test(t.zona || "")) && cta) baked.push({ zona: "cta", texto: cta, nota: "botón pill en color de acento" });
  const neutros = Array.isArray(p.neutros) ? p.neutros.join(", ") : p.neutros || "";
  const nunca = (p.nunca || []).filter(Boolean);
  const familia = pat.familia || "";
  const familiaNote = /gr[aá]fico/i.test(familia)
    ? "Clean typographic hierarchy, cards and thin line icons in the brand palette; the accent color marks the focus (the solution, the number, the claim). A real scene or brand-color background behind — never clipart or flat vector."
    : /nativo/i.test(familia)
      ? "This must NOT look like an ad: respect the platform UI or a lo-fi phone-photo look; the brand accent barely appears."
      : /testimonial/i.test(familia)
        ? "A real, believable person; the specific number in the accent color; real-looking attribution (name, city)."
        : "A real photographic scene lit exactly as the moodboard; product/person tack-sharp; generous negative space; editorial magazine finish; never flat vector or clipart.";

  const lines = [];
  lines.push(`${v.ratio || "4:5"} vertical static Meta ad in the style of pattern ${pat.id || ""} · ${pat.nombre || ""}, ${v.estilo || "premium photographic"}, for ${producto}${marca ? ` (brand: ${marca})` : ""}. Market: ${pais} — every visible text is in Spanish exactly as given below.`);
  if (seg.nombre) lines.push(`SEGMENT: "${seg.nombre}" — the person seeing this must instantly feel "this is for me": ${seg.quienEs || ""}.`);
  lines.push(`COMPOSITION (skeleton ${pat.id || ""}), zones top to bottom:`);
  (v.composicion || []).forEach((z, i) => lines.push(`  ${i + 1}. ${z}`));
  if (v.escena) lines.push(`SCENE: ${v.escena}`);
  lines.push(`SKIN (from the brand moodboard — use verbatim): background ${p.fondo || "-"}, accent ${p.acento || "-"}, neutrals ${neutros || "-"}, text ${p.texto || "-"}; display typography "${p.display || "-"}", body typography "${p.body || "-"}"; mood: ${p.mood || "-"}; light: ${p.luz || "-"}; textures/materials: ${p.texturas || "none"}.${nunca.length ? ` NEVER: ${nunca.join("; ")}.` : ""}`);
  lines.push(`VISUAL FILTER (segment targeting): subject/casting ${fv.casting || "-"}; location ${fv.locacion || "-"}; props ${fv.props || "-"}; segment marker visible in the top zone: "${fv.marcador || "-"}".`);
  lines.push(`BAKED-IN TEXT (Spanish, verbatim — do not translate, do not paraphrase, do not invent any other text):`);
  baked.forEach((t) => lines.push(`  • ${t.zona}: "${t.texto}"${t.nota ? ` — ${t.nota}` : ""}`));
  lines.push(`REFERENCE: the attached image is the brand's moodboard. Take the palette, typography character, lighting, materials and mood from it; do NOT copy its layout or reproduce it — create the new composition described above.${v.referencia ? ` ${v.referencia}` : ""}`);
  lines.push(`FAMILY: ${familiaNote}`);
  lines.push(`FINISH: premium editorial photography look, natural light as specified, high sharpness, perfect kerning on all text, no watermarks, no logos. Do not invent extra text. Respect the exact hex codes and typography. Verify that any numbers match the copy exactly.`);
  return lines.join("\n");
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
  // JPEG comprimido: el PNG de images/edits puede pasar de 2 MB y no cabe en un registro de Redis.
  form.append("output_format", "jpeg");
  form.append("output_compression", "82");
  const res = await fetch("https://api.openai.com/v1/images/edits", {
    method: "POST",
    headers: { Authorization: `Bearer ${openaiKey()}` },
    body: form,
  });
  if (!res.ok) {
    const err = imageError(res.status, await res.text());
    if (err.paramIssue) { // cuentas viejas sin output_format en /edits
      form.delete("output_format");
      form.delete("output_compression");
      const retry = await fetch("https://api.openai.com/v1/images/edits", { method: "POST", headers: { Authorization: `Bearer ${openaiKey()}` }, body: form });
      if (!retry.ok) throw imageError(retry.status, await retry.text());
      const rd = await retry.json();
      if (!rd.data?.[0]?.b64_json) throw new Error("OpenAI no devolvió imagen");
      return { mime: "image/png", b64: rd.data[0].b64_json };
    }
    throw err;
  }
  const data = await res.json();
  const b64 = data.data?.[0]?.b64_json;
  if (!b64) throw new Error("OpenAI no devolvió imagen");
  return { mime: "image/jpeg", b64 };
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
export async function generateImage({ prompt, size = "portrait", references = [], quality: qualityOverride = null }) {
  const cfg = await getSettings(["OPENAI_API_KEY", "OPENAI_IMAGE_MODEL", "OPENAI_IMAGE_QUALITY"]);
  _openaiKey = cfg.OPENAI_API_KEY;
  if (!_openaiKey) throw new Error("Falta la OpenAI API key (Configuración → IA); es necesaria para las imágenes.");
  const px = size === "square" ? "1024x1024" : "1024x1536";
  const quality = qualityOverride || cfg.OPENAI_IMAGE_QUALITY || "medium";
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

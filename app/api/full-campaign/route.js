import Anthropic from "@anthropic-ai/sdk";

export const runtime = "nodejs";
export const maxDuration = 300;

const STRIPE_KEY = process.env.STRIPE_SECRET_KEY || "";

// Recupera la sesión de Stripe: ¿pagada? + la metadata (datos del producto).
async function getSession(sessionId) {
  if (!STRIPE_KEY || !sessionId) return { paid: false, metadata: null };
  try {
    const res = await fetch(`https://api.stripe.com/v1/checkout/sessions/${encodeURIComponent(sessionId)}`, {
      headers: { Authorization: `Bearer ${STRIPE_KEY}` },
    });
    if (!res.ok) return { paid: false, metadata: null };
    const s = await res.json();
    const paid = s && (s.payment_status === "paid" || s.status === "complete");
    return { paid: !!paid, metadata: s?.metadata || null };
  } catch (e) {
    return { paid: false, metadata: null };
  }
}

function buildSystem({ producto, empresa, problema, link, pais }) {
  return `Eres Aria, estratega senior de Caperifai, operando con la metodología METADOLOGY ADS para Meta. Vas a producir una CAMPAÑA COMPLETA lista para producción para el cliente, con el mismo nivel de una propuesta profesional.

CONTEXTO DEL CLIENTE:
- Producto/servicio: ${producto}
- Empresa/marca: ${empresa || "(infiere un nombre apropiado)"}
- Problema que resuelve: ${problema}
- Link: ${link || "no proporcionado"}
- País/mercado de campañas: ${pais || "MX"}
- Idioma: español LATAM cercano, adaptar al país.

PREMISA: Meta premia DIVERSIDAD de conceptos genuinamente distintos = 1 Entity ID = 1 boleto a la subasta. Cada creativo ataca una motivación/ángulo/formato distinto, NO variaciones del mismo. Fórmula de cada ad: HOOK (0-3s, engancha Y filtra) → VALOR (agita el dolor + prueba/autoridad/"bandera") → OFERTA (CTA).

RECETA VISUAL (CRÍTICO — de esto depende que las imágenes salgan BONITAS, no feas):
Principio común de las referencias aprobadas: estética FOTOGRÁFICA y PREMIUM, NUNCA vector plano ni clipart ni 3D barato; luminoso y aireado; composición limpia y respirada con foco claro; titular corto arriba con UNA palabra clave en el color de acento de la marca; nada de fondos oscuros salvo que la marca lo dicte. Texto baked-in dentro de la imagen con tipografía sans premium, bien kerneada. SIN logotipos ni marcas de agua (usa la identidad visual —colores, estilo, tipografía— pero NO renderices el logo).

Infiere el ARQUETIPO del producto y aplica su receta:
• SaaS / digital → escena real (laptop o teléfono sobre escritorio claro con planta, taza, luz natural) con el dashboard/app en pantalla; opcional una PALABRA-FANTASMA gigante "ghosted" de fondo (ej. SIMPLE, CONTROL, ORDEN). Si es estilo gráfico: tarjetas blancas redondeadas con sombra suave e íconos lineales, ordenado y data-forward. Nada oscuro.
• Infoproducto → mockup fotográfico del libro/app + props aspiracionales (vela, lavanda, luz cálida) en la paleta de marca; estética emocional, no de dato; palabra-fantasma emocional (SIENTE, CREA…).
• Físico / consumo → bodegón premium del producto real en escena + lifestyle (persona disfrutándolo, luz cálida); el producto siempre presente y nítido; beneficio sensorial.
Cada prompt cierra el acabado: "foto editorial premium, luz natural suave, alta nitidez, look de revista".

TAREA: genera EXACTAMENTE 10 creativos cubriendo embudo frío, medio y caliente, en 3 formatos: ~6 estáticos, 2 carruseles y 2 UGC (video 9:16). Ángulos genuinamente distintos. Para estáticos incluye un "prompt" de imagen FOTORREALISTA y premium siguiendo la RECETA VISUAL (sin logo ni marcas de agua). Para UGC incluye un "script" por tomas. Para carruseles incluye el desglose de slides con su prompt visual.

RESPONDE ÚNICAMENTE JSON VÁLIDO (sin markdown, sin backticks, sin texto extra). Estructura EXACTA:
{
  "titulo": "Campaña Meta Ads · <marca> · <ciudad/país>",
  "subtitulo": "una línea con el objetivo de la campaña",
  "marca": {
    "nombre": "nombre de la marca",
    "mercado": "ciudad/país y a quién le habla",
    "brief": "2-3 líneas: el encargo y el enfoque",
    "paleta": [{ "hex": "#RRGGBB", "nombre": "color" }],
    "tipografia": "recomendación de tipografía",
    "logo": "descripción breve del logo/sello",
    "estilo_foto": "dirección fotográfica"
  },
  "estrategia": {
    "motor": { "hook": "", "valor": "", "oferta": "" },
    "bandera": "la prueba/diferencial que sostiene el valor",
    "autoridad": "autoridad/credibilidad hoy",
    "cta": "el CTA principal de la campaña",
    "buyer": "el cliente en llamas: 2-3 líneas con su voz/antojo",
    "objeciones": [{ "q": "objeción del cliente", "resuelve": "C# que la neutraliza" }]
  },
  "creativos": [
    {
      "id": "C1",
      "temperatura": "frío | medio | caliente",
      "angulo": "nombre del ángulo",
      "formato": "Estático | Carrusel · N | UGC 9:16",
      "titulo": "titular del anuncio (máx ~40 car)",
      "hook": "frase 0-3s que engancha y filtra",
      "copy_out": "copy completo Hook→Valor→Oferta, 3-6 líneas, listo para pegar en Meta",
      "cta": "tipo de CTA (Cómo llegar / Más información / Comprar / etc.)",
      "prompt": "SOLO si es estático: prompt self-contained FOTORREALISTA y premium siguiendo la RECETA VISUAL y el arquetipo del producto. Describe escena, encuadre, luz y lente; la paleta EXACTA con los hex de la marca; composición aireada; el titular con keyword en color de acento y TODO el texto que va baked-in entre comillas tal cual. Acabado editorial de revista, alta nitidez. SIN logotipos ni marcas de agua. Cierra con: No inventes textos extra ni logos.",
      "script": [{ "t": "0-3s", "linea": "lo que dice", "pantalla": "texto en pantalla" }],
      "carrusel": [{ "n": 1, "desc": "qué muestra y el texto de la slide", "prompt": "prompt self-contained FOTORREALISTA y premium para la imagen de ESTA slide, siguiendo la RECETA VISUAL y el arquetipo. Describe escena, luz y lente; la paleta EXACTA de marca; composición limpia y coherente con las demás slides; y el texto de la slide baked-in entre comillas tal cual. Acabado editorial, alta nitidez. SIN logos ni marcas de agua. Cierra con: No inventes textos extra ni logos." }]
    }
  ],
  "receta_visual": ["lineamiento visual 1", "lineamiento 2"],
  "salvaguardas": ["salvaguarda Entity ID 1", "2"],
  "lanzamiento": [{ "paso": "título del paso", "detalle": "qué hacer" }],
  "escala": [{ "titulo": "vía de escala", "detalle": "cómo" }]
}

REGLAS: 10 creativos exactos. En estáticos llena "prompt" y deja "script"/"carrusel" vacíos. En UGC (video) llena "script" (4 tomas aprox) y deja "prompt"/"carrusel" vacíos — los UGC NO llevan imagen generada, solo el script. En carrusel llena "carrusel" (4-5 slides, cada una con su "prompt" de imagen) y deja "prompt"/"script" vacíos. 4-6 pasos de lanzamiento. 3 vías de escala. Todo accionable y específico a este negocio.`;
}

// Intenta parsear JSON posiblemente truncado: recorre los caracteres, cierra la
// cadena abierta si la hubo, y balancea las llaves/corchetes pendientes. Si aun así
// no parsea, va recortando el último elemento incompleto hasta lograrlo o rendirse.
function tryRepairJson(s) {
  if (!s) return null;
  let str = String(s).trim();
  // Quita basura final tras el último } o ] de cierre razonable
  const lastBrace = Math.max(str.lastIndexOf("}"), str.lastIndexOf("]"));
  const balanced = closeOpenStructures(str);
  for (const cand of [str, balanced, closeOpenStructures(str.slice(0, lastBrace + 1))]) {
    if (!cand) continue;
    try { return JSON.parse(cand); } catch {}
  }
  // Último intento: recorta progresivamente desde el final y rebalancea.
  let cut = str;
  for (let i = 0; i < 200 && cut.length > 50; i++) {
    cut = cut.slice(0, cut.lastIndexOf(",") >= 0 ? cut.lastIndexOf(",") : cut.length - 1);
    try { return JSON.parse(closeOpenStructures(cut)); } catch {}
  }
  return null;
}

function closeOpenStructures(s) {
  if (!s) return null;
  const stack = [];
  let inStr = false, esc = false;
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (inStr) {
      if (esc) esc = false;
      else if (c === "\\") esc = true;
      else if (c === '"') inStr = false;
      continue;
    }
    if (c === '"') inStr = true;
    else if (c === "{" || c === "[") stack.push(c);
    else if (c === "}" || c === "]") stack.pop();
  }
  let out = s;
  if (inStr) out += '"';
  // Quita una posible coma colgante antes de cerrar
  out = out.replace(/,\s*$/, "");
  for (let i = stack.length - 1; i >= 0; i--) out += stack[i] === "{" ? "}" : "]";
  return out;
}

export async function POST(req) {
  let body = {};
  try { body = await req.json(); } catch {}
  const { sessionId, form } = body || {};

  const { paid, metadata } = await getSession(sessionId);
  if (!paid) {
    return Response.json({ error: "Pago no verificado." }, { status: 402 });
  }
  // El producto viene de la metadata de Stripe (autoritativo, cross-device); fallback al body.
  const f = (metadata && metadata.producto) ? metadata : (form || {});
  if (!f.producto || !f.problema) {
    return Response.json({ error: "Faltan datos del producto para generar la campaña." }, { status: 400 });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return Response.json({ error: "Falta ANTHROPIC_API_KEY en el servidor." }, { status: 500 });
  }

  const client = new Anthropic({ apiKey, maxRetries: 1 });
  const model = process.env.ANTHROPIC_MODEL || "claude-sonnet-4-6";
  try {
    const msg = await client.messages.create({
      model,
      max_tokens: 16000, // campaña completa (10 creativos + scripts + carruseles) — evita truncado
      system: buildSystem(f),
      messages: [{ role: "user", content: "Genera la campaña completa en el JSON especificado." }],
    });
    const text = msg.content.filter((b) => b.type === "text").map((b) => b.text).join("\n");
    const a = text.indexOf("{");
    const b = text.lastIndexOf("}");
    let campaign;
    try {
      campaign = JSON.parse(a >= 0 && b > a ? text.slice(a, b + 1) : text);
    } catch {
      // Respaldo: si vino truncado (corte por tokens) intentamos reparar el JSON
      // cerrando comillas/llaves/corchetes abiertos para rescatar lo generado.
      campaign = tryRepairJson(a >= 0 ? text.slice(a) : text);
      if (!campaign) {
        const truncated = msg.stop_reason === "max_tokens";
        return Response.json({
          error: truncated
            ? "La campaña salió muy larga y se cortó. Pulsa Reintentar."
            : "La IA no devolvió JSON válido. Pulsa Reintentar.",
        }, { status: 502 });
      }
    }
    return Response.json({ campaign });
  } catch (e) {
    return Response.json({ error: e?.message || "Error generando la campaña." }, { status: 502 });
  }
}

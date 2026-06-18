import Anthropic from "@anthropic-ai/sdk";

export const runtime = "nodejs";
export const maxDuration = 300;

const STRIPE_KEY = process.env.STRIPE_SECRET_KEY || "";

// Verifica que la sesión de Stripe esté pagada.
async function sessionPaid(sessionId) {
  if (!STRIPE_KEY || !sessionId) return false;
  try {
    const res = await fetch(`https://api.stripe.com/v1/checkout/sessions/${encodeURIComponent(sessionId)}`, {
      headers: { Authorization: `Bearer ${STRIPE_KEY}` },
    });
    if (!res.ok) return false;
    const s = await res.json();
    return s && (s.payment_status === "paid" || s.status === "complete");
  } catch (e) {
    return false;
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

TAREA: genera EXACTAMENTE 10 creativos cubriendo embudo frío, medio y caliente, en 3 formatos: ~6 estáticos, 2 carruseles y 2 UGC (video 9:16). Ángulos genuinamente distintos. Para estáticos incluye un "prompt" de imagen on-brand (sin logo ni marcas de agua). Para UGC incluye un "script" por tomas. Para carruseles incluye el desglose de slides.

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
      "prompt": "SOLO si es estático: prompt self-contained on-brand para el estático, sin logo ni marcas de agua, con todo el texto baked-in entre comillas",
      "script": [{ "t": "0-3s", "linea": "lo que dice", "pantalla": "texto en pantalla" }],
      "carrusel": [{ "n": 1, "desc": "qué muestra y el texto de la slide" }]
    }
  ],
  "receta_visual": ["lineamiento visual 1", "lineamiento 2"],
  "salvaguardas": ["salvaguarda Entity ID 1", "2"],
  "lanzamiento": [{ "paso": "título del paso", "detalle": "qué hacer" }],
  "escala": [{ "titulo": "vía de escala", "detalle": "cómo" }]
}

REGLAS: 10 creativos exactos. En estáticos llena "prompt" y deja "script"/"carrusel" vacíos. En UGC llena "script" (4 tomas aprox) y deja "prompt"/"carrusel" vacíos. En carrusel llena "carrusel" (4-5 slides) y deja "prompt"/"script" vacíos. 4-6 pasos de lanzamiento. 3 vías de escala. Todo accionable y específico a este negocio.`;
}

export async function POST(req) {
  let body = {};
  try { body = await req.json(); } catch {}
  const { sessionId, form } = body || {};

  if (!(await sessionPaid(sessionId))) {
    return Response.json({ error: "Pago no verificado." }, { status: 402 });
  }
  const f = form || {};
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
      max_tokens: 8000,
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
      return Response.json({ error: "La IA no devolvió JSON válido. Recarga e intenta de nuevo." }, { status: 502 });
    }
    return Response.json({ campaign });
  } catch (e) {
    return Response.json({ error: e?.message || "Error generando la campaña." }, { status: 502 });
  }
}

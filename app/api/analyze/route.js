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

function buildSystem({ producto, empresa, problema, link }) {
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

REGLA ANUNCIOS: genera EXACTAMENTE 2 anuncios estáticos de muestra, de 2 ángulos distintos (uno frío, uno medio). El copy_out aplica la fórmula completa Hook→Valor→Oferta. Son muestra: NO generes anuncios para todos los ángulos.`;
}

export async function POST(req) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return Response.json(
      { error: "Falta ANTHROPIC_API_KEY en el servidor." },
      { status: 500 }
    );
  }

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
  if (await emailAlreadyUsed(correo)) {
    return Response.json({ blocked: true });
  }

  // Registramos el lead AQUÍ (antes de generar): para un lead magnet, capturar el
  // lead es la prioridad — aunque Claude falle, el contacto queda guardado en el Sheet.
  await recordLead(form);

  const client = new Anthropic({ apiKey });

  try {
    const msg = await client.messages.create({
      model: process.env.ANTHROPIC_MODEL || "claude-sonnet-4-6",
      max_tokens: 3000,
      system: buildSystem(form),
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


    return Response.json(data);
  } catch (e) {
    return Response.json(
      { error: e?.message || "Error llamando a Claude." },
      { status: 502 }
    );
  }
}

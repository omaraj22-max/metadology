// Conversación de WhatsApp: Aria hace las 4 preguntas del formulario, una a la vez, y cuando tiene
// todo dispara el pipeline Metadology. Estado en el store (Redis); espejo en el Google Sheet.
import { kvGet, kvSet, kvSetNX, zAdd, K, newId } from "./store";
import { sendText, markRead } from "./wa";
import { claudeJson, hasAnthropic } from "./ai";
import { mirrorToSheet } from "./sheet";
import { normalizeUrl } from "./engine";
import { getSetting } from "./settings";
import { createResult } from "./result";

export const FIELDS = ["producto", "link", "pais", "problema"];

export async function siteUrl() {
  return (await getSetting("SITE_URL")).replace(/\/$/, "");
}
export async function ctaUrl() {
  return getSetting("CAPERIFAI_CTA_URL");
}
// Secreto para las llamadas internas al pipeline (solo env: es bootstrap, igual que la contraseña del back office).
export function internalSecret() {
  return (process.env.WA_INTERNAL_SECRET || process.env.BACKOFFICE_PASSWORD || process.env.META_WEBHOOK_VERIFY_TOKEN || "dev-secret").trim();
}

export function isComplete(fields) {
  return !!(fields.producto && fields.pais && fields.problema && fields.link !== null && fields.link !== undefined);
}

// ---- persistencia de la conversación ----

export async function getConversation(id) {
  return id ? kvGet(K.conv(id)) : null;
}

export async function saveConversation(conv) {
  conv.updatedAt = Date.now();
  await kvSet(K.conv(conv.id), conv);
  await zAdd(K.convs, conv.updatedAt, conv.id);
}

async function getActive(phone, name) {
  const activeId = await kvGet(K.active(phone));
  const conv = await getConversation(activeId);
  if (conv) {
    if (name && !conv.name) conv.name = name;
    return conv;
  }
  return newConversation(phone, name);
}

export async function newConversation(phone, name) {
  const conv = {
    id: newId("c"),
    phone,
    name: name || "",
    createdAt: Date.now(),
    updatedAt: Date.now(),
    status: "collecting", // collecting | generating | done | error
    stage: null,
    fields: { producto: null, link: null, pais: null, problema: null },
    transcript: [],
    resultId: null,
    error: null,
    humanMode: false, // true = el equipo tomó la conversación desde el inbox; Aria no contesta
    unread: 0, // mensajes del usuario sin leer en el inbox
  };
  await kvSet(K.active(phone), conv.id);
  await saveConversation(conv);
  return conv;
}

function push(conv, role, text) {
  conv.transcript.push({ role, text: String(text).slice(0, 2000), at: Date.now() });
  if (conv.transcript.length > 80) conv.transcript = conv.transcript.slice(-80);
}

export async function reply(conv, text) {
  push(conv, "aria", text);
  try {
    await sendText(conv.phone, text);
  } catch (e) {
    console.error("[wa] envío falló:", e?.message || e);
  }
}

/** Mensaje escrito por el equipo desde el inbox. Lanza si WhatsApp rechaza el envío. */
export async function sendHuman(conv, text) {
  await sendText(conv.phone, text);
  push(conv, "human", text);
  await saveConversation(conv);
  mirrorToSheet(conv, null).catch(() => {});
}

// ---- disparo del pipeline (etapas en /api/wa/process, cada una en su propia invocación) ----

export async function triggerStage(convId, stage) {
  const res = await fetch(`${await siteUrl()}/api/wa/process`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-wa-secret": internalSecret() },
    body: JSON.stringify({ convId, stage }),
  });
  if (!res.ok) throw new Error(`process ${res.status}: ${(await res.text()).slice(0, 200)}`);
}

// ---- el turno de Aria ----

const CHAT_SYSTEM = `Eres Aria, la IA de Caperifai, conversando por WhatsApp con un negocio que quiere anuncios para Meta. Tu única misión en esta conversación es conseguir 4 datos, en este orden, UNA pregunta a la vez:
1. producto — ¿Qué producto o servicio vende?
2. link — Link de su landing, producto o página web (opcional: si dice que no tiene, se guarda "" y sigues).
3. pais — ¿En qué país corre sus campañas?
4. problema — ¿Qué problema resuelve su producto o servicio?

Reglas:
- Tono cercano LATAM, tuteo, mensajes cortos (2-3 líneas máximo). Formato WhatsApp: puedes usar *negritas*, nada de markdown ni listas largas.
- Si es el primer mensaje, preséntate en una línea (Aria, de Caperifai), di que con 4 preguntas le armas el moodboard de su marca y un anuncio listo para Meta, y haz la pregunta 1.
- Si el usuario ya dio varios datos en un mismo mensaje, captúralos todos y pregunta solo el siguiente faltante.
- Si responde algo vago o fuera de tema, contesta brevísimo y regresa a la pregunta pendiente. Si pregunta qué es Caperifai: agencia de paid marketing con IA; luego regresa a la pregunta.
- NUNCA pidas nombre, correo ni teléfono. NUNCA menciones competencia ni análisis de competidores.
- Cuando tengas los 4 datos: confirma en una línea lo que entendiste (producto + país) y avisa que en unos minutos le mandas por aquí el moodboard y el anuncio. No preguntes nada más.

Responde ÚNICAMENTE con JSON válido:
{"fields":{"producto":string|null,"link":string|null,"pais":string|null,"problema":string|null},"reply":"tu mensaje para WhatsApp"}
En "fields" devuelve el valor CONSOLIDADO de cada dato (lo que ya se tenía + lo nuevo, limpio y completo, en español). null = aún no se tiene. Para "link": null = aún no se ha preguntado/respondido; "" = el usuario dijo que no tiene link; si da un dominio sin https, devuélvelo tal cual lo escribió.`;

async function ariaTurn(conv) {
  const known = conv.fields;
  const transcript = conv.transcript.slice(-24).map((m) => `${m.role === "user" ? "USUARIO" : "ARIA"}: ${m.text}`).join("\n");
  const user = `NOMBRE DEL USUARIO EN WHATSAPP: ${conv.name || "(desconocido)"}
DATOS YA CAPTURADOS: ${JSON.stringify(known)}

CONVERSACIÓN HASTA AHORA (el último mensaje es del usuario y debes responderlo):
${transcript}`;
  const data = await claudeJson({ system: CHAT_SYSTEM, user, maxTokens: 1200, effort: "low" });
  const f = data?.fields || {};
  const merged = { ...known };
  for (const k of FIELDS) {
    if (typeof f[k] === "string") merged[k] = f[k].trim();
    else if (f[k] === null && merged[k] == null) merged[k] = null;
  }
  return { fields: merged, reply: String(data?.reply || "").trim() };
}

// Respaldo determinista (sin ANTHROPIC_API_KEY o si Claude falla): misma secuencia de preguntas.
const QUESTIONS = {
  producto: "¿Qué producto o servicio vendes?",
  link: "¿Cuál es el link de tu landing, producto o página web? (si no tienes, escribe *no tengo*)",
  pais: "¿En qué país corres tus campañas?",
  problema: "¿Qué problema resuelve tu producto o servicio?",
};
function fallbackTurn(conv, text) {
  const fields = { ...conv.fields };
  const pending = FIELDS.find((k) => fields[k] == null);
  const isFirst = conv.transcript.filter((m) => m.role === "aria").length === 0;
  if (!isFirst && pending) {
    if (pending === "link") fields.link = /^(no|no tengo|ninguno|nada|n\/a)\b/i.test(text) ? "" : text;
    else fields[pending] = text;
  }
  const next = FIELDS.find((k) => fields[k] == null);
  let replyText;
  if (isFirst) {
    replyText = `¡Hola${conv.name ? " " + conv.name.split(" ")[0] : ""}! Soy Aria, la IA de Caperifai. Con 4 preguntas te armo el moodboard de tu marca y un anuncio listo para Meta. Primero: ${QUESTIONS.producto}`;
  } else if (next) {
    replyText = QUESTIONS[next];
  } else {
    replyText = `Perfecto: *${fields.producto}* en ${fields.pais}. Dame unos minutos y te mando por aquí el moodboard y tu anuncio.`;
  }
  return { fields, reply: replyText };
}

// ---- entrada principal ----

export async function handleInbound(msg) {
  const fresh = await kvSetNX(K.seen(msg.messageId), 1, 60 * 60 * 24);
  if (!fresh) return; // Meta reintenta entregas: ignorar duplicados
  markRead(msg.messageId);

  const phone = msg.from;
  let conv = await getActive(phone, msg.name);
  const text = msg.text;

  if (msg.type !== "text" && !text) {
    push(conv, "user", `[${msg.type}]`);
    await reply(conv, "Por ahora solo puedo leer mensajes de texto 🙏 ¿Me lo escribes?");
    await saveConversation(conv);
    return;
  }

  push(conv, "user", text);
  conv.unread = (conv.unread || 0) + 1;

  // El equipo tomó la conversación desde el inbox: solo registramos, Aria no contesta.
  if (conv.humanMode) {
    await saveConversation(conv);
    mirrorToSheet(conv, null).catch(() => {});
    return;
  }

  const restart = /^(reiniciar|empezar de nuevo|nuevo an[aá]lisis|otra marca)\b/i.test(text);
  if (restart && conv.status !== "collecting") {
    await saveConversation(conv);
    conv = await newConversation(phone, msg.name || conv.name);
    push(conv, "user", text);
  }

  if (conv.status === "generating") {
    await reply(conv, "Sigo trabajando en tu moodboard y tu anuncio ✨ En unos minutos te los mando por aquí.");
    await saveConversation(conv);
    return;
  }

  if (conv.status === "done") {
    await reply(
      conv,
      `Tu resultado completo está aquí: ${await siteUrl()}/r/${conv.resultId}\n\n¿Quieres que lo llevemos a una campaña completa? Agenda con el equipo de Caperifai: ${await ctaUrl()}\n\n(Si quieres analizar otra marca, escribe *reiniciar*.)`
    );
    await saveConversation(conv);
    return;
  }

  if (conv.status === "error") {
    if (/reintentar/i.test(text)) {
      conv.status = "generating";
      conv.error = null;
      await reply(conv, "Va de nuevo 💪 Dame unos minutos.");
      await saveConversation(conv);
      await triggerStage(conv.id, conv.stage || "brand");
    } else {
      await reply(conv, "Tuve un problema generando tu resultado. Escribe *reintentar* para volver a intentarlo o *reiniciar* para empezar de nuevo.");
      await saveConversation(conv);
    }
    return;
  }

  // status === "collecting"
  let turn;
  if (await hasAnthropic()) {
    try {
      turn = await ariaTurn(conv);
    } catch (e) {
      console.error("[flow] Claude falló, uso respaldo:", e?.message || e);
    }
  }
  if (!turn || !turn.reply) turn = fallbackTurn(conv, text);

  conv.fields = turn.fields;
  if (typeof conv.fields.link === "string" && conv.fields.link) {
    conv.fields.link = normalizeUrl(conv.fields.link) || conv.fields.link;
  }

  if (isComplete(conv.fields)) {
    // El resultado se crea ya, para mandar el link de avance en vivo en el mismo mensaje.
    const r = await createResult(conv);
    conv.status = "generating";
    conv.stage = "brand";
    await reply(conv, `${turn.reply}\n\n👀 Puedes ver el avance en vivo aquí: ${await siteUrl()}/r/${r.id}`);
    await saveConversation(conv);
    mirrorToSheet(conv, r).catch(() => {});
    await triggerStage(conv.id, "brand");
    return;
  }

  await reply(conv, turn.reply);
  await saveConversation(conv);
  mirrorToSheet(conv, null).catch(() => {});
}

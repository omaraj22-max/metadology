// WhatsApp Cloud API (Meta) — envío de mensajes, verificación del webhook y parseo del payload.
// Sin META_ACCESS_TOKEN / META_PHONE_NUMBER_ID (dev local) los envíos solo se registran en consola.
import { createHmac, timingSafeEqual } from "node:crypto";

const GRAPH = "https://graph.facebook.com/v21.0";

function creds() {
  const clean = (v) => (v || "").trim().replace(/^["']|["']$/g, "");
  return {
    token: clean(process.env.META_ACCESS_TOKEN),
    phoneId: clean(process.env.META_PHONE_NUMBER_ID),
    appSecret: clean(process.env.META_APP_SECRET),
    verifyToken: clean(process.env.META_WEBHOOK_VERIFY_TOKEN),
  };
}

export function waConfigured() {
  const c = creds();
  return !!(c.token && c.phoneId);
}

async function send(payload) {
  const { token, phoneId } = creds();
  if (!token || !phoneId) {
    console.log("[wa] (sin credenciales) →", JSON.stringify(payload).slice(0, 300));
    return { mock: true };
  }
  const res = await fetch(`${GRAPH}/${phoneId}/messages`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ messaging_product: "whatsapp", recipient_type: "individual", ...payload }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(`WhatsApp ${res.status}: ${data?.error?.message || "error"}`);
  }
  return data;
}

export function sendText(to, body) {
  // Límite de WhatsApp: 4096 caracteres por mensaje de texto.
  return send({ to, type: "text", text: { body: String(body).slice(0, 4000), preview_url: true } });
}

export function sendImage(to, link, caption) {
  return send({
    to,
    type: "image",
    image: { link, ...(caption ? { caption: String(caption).slice(0, 1000) } : {}) },
  });
}

export async function markRead(messageId) {
  const { token, phoneId } = creds();
  if (!token || !phoneId || !messageId) return;
  try {
    await fetch(`${GRAPH}/${phoneId}/messages`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ messaging_product: "whatsapp", status: "read", message_id: messageId }),
    });
  } catch {
    // no crítico
  }
}

/** GET del webhook: Meta manda hub.mode/hub.verify_token/hub.challenge. */
export function verifyChallenge(searchParams) {
  const { verifyToken } = creds();
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");
  if (mode === "subscribe" && verifyToken && token === verifyToken) return challenge || "";
  return null;
}

/** Firma X-Hub-Signature-256 (HMAC-SHA256 del body crudo con el App Secret). Sin secret configurado no se valida. */
export function verifySignature(rawBody, header) {
  const { appSecret } = creds();
  if (!appSecret) return true;
  if (!header || !header.startsWith("sha256=")) return false;
  const expected = createHmac("sha256", appSecret).update(rawBody).digest("hex");
  const given = header.slice(7);
  if (given.length !== expected.length) return false;
  return timingSafeEqual(Buffer.from(given, "hex"), Buffer.from(expected, "hex"));
}

/**
 * Extrae los mensajes entrantes del payload del webhook.
 * Devuelve [{ from, name, messageId, timestamp, type, text }].
 */
export function parseInbound(body) {
  const out = [];
  for (const entry of body?.entry || []) {
    for (const change of entry?.changes || []) {
      const value = change?.value;
      if (!value?.messages) continue;
      const names = {};
      for (const c of value.contacts || []) {
        if (c?.wa_id) names[c.wa_id] = c?.profile?.name || "";
      }
      for (const m of value.messages) {
        const type = m.type;
        let text = "";
        if (type === "text") text = m.text?.body || "";
        else if (type === "button") text = m.button?.text || "";
        else if (type === "interactive") text = m.interactive?.button_reply?.title || m.interactive?.list_reply?.title || "";
        else if (["image", "video", "document", "audio", "sticker"].includes(type)) text = m[type]?.caption || "";
        out.push({
          from: m.from,
          name: names[m.from] || "",
          messageId: m.id,
          timestamp: m.timestamp,
          type,
          text: String(text || "").trim(),
        });
      }
    }
  }
  return out;
}

// Espejo de cada conversación de WhatsApp en el Google Sheet (Apps Script, acción "wa_upsert").
// Misma URL que usa /api/analyze para los leads del formulario web. Fail-soft: nunca rompe el flujo.
import { getSetting } from "./settings";

const ROLE = { user: "Usuario", aria: "Aria", human: "Equipo" };

export async function conversationRow(conv, result) {
  const siteUrl = (await getSetting("SITE_URL")).replace(/\/$/, "");
  const f = conv.fields || {};
  const transcript = (conv.transcript || [])
    .map((m) => `[${new Date(m.at).toISOString().slice(0, 16).replace("T", " ")}] ${ROLE[m.role] || m.role}: ${m.text}`)
    .join("\n");
  return {
    convId: conv.id,
    telefono: conv.phone,
    nombre: conv.name || "",
    inicio: new Date(conv.createdAt).toISOString(),
    ultimaActividad: new Date(conv.updatedAt).toISOString(),
    status: conv.status,
    etapa: conv.stage || "",
    producto: f.producto || "",
    link: f.link || "",
    pais: f.pais || "",
    problema: f.problema || "",
    marca: result?.brand?.marca || "",
    resultadoUrl: conv.resultId ? `${siteUrl}/r/${conv.resultId}` : "",
    moodboardUrl: result?.moodboardImg ? `${siteUrl}/api/wa/image/${result.moodboardImg}` : "",
    adUrl: result?.adImg ? `${siteUrl}/api/wa/image/${result.adImg}` : "",
    hook: result?.campaign?.copy?.hook || "",
    error: conv.error || "",
    mensajes: (conv.transcript || []).length,
    transcript: transcript.slice(0, 45000),
  };
}

// El Apps Script debe ser la versión con soporte WhatsApp (doGet responde whatsapp:true); si no,
// la acción wa_upsert caería como "lead" y ensuciaría la pestaña Leads. Se verifica una vez por instancia.
let supportsWa = { url: null, ok: null };
export async function sheetSupportsWa(url) {
  if (supportsWa.url === url && supportsWa.ok !== null) return supportsWa.ok;
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 8000);
    const res = await fetch(url, { redirect: "follow", signal: controller.signal, cache: "no-store" });
    clearTimeout(timer);
    const j = await res.json().catch(() => null);
    supportsWa = { url, ok: !!(j && j.whatsapp === true) };
  } catch {
    supportsWa = { url, ok: null }; // sin respuesta: se vuelve a intentar en la siguiente llamada
    return false;
  }
  if (!supportsWa.ok) console.warn("[sheet] el Apps Script desplegado no tiene la acción wa_upsert; no se espeja a Sheets.");
  return supportsWa.ok;
}

/** Prueba de conexión para el back office. */
export async function testConnection() {
  const url = await getSetting("APPS_SCRIPT_URL");
  if (!url) throw new Error("Falta la URL del Apps Script.");
  supportsWa = { url: null, ok: null };
  const ok = await sheetSupportsWa(url);
  if (ok === null || ok === false) {
    throw new Error(ok === null ? "El Web App no respondió." : "Responde, pero es la versión vieja del script (sin wa_upsert). Pega el Code.gs nuevo y redespliega como nueva versión.");
  }
  return "Web App con soporte WhatsApp (wa_upsert) ✓";
}

export async function mirrorToSheet(conv, result) {
  const url = await getSetting("APPS_SCRIPT_URL");
  if (!url) return false;
  if (process.env.NODE_ENV !== "production" && process.env.SHEET_MIRROR !== "1") return false; // dev: no tocar el Sheet real
  if (!(await sheetSupportsWa(url))) return false;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 10000);
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "wa_upsert", ...(await conversationRow(conv, result)) }),
      redirect: "follow",
      signal: controller.signal,
    });
    return res.ok;
  } catch (e) {
    console.warn("[sheet] no se pudo espejar:", e?.message || e);
    return false;
  } finally {
    clearTimeout(timer);
  }
}

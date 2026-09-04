// Espejo de cada conversación de WhatsApp en el Google Sheet (Apps Script, acción "wa_upsert").
// Misma URL que usa /api/analyze para los leads del formulario web. Fail-soft: nunca rompe el flujo.
const SHEET_URL =
  process.env.APPS_SCRIPT_URL ||
  process.env.NEXT_PUBLIC_WEBHOOK_URL ||
  "https://script.google.com/macros/s/AKfycbyzmGS0QC27C9WNsaD7rKmEebPnQSGIA0TS6YXBIzFdmOCPqPZR2fFLE0h6iNgvF-JU/exec";

function siteUrl() {
  return (process.env.SITE_URL || "https://metadology.caperif.ai").replace(/\/$/, "");
}

export function conversationRow(conv, result) {
  const f = conv.fields || {};
  const transcript = (conv.transcript || [])
    .map((m) => `[${new Date(m.at).toISOString().slice(0, 16).replace("T", " ")}] ${m.role === "user" ? "Usuario" : "Aria"}: ${m.text}`)
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
    resultadoUrl: conv.resultId ? `${siteUrl()}/r/${conv.resultId}` : "",
    moodboardUrl: result?.moodboardImg ? `${siteUrl()}/api/wa/image/${result.moodboardImg}` : "",
    adUrl: result?.adImg ? `${siteUrl()}/api/wa/image/${result.adImg}` : "",
    hook: result?.campaign?.copy?.hook || "",
    error: conv.error || "",
    mensajes: (conv.transcript || []).length,
    transcript: transcript.slice(0, 45000),
  };
}

// El Apps Script debe ser la versión con soporte WhatsApp (doGet responde whatsapp:true); si no,
// la acción wa_upsert caería como "lead" y ensuciaría la pestaña Leads. Se verifica una vez por instancia.
let supportsWa = null;
async function sheetSupportsWa() {
  if (supportsWa !== null) return supportsWa;
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 8000);
    const res = await fetch(SHEET_URL, { redirect: "follow", signal: controller.signal, cache: "no-store" });
    clearTimeout(timer);
    const j = await res.json().catch(() => null);
    supportsWa = !!(j && j.whatsapp === true);
  } catch {
    supportsWa = null; // sin respuesta: se vuelve a intentar en la siguiente llamada
    return false;
  }
  if (!supportsWa) console.warn("[sheet] el Apps Script desplegado no tiene la acción wa_upsert; no se espeja a Sheets.");
  return supportsWa;
}

export async function mirrorToSheet(conv, result) {
  if (!SHEET_URL) return false;
  if (process.env.NODE_ENV !== "production" && process.env.SHEET_MIRROR !== "1") return false; // dev: no tocar el Sheet real
  if (!(await sheetSupportsWa())) return false;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 10000);
  try {
    const res = await fetch(SHEET_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "wa_upsert", ...conversationRow(conv, result) }),
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

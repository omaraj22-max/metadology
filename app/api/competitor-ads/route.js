import Anthropic from "@anthropic-ai/sdk";

export const runtime = "nodejs";
export const maxDuration = 60;

const APIFY_TOKEN = process.env.APIFY_TOKEN || "";
const APIFY_ACTOR = "automation-lab~facebook-ads-library";

// Convierte el texto libre del usuario en una búsqueda corta para la Ad Library.
// El usuario escribe descripciones largas, vagas o fuera de tema; Claude extrae el término.
async function deriveKeyword(producto) {
  const txt = String(producto || "").trim();
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey || !txt) return txt.slice(0, 60);
  try {
    const client = new Anthropic({ apiKey });
    const msg = await client.messages.create({
      model: process.env.ANTHROPIC_COMPETITIVE_MODEL || "claude-haiku-4-5-20251001",
      max_tokens: 24,
      system:
        "Del texto que escribe un negocio sobre lo que vende, devuelve ÚNICAMENTE una búsqueda corta (1-4 palabras, español) para encontrar anuncios de su COMPETENCIA en la biblioteca de anuncios de Meta. Solo el término de búsqueda: sin comillas, sin etiquetas, sin explicación. Usa el sustantivo/categoría principal del producto o servicio (no la marca propia del usuario). Si el texto es muy vago, usa lo más cercano a una categoría comercial.",
      messages: [{ role: "user", content: txt.slice(0, 800) }],
    });
    const kw = msg.content
      .filter((b) => b.type === "text")
      .map((b) => b.text)
      .join(" ")
      .trim()
      .replace(/^["'¿¡.\s]+|["'.\s]+$/g, "")
      .slice(0, 60);
    return kw || txt.slice(0, 60);
  } catch (e) {
    return txt.slice(0, 60);
  }
}

function pick(obj, paths) {
  for (const p of paths) {
    const v = p.split(".").reduce((o, k) => (o == null ? undefined : o[k]), obj);
    if (v != null && v !== "") return v;
  }
  return undefined;
}

function normalizeDate(v) {
  if (v == null) return "";
  const s = String(v);
  if (/^\d{9,10}$/.test(s)) {
    const d = new Date(parseInt(s, 10) * 1000);
    return d.toISOString().slice(0, 10);
  }
  return s.slice(0, 10);
}

// Mapeo tolerante a variaciones de nombres de campo entre versiones del actor.
function mapAd(it) {
  const id = pick(it, ["adArchiveId", "ad_archive_id", "adId", "id", "snapshot.ad_archive_id"]);
  const link =
    pick(it, ["adLibraryUrl", "ad_library_url", "url"]) ||
    (id ? `https://www.facebook.com/ads/library/?id=${id}` : "");
  const img =
    pick(it, [
      "imageUrls.0",
      "snapshot.images.0.original_image_url",
      "snapshot.images.0.resized_image_url",
      "imageUrl",
      "snapshot.cards.0.original_image_url",
    ]) || (Array.isArray(it.imageUrls) ? it.imageUrls[0] : "") || "";
  return {
    id: id || "",
    pagina: pick(it, ["pageName", "page_name", "snapshot.page_name", "pageInfo.name"]) || "",
    inicio: normalizeDate(
      pick(it, ["startDate", "ad_delivery_start_time", "startDateFormatted", "start_date", "snapshot.creation_time"])
    ),
    titulo: pick(it, ["title", "snapshot.title", "snapshot.cards.0.title"]) || "",
    copy: String(
      pick(it, ["bodyText", "snapshot.body.text", "body.text", "ad_creative_body", "adText", "snapshot.cards.0.body"]) || ""
    ).slice(0, 500),
    cta: pick(it, ["ctaText", "snapshot.cta_text", "cta_text"]) || "",
    imagen: img,
    link,
    plataformas: pick(it, ["platforms", "publisher_platforms", "publisher_platform"]) || [],
  };
}

// Arranca un run async (respuesta inmediata) y devuelve el runId.
async function startRun(producto, country) {
  const res = await fetch(`https://api.apify.com/v2/acts/${APIFY_ACTOR}/runs?token=${APIFY_TOKEN}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      searchQueries: [String(producto).slice(0, 80)],
      country: country || "MX",
      activeStatus: "active",
      mediaType: "all",
      maxAds: 10,
    }),
  });
  const json = await res.json().catch(() => null);
  return { runId: json?.data?.id || null, startStatus: res.status, startRaw: json };
}

// Revisa el estado del run; si terminó, trae y mapea los anuncios.
async function pollRun(runId, debug) {
  const r = await fetch(`https://api.apify.com/v2/actor-runs/${runId}?token=${APIFY_TOKEN}`);
  const j = await r.json().catch(() => null);
  const status = j?.data?.status || "UNKNOWN";
  if (status !== "SUCCEEDED") return { ok: true, status };
  const di = await fetch(
    `https://api.apify.com/v2/actor-runs/${runId}/dataset/items?token=${APIFY_TOKEN}&clean=true`
  );
  const items = await di.json().catch(() => null);
  const arr = Array.isArray(items) ? items : [];
  const ads = arr.map(mapAd).filter((a) => a.pagina || a.copy || a.titulo || a.imagen);
  ads.sort((a, b) => (a.inicio || "9999").localeCompare(b.inicio || "9999"));
  const out = { ok: true, status: "SUCCEEDED", count: ads.length, ads: ads.slice(0, 12) };
  if (debug || ads.length === 0) out.debug = { rawCount: arr.length, rawSample: arr[0] || null };
  return out;
}

async function handle({ producto, runId, country, debug }) {
  if (!APIFY_TOKEN) return Response.json({ ok: false, error: "Falta APIFY_TOKEN en el servidor." });
  try {
    if (runId) return Response.json(await pollRun(runId, debug));
    if (!producto) return Response.json({ ok: false, error: "Falta 'producto' / 'q'." });
    const keyword = await deriveKeyword(producto);
    const { runId: id, startStatus, startRaw } = await startRun(keyword, country);
    if (!id) return Response.json({ ok: false, error: "No se pudo iniciar el run de Apify.", keyword, startStatus, startRaw });
    return Response.json({ ok: true, runId: id, keyword, status: "RUNNING" });
  } catch (e) {
    return Response.json({ ok: false, error: String(e?.message || e) });
  }
}

export async function POST(req) {
  let b = {};
  try { b = await req.json(); } catch {}
  return handle({ producto: b.producto || b.q, runId: b.runId, country: b.country, debug: !!b.debug });
}

export async function GET(req) {
  const u = new URL(req.url);
  return handle({
    producto: u.searchParams.get("q"),
    runId: u.searchParams.get("runId"),
    country: u.searchParams.get("country"),
    debug: u.searchParams.get("debug") != null,
  });
}

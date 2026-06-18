export const runtime = "nodejs";
export const maxDuration = 60;

const APIFY_TOKEN = process.env.APIFY_TOKEN || "";
const APIFY_ACTOR = "automation-lab~facebook-ads-library";

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
  // unix seconds → YYYY-MM-DD
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

async function runApify(producto, country) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 50000);
  try {
    const res = await fetch(
      `https://api.apify.com/v2/acts/${APIFY_ACTOR}/run-sync-get-dataset-items?token=${APIFY_TOKEN}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          searchQueries: [String(producto).slice(0, 80)],
          country: country || "MX",
          activeStatus: "active",
          mediaType: "all",
          maxAds: 12,
        }),
        signal: controller.signal,
      }
    );
    const status = res.status;
    let raw;
    try { raw = await res.json(); } catch { raw = null; }
    return { status, raw };
  } finally {
    clearTimeout(timer);
  }
}

async function handle(producto, country, debug) {
  if (!APIFY_TOKEN) {
    return Response.json({ ok: false, error: "Falta APIFY_TOKEN en el servidor.", ads: [] });
  }
  if (!producto) {
    return Response.json({ ok: false, error: "Falta 'producto' / 'q'.", ads: [] });
  }
  try {
    const { status, raw } = await runApify(producto, country);
    const items = Array.isArray(raw) ? raw : Array.isArray(raw?.items) ? raw.items : [];
    const ads = items
      .map(mapAd)
      .filter((a) => a.pagina || a.copy || a.titulo || a.imagen);
    ads.sort((a, b) => (a.inicio || "9999").localeCompare(b.inicio || "9999"));
    const out = { ok: true, count: ads.length, ads: ads.slice(0, 12) };
    if (debug || ads.length === 0) {
      out.debug = {
        apifyStatus: status,
        rawCount: items.length,
        rawSample: items[0] || raw || null,
      };
    }
    return Response.json(out);
  } catch (e) {
    return Response.json({ ok: false, error: String(e?.message || e), ads: [] });
  }
}

export async function POST(req) {
  let body = {};
  try { body = await req.json(); } catch {}
  return handle(body.producto || body.q, body.country, !!body.debug);
}

export async function GET(req) {
  const url = new URL(req.url);
  return handle(url.searchParams.get("q"), url.searchParams.get("country"), url.searchParams.get("debug") != null);
}

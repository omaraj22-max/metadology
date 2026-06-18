export const runtime = "nodejs";
export const maxDuration = 120;

// fal.ai. Modelo configurable por env. Default: GPT Image 2 de OpenAI en fal.
const FAL_MODEL = process.env.FAL_IMAGE_MODEL || "openai/gpt-image-2";

export async function POST(req) {
  const FAL_KEY = process.env.FAL_KEY || process.env.FAL_API_KEY || "";
  if (!FAL_KEY) {
    return Response.json({ error: "Falta FAL_KEY en el servidor." }, { status: 500 });
  }
  let body = {};
  try { body = await req.json(); } catch {}
  const prompt = body && body.prompt;
  if (!prompt) {
    return Response.json({ error: "Falta 'prompt'." }, { status: 400 });
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 110000);
  try {
    const res = await fetch(`https://fal.run/${FAL_MODEL}`, {
      method: "POST",
      headers: { Authorization: `Key ${FAL_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: String(prompt).slice(0, 4000), num_images: 1 }),
      signal: controller.signal,
    });
    const json = await res.json().catch(() => null);
    if (!res.ok) {
      return Response.json(
        { error: json?.detail || json?.error || `fal ${res.status}` },
        { status: 502 }
      );
    }
    const url =
      json?.images?.[0]?.url ||
      json?.image?.url ||
      (Array.isArray(json?.images) && typeof json.images[0] === "string" ? json.images[0] : "") ||
      "";
    if (!url) {
      return Response.json({ error: "fal no devolvió imagen." }, { status: 502 });
    }
    return Response.json({ url });
  } catch (e) {
    return Response.json({ error: String(e?.message || e) }, { status: 502 });
  } finally {
    clearTimeout(timer);
  }
}

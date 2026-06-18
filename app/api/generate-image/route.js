export const runtime = "nodejs";
export const maxDuration = 120;

// fal.ai. Modelo configurable por env. Default: GPT Image 2 de OpenAI en fal.
const FAL_MODEL = process.env.FAL_IMAGE_MODEL || "openai/gpt-image-2";

async function jget(url, headers) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15000);
  try {
    const res = await fetch(url, { headers, signal: controller.signal });
    const json = await res.json().catch(() => null);
    return { ok: res.ok, status: res.status, json };
  } finally {
    clearTimeout(timer);
  }
}

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

  const headers = { Authorization: `Key ${FAL_KEY}`, "Content-Type": "application/json" };
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  try {
    // 1) Submit a la cola (respuesta inmediata con request_id + urls).
    const subController = new AbortController();
    const subTimer = setTimeout(() => subController.abort(), 15000);
    let subj;
    try {
      const sub = await fetch(`https://queue.fal.run/${FAL_MODEL}`, {
        method: "POST",
        headers,
        body: JSON.stringify({ prompt: String(prompt).slice(0, 4000) }),
        signal: subController.signal,
      });
      subj = await sub.json().catch(() => null);
      if (!sub.ok) {
        return Response.json(
          { error: subj?.detail || subj?.error || `fal ${sub.status}` },
          { status: 502 }
        );
      }
    } finally {
      clearTimeout(subTimer);
    }
    const statusUrl = subj?.status_url;
    const responseUrl = subj?.response_url;
    if (!statusUrl || !responseUrl) {
      return Response.json({ error: "fal no devolvió status/response url." }, { status: 502 });
    }

    // 2) Polling del estado (cada 2.5s, máx ~100s).
    let done = false;
    for (let i = 0; i < 40; i++) {
      await sleep(2500);
      const st = await jget(statusUrl, headers).catch(() => null);
      const status = st?.json?.status;
      if (status === "COMPLETED") { done = true; break; }
      if (status && !["IN_QUEUE", "IN_PROGRESS"].includes(status)) {
        return Response.json({ error: `fal status ${status}` }, { status: 502 });
      }
    }
    if (!done) {
      return Response.json({ error: "fal tardó demasiado (timeout)." }, { status: 504 });
    }

    // 3) Resultado.
    const r = await jget(responseUrl, headers);
    const rj = r.json;
    const url =
      rj?.images?.[0]?.url ||
      rj?.image?.url ||
      (Array.isArray(rj?.images) && typeof rj.images[0] === "string" ? rj.images[0] : "") ||
      "";
    if (!url) {
      return Response.json({ error: "fal no devolvió imagen." }, { status: 502 });
    }
    return Response.json({ url });
  } catch (e) {
    return Response.json({ error: String(e?.message || e) }, { status: 502 });
  }
}

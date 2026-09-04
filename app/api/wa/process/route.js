import { waitUntil } from "@vercel/functions";
import { runStage } from "@/lib/pipeline";
import { internalSecret } from "@/lib/flow";

export const runtime = "nodejs";
export const maxDuration = 300;

// Corre UNA etapa del pipeline en background y responde 202 al instante, para que la etapa
// anterior pueda terminar su invocación sin esperar a esta.
export async function POST(req) {
  if (req.headers.get("x-wa-secret") !== internalSecret()) {
    return new Response("Forbidden", { status: 403 });
  }
  let body = {};
  try { body = await req.json(); } catch {}
  const { convId, stage } = body || {};
  if (!convId || !stage) return Response.json({ error: "convId y stage requeridos" }, { status: 400 });
  waitUntil(runStage(convId, stage).catch((e) => console.error("[process] error:", e)));
  return Response.json({ ok: true, convId, stage }, { status: 202 });
}

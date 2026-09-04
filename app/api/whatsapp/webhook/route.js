import { waitUntil } from "@vercel/functions";
import { verifyChallenge, verifySignature, parseInbound } from "@/lib/wa";
import { handleInbound } from "@/lib/flow";

export const runtime = "nodejs";
export const maxDuration = 60;

// Verificación del webhook (Meta → GET con hub.challenge)
export async function GET(req) {
  const challenge = await verifyChallenge(new URL(req.url).searchParams);
  if (challenge === null) return new Response("Forbidden", { status: 403 });
  return new Response(challenge, { status: 200 });
}

// Mensajes entrantes. Respondemos 200 de inmediato y procesamos en background (waitUntil):
// Meta reintenta si tardamos, y la respuesta de Aria puede tomar varios segundos.
export async function POST(req) {
  const raw = await req.text();
  if (!(await verifySignature(raw, req.headers.get("x-hub-signature-256")))) {
    return new Response("Bad signature", { status: 401 });
  }
  let body = {};
  try { body = JSON.parse(raw); } catch {}
  const inbound = parseInbound(body);
  for (const msg of inbound) {
    waitUntil(handleInbound(msg).catch((e) => console.error("[webhook] error:", e)));
  }
  return Response.json({ ok: true, received: inbound.length });
}

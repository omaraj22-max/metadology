import { waitUntil } from "@vercel/functions";
import { verifyChallenge, verifySignature, parseInbound } from "@/lib/wa";
import { handleInbound } from "@/lib/flow";
import { logPush, K } from "@/lib/store";

export const runtime = "nodejs";
export const maxDuration = 60;

// Cada llamada queda en la bitácora (wa:hooks) para poder diagnosticar desde /back-office/diagnostico.
async function log(entry) {
  try {
    await logPush(K.hooks, { at: Date.now(), ...entry });
  } catch (e) {
    console.error("[webhook] no se pudo escribir la bitácora:", e?.message || e);
  }
}

// Verificación del webhook (Meta → GET con hub.challenge)
export async function GET(req) {
  const params = new URL(req.url).searchParams;
  const challenge = await verifyChallenge(params);
  if (challenge === null) {
    await log({ kind: "verify", ok: false, detail: `token recibido: ${params.get("hub.verify_token") || "(ninguno)"}` });
    return new Response("Forbidden", { status: 403 });
  }
  await log({ kind: "verify", ok: true, detail: "Meta verificó la URL correctamente" });
  return new Response(challenge, { status: 200 });
}

// Mensajes entrantes. Respondemos 200 de inmediato y procesamos en background (waitUntil):
// Meta reintenta si tardamos, y la respuesta de Aria puede tomar varios segundos.
export async function POST(req) {
  const raw = await req.text();

  if (!(await verifySignature(raw, req.headers.get("x-hub-signature-256")))) {
    await log({ kind: "post", ok: false, detail: "Firma inválida: el App Secret no coincide con el de la app de Meta." });
    return new Response("Bad signature", { status: 401 });
  }

  let body = {};
  try { body = JSON.parse(raw); } catch {}

  const field = body?.entry?.[0]?.changes?.[0]?.field || "(sin field)";
  const inbound = parseInbound(body);

  if (!inbound.length) {
    // Meta también manda estados de entrega (sent/delivered/read); no son mensajes.
    const statuses = body?.entry?.[0]?.changes?.[0]?.value?.statuses?.length || 0;
    await log({ kind: "post", ok: true, field, messages: 0, detail: statuses ? `${statuses} actualización(es) de estado` : "sin mensajes en el payload" });
    return Response.json({ ok: true, received: 0 });
  }

  await log({ kind: "post", ok: true, field, messages: inbound.length, detail: inbound.map((m) => `${m.from}: ${m.text?.slice(0, 40) || "[" + m.type + "]"}`).join(" · ") });

  for (const msg of inbound) {
    waitUntil(
      handleInbound(msg).catch(async (e) => {
        console.error("[webhook] error procesando:", e);
        await log({ kind: "process", ok: false, detail: `${msg.from}: ${e?.message || e}` });
      })
    );
  }
  return Response.json({ ok: true, received: inbound.length });
}

import { getConversation, sendHuman } from "@/lib/flow";

export const runtime = "nodejs";

// Mensaje del equipo al lead desde el inbox. Al escribir, la conversación pasa a modo humano
// (Aria deja de contestar) para no pisarse.
export async function POST(req) {
  let body = {};
  try { body = await req.json(); } catch {}
  const text = String(body?.text || "").trim();
  const conv = await getConversation(String(body?.convId || "").replace(/[^a-z0-9]/gi, ""));
  if (!conv) return Response.json({ error: "no existe" }, { status: 404 });
  if (!text) return Response.json({ error: "mensaje vacío" }, { status: 400 });
  conv.humanMode = true;
  conv.unread = 0;
  try {
    await sendHuman(conv, text);
  } catch (e) {
    return Response.json({ error: String(e?.message || e) }, { status: 502 });
  }
  return Response.json({ ok: true, conversation: conv });
}

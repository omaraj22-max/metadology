import { getConversation, saveConversation, triggerStage } from "@/lib/flow";

export const runtime = "nodejs";

// Reintenta el pipeline de una conversación (desde la etapa en la que se quedó, o desde el inicio).
// Protegido por el middleware del back office.
export async function POST(req) {
  let body = {};
  try { body = await req.json(); } catch {}
  const conv = await getConversation(body?.convId);
  if (!conv) return Response.json({ error: "no existe" }, { status: 404 });
  const stage = body?.fromStart ? "brand" : (conv.stage && conv.stage !== "done" ? conv.stage : "brand");
  conv.status = "generating";
  conv.error = null;
  await saveConversation(conv);
  await triggerStage(conv.id, stage);
  return Response.json({ ok: true, stage });
}

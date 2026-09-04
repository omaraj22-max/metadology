import { kvGet, K } from "@/lib/store";
import { getConversation, saveConversation } from "@/lib/flow";
import { mirrorToSheet } from "@/lib/sheet";

export const runtime = "nodejs";

function clean(id) {
  return String(id || "").replace(/[^a-z0-9]/gi, "");
}

export async function GET(_req, { params }) {
  const c = await getConversation(clean(params.id));
  if (!c) return Response.json({ error: "no existe" }, { status: 404 });
  const result = c.resultId ? await kvGet(K.result(c.resultId)) : null;
  return Response.json(
    { conversation: c, result: result ? { id: result.id, brand: result.brand, moodboardImg: result.moodboardImg, adImg: result.adImg, hook: result.campaign?.copy?.hook } : null },
    { headers: { "Cache-Control": "no-store" } }
  );
}

// PATCH { humanMode?: boolean, read?: true }
export async function PATCH(req, { params }) {
  const c = await getConversation(clean(params.id));
  if (!c) return Response.json({ error: "no existe" }, { status: 404 });
  let body = {};
  try { body = await req.json(); } catch {}
  if (typeof body.humanMode === "boolean") c.humanMode = body.humanMode;
  if (body.read) c.unread = 0;
  await saveConversation(c);
  if (typeof body.humanMode === "boolean") mirrorToSheet(c, null).catch(() => {});
  return Response.json({ ok: true, humanMode: !!c.humanMode, unread: c.unread || 0 });
}

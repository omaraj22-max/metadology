import { zRevRange, kvGet, K } from "@/lib/store";

export const runtime = "nodejs";

// Lista para el inbox (ligera: sin transcripción completa).
export async function GET() {
  const ids = await zRevRange(K.convs, 0, 299);
  const convs = (await Promise.all(ids.map((id) => kvGet(K.conv(id))))).filter(Boolean);
  const list = convs.map((c) => {
    const last = c.transcript?.[c.transcript.length - 1];
    return {
      id: c.id, phone: c.phone, name: c.name, status: c.status, stage: c.stage, humanMode: !!c.humanMode,
      unread: c.unread || 0, updatedAt: c.updatedAt, resultId: c.resultId, producto: c.fields?.producto || "",
      last: last ? { role: last.role, text: last.text.slice(0, 90), at: last.at } : null,
      lastUserAt: [...(c.transcript || [])].reverse().find((m) => m.role === "user")?.at || null,
    };
  });
  return Response.json({ conversations: list, now: Date.now() }, { headers: { "Cache-Control": "no-store" } });
}

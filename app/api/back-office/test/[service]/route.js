import { testConnection as testWa } from "@/lib/wa";
import { testConnection as testClaude } from "@/lib/ai";
import { testOpenAI } from "@/lib/engine";
import { testConnection as testSheet } from "@/lib/sheet";

export const runtime = "nodejs";
export const maxDuration = 60;

const TESTS = { whatsapp: testWa, claude: testClaude, openai: testOpenAI, sheet: testSheet };

export async function POST(_req, { params }) {
  const fn = TESTS[params?.service];
  if (!fn) return Response.json({ ok: false, error: "servicio desconocido" }, { status: 404 });
  try {
    return Response.json({ ok: true, message: await fn() });
  } catch (e) {
    return Response.json({ ok: false, error: String(e?.message || e) });
  }
}

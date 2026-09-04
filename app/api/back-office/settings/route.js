import { describeSettings, saveSettings } from "@/lib/settings";

export const runtime = "nodejs";

export async function GET() {
  return Response.json({ groups: await describeSettings() });
}

// Guarda solo las llaves enviadas. Un secreto vacío se conserva (no se borra por dejar el campo en blanco);
// para borrarlo se manda "__clear__".
export async function POST(req) {
  let body = {};
  try { body = await req.json(); } catch {}
  const patch = {};
  for (const [k, v] of Object.entries(body || {})) {
    if (v === "__clear__") patch[k] = "";
    else if (typeof v === "string" && v.trim()) patch[k] = v;
  }
  await saveSettings(patch);
  return Response.json({ ok: true, groups: await describeSettings() });
}

import { handleInbound } from "@/lib/flow";

export const runtime = "nodejs";
export const maxDuration = 300;

// Inyecta un mensaje como si viniera del webhook, saltándose la firma de Meta.
// Sirve para separar el problema: si esto funciona, lo que falla es la entrega de Meta.
// Protegido por el middleware del back office.
export async function POST(req) {
  let body = {};
  try { body = await req.json(); } catch {}
  const phone = String(body?.phone || "").replace(/[^0-9]/g, "");
  const text = String(body?.text || "hola").trim();
  if (!phone) return Response.json({ error: "Falta el número (solo dígitos, con código de país)." }, { status: 400 });
  try {
    await handleInbound({
      from: phone,
      name: String(body?.name || "Prueba").slice(0, 40),
      messageId: `sim-${Date.now()}`,
      timestamp: String(Math.floor(Date.now() / 1000)),
      type: "text",
      text,
    });
    return Response.json({ ok: true });
  } catch (e) {
    return Response.json({ error: String(e?.message || e) }, { status: 500 });
  }
}

import { subscribeApp } from "@/lib/wa";

export const runtime = "nodejs";

// Suscribe la cuenta de WhatsApp Business a esta app (POST /{waba-id}/subscribed_apps).
// Sin esto Meta no entrega los mensajes aunque el webhook esté verificado.
export async function POST() {
  try {
    return Response.json({ ok: true, message: await subscribeApp() });
  } catch (e) {
    return Response.json({ ok: false, error: String(e?.message || e) }, { status: 502 });
  }
}

// Alta de leads de la landing de referidos (/referrals).
// Escribe en el mismo Apps Script que el resto del sitio, con la acción "referral"
// (pestaña "Referidos"). Si el Web App desplegado todavía es la versión vieja, cae
// a la acción "lead" y el registro aterriza en la pestaña "Leads" con los campos
// que sí comparte — nunca se pierde el contacto.

export const runtime = "nodejs";

const WEBHOOK = process.env.APPS_SCRIPT_URL || process.env.NEXT_PUBLIC_WEBHOOK_URL || "";

const clean = (v, max = 400) => String(v ?? "").trim().slice(0, max);
const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);

export async function POST(req) {
  let body;
  try {
    body = await req.json();
  } catch {
    return Response.json({ ok: false, error: "Solicitud inválida." }, { status: 400 });
  }

  const lead = {
    nombre: clean(body.nombre, 120),
    correo: clean(body.correo, 160).toLowerCase(),
    empresa: clean(body.empresa, 120),
    rol: clean(body.rol, 60),
    etapa: clean(body.etapa, 40),
    presupuesto: clean(body.presupuesto, 40),
    canales: clean(body.canales, 200),
    problema: clean(body.problema, 300),
    referido: clean(body.referido, 120),
    origen: clean(body.origen, 500),
  };

  if (!lead.nombre || !lead.empresa) {
    return Response.json({ ok: false, error: "Faltan datos obligatorios." }, { status: 400 });
  }
  if (!isEmail(lead.correo)) {
    return Response.json({ ok: false, error: "Revisa tu correo." }, { status: 400 });
  }

  if (!WEBHOOK) {
    // Sin webhook configurado no se pierde el lead: queda en los logs de la función.
    console.warn("[referrals] falta APPS_SCRIPT_URL; lead sin registrar:", JSON.stringify(lead));
    return Response.json({ ok: true, stored: false });
  }

  const payload = {
    action: "referral",
    fecha: new Date().toISOString(),
    ...lead,
    // Alias de la pestaña "Leads" para que un Apps Script viejo también registre algo.
    producto: `${lead.rol} · ${lead.etapa} · ${lead.presupuesto}`,
    link: lead.origen,
  };

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 10000);
  try {
    const res = await fetch(WEBHOOK, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      redirect: "follow",
      signal: controller.signal,
    });
    if (!res.ok) throw new Error(`webhook ${res.status}`);
    return Response.json({ ok: true, stored: true });
  } catch (e) {
    console.error("[referrals] no se pudo registrar el lead:", e?.message || e, JSON.stringify(lead));
    // El contacto ya quedó en logs: no se le pide al usuario repetir el formulario.
    return Response.json({ ok: true, stored: false });
  } finally {
    clearTimeout(timer);
  }
}

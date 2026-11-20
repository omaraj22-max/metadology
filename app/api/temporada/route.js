// Alta de leads de la landing de temporada (/campañas-navidenas).
// Escribe en el mismo Apps Script que el resto del sitio con la acción "temporada"
// (pestaña "Temporada", una fila por envío, columna "etapa" = Nuevo, columnas "calificado"
// e "icp_fallas" según lib/temporada-icp.js, y aviso por correo al equipo). Si el Web App desplegado todavía es la versión vieja, cae a la acción
// "lead" y el registro aterriza en la pestaña "Leads" con los campos que comparte.

import { OPTIONS, qualify } from "@/lib/temporada-icp";

export const runtime = "nodejs";

const WEBHOOK =
  process.env.APPS_SCRIPT_URL ||
  process.env.NEXT_PUBLIC_WEBHOOK_URL ||
  "https://script.google.com/macros/s/AKfycbyzmGS0QC27C9WNsaD7rKmEebPnQSGIA0TS6YXBIzFdmOCPqPZR2fFLE0h6iNgvF-JU/exec";

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
    empresa: clean(body.empresa, 120),
    whatsapp: clean(body.whatsapp, 30),
    correo: clean(body.correo, 160).toLowerCase(),
    rol: clean(body.rol, 60),
    pais: clean(body.pais, 40),
    giro: clean(body.giro, 60),
    tamano: clean(body.tamano, 40),
    canales: clean(body.canales, 60),
    inversion: clean(body.inversion, 40),
    operador: clean(body.operador, 60),
    resultados: clean(body.resultados, 80),
    medicion: clean(body.medicion, 80),
    modalidad: clean(body.modalidad, 40),
    notas: clean(body.notas, 1000),
    fuente: clean(body.fuente, 60),
    utm_source: clean(body.utm_source, 120),
    utm_medium: clean(body.utm_medium, 120),
    utm_campaign: clean(body.utm_campaign, 200),
    utm_content: clean(body.utm_content, 200),
    utm_term: clean(body.utm_term, 200),
    gclid: clean(body.gclid, 300),
    fbclid: clean(body.fbclid, 300),
    referrer: clean(body.referrer, 500),
    pagina: clean(body.pagina, 800),
  };

  if (!lead.nombre || !lead.empresa || !lead.whatsapp) {
    return Response.json({ ok: false, error: "Completa todos los campos obligatorios." }, { status: 400 });
  }
  // Las respuestas de opción múltiple deben ser una de las opciones del formulario.
  if (Object.keys(OPTIONS).some((k) => !OPTIONS[k].includes(lead[k]))) {
    return Response.json({ ok: false, error: "Completa todos los campos obligatorios." }, { status: 400 });
  }
  if (!isEmail(lead.correo)) {
    return Response.json({ ok: false, error: "Revisa tu correo." }, { status: 400 });
  }
  if (lead.whatsapp.replace(/\D/g, "").length < 10) {
    return Response.json({ ok: false, error: "Revisa tu número de WhatsApp (10 dígitos)." }, { status: 400 });
  }

  const { calificado, fallas } = qualify(lead);

  const payload = {
    action: "temporada",
    fecha: new Date().toISOString(),
    etapa: "Nuevo",
    calificado: calificado ? "Sí" : "No",
    icp_fallas: fallas.join(" · "),
    ...lead,
    // Alias de la pestaña "Leads" para que un Apps Script viejo también registre algo.
    telefono: lead.whatsapp,
    producto: `Temporada · ${calificado ? "ICP ✓" : "ICP ✗"} · ${lead.modalidad} · ${lead.giro}`,
    link: lead.pagina,
    problema: [lead.rol, lead.tamano, lead.canales, lead.inversion, lead.operador, lead.resultados, lead.medicion, fallas.join(", "), lead.fuente, lead.notas].filter(Boolean).join(" · "),
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
    return Response.json({ ok: true, stored: true, calificado });
  } catch (e) {
    console.error("[temporada] no se pudo registrar el lead:", e?.message || e, JSON.stringify({ calificado, fallas, ...lead }));
    // El contacto ya quedó en logs: no se le pide al usuario repetir el formulario.
    return Response.json({ ok: true, stored: false, calificado });
  } finally {
    clearTimeout(timer);
  }
}

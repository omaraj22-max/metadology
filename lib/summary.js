// Resumen ejecutivo final para WhatsApp, armado directo del JSON de la campaña (sin otra llamada a la IA:
// cero relleno, siempre el mismo formato). Corto: lo que se lee en 30 segundos.

function cut(s, n) {
  const t = String(s || "").replace(/\s+/g, " ").trim();
  if (!t) return "";
  return t.length > n ? t.slice(0, n - 1).replace(/[\s,;:]+\S*$/, "") + "…" : t;
}

function temp(t) {
  const s = String(t || "").toLowerCase();
  if (s.startsWith("fr")) return "frío";
  if (s.startsWith("tem") || s.startsWith("med")) return "templado";
  if (s.startsWith("cal")) return "caliente";
  return "";
}

/** Ganador primero; luego completa hasta 3 cubriendo temperaturas distintas. */
export function pickTopAngles(campaign) {
  const all = (campaign?.angulos || []).filter((a) => a && typeof a === "object");
  if (!all.length) return [];
  const wi = Number.isInteger(campaign?.anguloElegidoIndex) && all[campaign.anguloElegidoIndex] ? campaign.anguloElegidoIndex : 0;
  const out = [all[wi]];
  const seen = new Set([temp(all[wi].temperatura)]);
  for (const a of all) {
    if (out.length >= 3) break;
    if (out.includes(a)) continue;
    const t = temp(a.temperatura);
    if (!seen.has(t)) { out.push(a); seen.add(t); }
  }
  for (const a of all) {
    if (out.length >= 3) break;
    if (!out.includes(a)) out.push(a);
  }
  return out;
}

export function buildExecutiveSummary({ marca, campaign, link }) {
  const c = campaign || {};
  const cl = c.clasificacion || {};
  const an = c.angulo || {};
  const es = c.estrategia || {};
  const lines = [];

  lines.push(`📋 *Resumen ejecutivo · ${cut(marca || "tu marca", 40)}*`);
  lines.push("");
  if (cl.persona) lines.push(`*Cliente:* ${cut(cl.persona, 110)}`);
  const cons = [cl.consciencia ? `*Consciencia:* ${cut(cl.consciencia, 30)}` : "", cl.deseo ? `*Deseo:* ${cut(cl.deseo, 20)}` : ""].filter(Boolean).join(" · ");
  if (cons) lines.push(cons + (cl.deseoDetalle ? ` — ${cut(cl.deseoDetalle, 90)}` : ""));
  if (an.lente) lines.push(`*Ángulo ganador:* ${cut(an.lente, 40)}${an.bigIdea ? ` — ${cut(an.bigIdea, 90)}` : ""}`);

  const top = pickTopAngles(c);
  if (top.length) {
    lines.push("");
    lines.push("*Los 3 ángulos de tu campaña:*");
    top.forEach((a, i) => {
      const t = temp(a.temperatura);
      lines.push(`${i + 1}. ${cut(a.lente, 36)}${t ? ` (${t})` : ""}${a.bigIdea ? ` — ${cut(a.bigIdea, 80)}` : ""}`);
    });
  }

  const strat = [
    es.lanzamiento ? `*Lanzamiento:* ${cut(es.lanzamiento, 160)}` : "",
    es.distribucion ? `*Presupuesto:* ${cut(es.distribucion, 90)}` : "",
    es.metricas ? `*Mide:* ${cut(es.metricas, 90)}` : "",
  ].filter(Boolean);
  if (strat.length) {
    lines.push("");
    lines.push(...strat);
  }

  if (link) {
    lines.push("");
    lines.push(`Detalle completo: ${link}`);
  }
  return lines.join("\n").trim();
}

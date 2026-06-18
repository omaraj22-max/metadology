import PptxGenJS from "pptxgenjs";

export const runtime = "nodejs";
export const maxDuration = 90;

// Sistema de marca Caperifai (mismo del deck de referencia Padaria Tuga).
const PURPLE = "5A3AFF", PURPLE2 = "4324C9", BLUE = "2563EB", CYAN = "00D4FF",
  INK = "0F172A", SLATE = "64748B", SLATE2 = "475569", BORDER = "E4E9F2",
  BG = "F8FAFC", CARD = "FFFFFF", TINT = "F1F0FE", TINT2 = "EEF4FF", WHITE = "FFFFFF";
const FH = "Sora", FB = "Inter";
const W = 13.333, H = 7.5, M = 0.7;

// Descarga una imagen y la devuelve como data URI base64 para embeberla en el PPTX.
async function fetchImageData(url) {
  if (!url || !/^https?:\/\//i.test(url)) return null;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 12000);
  try {
    const res = await fetch(url, { signal: controller.signal, headers: { "User-Agent": "Mozilla/5.0" } });
    if (!res.ok) return null;
    const buf = Buffer.from(await res.arrayBuffer());
    if (!buf.length || buf.length > 5_000_000) return null;
    const b = buf;
    let mt = "image/jpeg";
    if (b[0] === 0x89 && b[1] === 0x50) mt = "image/png";
    else if (b[0] === 0x47 && b[1] === 0x49) mt = "image/gif";
    else if (b.length >= 12 && b[8] === 0x57 && b[9] === 0x45) mt = "image/webp";
    return `data:${mt};base64,${buf.toString("base64")}`;
  } catch (e) {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

const fmtOf = (cr) => String(cr.formato || "").toLowerCase();
const isUgc = (cr) => fmtOf(cr).includes("ugc");
const isCar = (cr) => fmtOf(cr).includes("carrusel");
const isStat = (cr) => !isUgc(cr) && !isCar(cr);
// Acento por temperatura de embudo: frío=azul, caliente=violeta oscuro, medio=violeta.
const accForTemp = (t) => {
  const s = String(t || "").toLowerCase();
  if (s.includes("frí") || s.includes("fri")) return BLUE;
  if (s.includes("calien")) return PURPLE2;
  return PURPLE;
};

export async function POST(req) {
  let body = {};
  try { body = await req.json(); } catch {}
  const c = body && body.campaign;
  if (!c) return Response.json({ error: "Falta 'campaign'." }, { status: 400 });

  const creativos = Array.isArray(c.creativos) ? c.creativos : [];
  // Pre-descarga en paralelo las imágenes generadas (estáticos y slides de carrusel).
  const imgData = await Promise.all(creativos.map((cr) => (cr.imagen ? fetchImageData(cr.imagen) : Promise.resolve(null))));
  const carImgData = await Promise.all(
    creativos.map((cr) =>
      Array.isArray(cr.carrusel)
        ? Promise.all(cr.carrusel.map((cs) => (cs.imagen ? fetchImageData(cs.imagen) : Promise.resolve(null))))
        : Promise.resolve([])
    )
  );

  try {
    const pptx = new PptxGenJS();
    pptx.defineLayout({ name: "W", width: W, height: H });
    pptx.layout = "W";
    pptx.author = "Caperifai";
    pptx.company = "Caperifai";
    pptx.title = String(c.titulo || "Campaña Meta Ads");

    const RR = pptx.ShapeType.roundRect, RECT = pptx.ShapeType.rect, OVAL = pptx.ShapeType.ellipse, CHEV = pptx.ShapeType.chevron;
    const shadow = () => ({ type: "outer", color: PURPLE, blur: 11, offset: 4, angle: 90, opacity: 0.1 });
    const shadowSoft = () => ({ type: "outer", color: INK, blur: 9, offset: 3, angle: 90, opacity: 0.07 });
    const titulo = String(c.titulo || "Campaña Meta Ads");

    const wordmark = (s, x, y, h, light) => {
      s.addText([{ text: "caperif", options: { color: light ? WHITE : INK } }, { text: "ai", options: { color: PURPLE } }],
        { x, y, w: 4, h, fontFace: FH, fontSize: h * 46, bold: true, valign: "middle", margin: 0, charSpacing: -0.3 });
    };
    let pageNo = 0;
    const footer = (s, light) => {
      pageNo++;
      s.addText([
        { text: "caperif", options: { color: light ? "C7D2E5" : INK, bold: true } },
        { text: "ai", options: { color: PURPLE, bold: true } },
        { text: "   ·   " + titulo, options: { color: light ? "AEB8CC" : SLATE } },
      ], { x: M, y: H - 0.48, w: 9.5, h: 0.3, fontFace: FB, fontSize: 8.5, valign: "middle", margin: 0 });
      s.addText(String(pageNo).padStart(2, "0"), { x: W - M - 0.5, y: H - 0.48, w: 0.5, h: 0.3, fontFace: FB, fontSize: 8.5, bold: true, color: PURPLE, align: "right", valign: "middle", margin: 0 });
    };
    const header = (s, kicker, t) => {
      s.addShape(RR, { x: M, y: 0.6, w: 0.34, h: 0.34, fill: { color: TINT }, rectRadius: 0.08 });
      s.addShape(OVAL, { x: M + 0.11, y: 0.71, w: 0.12, h: 0.12, fill: { color: PURPLE } });
      s.addText(String(kicker).toUpperCase(), { x: M + 0.46, y: 0.6, w: 11, h: 0.34, fontFace: FB, fontSize: 10.5, bold: true, color: PURPLE, charSpacing: 2, valign: "middle", margin: 0 });
      s.addText(String(t || ""), { x: M - 0.02, y: 1.02, w: 12.2, h: 0.7, fontFace: FH, fontSize: 25, bold: true, color: INK, margin: 0 });
    };
    const pill = (s, x, y, txt, fillc, txtc, outline) => {
      const w = 0.3 + String(txt).length * 0.082;
      s.addShape(RR, { x, y, w, h: 0.34, fill: { color: fillc }, rectRadius: 0.17, ...(outline ? { line: { color: BORDER, width: 1 } } : {}) });
      s.addText(txt, { x, y, w, h: 0.34, fontFace: FB, fontSize: 9, bold: true, color: txtc, align: "center", valign: "middle", margin: 0 });
      return w;
    };

    const nEst = creativos.filter(isStat).length;
    const nCar = creativos.filter(isCar).length;
    const nUgc = creativos.filter(isUgc).length;
    const nAng = new Set(creativos.map((cr) => String(cr.angulo || "").trim().toLowerCase()).filter(Boolean)).size;
    const marca = c.marca || {};
    const estr = c.estrategia || {};

    // ============ 1 · PORTADA (oscura, premium, sin assets) ============
    let s = pptx.addSlide();
    s.background = { color: INK };
    s.addShape(OVAL, { x: 9.0, y: -2.4, w: 7.2, h: 7.2, fill: { color: PURPLE, transparency: 82 } });
    s.addShape(OVAL, { x: 7.6, y: 3.9, w: 4.4, h: 4.4, fill: { color: BLUE, transparency: 86 } });
    s.addShape(RECT, { x: 0, y: 0, w: 0.16, h: H, fill: { color: PURPLE } });
    wordmark(s, M, 0.66, 0.6, true);
    s.addText("AI Copilots for Marketing that Scale", { x: M + 0.02, y: 1.18, w: 6, h: 0.28, fontFace: FB, fontSize: 9.5, color: "AEB8CC", valign: "middle", margin: 0 });
    s.addShape(RR, { x: M, y: 2.5, w: 3.0, h: 0.42, fill: { color: PURPLE }, rectRadius: 0.21 });
    s.addText("PROPUESTA PARA CLIENTE", { x: M, y: 2.5, w: 3.0, h: 0.42, fontFace: FB, fontSize: 10, bold: true, color: WHITE, align: "center", charSpacing: 1.2, valign: "middle", margin: 0 });
    s.addText(titulo, { x: M - 0.04, y: 3.15, w: 11.6, h: 1.5, fontFace: FH, fontSize: 40, bold: true, color: WHITE, margin: 0, valign: "top", lineSpacingMultiple: 0.98 });
    if (c.subtitulo) s.addText(String(c.subtitulo), { x: M, y: 4.95, w: 9.2, h: 0.8, fontFace: FB, fontSize: 13.5, color: "C7D2E5", margin: 0, valign: "top" });
    let cx = M;
    [[String(creativos.length || 10) + " creativos", PURPLE, WHITE, false],
      [nEst + " estáticos · " + nCar + " carruseles · " + nUgc + " UGC", "1B2440", "C7D2E5", true],
      [(estr.cta || "Awareness"), "1B2440", "C7D2E5", true]].forEach((p) => {
      cx += pill(s, cx, 5.95, p[0], p[1], p[2], p[3]) + 0.14;
    });
    footer(s, true);

    // ============ 2 · RESUMEN EJECUTIVO ============
    s = pptx.addSlide(); s.background = { color: BG };
    header(s, "Resumen ejecutivo", "Qué entregamos y a quién le hablamos");
    const stats = [
      [String(creativos.length || 0), "creativos", nEst + " est · " + nCar + " carr · " + nUgc + " UGC", PURPLE],
      ["3", "formatos", "estático · carrusel · UGC", BLUE],
      [String(nAng || creativos.length), "ángulos", "conceptos distintos = Entity IDs", PURPLE],
      ["3", "temperaturas", "frío · medio · caliente", BLUE],
    ];
    const sw = (W - 2 * M - 0.45) / 4;
    stats.forEach((st, i) => {
      const x = M + i * (sw + 0.15);
      s.addShape(RR, { x, y: 1.95, w: sw, h: 1.7, fill: { color: CARD }, rectRadius: 0.1, line: { color: BORDER, width: 1 }, shadow: shadow() });
      s.addText(st[0], { x, y: 2.1, w: sw, h: 0.85, fontFace: FH, fontSize: st[0].length > 3 ? 26 : 40, bold: true, color: st[3], align: "center", valign: "middle", margin: 0 });
      s.addText(st[1].toUpperCase(), { x, y: 2.98, w: sw, h: 0.28, fontFace: FB, fontSize: 11, bold: true, color: INK, align: "center", charSpacing: 0.5, margin: 0 });
      s.addText(st[2], { x, y: 3.24, w: sw, h: 0.3, fontFace: FB, fontSize: 9, color: SLATE, align: "center", margin: 0 });
    });
    s.addShape(RR, { x: M, y: 4.05, w: W - 2 * M, h: 1.65, fill: { color: CARD }, rectRadius: 0.1, line: { color: BORDER, width: 1 }, shadow: shadow() });
    s.addShape(RECT, { x: M, y: 4.05, w: 0.12, h: 1.65, fill: { color: PURPLE } });
    s.addText("EL ENCARGO", { x: M + 0.45, y: 4.3, w: 6, h: 0.3, fontFace: FB, fontSize: 10.5, bold: true, color: PURPLE, charSpacing: 1.5, margin: 0 });
    s.addText(String(marca.brief || c.subtitulo || ""), { x: M + 0.45, y: 4.62, w: W - 2 * M - 0.9, h: 0.95, fontFace: FB, fontSize: 12.5, color: SLATE2, margin: 0, valign: "top" });
    if (marca.mercado) s.addText([{ text: "Mercado   ", options: { bold: true, color: INK } }, { text: String(marca.mercado), options: { color: SLATE } }], { x: M, y: 5.95, w: W - 2 * M, h: 0.4, fontFace: FB, fontSize: 10.5, margin: 0 });
    footer(s, false);

    // ============ 3 · EL CLIENTE (paleta + identidad) ============
    s = pptx.addSlide(); s.background = { color: BG };
    header(s, "El cliente", marca.nombre ? "La marca: " + marca.nombre : "La marca que presentamos");
    s.addText("Documentamos la identidad de la marca para que cada creativo la respete. Estos colores y tipografías se aplican dentro de las piezas, no a esta presentación.", { x: M, y: 1.78, w: W - 2 * M, h: 0.5, fontFace: FB, fontSize: 11.5, color: SLATE2, margin: 0, valign: "top" });
    s.addShape(RR, { x: M, y: 2.5, w: 6.7, h: 3.05, fill: { color: CARD }, rectRadius: 0.1, line: { color: BORDER, width: 1 }, shadow: shadow() });
    s.addText("PALETA DE LA MARCA", { x: M + 0.35, y: 2.72, w: 6, h: 0.3, fontFace: FB, fontSize: 10, bold: true, color: SLATE, charSpacing: 1.5, margin: 0 });
    const pal = (Array.isArray(marca.paleta) ? marca.paleta : []).slice(0, 4);
    const csw = 1.42;
    (pal.length ? pal : [{ hex: "#5A3AFF", nombre: "Acento" }]).forEach((p, i) => {
      const x = M + 0.35 + i * (csw + 0.12);
      const hex = "#" + String(p.hex || "#5A3AFF").replace("#", "");
      s.addShape(RR, { x, y: 3.15, w: csw, h: 1.05, fill: { color: hex.replace("#", "") }, rectRadius: 0.08, line: { color: BORDER, width: 0.75 } });
      s.addText(hex, { x, y: 4.25, w: csw, h: 0.24, fontFace: FB, fontSize: 9.5, bold: true, color: INK, margin: 0 });
      s.addText(String(p.nombre || ""), { x, y: 4.48, w: csw, h: 0.24, fontFace: FB, fontSize: 8.5, color: SLATE, margin: 0 });
    });
    s.addText("Aplica la paleta dentro de cada pieza; nunca a esta presentación.", { x: M + 0.35, y: 4.98, w: 6.1, h: 0.4, fontFace: FB, fontSize: 10, color: SLATE2, margin: 0 });
    const rx = M + 7.0, rw = W - M - rx;
    const infoCard = (yy, k, v) => {
      s.addShape(RR, { x: rx, y: yy, w: rw, h: 0.9, fill: { color: CARD }, rectRadius: 0.08, line: { color: BORDER, width: 1 }, shadow: shadow() });
      s.addShape(RECT, { x: rx, y: yy + 0.18, w: 0.08, h: 0.54, fill: { color: PURPLE } });
      s.addText(String(k).toUpperCase(), { x: rx + 0.3, y: yy + 0.16, w: rw - 0.5, h: 0.24, fontFace: FB, fontSize: 9, bold: true, color: SLATE, charSpacing: 1, margin: 0 });
      s.addText(String(v || "—"), { x: rx + 0.3, y: yy + 0.4, w: rw - 0.5, h: 0.42, fontFace: FH, fontSize: 12.5, bold: true, color: INK, margin: 0, valign: "top" });
    };
    infoCard(2.5, "Tipografía", marca.tipografia);
    infoCard(3.55, "Logo", marca.logo);
    infoCard(4.6, "Estilo de foto", marca.estilo_foto);
    footer(s, false);

    // ============ 4 · EL MOTOR ============
    s = pptx.addSlide(); s.background = { color: BG };
    header(s, "Estrategia · 01", "El motor: cómo se construye cada creativo");
    const motor = estr.motor || {};
    const steps = [["HOOK", "0-3s", motor.hook, PURPLE], ["VALOR", "agita", motor.valor, BLUE], ["OFERTA", "CTA", motor.oferta, PURPLE]];
    const stw = (W - 2 * M - 1.0) / 3;
    steps.forEach((st, i) => {
      const x = M + i * (stw + 0.5);
      s.addShape(RR, { x, y: 1.95, w: stw, h: 1.95, fill: { color: CARD }, rectRadius: 0.1, line: { color: BORDER, width: 1 }, shadow: shadow() });
      s.addShape(OVAL, { x: x + 0.32, y: 2.2, w: 0.62, h: 0.62, fill: { color: st[3] } });
      s.addText(String(i + 1), { x: x + 0.32, y: 2.2, w: 0.62, h: 0.62, fontFace: FH, fontSize: 22, bold: true, color: WHITE, align: "center", valign: "middle", margin: 0 });
      s.addText(st[0], { x: x + 1.08, y: 2.24, w: stw - 1.3, h: 0.4, fontFace: FH, fontSize: 20, bold: true, color: INK, margin: 0 });
      s.addText(st[1], { x: x + 1.08, y: 2.64, w: stw - 1.3, h: 0.25, fontFace: FB, fontSize: 10, bold: true, color: st[3], margin: 0 });
      s.addText(String(st[2] || ""), { x: x + 0.32, y: 3.0, w: stw - 0.6, h: 0.85, fontFace: FB, fontSize: 11.5, color: SLATE2, margin: 0, valign: "top" });
      if (i < 2) s.addShape(CHEV, { x: x + stw + 0.12, y: 2.75, w: 0.26, h: 0.3, fill: { color: PURPLE } });
    });
    s.addText("La bandera y la autoridad que sostienen el VALOR", { x: M, y: 4.25, w: 12, h: 0.35, fontFace: FH, fontSize: 14, bold: true, color: INK, margin: 0 });
    const flag = [["LA BANDERA", estr.bandera, PURPLE], ["AUTORIDAD HOY", estr.autoridad, BLUE], ["CTA", estr.cta, PURPLE2]];
    flag.forEach((q, i) => {
      const x = M + i * (stw + 0.5);
      s.addShape(RR, { x, y: 4.7, w: stw, h: 1.45, fill: { color: TINT }, rectRadius: 0.1 });
      s.addText(q[0], { x: x + 0.28, y: 4.85, w: stw - 0.5, h: 0.3, fontFace: FH, fontSize: 11.5, bold: true, color: q[2], margin: 0 });
      s.addText(String(q[1] || ""), { x: x + 0.28, y: 5.18, w: stw - 0.5, h: 0.9, fontFace: FB, fontSize: 10.5, color: SLATE2, margin: 0, valign: "top" });
    });
    footer(s, false);

    // ============ 5 · CLIENTE EN LLAMAS + OBJECIONES ============
    s = pptx.addSlide(); s.background = { color: BG };
    header(s, "Estrategia · 02", "El cliente en llamas y sus objeciones");
    s.addShape(RR, { x: M, y: 1.9, w: W - 2 * M, h: 1.4, fill: { color: CARD }, rectRadius: 0.1, line: { color: BORDER, width: 1 }, shadow: shadow() });
    s.addShape(RECT, { x: M, y: 1.9, w: 0.12, h: 1.4, fill: { color: PURPLE } });
    s.addText("EL CLIENTE EN LLAMAS", { x: M + 0.42, y: 2.08, w: 6, h: 0.28, fontFace: FB, fontSize: 10, bold: true, color: PURPLE, charSpacing: 1.5, margin: 0 });
    s.addText(String(estr.buyer || ""), { x: M + 0.42, y: 2.36, w: W - 2 * M - 0.8, h: 0.85, fontFace: FB, fontSize: 12, color: SLATE2, margin: 0, valign: "top" });
    const objs = (Array.isArray(estr.objeciones) ? estr.objeciones : []).slice(0, 4);
    if (objs.length) {
      s.addText("OBJECIONES Y DÓNDE SE RESUELVEN", { x: M, y: 3.55, w: 8, h: 0.3, fontFace: FB, fontSize: 10, bold: true, color: PURPLE, charSpacing: 1.5, margin: 0 });
      const ow = (W - 2 * M - 0.15 * (objs.length - 1)) / objs.length;
      objs.forEach((o, i) => {
        const x = M + i * (ow + 0.15);
        s.addShape(RR, { x, y: 3.9, w: ow, h: 1.4, fill: { color: TINT2 }, rectRadius: 0.1 });
        s.addText("“" + String(o.q || "") + "”", { x: x + 0.25, y: 4.08, w: ow - 0.5, h: 0.7, fontFace: FB, italic: true, fontSize: 11, bold: true, color: INK, valign: "top", margin: 0 });
        s.addText("SE RESUELVE EN", { x: x + 0.25, y: 4.78, w: ow - 0.5, h: 0.22, fontFace: FB, fontSize: 7.5, bold: true, color: SLATE, charSpacing: 1, margin: 0 });
        s.addText(String(o.resuelve || ""), { x: x + 0.25, y: 4.98, w: ow - 0.5, h: 0.3, fontFace: FH, fontSize: 13, bold: true, color: BLUE, margin: 0 });
      });
    }
    s.addText("Cada objeción se neutraliza mostrando el producto real, la cercanía y la experiencia.", { x: M, y: 5.55, w: W - 2 * M, h: 0.4, fontFace: FB, italic: true, fontSize: 10, color: SLATE, margin: 0 });
    footer(s, false);

    // ============ 6 · GRID DE CONCEPTOS ============
    s = pptx.addSlide(); s.background = { color: BG };
    header(s, "Estrategia · 03", "Los " + (creativos.length || 0) + " creativos (Entity IDs)");
    const gcw = (W - 2 * M - 0.6) / 4, gch = 1.3;
    creativos.slice(0, 12).forEach((cr, i) => {
      const col = i % 4, row = Math.floor(i / 4);
      const x = M + col * (gcw + 0.2), y = 1.9 + row * (gch + 0.18);
      const ac = accForTemp(cr.temperatura);
      s.addShape(RR, { x, y, w: gcw, h: gch, fill: { color: CARD }, rectRadius: 0.1, line: { color: BORDER, width: 1 }, shadow: shadow() });
      s.addShape(RECT, { x, y, w: gcw, h: 0.07, fill: { color: ac } });
      s.addShape(RR, { x: x + 0.2, y: y + 0.2, w: 0.72, h: 0.4, fill: { color: ac }, rectRadius: 0.08 });
      s.addText(String(cr.id || "C" + (i + 1)), { x: x + 0.2, y: y + 0.2, w: 0.72, h: 0.4, fontFace: FH, fontSize: 13, bold: true, color: WHITE, align: "center", valign: "middle", margin: 0 });
      s.addText(String(cr.temperatura || ""), { x: x + 1.0, y: y + 0.2, w: gcw - 1.2, h: 0.4, fontFace: FB, fontSize: 8, bold: true, color: ac, align: "right", valign: "middle", margin: 0 });
      s.addText(String(cr.angulo || cr.titulo || ""), { x: x + 0.2, y: y + 0.66, w: gcw - 0.4, h: 0.36, fontFace: FH, fontSize: 11, bold: true, color: INK, valign: "top", margin: 0 });
      s.addText(String(cr.formato || ""), { x: x + 0.2, y: y + gch - 0.3, w: gcw - 0.4, h: 0.26, fontFace: FB, fontSize: 8.5, color: SLATE, valign: "middle", margin: 0 });
    });
    s.addText("Cada concepto es un ángulo + formato + tratamiento visual distintos: no canibalizan Entity IDs.", { x: M, y: 6.45, w: W - 2 * M, h: 0.4, fontFace: FB, italic: true, fontSize: 10, color: SLATE, align: "center", margin: 0 });
    footer(s, false);

    // ============ SLIDES DE CONCEPTO (una por creativo) ============
    const colW = (W - 2 * M - 0.4) / 2;
    creativos.forEach((cr, ci) => {
      const ac = accForTemp(cr.temperatura);
      s = pptx.addSlide(); s.background = { color: BG };
      // Banda superior
      s.addShape(RECT, { x: 0, y: 0, w: W, h: 1.3, fill: { color: CARD } });
      s.addShape(RECT, { x: 0, y: 1.3, w: W, h: 0.02, fill: { color: BORDER } });
      s.addShape(RR, { x: M, y: 0.34, w: 1.05, h: 0.66, fill: { color: ac }, rectRadius: 0.1 });
      const idStr = String(cr.id || "C" + (ci + 1));
      s.addText(idStr, { x: M, y: 0.34, w: 1.05, h: 0.66, fontFace: FH, fontSize: idStr.length > 2 ? 21 : 25, bold: true, color: WHITE, align: "center", valign: "middle", margin: 0 });
      s.addText(String(cr.titulo || cr.angulo || ""), { x: M + 1.25, y: 0.34, w: 7.8, h: 0.46, fontFace: FH, fontSize: 18, bold: true, color: INK, valign: "middle", margin: 0 });
      s.addText([{ text: (cr.angulo || "") + "   ", options: { color: ac, bold: true } }, { text: String(cr.formato || "") + "  ·  Embudo " + (cr.temperatura || ""), options: { color: SLATE } }],
        { x: M + 1.26, y: 0.82, w: 9.0, h: 0.34, fontFace: FB, fontSize: 10, valign: "middle", margin: 0 });
      if (cr.cta) {
        s.addShape(RR, { x: W - M - 2.6, y: 0.49, w: 2.6, h: 0.42, fill: { color: PURPLE }, rectRadius: 0.21 });
        s.addText("CTA · " + cr.cta, { x: W - M - 2.6, y: 0.49, w: 2.6, h: 0.42, fontFace: FB, fontSize: 10.5, bold: true, color: WHITE, align: "center", valign: "middle", margin: 0 });
      }
      // Hook
      s.addShape(RR, { x: M, y: 1.6, w: W - 2 * M, h: 0.86, fill: { color: TINT }, rectRadius: 0.1 });
      s.addShape(RECT, { x: M, y: 1.6, w: 0.12, h: 0.86, fill: { color: PURPLE } });
      s.addText("HOOK · 0-3s", { x: M + 0.34, y: 1.68, w: 3, h: 0.26, fontFace: FB, fontSize: 9.5, bold: true, color: PURPLE, charSpacing: 1, margin: 0 });
      s.addText("“" + String(cr.hook || "") + "”", { x: M + 0.34, y: 1.9, w: W - 2 * M - 0.65, h: 0.5, fontFace: FH, fontSize: 16, bold: true, color: INK, margin: 0, valign: "middle" });

      const ly = 2.66;
      // Columna izquierda: copy out + título
      s.addText("COPY OUT", { x: M, y: ly, w: 4, h: 0.26, fontFace: FB, fontSize: 9.5, bold: true, color: ac, charSpacing: 1.5, margin: 0 });
      s.addText(String(cr.copy_out || ""), { x: M, y: ly + 0.28, w: colW, h: 3.2, fontFace: FB, fontSize: 10.5, color: SLATE2, margin: 0, valign: "top", paraSpaceAfter: 5, lineSpacingMultiple: 1.02 });
      s.addShape(RR, { x: M, y: 6.18, w: colW, h: 0.72, fill: { color: CARD }, rectRadius: 0.1, line: { color: BORDER, width: 1 }, shadow: shadow() });
      s.addShape(RECT, { x: M + 0.2, y: 6.32, w: 0.07, h: 0.44, fill: { color: ac } });
      s.addText("TÍTULO", { x: M + 0.38, y: 6.28, w: 4, h: 0.2, fontFace: FB, fontSize: 8, bold: true, color: SLATE, charSpacing: 1, margin: 0 });
      s.addText(String(cr.titulo || ""), { x: M + 0.38, y: 6.46, w: colW - 0.55, h: 0.42, fontFace: FH, fontSize: 12, bold: true, color: INK, margin: 0, valign: "middle" });

      // Columna derecha
      const rxx = M + colW + 0.4;
      const staticImg = imgData[ci];
      if (isStat(cr) && staticImg) {
        // El anuncio generado es el héroe
        s.addText("ANUNCIO PROPUESTO", { x: rxx, y: ly, w: 5, h: 0.26, fontFace: FB, fontSize: 9.5, bold: true, color: ac, charSpacing: 1.5, margin: 0 });
        const iw = 3.9, ix = rxx + (colW - iw) / 2;
        s.addShape(RR, { x: ix - 0.06, y: ly + 0.28, w: iw + 0.12, h: iw + 0.12, fill: { color: CARD }, rectRadius: 0.1, line: { color: BORDER, width: 1 }, shadow: shadow() });
        try { s.addImage({ data: staticImg, x: ix, y: ly + 0.34, w: iw, h: iw, rounding: true }); } catch (e) {}
      } else if (isUgc(cr) && Array.isArray(cr.script) && cr.script.length) {
        s.addText("SCRIPT DE GRABACIÓN", { x: rxx, y: ly, w: 5, h: 0.26, fontFace: FB, fontSize: 9.5, bold: true, color: ac, charSpacing: 1.5, margin: 0 });
        const sh = ["T", "LÍNEA HABLADA", "EN PANTALLA"].map((t) => ({ text: t, options: { fill: { color: INK }, color: WHITE, bold: true, fontFace: FB, fontSize: 8.5, align: "left" } }));
        const tbl = [sh];
        cr.script.slice(0, 5).forEach((r, i) => {
          const fillc = i % 2 ? CARD : TINT2;
          tbl.push([
            { text: String(r.t || ""), options: { fill: { color: fillc }, color: ac, bold: true, fontFace: FB, fontSize: 8.5, align: "left" } },
            { text: String(r.linea || ""), options: { fill: { color: fillc }, color: SLATE2, fontFace: FB, fontSize: 8.5, align: "left" } },
            { text: String(r.pantalla || ""), options: { fill: { color: fillc }, color: r.pantalla ? PURPLE2 : "94A3B8", bold: !!r.pantalla, fontFace: FB, fontSize: 8, align: "left" } },
          ]);
        });
        s.addTable(tbl, { x: rxx, y: ly + 0.32, w: colW, colW: [0.6, colW - 2.05, 1.45], rowH: 0.62, border: { type: "solid", pt: 0.75, color: BORDER }, valign: "middle", margin: [0.02, 0.08, 0.02, 0.08] });
      } else if (isCar(cr) && Array.isArray(cr.carrusel) && cr.carrusel.length) {
        s.addText("CARRUSEL · " + cr.carrusel.length + " SLIDES", { x: rxx, y: ly, w: 5, h: 0.26, fontFace: FB, fontSize: 9.5, bold: true, color: ac, charSpacing: 1.5, margin: 0 });
        const imgs = carImgData[ci] || [];
        const slides = cr.carrusel.slice(0, 5);
        const anyImg = imgs.some(Boolean);
        if (anyImg && slides.length <= 4) {
          // 2×2 de imágenes generadas con número
          const tw = (colW - 0.2) / 2;
          slides.forEach((cs, k) => {
            const gx = rxx + (k % 2) * (tw + 0.2);
            const gy = ly + 0.34 + Math.floor(k / 2) * (tw + 0.16);
            s.addShape(RR, { x: gx, y: gy, w: tw, h: tw, fill: { color: CARD }, rectRadius: 0.08, line: { color: BORDER, width: 1 } });
            if (imgs[k]) { try { s.addImage({ data: imgs[k], x: gx + 0.05, y: gy + 0.05, w: tw - 0.1, h: tw - 0.1 }); } catch (e) {} }
            s.addShape(RR, { x: gx + 0.08, y: gy + 0.08, w: 0.3, h: 0.3, fill: { color: ac }, rectRadius: 0.07 });
            s.addText(String(cs.n || k + 1), { x: gx + 0.08, y: gy + 0.08, w: 0.3, h: 0.3, fontFace: FH, fontSize: 11, bold: true, color: WHITE, align: "center", valign: "middle", margin: 0 });
          });
        } else {
          const rh = slides.length >= 5 ? 0.62 : 0.78;
          slides.forEach((cs, k) => {
            const y = ly + 0.34 + k * rh;
            s.addShape(RR, { x: rxx, y, w: colW, h: rh - 0.1, fill: { color: k % 2 ? CARD : TINT2 }, rectRadius: 0.08, line: { color: BORDER, width: 1 } });
            s.addShape(RR, { x: rxx + 0.12, y: y + (rh - 0.1) / 2 - 0.16, w: 0.32, h: 0.32, fill: { color: ac }, rectRadius: 0.07 });
            s.addText(String(cs.n || k + 1), { x: rxx + 0.12, y: y + (rh - 0.1) / 2 - 0.16, w: 0.32, h: 0.32, fontFace: FH, fontSize: 11, bold: true, color: WHITE, align: "center", valign: "middle", margin: 0 });
            s.addText(String(cs.desc || ""), { x: rxx + 0.56, y, w: colW - 0.7, h: rh - 0.1, fontFace: FB, fontSize: 9, color: SLATE2, valign: "middle", margin: 0 });
          });
        }
      } else if (cr.prompt) {
        s.addText("PROMPT DE IMAGEN", { x: rxx, y: ly, w: 5, h: 0.26, fontFace: FB, fontSize: 9.5, bold: true, color: ac, charSpacing: 1.5, margin: 0 });
        s.addShape(RR, { x: rxx, y: ly + 0.28, w: colW, h: 3.4, fill: { color: TINT }, rectRadius: 0.1 });
        s.addShape(RECT, { x: rxx, y: ly + 0.28, w: 0.1, h: 3.4, fill: { color: PURPLE } });
        s.addText(String(cr.prompt), { x: rxx + 0.3, y: ly + 0.42, w: colW - 0.55, h: 3.12, fontFace: FB, fontSize: 8.7, color: INK, margin: 0, valign: "top", lineSpacingMultiple: 1.02 });
      }
      footer(s, false);
    });

    // ============ SALVAGUARDAS (oscura) ============
    if ((Array.isArray(c.receta_visual) && c.receta_visual.length) || (Array.isArray(c.salvaguardas) && c.salvaguardas.length)) {
      s = pptx.addSlide(); s.background = { color: BG };
      header(s, "Producción · 04", "Receta visual y salvaguardas Entity ID");
      const halfW = (W - 2 * M - 0.4) / 2;
      s.addShape(RR, { x: M, y: 1.95, w: halfW, h: 4.2, fill: { color: INK }, rectRadius: 0.12 });
      s.addText("RECETA VISUAL", { x: M + 0.4, y: 2.25, w: halfW - 0.8, h: 0.35, fontFace: FH, fontSize: 14, bold: true, color: CYAN, margin: 0 });
      const rec = (Array.isArray(c.receta_visual) && c.receta_visual.length ? c.receta_visual : [
        "Estética fotográfica premium, luz natural y fondos claros.",
        "Identidad de marca como acento, nunca dominante.",
        "Logo discreto y texto baked-in legible.",
        "Revisar cifras y textos en cada render antes de publicar.",
      ]).slice(0, 4);
      rec.forEach((t, i) => {
        const y = 3.0 + i * 0.74;
        s.addShape(OVAL, { x: M + 0.4, y: y + 0.04, w: 0.16, h: 0.16, fill: { color: CYAN } });
        s.addText(String(t), { x: M + 0.72, y: y - 0.06, w: halfW - 1.1, h: 0.66, fontFace: FB, fontSize: 10.5, color: "E2E8F0", margin: 0, valign: "top" });
      });
      const rcx = M + halfW + 0.4;
      s.addText("SALVAGUARDAS ENTITY ID", { x: rcx, y: 1.95, w: halfW, h: 0.35, fontFace: FH, fontSize: 14, bold: true, color: PURPLE, margin: 0 });
      const safe = (Array.isArray(c.salvaguardas) && c.salvaguardas.length ? c.salvaguardas : [
        "Cada concepto: ángulo, formato y tratamiento visual distintos.",
        "Los dobles formatos se ven completamente distintos entre sí.",
        "UGC con presentador, locación y guion distintos.",
        "Estáticos comparten marca pero cambian de composición.",
      ]).slice(0, 4);
      safe.forEach((t, i) => {
        const y = 2.45 + i * 0.93;
        s.addShape(OVAL, { x: rcx, y: y + 0.02, w: 0.34, h: 0.34, fill: { color: PURPLE } });
        s.addText(String(i + 1), { x: rcx, y: y + 0.02, w: 0.34, h: 0.34, fontFace: FH, fontSize: 13, bold: true, color: WHITE, align: "center", valign: "middle", margin: 0 });
        s.addText(String(t), { x: rcx + 0.5, y, w: halfW - 0.5, h: 0.85, fontFace: FB, fontSize: 10.5, color: SLATE2, margin: 0, valign: "top" });
      });
      footer(s, false);
    }

    // ============ CÓMO LANZAR (banda violeta) ============
    if (Array.isArray(c.lanzamiento) && c.lanzamiento.length) {
      s = pptx.addSlide(); s.background = { color: PURPLE2 };
      s.addShape(OVAL, { x: 9.6, y: -2.2, w: 6.4, h: 6.4, fill: { color: PURPLE, transparency: 60 } });
      s.addText("CÓMO LANZAR", { x: M, y: 0.6, w: 8, h: 0.35, fontFace: FB, fontSize: 12, bold: true, color: "DCE4FF", charSpacing: 3, margin: 0 });
      s.addText("El plan de salida en Meta", { x: M - 0.02, y: 0.95, w: 11, h: 0.6, fontFace: FH, fontSize: 25, bold: true, color: WHITE, margin: 0 });
      const launch = c.lanzamiento.slice(0, 5);
      const lh = launch.length > 4 ? 0.92 : 1.05;
      launch.forEach((l, i) => {
        const y = 1.85 + i * lh;
        s.addShape(RR, { x: M, y, w: W - 2 * M, h: lh - 0.14, fill: { color: WHITE }, rectRadius: 0.1, shadow: { type: "outer", color: "1B1466", blur: 9, offset: 3, angle: 90, opacity: 0.16 } });
        s.addShape(RR, { x: M + 0.2, y: y + 0.16, w: 0.46, h: 0.46, fill: { color: PURPLE }, rectRadius: 0.1 });
        s.addText(String(i + 1), { x: M + 0.2, y: y + 0.16, w: 0.46, h: 0.46, fontFace: FH, fontSize: 20, bold: true, color: WHITE, align: "center", valign: "middle", margin: 0 });
        s.addText(String(l.paso || ""), { x: M + 0.92, y: y + 0.08, w: 4.7, h: lh - 0.3, fontFace: FH, fontSize: 13.5, bold: true, color: INK, valign: "middle", margin: 0 });
        s.addText(String(l.detalle || ""), { x: M + 5.8, y: y + 0.06, w: W - 2 * M - 6.1, h: lh - 0.26, fontFace: FB, fontSize: 10.5, color: SLATE2, valign: "middle", margin: 0 });
      });
      footer(s, true);
    }

    // ============ ESCALA / REUTILIZACIÓN ============
    if (Array.isArray(c.escala) && c.escala.length) {
      s = pptx.addSlide(); s.background = { color: BG };
      header(s, "Escala · 05", "Cómo reutilizar y escalar el sistema");
      const reuse = c.escala.slice(0, 3);
      const accs = [PURPLE, BLUE, INK];
      const ruw = (W - 2 * M - 0.6) / Math.max(reuse.length, 1);
      reuse.forEach((r, i) => {
        const x = M + i * (ruw + 0.3);
        const acc = accs[i % 3];
        s.addShape(RR, { x, y: 2.05, w: ruw, h: 3.05, fill: { color: CARD }, rectRadius: 0.12, line: { color: BORDER, width: 1 }, shadow: shadow() });
        s.addShape(RECT, { x, y: 2.05, w: ruw, h: 0.1, fill: { color: acc } });
        s.addShape(RR, { x: x + 0.38, y: 2.5, w: 0.7, h: 0.7, fill: { color: acc }, rectRadius: 0.12 });
        s.addText(String.fromCharCode(65 + i), { x: x + 0.38, y: 2.5, w: 0.7, h: 0.7, fontFace: FH, fontSize: 24, bold: true, color: WHITE, align: "center", valign: "middle", margin: 0 });
        s.addText(String(r.titulo || ""), { x: x + 0.38, y: 3.4, w: ruw - 0.76, h: 0.6, fontFace: FH, fontSize: 15, bold: true, color: INK, valign: "top", margin: 0 });
        s.addText(String(r.detalle || ""), { x: x + 0.38, y: 4.05, w: ruw - 0.76, h: 1.0, fontFace: FB, fontSize: 11, color: SLATE2, valign: "top", margin: 0 });
      });
      s.addShape(RR, { x: M, y: 5.4, w: W - 2 * M, h: 0.8, fill: { color: TINT }, rectRadius: 0.1 });
      s.addText([{ text: "Principio rector:   ", options: { bold: true, color: PURPLE2 } }, { text: "el motor y la munición se reutilizan; solo cambian geo, prueba social y la capa de ángulo. Adaptar, no empezar de cero.", options: { color: SLATE2 } }],
        { x: M + 0.4, y: 5.4, w: W - 2 * M - 0.8, h: 0.8, fontFace: FB, fontSize: 12, valign: "middle", margin: 0 });
      footer(s, false);
    }

    // ============ CIERRE (oscura) ============
    s = pptx.addSlide(); s.background = { color: INK };
    s.addShape(OVAL, { x: 8.6, y: -2.6, w: 7.6, h: 7.6, fill: { color: PURPLE, transparency: 80 } });
    s.addShape(RECT, { x: 0, y: 0, w: 0.16, h: H, fill: { color: PURPLE } });
    wordmark(s, M, 1.95, 0.68, true);
    s.addText("Tu campaña está lista para producción", { x: M - 0.04, y: 3.1, w: 11.5, h: 1.4, fontFace: FH, fontSize: 38, bold: true, color: WHITE, margin: 0, valign: "top", lineSpacingMultiple: 0.98 });
    s.addText("Sube tus Entity IDs al ad set, déjalo correr 4-7 días sin tocar y escala al ganador con ángulos nuevos.", { x: M, y: 4.75, w: 10.2, h: 0.8, fontFace: FB, fontSize: 13.5, color: "C7D2E5", margin: 0, valign: "top" });
    s.addShape(RR, { x: M, y: 5.75, w: 3.4, h: 0.72, fill: { color: PURPLE }, rectRadius: 0.36 });
    s.addText("Metadology Ads · Caperifai", { x: M, y: 5.75, w: 3.4, h: 0.72, fontFace: FB, fontSize: 11.5, bold: true, color: WHITE, align: "center", valign: "middle", margin: 0 });

    const buf = await pptx.write({ outputType: "nodebuffer" });
    return new Response(buf, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        "Content-Disposition": `attachment; filename="Campana-Caperifai.pptx"`,
      },
    });
  } catch (e) {
    return Response.json({ error: String(e?.message || e) }, { status: 500 });
  }
}

import PptxGenJS from "pptxgenjs";

export const runtime = "nodejs";
export const maxDuration = 60;

const VIOLET = "5A3AFF";
const BLUE = "2563EB";
const NAVY = "0B1437";
const INK = "0F172A";
const SLATE = "64748B";
const LIGHT = "F1EEFF";
const BORDER = "E2E8F0";
const W = 13.333;
const H = 7.5;

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

export async function POST(req) {
  let body = {};
  try { body = await req.json(); } catch {}
  const c = body && body.campaign;
  if (!c) return Response.json({ error: "Falta 'campaign'." }, { status: 400 });

  // Pre-descarga las imágenes generadas (estáticos y slides de carrusel) en paralelo.
  const creativosArr = Array.isArray(c.creativos) ? c.creativos : [];
  const imgData = await Promise.all(creativosArr.map((cr) => (cr.imagen ? fetchImageData(cr.imagen) : Promise.resolve(null))));
  const carImgData = await Promise.all(
    creativosArr.map((cr) =>
      Array.isArray(cr.carrusel)
        ? Promise.all(cr.carrusel.map((cs) => (cs.imagen ? fetchImageData(cs.imagen) : Promise.resolve(null))))
        : Promise.resolve([])
    )
  );

  try {
  const pptx = new PptxGenJS();
  pptx.defineLayout({ name: "WIDE", width: W, height: H });
  pptx.layout = "WIDE";
  pptx.author = "Caperifai";
  pptx.company = "Caperifai";

  const footer = (s, n) => {
    s.addText("caperifai", { x: 0.5, y: H - 0.45, w: 3, h: 0.3, fontSize: 9, bold: true, color: VIOLET });
    s.addText(String(c.titulo || "Campaña Meta Ads"), { x: 3, y: H - 0.45, w: 8, h: 0.3, fontSize: 8, color: SLATE, align: "left" });
    if (n != null) s.addText(String(n).padStart(2, "0"), { x: W - 1, y: H - 0.45, w: 0.5, h: 0.3, fontSize: 8, color: SLATE, align: "right" });
  };
  const eyebrow = (s, t) => s.addText(String(t).toUpperCase(), { x: 0.5, y: 0.5, w: 12, h: 0.3, fontSize: 11, bold: true, color: VIOLET, charSpacing: 2 });
  const title = (s, t) => s.addText(String(t || ""), { x: 0.5, y: 0.85, w: 12.3, h: 0.8, fontSize: 26, bold: true, color: NAVY });

  let page = 1;

  // ---- Portada ----
  let s = pptx.addSlide();
  s.background = { color: "FFFFFF" };
  s.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: W, h: 0.18, fill: { color: VIOLET } });
  s.addText("caperifai", { x: 0.6, y: 0.6, w: 5, h: 0.5, fontSize: 20, bold: true, color: NAVY });
  s.addText("AI Copilots for Marketing that Scale", { x: 0.6, y: 1.1, w: 7, h: 0.3, fontSize: 11, color: SLATE });
  s.addText("PROPUESTA DE CAMPAÑA", { x: 0.6, y: 2.4, w: 8, h: 0.3, fontSize: 12, bold: true, color: VIOLET, charSpacing: 2 });
  s.addText(String(c.titulo || "Campaña Meta Ads"), { x: 0.6, y: 2.85, w: 11.5, h: 1.2, fontSize: 34, bold: true, color: NAVY });
  s.addText(String(c.subtitulo || ""), { x: 0.6, y: 4.1, w: 11, h: 0.8, fontSize: 14, color: INK });
  s.addText("10 creativos · 6 estáticos · 2 carruseles · 2 UGC", { x: 0.6, y: 5.2, w: 11, h: 0.4, fontSize: 13, bold: true, color: BLUE });
  footer(s, page++);

  // ---- Marca ----
  if (c.marca) {
    s = pptx.addSlide(); s.background = { color: "FFFFFF" };
    eyebrow(s, "El cliente"); title(s, c.marca.nombre || "La marca");
    s.addText(String(c.marca.brief || ""), { x: 0.5, y: 1.7, w: 7.2, h: 1.6, fontSize: 13, color: INK, valign: "top" });
    const pal = Array.isArray(c.marca.paleta) ? c.marca.paleta.slice(0, 5) : [];
    pal.forEach((p, i) => {
      const hex = String(p.hex || "#cccccc").replace("#", "");
      s.addShape(pptx.ShapeType.rect, { x: 0.5 + i * 1.2, y: 3.5, w: 1.05, h: 0.9, fill: { color: hex }, line: { color: BORDER, width: 1 } });
      s.addText(`#${hex}\n${p.nombre || ""}`, { x: 0.5 + i * 1.2, y: 4.45, w: 1.1, h: 0.5, fontSize: 8, color: SLATE, align: "center" });
    });
    s.addText(
      [
        { text: "Tipografía: ", options: { bold: true, color: NAVY } }, { text: (c.marca.tipografia || "") + "\n", options: { color: INK } },
        { text: "Logo: ", options: { bold: true, color: NAVY } }, { text: (c.marca.logo || "") + "\n", options: { color: INK } },
        { text: "Estilo de foto: ", options: { bold: true, color: NAVY } }, { text: (c.marca.estilo_foto || ""), options: { color: INK } },
      ],
      { x: 8.0, y: 1.7, w: 4.8, h: 3.5, fontSize: 12, valign: "top", lineSpacingMultiple: 1.3 }
    );
    footer(s, page++);
  }

  // ---- Estrategia ----
  if (c.estrategia) {
    const e = c.estrategia;
    s = pptx.addSlide(); s.background = { color: "FFFFFF" };
    eyebrow(s, "Estrategia"); title(s, "El motor de cada creativo");
    const motor = e.motor || {};
    [["HOOK · 0-3s", motor.hook], ["VALOR · agita", motor.valor], ["OFERTA · CTA", motor.oferta]].forEach((m, i) => {
      s.addShape(pptx.ShapeType.roundRect, { x: 0.5 + i * 4.1, y: 1.7, w: 3.9, h: 1.7, fill: { color: LIGHT }, line: { color: BORDER, width: 1 }, rectRadius: 0.1 });
      s.addText(m[0], { x: 0.7 + i * 4.1, y: 1.85, w: 3.5, h: 0.3, fontSize: 11, bold: true, color: VIOLET });
      s.addText(String(m[1] || ""), { x: 0.7 + i * 4.1, y: 2.25, w: 3.5, h: 1.0, fontSize: 11, color: INK, valign: "top" });
    });
    s.addText(
      [
        { text: "La bandera: ", options: { bold: true, color: NAVY } }, { text: (e.bandera || "") + "\n", options: { color: INK } },
        { text: "Autoridad: ", options: { bold: true, color: NAVY } }, { text: (e.autoridad || "") + "\n", options: { color: INK } },
        { text: "CTA: ", options: { bold: true, color: NAVY } }, { text: (e.cta || "") + "\n", options: { color: INK } },
        { text: "El cliente en llamas: ", options: { bold: true, color: NAVY } }, { text: (e.buyer || ""), options: { color: INK } },
      ],
      { x: 0.5, y: 3.7, w: 12.3, h: 2.6, fontSize: 12, valign: "top", lineSpacingMultiple: 1.35 }
    );
    footer(s, page++);
  }

  // ---- Creativos ----
  const creativos = creativosArr;
  creativos.forEach((cr, ci) => {
    s = pptx.addSlide(); s.background = { color: "FFFFFF" };
    eyebrow(s, `${cr.id || ""} · ${cr.formato || ""} · ${cr.temperatura || ""}`);
    title(s, cr.titulo || cr.angulo || "");
    s.addText([{ text: "ÁNGULO: ", options: { bold: true, color: VIOLET } }, { text: cr.angulo || "", options: { color: NAVY } }, { text: "    CTA: ", options: { bold: true, color: VIOLET } }, { text: cr.cta || "", options: { color: NAVY } }], { x: 0.5, y: 1.65, w: 12, h: 0.3, fontSize: 11 });
    s.addText([{ text: "HOOK 0-3s\n", options: { bold: true, color: SLATE, fontSize: 9 } }, { text: cr.hook || "", options: { color: INK, italic: true } }], { x: 0.5, y: 2.05, w: 12.3, h: 0.7, fontSize: 12, valign: "top" });
    s.addText([{ text: "COPY\n", options: { bold: true, color: SLATE, fontSize: 9 } }, { text: cr.copy_out || "", options: { color: INK } }], { x: 0.5, y: 2.85, w: 6.0, h: 3.4, fontSize: 11.5, valign: "top", lineSpacingMultiple: 1.15 });

    // Columna derecha: imagen generada (si hay) y/o detalle por formato
    const fmt = String(cr.formato || "").toLowerCase();
    let imgOk = false;
    if (imgData[ci]) {
      try {
        s.addImage({ data: imgData[ci], x: 8.7, y: 2.0, w: 4.1, h: 4.1 });
        s.addText("ANUNCIO GENERADO", { x: 8.7, y: 1.65, w: 4, h: 0.3, fontSize: 9, bold: true, color: SLATE });
        imgOk = true;
      } catch (e) { imgOk = false; }
    }
    if (imgOk) {
      // imagen ya colocada
    } else if (fmt.includes("ugc") && Array.isArray(cr.script) && cr.script.length) {
      s.addText("SCRIPT DE GRABACIÓN", { x: 6.7, y: 2.85, w: 6, h: 0.3, fontSize: 9, bold: true, color: SLATE });
      const rows = [[{ text: "T", options: { bold: true, fill: { color: LIGHT }, color: NAVY } }, { text: "Línea", options: { bold: true, fill: { color: LIGHT }, color: NAVY } }, { text: "En pantalla", options: { bold: true, fill: { color: LIGHT }, color: NAVY } }]];
      cr.script.slice(0, 6).forEach((r) => rows.push([{ text: String(r.t || "") }, { text: String(r.linea || "") }, { text: String(r.pantalla || "") }]));
      s.addTable(rows, { x: 6.7, y: 3.15, w: 6.1, colW: [1, 3.1, 2], fontSize: 8.5, color: INK, border: { type: "solid", color: BORDER, pt: 0.5 }, valign: "top" });
    } else if (fmt.includes("carrusel") && Array.isArray(cr.carrusel) && cr.carrusel.length) {
      s.addText("CARRUSEL · SLIDES", { x: 6.7, y: 2.85, w: 6, h: 0.3, fontSize: 9, bold: true, color: SLATE });
      const slides = cr.carrusel.slice(0, 4);
      const imgs = carImgData[ci] || [];
      slides.forEach((cs, k) => {
        const ix = 6.7 + k * 1.52;
        if (imgs[k]) {
          try { s.addImage({ data: imgs[k], x: ix, y: 3.2, w: 1.42, h: 1.42 }); } catch (e) {}
        }
        s.addText(`${cs.n || k + 1}. ${String(cs.desc || "").slice(0, 90)}`, { x: ix, y: 4.7, w: 1.48, h: 1.5, fontSize: 7.5, color: SLATE, valign: "top", lineSpacingMultiple: 1.1 });
      });
    } else if (cr.prompt) {
      s.addText("PROMPT DEL ESTÁTICO", { x: 6.7, y: 2.85, w: 6, h: 0.3, fontSize: 9, bold: true, color: SLATE });
      s.addText(String(cr.prompt), { x: 6.7, y: 3.15, w: 6.1, h: 3.0, fontSize: 9.5, color: SLATE, valign: "top", fill: { color: "F8FAFC" }, lineSpacingMultiple: 1.15 });
    }
    footer(s, page++);
  });

  // ---- Lanzamiento ----
  if (Array.isArray(c.lanzamiento) && c.lanzamiento.length) {
    s = pptx.addSlide(); s.background = { color: "FFFFFF" };
    eyebrow(s, "Cómo lanzar"); title(s, "El plan de salida en Meta");
    const text = c.lanzamiento.map((p, i) => [{ text: `${i + 1}. ${p.paso || ""}\n`, options: { bold: true, color: NAVY } }, { text: (p.detalle || "") + "\n\n", options: { color: INK } }]).flat();
    s.addText(text, { x: 0.5, y: 1.7, w: 12.3, h: 5, fontSize: 12.5, valign: "top", lineSpacingMultiple: 1.15 });
    footer(s, page++);
  }

  // ---- Escala / salvaguardas ----
  if (Array.isArray(c.escala) && c.escala.length) {
    s = pptx.addSlide(); s.background = { color: "FFFFFF" };
    eyebrow(s, "Escala"); title(s, "Cómo reutilizar y escalar");
    const text = c.escala.map((p) => [{ text: `${p.titulo || ""}\n`, options: { bold: true, color: VIOLET } }, { text: (p.detalle || "") + "\n\n", options: { color: INK } }]).flat();
    s.addText(text, { x: 0.5, y: 1.7, w: 7.5, h: 5, fontSize: 12.5, valign: "top", lineSpacingMultiple: 1.15 });
    const sg = Array.isArray(c.salvaguardas) ? c.salvaguardas : [];
    if (sg.length) {
      s.addText("SALVAGUARDAS ENTITY ID", { x: 8.3, y: 1.7, w: 4.5, h: 0.3, fontSize: 9, bold: true, color: SLATE });
      s.addText(sg.map((x, i) => `${i + 1}. ${x}`).join("\n"), { x: 8.3, y: 2.05, w: 4.5, h: 4.5, fontSize: 10.5, color: INK, valign: "top", lineSpacingMultiple: 1.25 });
    }
    footer(s, page++);
  }

  // ---- Cierre ----
  s = pptx.addSlide(); s.background = { color: NAVY };
  s.addText("caperifai", { x: 0.6, y: 2.6, w: 6, h: 0.6, fontSize: 22, bold: true, color: "FFFFFF" });
  s.addText("Tu campaña está lista para producción", { x: 0.6, y: 3.3, w: 11, h: 0.8, fontSize: 28, bold: true, color: "FFFFFF" });
  s.addText("Sube los Entity IDs a tu ad set, deja correr 4-7 días y escala al ganador con ángulos nuevos.", { x: 0.6, y: 4.3, w: 11, h: 0.8, fontSize: 14, color: "C9D3E8" });

  const buf = await pptx.write({ outputType: "nodebuffer" });
  const fname = "Campana-Caperifai.pptx";
  return new Response(buf, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      "Content-Disposition": `attachment; filename="${fname}"`,
    },
  });
  } catch (e) {
    return Response.json({ error: String(e?.message || e) }, { status: 500 });
  }
}

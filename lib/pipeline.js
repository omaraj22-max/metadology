// Pipeline Metadology por etapas. Cada etapa corre en su propia invocación de /api/wa/process
// (límite de 300s por función en Vercel) y al terminar dispara la siguiente.
//   brand     → scrape + análisis de marca + moodboard (JSON)
//   moodboard → imagen del moodboard (GPT Image) + se la mandamos
//   campaign  → concepto del anuncio (JSON)
//   ad        → imagen del anuncio con el moodboard como referencia + entrega final
import { kvGet, kvSet, K, newId } from "./store";
import { getConversation, saveConversation, reply, triggerStage, siteUrl, ctaUrl } from "./flow";
import { sendImage } from "./wa";
import { mirrorToSheet } from "./sheet";
import { scrapeLanding, analyzeBrand, generateMoodboard, generateCampaign, generateImage, fetchImageRef } from "./engine";

const ORDER = ["brand", "moodboard", "campaign", "ad"];

async function saveImage({ mime, b64 }) {
  const id = newId("i");
  const kb = Math.round((b64.length * 3) / 4 / 1024);
  try {
    await kvSet(K.img(id), { mime, b64, at: Date.now() });
  } catch (e) {
    throw new Error(`No se pudo guardar la imagen (${kb} KB) en el store: ${e?.message || e}`);
  }
  return id;
}

export async function imageUrl(id) {
  return `${await siteUrl()}/api/wa/image/${id}`;
}

async function getResult(conv) {
  if (conv.resultId) {
    const r = await kvGet(K.result(conv.resultId));
    if (r) return r;
  }
  const r = {
    id: newId("r"),
    convId: conv.id,
    phone: conv.phone,
    name: conv.name,
    createdAt: Date.now(),
    fields: conv.fields,
    landing: null,
    brand: null,
    moodboard: null,
    moodboardImg: null,
    campaign: null,
    adImg: null,
  };
  conv.resultId = r.id;
  await kvSet(K.result(r.id), r);
  return r;
}

async function saveResult(r) {
  r.updatedAt = Date.now();
  await kvSet(K.result(r.id), r);
}

function firstName(conv) {
  return conv.name ? conv.name.split(" ")[0] : "";
}

async function stageBrand(conv, r) {
  const f = conv.fields;
  r.landing = f.link ? await scrapeLanding(f.link) : null;
  if (r.landing) {
    // el texto crudo es grande y no se muestra: guardamos solo lo útil para la página
    r.landing = { ...r.landing, text: r.landing.text?.slice(0, 1500) };
  }
  const landingFull = f.link ? await scrapeLanding(f.link) : null;
  r.brand = await analyzeBrand({ producto: f.producto, problema: f.problema, pais: f.pais, landing: landingFull });
  r.moodboard = await generateMoodboard({
    producto: f.producto, problema: f.problema, pais: f.pais, landing: landingFull,
    marca: r.brand?.marca, resumen: r.brand?.resumen, industria: r.brand?.industria,
  });
  await saveResult(r);
  await reply(conv, `Ya analicé *${r.brand?.marca || "tu marca"}* ✅ ${r.brand?.resumen || ""}\n\nAhora estoy dibujando tu moodboard, dame un momento…`);
}

async function stageMoodboard(conv, r) {
  const logoRef = await fetchImageRef(r.landing?.identidad?.logo);
  const img = await generateImage({ prompt: r.moodboard.imagePrompt, size: "square", references: logoRef ? [logoRef] : [] });
  r.moodboardImg = await saveImage(img);
  await saveResult(r);
  try {
    const url = await imageUrl(r.moodboardImg);
    await sendImage(conv.phone, url, `Tu moodboard: la piel de ${r.brand?.marca || "tu marca"} 🎨\n\nCon esto armo tu anuncio, ya casi…`);
    conv.transcript.push({ role: "aria", text: `[imagen: moodboard] ${url}`, at: Date.now() });
  } catch (e) {
    console.error("[wa] imagen moodboard:", e?.message || e);
  }
}

async function stageCampaign(conv, r) {
  const f = conv.fields;
  r.campaign = await generateCampaign({
    producto: f.producto, problema: f.problema, pais: f.pais, landing: r.landing,
    resumen: r.brand?.resumen, industria: r.brand?.industria, marca: r.brand?.marca, moodboard: r.moodboard,
  });
  await saveResult(r);
}

async function stageAd(conv, r) {
  const refs = [];
  const mb = r.moodboardImg ? await kvGet(K.img(r.moodboardImg)) : null;
  if (mb) refs.push({ mime: mb.mime, b64: mb.b64 });
  const img = await generateImage({ prompt: r.campaign.imagePrompt, size: "portrait", references: refs });
  r.adImg = await saveImage(img);
  await saveResult(r);

  const c = r.campaign.copy || {};
  const link = `${await siteUrl()}/r/${r.id}`;
  try {
    const url = await imageUrl(r.adImg);
    await sendImage(conv.phone, url, `🎉 Listo${firstName(conv) ? ", " + firstName(conv) : ""}. Tu anuncio Metadology para *${r.brand?.marca || "tu marca"}*.`);
    conv.transcript.push({ role: "aria", text: `[imagen: anuncio] ${url}`, at: Date.now() });
  } catch (e) {
    console.error("[wa] imagen anuncio:", e?.message || e);
  }
  await reply(
    conv,
    `*Copy listo para pegar en Meta:*\n\n*Hook:* ${c.hook || ""}\n*Valor:* ${c.valor || ""}\n*Oferta:* ${c.oferta || ""}\n*CTA:* ${c.cta || ""}\n\n${r.campaign.explicacion || ""}\n\nTu resultado completo (moodboard, ángulos de venta, conceptos y estrategia): ${link}\n\nEsto fue 1 anuncio; una campaña ganadora necesita 8-12. ¿Lo armamos juntos? Agenda con Caperifai: ${await ctaUrl()}`
  );
  conv.status = "done";
  conv.stage = "done";
}

const RUN = { brand: stageBrand, moodboard: stageMoodboard, campaign: stageCampaign, ad: stageAd };

export async function runStage(convId, stage) {
  const conv = await getConversation(convId);
  if (!conv) throw new Error(`conversación ${convId} no existe`);
  if (!RUN[stage]) throw new Error(`etapa desconocida: ${stage}`);
  conv.stage = stage;
  conv.status = "generating";
  await saveConversation(conv);
  const r = await getResult(conv);
  try {
    await RUN[stage](conv, r);
    const next = ORDER[ORDER.indexOf(stage) + 1];
    if (next) conv.stage = next;
    await saveConversation(conv);
    mirrorToSheet(conv, r).catch(() => {});
    if (next) await triggerStage(conv.id, next);
  } catch (e) {
    console.error(`[pipeline] etapa ${stage} falló:`, e);
    conv.status = "error";
    conv.error = `${stage}: ${e?.message || e}`;
    await reply(conv, "Ups, tuve un problema generando tu resultado 😕 Escribe *reintentar* y lo vuelvo a intentar; si sigue fallando, el equipo de Caperifai lo revisa y te escribe por aquí.");
    await saveConversation(conv);
    mirrorToSheet(conv, r).catch(() => {});
  }
}

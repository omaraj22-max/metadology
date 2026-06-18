"use client";

import React, { useEffect, useState } from "react";

const C = {
  violet: "#5A3AFF", blue: "#2563EB", navy: "#0B1437", ink: "#0F172A",
  slate: "#64748B", border: "#E2E8F0", bg: "#F8FAFF", surfaceAlt: "#FBFCFE",
};
const PENDING_KEY = "caperif_pending_v1";

// Reporta la compra a Meta (Pixel) una sola vez por sesión. Aunque el usuario recargue
// /gracias, el candado en localStorage evita doble conteo. eventID = sessionId permite
// además deduplicar si en el futuro se envía también por Conversions API (server-side).
function reportPurchase(order, sessionId) {
  if (!sessionId) return;
  const key = "caperif_purchase_" + sessionId;
  try { if (localStorage.getItem(key)) return; } catch (e) {}
  const value = typeof order?.value === "number" ? order.value : undefined;
  const currency = order?.currency || "USD";
  try {
    if (typeof window !== "undefined") {
      if (typeof window.fbq === "function") {
        window.fbq(
          "track",
          "Purchase",
          { value, currency, content_name: "Campaña completa Caperifai", content_type: "product" },
          { eventID: sessionId }
        );
      }
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({ event: "purchase", value, currency, transaction_id: sessionId });
    }
  } catch (e) {}
  try { localStorage.setItem(key, "1"); } catch (e) {}
}

export default function Gracias() {
  const [stage, setStage] = useState("loading"); // loading | ready | error
  const [err, setErr] = useState("");
  const [campaign, setCampaign] = useState(null);
  const [downloading, setDownloading] = useState(false);

  // Genera (o re-genera) la campaña. El producto se lee de la sesión de Stripe ya pagada,
  // así que reintentar NO vuelve a cobrar.
  const generate = async () => {
    setStage("loading"); setErr("");
    try {
      const params = new URLSearchParams(window.location.search);
      const sessionId = params.get("session_id");
      let form = null;
      try { form = JSON.parse(localStorage.getItem(PENDING_KEY) || "null"); } catch (e) {}
      if (!sessionId) { setErr("No encontramos la sesión de pago."); setStage("error"); return; }
      const res = await fetch("/api/full-campaign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, form }),
      });
      const json = await res.json().catch(() => ({}));
      // El pago ya está verificado en el servidor (viene 'order'): reporta la compra a Meta
      // UNA sola vez por sesión, incluso si la generación falla. eventID = sessionId (dedup).
      if (json.order) reportPurchase(json.order, sessionId);
      if (!res.ok || json.error) throw new Error(json.error || `Error ${res.status}`);
      setCampaign(json.campaign);
      setStage("ready");
    } catch (e) {
      setErr(e?.message || "No se pudo generar la campaña.");
      setStage("error");
    }
  };

  useEffect(() => { generate(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, []);

  // Genera con fal.ai la imagen de cada estático y de cada SLIDE de carrusel (los UGC
  // solo llevan script, no imagen). En paralelo (3 a la vez) y de forma progresiva.
  useEffect(() => {
    if (stage !== "ready" || !campaign) return;
    let cancelled = false;
    const targets = [];
    (campaign.creativos || []).forEach((cr, i) => {
      if (cr.prompt && !cr.imagen) targets.push({ prompt: cr.prompt, i, k: -1 });
      if (Array.isArray(cr.carrusel)) cr.carrusel.forEach((cs, k) => { if (cs.prompt && !cs.imagen) targets.push({ prompt: cs.prompt, i, k }); });
    });
    let idx = 0;
    const worker = async () => {
      while (idx < targets.length && !cancelled) {
        const my = targets[idx++];
        try {
          const res = await fetch("/api/generate-image", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ prompt: my.prompt }) });
          const json = await res.json().catch(() => ({}));
          if (json.url && !cancelled) {
            setCampaign((prev) => ({
              ...prev,
              creativos: prev.creativos.map((c, j) => {
                if (j !== my.i) return c;
                if (my.k === -1) return { ...c, imagen: json.url };
                return { ...c, carrusel: (c.carrusel || []).map((cs, kk) => (kk === my.k ? { ...cs, imagen: json.url } : cs)) };
              }),
            }));
          }
        } catch (e) {}
      }
    };
    Promise.all([worker(), worker(), worker()]);
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage]);

  // Descarga una imagen individual (fuerza descarga vía blob; si falla CORS, abre en pestaña).
  const downloadImage = async (url, name) => {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error("fetch");
      const blob = await res.blob();
      const u = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = u; a.download = name;
      document.body.appendChild(a); a.click(); a.remove();
      URL.revokeObjectURL(u);
    } catch (e) {
      window.open(url, "_blank");
    }
  };

  const downloadAllImages = async () => {
    const list = [];
    (campaign.creativos || []).forEach((cr) => {
      if (cr.imagen) list.push([cr.imagen, `${cr.id || "ad"}.jpg`]);
      (cr.carrusel || []).forEach((cs, k) => { if (cs.imagen) list.push([cs.imagen, `${cr.id || "ad"}-slide-${cs.n || k + 1}.jpg`]); });
    });
    for (const [u, n] of list) { await downloadImage(u, n); await new Promise((r) => setTimeout(r, 400)); }
  };

  const download = async () => {
    if (!campaign) return;
    setDownloading(true);
    try {
      const res = await fetch("/api/campaign-pptx", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ campaign }),
      });
      if (!res.ok) throw new Error("No se pudo generar el archivo.");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = "Campana-Caperifai.pptx";
      document.body.appendChild(a); a.click(); a.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      alert(e?.message || "No se pudo descargar la presentación.");
    } finally {
      setDownloading(false);
    }
  };

  // Progreso de imágenes: el PPTX se habilita solo cuando TODAS están listas.
  let imagesTotal = 0, imagesDone = 0;
  if (campaign) {
    (campaign.creativos || []).forEach((cr) => {
      if (cr.prompt) { imagesTotal++; if (cr.imagen) imagesDone++; }
      (cr.carrusel || []).forEach((cs) => { if (cs.prompt) { imagesTotal++; if (cs.imagen) imagesDone++; } });
    });
  }
  const allImagesReady = imagesTotal === 0 || imagesDone >= imagesTotal;

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "'Inter', system-ui, sans-serif", color: C.ink, padding: "40px 20px" }}>
      <div style={{ maxWidth: 820, margin: "0 auto" }}>
        <a href="/" style={{ textDecoration: "none" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="Caperifai" style={{ height: 26, display: "block", marginBottom: 28 }} />
        </a>

        {stage === "loading" && (
          <div style={{ background: "#fff", border: `1px solid ${C.border}`, borderRadius: 20, padding: 48, textAlign: "center" }}>
            <div style={{ width: 34, height: 34, border: `3px solid ${C.border}`, borderTopColor: C.violet, borderRadius: "50%", margin: "0 auto 18px", animation: "sp 0.8s linear infinite" }} />
            <h1 style={{ fontSize: 22, fontWeight: 700, color: C.navy, margin: "0 0 8px" }}>¡Gracias por tu compra! 🎉</h1>
            <p style={{ color: C.slate, fontSize: 14.5, lineHeight: 1.6, maxWidth: 460, margin: "0 auto" }}>Aria está armando tu campaña completa para producción. Esto toma 1-2 minutos, no cierres esta página…</p>
            <style>{`@keyframes sp { to { transform: rotate(360deg) } }`}</style>
          </div>
        )}

        {stage === "error" && (
          <div style={{ background: "#fff", border: `1px solid ${C.border}`, borderRadius: 20, padding: 40 }}>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: C.navy, margin: "0 0 10px" }}>Tu pago se procesó ✓</h1>
            <p style={{ color: "#E11D48", fontSize: 14.5, lineHeight: 1.6, marginBottom: 16 }}>Pero no pudimos generar la campaña automáticamente.<br /><span style={{ color: C.slate, fontSize: 12.5 }}>Detalle: {err}</span></p>
            <p style={{ color: C.slate, fontSize: 14, lineHeight: 1.6, marginBottom: 18 }}>Tu pago ya está verificado, así que reintentar <strong>no vuelve a cobrar</strong>. Puedes generar tu campaña de nuevo aquí mismo:</p>
            <button onClick={generate} style={{ background: `linear-gradient(135deg, ${C.violet}, ${C.blue})`, color: "#fff", border: "none", borderRadius: 12, padding: "12px 22px", fontSize: 15, fontWeight: 700, cursor: "pointer", marginBottom: 16 }}>Reintentar generación</button>
            <p style={{ color: C.slate, fontSize: 13, lineHeight: 1.6 }}>Si sigue fallando, escríbenos a <a href="mailto:hello@caperif.ai" style={{ color: C.violet, fontWeight: 600 }}>hello@caperif.ai</a> con tu correo de compra y te enviamos tu campaña a la mano.</p>
          </div>
        )}

        {stage === "ready" && campaign && (
          <>
            <div style={{ background: `linear-gradient(135deg, ${C.violet}, ${C.blue})`, borderRadius: 20, padding: 32, color: "#fff", marginBottom: 22, textAlign: "center" }}>
              <h1 style={{ fontSize: 24, fontWeight: 700, margin: "0 0 8px" }}>Tu campaña completa está lista 🚀</h1>
              <p style={{ fontSize: 14, color: "rgba(255,255,255,.9)", margin: "0 0 20px", lineHeight: 1.6 }}>{campaign.titulo}</p>
              <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
                <button onClick={download} disabled={downloading || !allImagesReady} style={{ padding: "14px 28px", borderRadius: 12, border: "none", background: "#fff", color: C.violet, fontWeight: 700, fontSize: 15, cursor: downloading || !allImagesReady ? "not-allowed" : "pointer", opacity: downloading || !allImagesReady ? 0.6 : 1 }}>
                  {downloading ? "Generando…" : !allImagesReady ? `Generando imágenes (${imagesDone}/${imagesTotal})…` : "⬇ Descargar presentación (.pptx)"}
                </button>
                {allImagesReady && imagesTotal > 0 && (
                  <button onClick={downloadAllImages} style={{ padding: "14px 22px", borderRadius: 12, border: "1.5px solid rgba(255,255,255,.5)", background: "transparent", color: "#fff", fontWeight: 600, fontSize: 14, cursor: "pointer" }}>
                    ⬇ Descargar todas las imágenes
                  </button>
                )}
              </div>
              {!allImagesReady && <p style={{ fontSize: 11.5, color: "rgba(255,255,255,.75)", margin: "12px 0 0" }}>Las imágenes se están generando (1-2 min). El botón se habilita al terminar.</p>}
            </div>

            <div style={{ background: "#fff", border: `1px solid ${C.border}`, borderRadius: 18, padding: 28 }}>
              <h2 style={{ fontSize: 17, fontWeight: 700, color: C.navy, margin: "0 0 4px" }}>Vista previa: tus 10 creativos</h2>
              <p style={{ color: C.slate, fontSize: 13, margin: "0 0 18px" }}>Todo el detalle (estrategia, scripts, carruseles, plan de lanzamiento) está en la presentación descargable.</p>
              <div style={{ display: "grid", gap: 12 }}>
                {(campaign.creativos || []).map((cr, i) => {
                  const isUGC = /ugc/i.test(cr.formato || "");
                  const isCarrusel = Array.isArray(cr.carrusel) && cr.carrusel.length > 0;
                  return (
                  <div key={i} style={{ border: `1px solid ${C.border}`, borderRadius: 12, padding: 14, display: "flex", gap: 14, flexDirection: isCarrusel ? "column" : "row" }}>
                    {cr.prompt && !isCarrusel ? (
                      <div style={{ width: 130, flexShrink: 0 }}>
                        {cr.imagen ? (
                          <>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={cr.imagen} alt="" style={{ width: 130, height: 130, objectFit: "cover", borderRadius: 8, border: `1px solid ${C.border}`, display: "block" }} />
                            <button onClick={() => downloadImage(cr.imagen, `${cr.id || "ad"}.jpg`)} style={{ marginTop: 6, width: 130, fontSize: 11, color: C.violet, background: "transparent", border: `1px solid ${C.border}`, borderRadius: 7, padding: "4px 0", cursor: "pointer", fontWeight: 600 }}>⬇ Descargar</button>
                          </>
                        ) : (
                          <div style={{ width: 130, height: 130, borderRadius: 8, border: `1px solid ${C.border}`, background: C.surfaceAlt, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8 }}>
                            <div style={{ width: 22, height: 22, border: `2.5px solid ${C.border}`, borderTopColor: C.violet, borderRadius: "50%", animation: "sp 0.8s linear infinite" }} />
                            <span style={{ fontSize: 10, color: C.slate, textAlign: "center" }}>Generando…</span>
                          </div>
                        )}
                      </div>
                    ) : null}
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", gap: 8, flexWrap: "wrap", marginBottom: 4 }}>
                        <b style={{ color: C.navy, fontSize: 14 }}>{cr.id} · {cr.titulo || cr.angulo}</b>
                        <span style={{ fontSize: 11, color: C.violet, fontWeight: 600 }}>{cr.formato} · {cr.temperatura}</span>
                      </div>
                      {cr.hook && <div style={{ fontSize: 12.5, color: C.ink, fontStyle: "italic", marginBottom: 4 }}>“{cr.hook}”</div>}
                      {cr.copy_out && <div style={{ fontSize: 12.5, color: C.slate, lineHeight: 1.5, whiteSpace: "pre-wrap" }}>{cr.copy_out}</div>}
                      {isUGC && <div style={{ fontSize: 12, color: C.violet, fontWeight: 600, marginTop: 6 }}>🎬 Video UGC · el script completo está en la presentación</div>}
                    </div>
                    {isCarrusel && (
                      <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingTop: 4 }}>
                        {cr.carrusel.map((cs, k) => (
                          <div key={k} style={{ width: 96, flexShrink: 0 }}>
                            {cs.imagen ? (
                              <>
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={cs.imagen} alt="" style={{ width: 96, height: 96, objectFit: "cover", borderRadius: 6, border: `1px solid ${C.border}`, display: "block" }} />
                                <button onClick={() => downloadImage(cs.imagen, `${cr.id || "ad"}-slide-${cs.n || k + 1}.jpg`)} style={{ marginTop: 4, width: 96, fontSize: 10, color: C.violet, background: "transparent", border: `1px solid ${C.border}`, borderRadius: 6, padding: "3px 0", cursor: "pointer", fontWeight: 600 }}>⬇</button>
                              </>
                            ) : (
                              <div style={{ width: 96, height: 96, borderRadius: 6, border: `1px solid ${C.border}`, background: C.surfaceAlt, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <div style={{ width: 18, height: 18, border: `2.5px solid ${C.border}`, borderTopColor: C.violet, borderRadius: "50%", animation: "sp 0.8s linear infinite" }} />
                              </div>
                            )}
                            <div style={{ fontSize: 9.5, color: C.slate, textAlign: "center", marginTop: 3 }}>Slide {cs.n || k + 1}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

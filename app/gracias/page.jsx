"use client";

import React, { useEffect, useState } from "react";

const C = {
  violet: "#5A3AFF", blue: "#2563EB", navy: "#0B1437", ink: "#0F172A",
  slate: "#64748B", border: "#E2E8F0", bg: "#F8FAFF", surfaceAlt: "#FBFCFE",
};
const PENDING_KEY = "caperif_pending_v1";

export default function Gracias() {
  const [stage, setStage] = useState("loading"); // loading | ready | error
  const [err, setErr] = useState("");
  const [campaign, setCampaign] = useState(null);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const sessionId = params.get("session_id");
        let form = null;
        try { form = JSON.parse(localStorage.getItem(PENDING_KEY) || "null"); } catch (e) {}
        if (!sessionId) { setErr("No encontramos la sesión de pago."); setStage("error"); return; }
        if (!form || !form.producto) { setErr("No encontramos los datos de tu producto. Vuelve a la página y genera tu análisis antes de pagar."); setStage("error"); return; }
        const res = await fetch("/api/full-campaign", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId, form }),
        });
        const json = await res.json().catch(() => ({}));
        if (!res.ok || json.error) throw new Error(json.error || `Error ${res.status}`);
        setCampaign(json.campaign);
        setStage("ready");
      } catch (e) {
        setErr(e?.message || "No se pudo generar la campaña.");
        setStage("error");
      }
    })();
  }, []);

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
            <p style={{ color: C.slate, fontSize: 14, lineHeight: 1.6 }}>Escríbenos a <a href="mailto:hello@caperif.ai" style={{ color: C.violet, fontWeight: 600 }}>hello@caperif.ai</a> con tu correo de compra y te enviamos tu campaña a la mano.</p>
          </div>
        )}

        {stage === "ready" && campaign && (
          <>
            <div style={{ background: `linear-gradient(135deg, ${C.violet}, ${C.blue})`, borderRadius: 20, padding: 32, color: "#fff", marginBottom: 22, textAlign: "center" }}>
              <h1 style={{ fontSize: 24, fontWeight: 700, margin: "0 0 8px" }}>Tu campaña completa está lista 🚀</h1>
              <p style={{ fontSize: 14, color: "rgba(255,255,255,.9)", margin: "0 0 20px", lineHeight: 1.6 }}>{campaign.titulo}</p>
              <button onClick={download} disabled={downloading} style={{ padding: "14px 30px", borderRadius: 12, border: "none", background: "#fff", color: C.violet, fontWeight: 700, fontSize: 15, cursor: downloading ? "wait" : "pointer", opacity: downloading ? 0.7 : 1 }}>
                {downloading ? "Generando…" : "⬇ Descargar presentación (.pptx)"}
              </button>
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
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={cr.imagen} alt="" style={{ width: 130, height: 130, objectFit: "cover", borderRadius: 8, border: `1px solid ${C.border}`, display: "block" }} />
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
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={cs.imagen} alt="" style={{ width: 96, height: 96, objectFit: "cover", borderRadius: 6, border: `1px solid ${C.border}`, display: "block" }} />
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

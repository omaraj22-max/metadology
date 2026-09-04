import { notFound } from "next/navigation";
import { kvGet, K } from "@/lib/store";
import Top from "../Top";
import RetryButton from "./RetryButton";

export const dynamic = "force-dynamic";

function fmt(ts) {
  return ts ? new Date(ts).toLocaleString("es-MX", { timeZone: "America/Mexico_City" }) : "";
}

export default async function ConversationPage({ params }) {
  const id = String(params.id || "").replace(/[^a-z0-9]/gi, "");
  const c = await kvGet(K.conv(id));
  if (!c) notFound();
  const r = c.resultId ? await kvGet(K.result(c.resultId)) : null;

  return (
    <>
      <Top />
      <main className="wrap">
        <div className="bo-head">
          <div>
            <a href="/back-office" className="bo-muted" style={{ fontSize: 13, textDecoration: "none" }}>← Conversaciones</a>
            <h1 style={{ marginTop: 6 }}>{c.name || "(sin nombre)"} · +{c.phone}</h1>
            <p>Inicio {fmt(c.createdAt)} · última actividad {fmt(c.updatedAt)} · <span className={`bo-tag ${c.status}`}>{c.status}</span>{c.stage ? ` · etapa ${c.stage}` : ""}</p>
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <a className="bo-btn" href={`/back-office/inbox?c=${c.id}`} style={{ textDecoration: "none" }}>Abrir en el inbox</a>
            {c.resultId && <a className="bo-btn primary" href={`/r/${c.resultId}`} target="_blank" rel="noreferrer" style={{ textDecoration: "none" }}>Ver página del resultado ↗</a>}
            {(c.status === "error" || c.status === "generating") && <RetryButton convId={c.id} label="Reintentar etapa" />}
            {(c.status === "done" || c.status === "error") && <RetryButton convId={c.id} fromStart label="Regenerar todo" />}
          </div>
        </div>

        {c.error && <div className="bo-card" style={{ borderColor: "#FCA5A5", background: "#FEF2F2", marginBottom: 20 }}><h2 style={{ color: "#B91C1C" }}>Error</h2><div style={{ fontSize: 13 }}>{c.error}</div></div>}

        <div className="bo-grid">
          <div className="bo-card">
            <h2>Conversación ({c.transcript?.length || 0} mensajes)</h2>
            <div className="bo-chat">
              {(c.transcript || []).map((m, i) => (
                <div key={i} className={`bo-msg ${m.role}`}>{m.text}<small>{m.role === "user" ? "Usuario" : m.role === "human" ? "Equipo" : "Aria"} · {fmt(m.at)}</small></div>
              ))}
            </div>
          </div>
          <div style={{ display: "grid", gap: 20, alignContent: "start" }}>
            <div className="bo-card">
              <h2>Respuestas del formulario</h2>
              <dl className="bo-kv">
                <dt>Producto</dt><dd>{c.fields?.producto || <span className="bo-muted">pendiente</span>}</dd>
                <dt>Link</dt><dd>{c.fields?.link ? <a href={c.fields.link} target="_blank" rel="noreferrer">{c.fields.link}</a> : c.fields?.link === "" ? "sin link" : <span className="bo-muted">pendiente</span>}</dd>
                <dt>País</dt><dd>{c.fields?.pais || <span className="bo-muted">pendiente</span>}</dd>
                <dt>Problema</dt><dd>{c.fields?.problema || <span className="bo-muted">pendiente</span>}</dd>
              </dl>
            </div>
            {r && (
              <div className="bo-card">
                <h2>Resultado Metadology</h2>
                <dl className="bo-kv" style={{ marginBottom: 12 }}>
                  <dt>Marca</dt><dd>{r.brand?.marca || "—"}</dd>
                  <dt>Industria</dt><dd>{r.brand?.industria || "—"}</dd>
                  <dt>Resumen</dt><dd>{r.brand?.resumen || "—"}</dd>
                  <dt>Landing</dt><dd>{r.landing?.url ? `${r.landing.title || ""} (${r.landing.url})` : "no leída"}</dd>
                  <dt>Hook</dt><dd>{r.campaign?.copy?.hook || "—"}</dd>
                  
                </dl>
                <div className="bo-imgs">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  {r.moodboardImg ? <img src={`/api/wa/image/${r.moodboardImg}`} alt="moodboard" /> : <div className="bo-muted" style={{ fontSize: 12 }}>Moodboard pendiente</div>}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  {r.adImg ? <img src={`/api/wa/image/${r.adImg}`} alt="anuncio" /> : <div className="bo-muted" style={{ fontSize: 12 }}>Anuncio pendiente</div>}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
}

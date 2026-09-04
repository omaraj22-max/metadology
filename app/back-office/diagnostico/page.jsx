import { headers } from "next/headers";
import Top from "../Top";
import Simulator from "./Simulator";
import Subscribe from "./Subscribe";
import { logRead, storePing, hasRedis, K, zRevRange } from "@/lib/store";
import { getSettings } from "@/lib/settings";
import { listSubscribedApps } from "@/lib/wa";

export const dynamic = "force-dynamic";

function fmt(ts) {
  return ts ? new Date(ts).toLocaleString("es-MX", { timeZone: "America/Mexico_City" }) : "—";
}

const KIND = { verify: "Verificación", post: "Mensaje entrante", process: "Procesamiento" };

export default async function Diagnostico() {
  let store = { ok: false, ms: 0, backend: hasRedis() ? "redis" : "archivo local", error: null };
  try {
    store = { ...(await storePing()), error: null };
  } catch (e) {
    store.error = String(e?.message || e);
  }

  const hooks = store.error ? [] : await logRead(K.hooks).catch(() => []);
  const convIds = store.error ? [] : await zRevRange(K.convs, 0, 999).catch(() => []);
  const cfg = await getSettings([
    "META_PHONE_NUMBER_ID", "META_ACCESS_TOKEN", "META_APP_SECRET", "META_WEBHOOK_VERIFY_TOKEN",
    "ANTHROPIC_API_KEY", "OPENAI_API_KEY", "SITE_URL", "APPS_SCRIPT_URL",
  ]);

  // Dominio real donde se está sirviendo esta página (no el configurado): es el que Meta debe llamar.
  const h = headers();
  const realHost = h.get("x-forwarded-host") || h.get("host") || "";
  const proto = realHost.startsWith("localhost") ? "http" : "https";
  const realOrigin = realHost ? `${proto}://${realHost}` : "";
  const configuredHost = (() => { try { return new URL(cfg.SITE_URL).host; } catch { return ""; } })();
  const hostMatches = !!realHost && !!configuredHost && realHost === configuredHost;

  // Prueba real: ¿la URL pública configurada llega a ESTE sistema? (De ella dependen las imágenes que
  // descarga WhatsApp y la llamada entre etapas del pipeline.) Puede ser otro alias del mismo proyecto.
  let site = { ok: false, detail: "" };
  if (!/^https?:\/\//.test(cfg.SITE_URL || "")) {
    site.detail = "sin configurar o sin https";
  } else if (!cfg.META_WEBHOOK_VERIFY_TOKEN) {
    site = { ok: hostMatches, detail: hostMatches ? cfg.SITE_URL : "no se puede comprobar sin verify token" };
  } else {
    const nonce = `diag-${Math.random().toString(36).slice(2, 10)}`;
    try {
      const ctrl = new AbortController();
      const t = setTimeout(() => ctrl.abort(), 8000);
      const r = await fetch(
        `${cfg.SITE_URL.replace(/\/$/, "")}/api/whatsapp/webhook?hub.mode=subscribe&hub.verify_token=${encodeURIComponent(cfg.META_WEBHOOK_VERIFY_TOKEN)}&hub.challenge=${nonce}`,
        { headers: { "x-wa-selfcheck": "1" }, cache: "no-store", signal: ctrl.signal }
      );
      clearTimeout(t);
      const body = (await r.text()).trim();
      site = r.ok && body === nonce
        ? { ok: true, detail: `${cfg.SITE_URL} responde a este mismo sistema ✓` }
        : { ok: false, detail: `${cfg.SITE_URL} respondió HTTP ${r.status} (${body.slice(0, 40) || "vacío"}): no es este sistema o no tiene el mismo verify token.` };
    } catch (e) {
      site = { ok: false, detail: `${cfg.SITE_URL} no respondió (${e?.name === "AbortError" ? "timeout" : e?.message || e}).` };
    }
  }

  // La WABA debe estar suscrita a esta app o Meta no entrega los mensajes, aunque el webhook esté verificado.
  let subs = null;
  try {
    subs = await listSubscribedApps();
  } catch (e) {
    subs = { error: String(e?.message || e) };
  }

  const lastVerify = hooks.find((h) => h.kind === "verify");
  const lastPost = hooks.find((h) => h.kind === "post");
  const lastMsg = hooks.find((h) => h.kind === "post" && h.messages > 0);
  const lastFail = hooks.find((h) => !h.ok);
  const webhookUrl = `${site.ok ? cfg.SITE_URL.replace(/\/$/, "") : realOrigin}/api/whatsapp/webhook`;

  const checks = [
    {
      label: "Almacenamiento (Redis)",
      ok: store.ok,
      detail: store.error
        ? `Error: ${store.error}`
        : `${store.backend} · lectura/escritura en ${store.ms} ms`,
      fix: "Vercel → tu proyecto → Storage → Upstash for Redis → Connect Project, y vuelve a desplegar.",
    },
    {
      label: "Meta verificó la URL del webhook",
      ok: !!lastVerify?.ok,
      detail: lastVerify ? `${fmt(lastVerify.at)} · ${lastVerify.detail}` : "Meta nunca ha llamado a la URL de verificación.",
      fix: "Meta → tu app → WhatsApp → Configuración → Webhook → Editar: pon la Callback URL y el verify token, y dale «Verify and save».",
    },
    {
      label: "Han llegado mensajes de WhatsApp",
      ok: !!lastMsg,
      detail: lastMsg
        ? `Último: ${fmt(lastMsg.at)} · ${lastMsg.detail}`
        : lastPost
          ? `Meta sí llega a este servidor (última llamada ${fmt(lastPost.at)}: ${lastPost.detail}), pero no ha entregado mensajes de usuarios.`
          : "Meta no ha entregado nada a este servidor.",
      fix: lastPost
        ? "Llegan avisos pero no mensajes: revisa que estés escribiendo al número correcto y que en Webhook → Manage el campo suscrito sea «messages»."
        : "Casi siempre son dos cosas: (1) la app sigue en modo Development — publícala (Development → Live); (2) la Callback URL no apunta a este dominio o falta suscribir «messages» en Webhook → Manage.",
    },
    {
      label: "La cuenta de WhatsApp está suscrita a esta app",
      ok: !!subs?.apps?.length,
      detail: subs?.error
        ? `No se pudo consultar: ${subs.error}`
        : subs?.apps?.length
          ? `WABA ${subs.wabaId} · apps suscritas: ${subs.apps.join(", ")}`
          : `WABA ${subs?.wabaId || "?"} · ninguna app suscrita. Este es el motivo más común de que el webhook esté verificado y aun así no llegue ningún mensaje.`,
      fix: "Usa el botón «Suscribir la cuenta a esta app» de aquí abajo.",
      action: !subs?.apps?.length,
    },
    {
      label: "Credenciales de WhatsApp",
      ok: !!(cfg.META_PHONE_NUMBER_ID && cfg.META_ACCESS_TOKEN),
      detail: `Phone number ID: ${cfg.META_PHONE_NUMBER_ID || "falta"} · Access token: ${cfg.META_ACCESS_TOKEN ? "guardado" : "falta"} · App secret: ${cfg.META_APP_SECRET ? "guardado (se valida la firma)" : "sin configurar (no se valida la firma)"}`,
      fix: "Configuración → WhatsApp.",
    },
    {
      label: "Verify token guardado",
      ok: !!cfg.META_WEBHOOK_VERIFY_TOKEN,
      detail: cfg.META_WEBHOOK_VERIFY_TOKEN ? "Configurado. Debe ser idéntico al que pusiste en Meta." : "Falta.",
      fix: "Configuración → WhatsApp → Verify token del webhook.",
    },
    {
      label: "Claves de IA",
      ok: !!(cfg.ANTHROPIC_API_KEY && cfg.OPENAI_API_KEY),
      detail: `Claude: ${cfg.ANTHROPIC_API_KEY ? "ok" : "falta"} · OpenAI: ${cfg.OPENAI_API_KEY ? "ok" : "falta"}`,
      fix: "Configuración → Inteligencia artificial (usa los botones «Probar»).",
    },
    {
      label: "URL pública del sitio",
      ok: site.ok,
      detail: site.detail + (site.ok && !hostMatches ? ` · (estás viendo el back office en ${realHost}, que es otro alias del mismo proyecto)` : ""),
      fix: `Configuración → General → URL pública del sitio: debe ser un dominio de ESTE proyecto (por ejemplo ${realOrigin}). Si no, WhatsApp no puede descargar las imágenes y el pipeline no se puede llamar a sí mismo.`,
    },
  ];

  return (
    <>
      <Top current="diag" />
      <main className="wrap">
        <div className="bo-head">
          <div>
            <h1>Diagnóstico</h1>
            <p>Estado de la conexión con Meta y del almacenamiento. Recarga esta página después de mandar un mensaje de prueba.</p>
          </div>
          <div className="bo-stats">
            <span className="bo-stat"><b>{convIds.length}</b><span>Conversaciones</span></span>
            <span className="bo-stat"><b>{hooks.filter((h) => h.kind === "post").length}</b><span>Llamadas recibidas</span></span>
          </div>
        </div>

        <div className="bo-card" style={{ marginBottom: 20 }}>
          <h2>Tu webhook</h2>
          <div className="bo-kv">
            <dt>Callback URL</dt><dd><code>{webhookUrl}</code></dd>
            <dt>Campo a suscribir</dt><dd><code>messages</code></dd>
          </div>
          <p className="bo-muted" style={{ fontSize: 12.5, marginTop: 10 }}>
            Pega exactamente eso en Meta → Use cases → Connect with customers through WhatsApp → Configure Webhooks.
            {site.ok && !hostMatches && (
              <span style={{ display: "block", marginTop: 6 }}>
                Sale de tu «URL pública del sitio». Estás viendo el back office en <code>{realHost}</code>, que también apunta a este proyecto; las dos direcciones funcionan.
              </span>
            )}
            {!site.ok && (
              <b style={{ color: "#B45309", display: "block", marginTop: 6 }}>
                ⚠️ La «URL pública del sitio» de tu configuración ({cfg.SITE_URL || "vacía"}) no responde a este sistema, así que
                aquí se muestra la dirección real de esta página. Corrígela en Configuración → General o las imágenes y los links que reciba el lead van a fallar.
              </b>
            )}
          </p>
        </div>

        <Simulator />

        {lastFail && (
          <div className="bo-card" style={{ marginBottom: 20, borderColor: "#FCA5A5", background: "#FEF2F2" }}>
            <h2 style={{ color: "#B91C1C" }}>Último fallo · {fmt(lastFail.at)}</h2>
            <div style={{ fontSize: 13.5 }}>{KIND[lastFail.kind] || lastFail.kind}: {lastFail.detail}</div>
          </div>
        )}

        <div className="bo-card" style={{ marginBottom: 20 }}>
          <h2>Revisiones</h2>
          {checks.map((c) => (
            <div key={c.label} className="bo-check">
              <span className={`bo-dot ${c.ok ? "ok" : "bad"}`}>{c.ok ? "✓" : "✕"}</span>
              <div>
                <b>{c.label}</b>
                <div className="bo-muted" style={{ fontSize: 13 }}>{c.detail}</div>
                {!c.ok && <div style={{ fontSize: 12.5, color: "#B45309", marginTop: 3 }}>→ {c.fix}</div>}
                {c.action && <div style={{ marginTop: 8 }}><Subscribe /></div>}
              </div>
            </div>
          ))}
        </div>

        <div className="bo-card" style={{ marginBottom: 40 }}>
          <h2>Bitácora del webhook (últimas {hooks.length})</h2>
          {hooks.length === 0 ? (
            <p className="bo-muted" style={{ fontSize: 13.5 }}>
              Vacía. Meta todavía no ha tocado este servidor: ni la verificación de la URL ni ningún mensaje.
              Revisa que la app esté publicada (Development → Live) y que la Callback URL apunte a este dominio.
            </p>
          ) : (
            <div className="bo-table-wrap">
              <table className="bo-table">
                <thead><tr><th>Cuándo</th><th>Tipo</th><th></th><th>Detalle</th></tr></thead>
                <tbody>
                  {hooks.map((h, i) => (
                    <tr key={i}>
                      <td style={{ whiteSpace: "nowrap" }}>{fmt(h.at)}</td>
                      <td>{KIND[h.kind] || h.kind}</td>
                      <td><span className={`bo-dot ${h.ok ? "ok" : "bad"}`}>{h.ok ? "✓" : "✕"}</span></td>
                      <td>{h.detail}{h.field && h.field !== "messages" ? ` (field: ${h.field})` : ""}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </>
  );
}

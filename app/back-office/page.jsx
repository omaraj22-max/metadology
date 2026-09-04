import { zRevRange, kvGet, K, hasRedis } from "@/lib/store";
import Top from "./Top";

export const dynamic = "force-dynamic";

function fmt(ts) {
  if (!ts) return "";
  return new Date(ts).toLocaleString("es-MX", { timeZone: "America/Mexico_City", day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
}

export default async function BackOffice({ searchParams }) {
  const ids = await zRevRange(K.convs, 0, 299);
  const convs = (await Promise.all(ids.map((id) => kvGet(K.conv(id))))).filter(Boolean);
  const filter = searchParams?.status || "";
  const list = filter ? convs.filter((c) => c.status === filter) : convs;
  const count = (s) => convs.filter((c) => c.status === s).length;

  return (
    <>
      <Top current="list" />
      <main className="wrap">
        <div className="bo-head">
          <div>
            <h1>Conversaciones de WhatsApp</h1>
            <p>{convs.length} en total · fuente: {hasRedis() ? "Redis" : "archivo local (dev)"} · espejo en Google Sheet (pestaña WhatsApp)</p>
          </div>
          <div className="bo-stats">
            {[["", "Todas", convs.length], ["collecting", "Capturando", count("collecting")], ["generating", "Generando", count("generating")], ["done", "Entregadas", count("done")], ["error", "Con error", count("error")]].map(([s, l, n]) => (
              <a key={s} href={s ? `/back-office?status=${s}` : "/back-office"} className="bo-stat" style={{ textDecoration: "none", color: "inherit", outline: filter === s ? "2px solid #5A3AFF" : "none" }}>
                <b>{n}</b><span>{l}</span>
              </a>
            ))}
          </div>
        </div>

        <div className="bo-table-wrap" style={{ marginBottom: 40 }}>
          <table className="bo-table">
            <thead>
              <tr><th>Última actividad</th><th>Contacto</th><th>Estado</th><th>Producto</th><th>País</th><th>Link</th><th>Msgs</th><th>Resultado</th></tr>
            </thead>
            <tbody>
              {list.length === 0 && (
                <tr><td colSpan={8} className="bo-muted" style={{ padding: 24, textAlign: "center" }}>Todavía no hay conversaciones{filter ? " con ese estado" : ""}.</td></tr>
              )}
              {list.map((c) => (
                <tr key={c.id}>
                  <td className="bo-muted" style={{ whiteSpace: "nowrap" }}>{fmt(c.updatedAt)}</td>
                  <td><a href={`/back-office/${c.id}`}>{c.name || "(sin nombre)"}</a><div className="bo-muted">+{c.phone}</div></td>
                  <td><span className={`bo-tag ${c.status}`}>{c.status}</span>{c.status === "generating" && c.stage ? <div className="bo-muted" style={{ fontSize: 11 }}>{c.stage}</div> : null}{c.status === "error" ? <div className="bo-muted" style={{ fontSize: 11, maxWidth: 200 }}>{c.error}</div> : null}</td>
                  <td><span className="bo-clip" title={c.fields?.producto || ""}>{c.fields?.producto || <span className="bo-muted">—</span>}</span></td>
                  <td>{c.fields?.pais || <span className="bo-muted">—</span>}</td>
                  <td>{c.fields?.link ? <a href={c.fields.link} target="_blank" rel="noreferrer" className="bo-clip" style={{ maxWidth: 180 }}>{c.fields.link.replace(/^https?:\/\//, "")}</a> : <span className="bo-muted">{c.fields?.link === "" ? "sin link" : "—"}</span>}</td>
                  <td>{c.transcript?.length || 0}</td>
                  <td>{c.resultId ? <a href={`/r/${c.resultId}`} target="_blank" rel="noreferrer">Ver página ↗</a> : <span className="bo-muted">—</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </>
  );
}

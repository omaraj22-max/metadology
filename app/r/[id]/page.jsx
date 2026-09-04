import { notFound } from "next/navigation";
import { kvGet, K } from "@/lib/store";
import { getSetting } from "@/lib/settings";
import "../result.css";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const r = await kvGet(K.result(clean(params.id)));
  const marca = r?.brand?.marca || "tu marca";
  return { title: `Metadology · ${marca} — moodboard y anuncio`, robots: { index: false, follow: false } };
}

function clean(id) {
  return String(id || "").replace(/[^a-z0-9]/gi, "");
}

function temp(t) {
  const s = String(t || "").toLowerCase();
  if (s.startsWith("fr")) return "frio";
  if (s.startsWith("tem") || s.startsWith("med")) return "templado";
  if (s.startsWith("cal")) return "caliente";
  return "";
}

function Swatches({ list }) {
  if (!list?.length) return null;
  return (
    <div className="mr-palette">
      {list.map((c, i) => (
        <div className="sw" key={i}>
          <span className="mr-swatch" style={{ background: c.hex }} />
          <b>{c.nombre}</b>
          <span>{c.hex}</span>
          <em>{c.psicologia}</em>
        </div>
      ))}
    </div>
  );
}

function Block({ title, children }) {
  return (
    <div className="mr-block">
      <h4>{title}</h4>
      {children}
    </div>
  );
}

function KV({ obj }) {
  if (!obj) return null;
  return Object.entries(obj).map(([k, v]) => (
    <p key={k}><b>{k.replace(/([A-Z])/g, " $1").toLowerCase()}:</b> {String(v ?? "")}</p>
  ));
}

export default async function ResultPage({ params }) {
  const r = await kvGet(K.result(clean(params.id)));
  if (!r) notFound();
  const CTA = await getSetting("CAPERIFAI_CTA_URL");
  const mb = r.moodboard || {};
  const cp = r.campaign || {};
  const marca = r.brand?.marca || "tu marca";
  const pending = !r.adImg;

  return (
    <div className="mr">
      <header className="mr-top">
        <div className="wrap">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="Caperifai" />
          <a className="cta" href={CTA} target="_blank" rel="noreferrer">Agenda con Caperifai</a>
        </div>
      </header>

      <main className="wrap">
        <section className="mr-hero">
          <div className="mr-kicker">Metadology · resultado</div>
          <h1>{marca}: tu moodboard y el anuncio que deberías estar corriendo</h1>
          <p>{r.brand?.resumen}{r.brand?.industria ? ` · ${r.brand.industria}` : ""}{r.fields?.pais ? ` · ${r.fields.pais}` : ""}</p>
          {pending && (
            <p style={{ marginTop: 12, color: "#B45309", fontWeight: 500 }}>
              ⏳ Todavía estamos generando parte de tu resultado. Esta página se actualiza sola: recárgala en unos minutos.
            </p>
          )}
        </section>

        <div className="mr-grid">
          <div className="mr-card">
            <h2>El anuncio (C1)</h2>
            {r.adImg ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img className="mr-img" src={`/api/wa/image/${r.adImg}`} alt={`Anuncio ${marca}`} />
            ) : (
              <p style={{ color: "#64748B" }}>Generando la imagen del anuncio…</p>
            )}
            {cp.explicacion && <p style={{ marginTop: 14, fontSize: 14, color: "#334155" }}>{cp.explicacion}</p>}
          </div>

          <div style={{ display: "grid", gap: 20, alignContent: "start" }}>
            {cp.copy && (
              <div className="mr-card">
                <h2>Tu copy — Hook → Valor → Oferta</h2>
                <div className="mr-copy">
                  <div className="row"><div className="lbl">Hook</div><div className="txt strong">{cp.copy.hook}</div></div>
                  <div className="row"><div className="lbl">Valor</div><div className="txt">{cp.copy.valor}</div></div>
                  <div className="row"><div className="lbl">Oferta</div><div className="txt">{cp.copy.oferta}</div></div>
                  <div className="row"><div className="lbl">CTA</div><div className="txt strong">{cp.copy.cta}</div></div>
                </div>
              </div>
            )}
            {cp.clasificacion && (
              <div className="mr-card">
                <h2>Así clasificamos a tu cliente</h2>
                <dl className="mr-kv">
                  <dt>Persona</dt><dd>{cp.clasificacion.persona}</dd>
                  <dt>Consciencia</dt><dd>{cp.clasificacion.consciencia}</dd>
                  <dt>Sofisticación</dt><dd>{cp.clasificacion.sofisticacion} / 5</dd>
                  <dt>Deseo</dt><dd>{cp.clasificacion.deseo} — {cp.clasificacion.deseoDetalle}</dd>
                  {cp.patron && (<><dt>Patrón</dt><dd>{cp.patron.id} {cp.patron.nombre} — {cp.patron.porQue}</dd></>)}
                  {cp.angulo && (<><dt>Ángulo ganador</dt><dd>{cp.angulo.lente}: {cp.angulo.bigIdea}</dd></>)}
                </dl>
              </div>
            )}
          </div>
        </div>

        <div className="mr-grid">
          <div className="mr-card">
            <h2>El moodboard — la piel de tus anuncios</h2>
            {r.moodboardImg ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img className="mr-img" src={`/api/wa/image/${r.moodboardImg}`} alt={`Moodboard ${marca}`} />
            ) : (
              <p style={{ color: "#64748B" }}>Generando el moodboard…</p>
            )}
            {mb.direccionCreativa && <p style={{ marginTop: 14, fontSize: 14, color: "#334155" }}>{mb.direccionCreativa}</p>}
          </div>
          <div style={{ display: "grid", gap: 20, alignContent: "start" }}>
            {mb.paleta && (
              <div className="mr-card">
                <h2>Paleta</h2>
                <Swatches list={[...(mb.paleta.principales || []), ...(mb.paleta.secundarios || []), ...(mb.paleta.apoyo || [])]} />
              </div>
            )}
            {mb.tipografia && (
              <div className="mr-card">
                <h2>Tipografía</h2>
                <dl className="mr-kv">
                  <dt>Display</dt><dd><b>{mb.tipografia.display?.fuente}</b> — {mb.tipografia.display?.porQue}</dd>
                  <dt>Body</dt><dd><b>{mb.tipografia.body?.fuente}</b> — {mb.tipografia.body?.porQue}</dd>
                </dl>
              </div>
            )}
            {mb.analisis && (
              <div className="mr-card">
                <h2>Análisis estratégico</h2>
                <dl className="mr-kv">
                  <dt>Qué vende</dt><dd>{mb.analisis.queVende}</dd>
                  <dt>Público</dt><dd>{mb.analisis.publico}</dd>
                  <dt>Arquetipo</dt><dd>{mb.analisis.arquetipo}</dd>
                  <dt>Personalidad</dt><dd>{mb.analisis.personalidad}</dd>
                  <dt>Posicionamiento</dt><dd>{mb.analisis.posicionamiento}</dd>
                  <dt>Valores</dt><dd>{(mb.analisis.valores || []).join(" · ")}</dd>
                  <dt>Emociones</dt><dd>{(mb.analisis.emociones || []).join(" · ")}</dd>
                </dl>
              </div>
            )}
          </div>
        </div>

        {cp.angulos?.length > 0 && (
          <section className="mr-section">
            <h2>Tus ángulos de venta — la campaña completa ({cp.angulos.length})</h2>
            <p className="sub">Cada ángulo es un mensaje genuinamente distinto: 1 ángulo = 1 Entity ID = 1 boleto a la subasta de Meta.</p>
            <div className="mr-table-wrap">
              <table className="mr-table">
                <thead><tr><th>#</th><th>Lente</th><th>Big idea</th><th>Dolor / deseo</th><th>Trigger</th><th>Etapa</th></tr></thead>
                <tbody>
                  {cp.angulos.map((a, i) => (
                    <tr key={i}>
                      <td>{i === (cp.anguloElegidoIndex ?? 0) ? <span className="mr-tag winner">C1</span> : i + 1}</td>
                      <td><b>{a.lente}</b></td>
                      <td>{a.bigIdea}</td>
                      <td>{a.dolor}</td>
                      <td>{a.triggerWord}</td>
                      <td><span className={`mr-tag ${temp(a.temperatura)}`}>{a.temperatura}</span>{a.consciencia ? <div style={{ fontSize: 11, color: "#64748B", marginTop: 3 }}>{a.consciencia}</div> : null}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {cp.conceptos?.length > 0 && (
          <section className="mr-section">
            <h2>Los conceptos de tu campaña (Entity IDs)</h2>
            <p className="sub">En este análisis generamos el C1. Los demás son la campaña completa.</p>
            <div className="mr-concepts">
              {cp.conceptos.map((c, i) => (
                <div className="mr-concept" key={i}>
                  <div className="id">{c.id} · {c.formato}</div>
                  <h3>{c.nombre}</h3>
                  <p>{c.descripcion}</p>
                  <div className="lock">{c.angulo} · {c.patron}{i > 0 ? " · 🔒 en la campaña completa" : ""}</div>
                </div>
              ))}
            </div>
          </section>
        )}

        {cp.estrategia && (
          <section className="mr-section">
            <h2>Estrategia de lanzamiento</h2>
            <div className="mr-system">
              <Block title="Lanzamiento"><p>{cp.estrategia.lanzamiento}</p></Block>
              <Block title="Distribución"><p>{cp.estrategia.distribucion}</p></Block>
              <Block title="Métricas 7 días"><p>{cp.estrategia.metricas}</p></Block>
            </div>
          </section>
        )}

        {(mb.fotografia || mb.direccionArte || mb.aplicaciones) && (
          <section className="mr-section">
            <h2>Sistema visual completo</h2>
            <p className="sub">Las reglas para que todo lo que publiques se reconozca como {marca}.</p>
            <div className="mr-system">
              {mb.fotografia && <Block title="Fotografía"><KV obj={mb.fotografia} /></Block>}
              {mb.direccionArte && <Block title="Dirección de arte"><KV obj={mb.direccionArte} /></Block>}
              {mb.aplicaciones?.redesSociales && <Block title="Redes sociales"><p>{mb.aplicaciones.redesSociales}</p></Block>}
              {mb.aplicaciones?.publicidad && <Block title="Publicidad"><p>{mb.aplicaciones.publicidad}</p></Block>}
              {mb.aplicaciones?.landingPages && <Block title="Landing pages"><p>{mb.aplicaciones.landingPages}</p></Block>}
              {mb.aplicaciones?.presentaciones && <Block title="Presentaciones"><p>{mb.aplicaciones.presentaciones}</p></Block>}
              {mb.packaging && <Block title="Packaging"><p>{mb.packaging}</p></Block>}
              {mb.merch && <Block title="Merch"><p>{mb.merch}</p></Block>}
              {mb.brandLocks?.length > 0 && <Block title="Nunca (brand-locks)"><p>{mb.brandLocks.join(" · ")}</p></Block>}
              {mb.analisis?.marcasSimilares?.length > 0 && <Block title="Referencias"><p>{mb.analisis.marcasSimilares.join(" · ")}</p></Block>}
            </div>
          </section>
        )}

        <section className="mr-final">
          <h2>Esto fue 1 anuncio. Una campaña ganadora necesita 8–12.</h2>
          <p>Caperifai produce la campaña completa de {marca} —todos los conceptos, estáticos y video— y la optimiza con IA.</p>
          <a href={CTA} target="_blank" rel="noreferrer">Agenda una llamada con Caperifai</a>
        </section>
      </main>
    </div>
  );
}

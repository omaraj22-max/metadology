export default function Top({ current }) {
  const items = [["list", "/back-office", "Conversaciones"], ["inbox", "/back-office/inbox", "Inbox"], ["settings", "/back-office/settings", "Configuración"]];
  return (
    <header className="bo-top">
      <div className="wrap">
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="Caperifai" />
          <span style={{ fontSize: 12, color: "#64748B", fontWeight: 600, letterSpacing: ".08em", textTransform: "uppercase" }}>Back office</span>
        </div>
        <nav>
          {items.map(([id, href, label]) => <a key={id} href={href} className={current === id ? "on" : ""}>{label}</a>)}
          <a href="/" target="_blank" rel="noreferrer">Sitio</a>
        </nav>
      </div>
    </header>
  );
}

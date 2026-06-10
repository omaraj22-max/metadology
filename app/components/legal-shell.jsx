import "./legal.css";

export default function LegalShell({ children }) {
  return (
    <div className="legal">
      <header className="legal-nav">
        <div className="legal-wrap">
          <a href="/landing-2" aria-label="Caperifai inicio">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="Caperifai" style={{ height: 26, width: "auto", display: "block" }} />
          </a>
          <a href="/landing-2" className="legal-back">← Volver al sitio</a>
        </div>
      </header>

      <main className="legal-wrap legal-body">{children}</main>

      <footer className="legal-foot">
        <div className="legal-wrap">
          <p>© 2026 Caperifai. El copiloto de IA para tus campañas en Meta.</p>
          <nav aria-label="Links legales">
            <a href="/privacidad">Aviso de Privacidad</a>
            <a href="/terminos">Términos y Condiciones</a>
            <a href="mailto:hello@caperif.ai">Contacto</a>
          </nav>
        </div>
      </footer>
    </div>
  );
}

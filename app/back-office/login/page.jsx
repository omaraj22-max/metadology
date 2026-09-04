export const dynamic = "force-dynamic";

export default function Login({ searchParams }) {
  return (
    <div className="wrap">
      <form className="bo-login" method="POST" action="/api/back-office/login">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.png" alt="Caperifai" style={{ height: 24, width: "auto", marginBottom: 18 }} />
        <h1>Back office</h1>
        <p>Conversaciones de WhatsApp y resultados Metadology.</p>
        {searchParams?.error && <div className="err">Contraseña incorrecta.</div>}
        <input type="password" name="password" placeholder="Contraseña" autoFocus required />
        <button className="bo-btn primary" type="submit" style={{ width: "100%" }}>Entrar</button>
      </form>
    </div>
  );
}

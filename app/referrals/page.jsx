import ReferralsView from "../components/referrals-view";

// Landing de referidos para startups. Los valores que en Claude Design eran props
// editables se llenan desde el query string, para que cada partner reciba su link:
//
//   /referrals?ref=Nombre%20del%20Partner&precio=$X%20MXN&lista=$Y%20MXN&condicion=Solo%205%20cupos
//   /referrals?referido=0     -> modo genérico "Caperifai for Startups" (sin partner)
//
// Sin parámetros la página muestra los placeholders del diseño ([PARTNER], [PRECIO PILOTO]…).

export const metadata = {
  title: "Caperifai for Startups · El equipo de growth que todavía no puedes contratar",
  description:
    "Conecta tus canales, tu CRM y tu web en un solo cerebro. Aria analiza y ejecuta los cambios en tus campañas todos los días. 30 días gratis, sin tarjeta.",
  // Es una landing de campaña por referido: no debe competir en orgánico con el home.
  robots: { index: false, follow: false },
};

const first = (v) => (Array.isArray(v) ? v[0] : v);

export default function ReferralsPage({ searchParams = {} }) {
  const partner = (first(searchParams.ref) || first(searchParams.partner) || "").trim();
  const referidoParam = first(searchParams.referido);
  const referredMode = referidoParam === "0" || referidoParam === "false" ? false : true;

  return (
    <ReferralsView
      partner={partner || "[PARTNER]"}
      referredMode={referredMode}
      pricePiloto={first(searchParams.precio) || "[PRECIO PILOTO]"}
      priceLista={first(searchParams.lista) || "[PRECIO LISTA]"}
      offerCondition={
        first(searchParams.condicion) || "[CONDICIÓN: cupos / vigencia / etapa máxima]"
      }
      demoUrl={process.env.NEXT_PUBLIC_DEMO_URL || ""}
    />
  );
}

import ReferralsView from "../components/referrals-view";
import { findPartner } from "@/lib/partners";

// Landing de referidos para startups.
//
// El link de cada partner lleva su código en ?ref= (también acepta el slug o el
// nombre). Ese código resuelve el nombre que se muestra en el hero y en la oferta,
// y queda precargado en el campo "Código de referido" del formulario:
//
//   /referrals?ref=CAPDITX0926     -> Distrito Tlalpan
//   /referrals?ref=CAPAGVX0926     -> Angel Ventures
//
// Un ?ref= que no es de ningún partner conocido no inventa un nombre: cae a la
// variante genérica "Caperifai for Startups", pero conserva el código en el form
// para no perder el rastro. Para un partner de una sola vez se puede forzar el
// nombre con ?partner=Nombre. Con ?referido=0 se fuerza la variante genérica.
//
// Precio y condición son editables por link: ?precio=… &lista=… &condicion=…

export const metadata = {
  title: "Caperifai for Startups · El sistema operativo que tu equipo de Growth necesita",
  description:
    "A través de nuestro Marketing Neural Center, Caperifai conecta tus canales, tu CRM y tu web en un solo cerebro y ejecuta los cambios en tus campañas todos los días. 30 días gratis, sin tarjeta.",
  // Es una landing de campaña por referido: no debe competir en orgánico con el home.
  robots: { index: false, follow: false },
};

const first = (v) => (Array.isArray(v) ? v[0] : v);

export default function ReferralsPage({ searchParams = {} }) {
  const ref = (first(searchParams.ref) || "").trim();
  const known = findPartner(ref);
  const partnerName = (first(searchParams.partner) || "").trim() || known?.name || "";
  const partnerCode = known?.code || ref;

  const referidoParam = first(searchParams.referido);
  const forcedOff = referidoParam === "0" || referidoParam === "false";
  const referredMode = !forcedOff && Boolean(partnerName);

  return (
    <ReferralsView
      partner={partnerName || "[PARTNER]"}
      partnerCode={partnerCode}
      referredMode={referredMode}
      pricePiloto={first(searchParams.precio) || "Precio preferencial"}
      priceLista={first(searchParams.lista) || ""}
      offerCondition={first(searchParams.condicion) || "3 meses de precio especial"}
      demoUrl={process.env.NEXT_PUBLIC_DEMO_URL || ""}
    />
  );
}

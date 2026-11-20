import TemporadaView from "../components/temporada-view";
import "./temporada.css";

// Landing de campaña de temporada (fin de año) para negocios de servicios.
// URL pública: /campañas-navidenas (rewrite en next.config.mjs → esta carpeta ASCII,
// porque las carpetas con "ñ" en el App Router de Next 14 no son confiables).
// Tráfico: Google Search y Meta. Conversión: el formulario → /api/temporada → Google Sheet.

export const metadata = {
  title: "Caperifai · Más clientes esta temporada",
  description:
    "Hacemos y operamos tus campañas en Meta y Google para que te lleguen más cotizaciones en posadas, eventos y reuniones de fin de año. Paga por lead calificado o por campaña completa.",
  // Landing de pauta: no compite en orgánico con el home.
  robots: { index: false, follow: false },
};

export default function CampanasNavidenasPage() {
  return <TemporadaView />;
}

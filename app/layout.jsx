import "./globals.css";

export const metadata = {
  title: "Caperifai · Tu copiloto de IA para Meta Ads",
  description:
    "Descubre gratis los ángulos de venta que tus anuncios deberían estar usando. Aria te los da en menos de 2 minutos.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Sora:wght@500;600;700;800&family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}

import "./globals.css";

export const metadata = {
  title: "Caperif.ai · Tu buyer persona + ángulos de venta",
  description:
    "Cuéntanos sobre tu producto y nuestra IA te entrega el perfil de tu cliente ideal y los ángulos listos para tus campañas en Meta.",
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
          href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=Space+Mono&display=swap"
          rel="stylesheet"
        />
      </head>
      <body style={{ margin: 0 }}>{children}</body>
    </html>
  );
}

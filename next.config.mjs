/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    // La landing de temporada vive en app/campanas-navidenas (carpeta ASCII) pero se
    // publica como /campañas-navidenas. El navegador manda la ñ codificada (%C3%B1).
    return [
      { source: "/campa%C3%B1as-navidenas", destination: "/campanas-navidenas" },
      { source: "/campañas-navidenas", destination: "/campanas-navidenas" },
    ];
  },
};

export default nextConfig;

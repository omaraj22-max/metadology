// Partners del programa de referidos. El código es el identificador público:
// el link de cada partner es /referrals?ref=<código> y ese mismo código queda
// precargado en el campo "Código de referido" del formulario.
export const PARTNERS = [
  { code: "CAPDITX0926", slug: "distrito-tlalpan", name: "Distrito Tlalpan" },
  { code: "CAPAGVX0926", slug: "angel-ventures", name: "Angel Ventures" },
];

const norm = (v) =>
  String(v || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");

/** Resuelve ?ref= por código, slug o nombre. Devuelve null si no es un partner conocido. */
export function findPartner(ref) {
  const q = norm(ref);
  if (!q) return null;
  return (
    PARTNERS.find((p) => norm(p.code) === q || norm(p.slug) === q || norm(p.name) === q) || null
  );
}

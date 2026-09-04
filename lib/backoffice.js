// Sesión del back office: cookie firmada derivada de BACKOFFICE_PASSWORD (Web Crypto: sirve en middleware Edge).
export const BO_COOKIE = "bo_session";

async function sha256(s) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

export async function sessionToken() {
  const pw = (process.env.BACKOFFICE_PASSWORD || "").trim();
  if (!pw) return null;
  return sha256(`caperifai-back-office:${pw}`);
}

export async function isValidSession(value) {
  const tok = await sessionToken();
  return !!(tok && value && value === tok);
}

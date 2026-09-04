import { BO_COOKIE, sessionToken } from "@/lib/backoffice";

export const runtime = "nodejs";

export async function POST(req) {
  const form = await req.formData().catch(() => null);
  const password = String(form?.get("password") || "");
  const expected = (process.env.BACKOFFICE_PASSWORD || "").trim();
  if (!expected) {
    return new Response("Falta BACKOFFICE_PASSWORD en el servidor.", { status: 500 });
  }
  if (password !== expected) {
    return Response.redirect(new URL("/back-office/login?error=1", req.url), 303);
  }
  const token = await sessionToken();
  // Response.redirect() devuelve headers inmutables: construimos la respuesta a mano para poder poner la cookie.
  return new Response(null, {
    status: 303,
    headers: {
      Location: new URL("/back-office", req.url).toString(),
      "Set-Cookie": `${BO_COOKIE}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${60 * 60 * 24 * 30}${process.env.NODE_ENV === "production" ? "; Secure" : ""}`,
    },
  });
}

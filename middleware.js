import { NextResponse } from "next/server";
import { BO_COOKIE, isValidSession } from "@/lib/backoffice";

// Protege el back office con la cookie de sesión (ver /api/back-office/login).
export async function middleware(req) {
  const { pathname } = req.nextUrl;
  if (pathname === "/back-office/login" || pathname === "/api/back-office/login") return NextResponse.next();
  const ok = await isValidSession(req.cookies.get(BO_COOKIE)?.value);
  if (ok) return NextResponse.next();
  if (pathname.startsWith("/api/")) return new NextResponse("Unauthorized", { status: 401 });
  const url = req.nextUrl.clone();
  url.pathname = "/back-office/login";
  url.search = "";
  return NextResponse.redirect(url);
}

export const config = { matcher: ["/back-office/:path*", "/api/back-office/:path*"] };

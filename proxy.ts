import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, verifySession } from "@/lib/session";

const PROTECTED_PREFIX = "/dashboard";

/**
 * En Next.js 16 esto se llama `proxy` (antes `middleware`).
 * Corre en runtime Node antes de renderizar y solo hace una comprobación
 * optimista: verificar la firma de la cookie. Nunca consulta la base de datos.
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const session = await verifySession(token);

  const isProtected =
    pathname === PROTECTED_PREFIX ||
    pathname.startsWith(`${PROTECTED_PREFIX}/`);

  if (isProtected && !session) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (pathname === "/login" && session) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/login"],
};

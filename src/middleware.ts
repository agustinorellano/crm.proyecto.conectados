import { NextResponse, type NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  try {
    const token = await getToken({
      req,
      secret: process.env.NEXTAUTH_SECRET,
      secureCookie: req.nextUrl.protocol === "https:",
    });

    if (!token) {
      const loginUrl = req.nextUrl.clone();
      loginUrl.pathname = "/login";
      loginUrl.search = "";
      return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
  } catch (err) {
    // Nunca dejar caer el middleware entero: si algo falla al validar la
    // sesión (token corrupto, secret faltante, etc.), tratamos como no
    // autenticado en vez de devolver un 500.
    console.error("[middleware] auth check failed", err);
    const loginUrl = req.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.search = "";
    return NextResponse.redirect(loginUrl);
  }
}

export const config = {
  // Protege todo excepto /login, assets estáticos y las rutas de auth.
  matcher: ["/((?!login|api/auth|_next/static|_next/image|favicon.ico).*)"],
};

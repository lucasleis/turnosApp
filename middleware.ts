import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_PATHS = ["/login", "/registro"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });
  const isAuthenticated = !!token;

  // Redirigir usuarios autenticados fuera de las páginas de auth
  const isAuthPage = PUBLIC_PATHS.some((path) => pathname.startsWith(path));
  if (isAuthPage && isAuthenticated) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Proteger rutas que requieren sesión
  const isProtectedRoute =
    pathname.startsWith("/admin") ||
    pathname.startsWith("/barber") ||
    pathname.startsWith("/agenda");

  if (isProtectedRoute && !isAuthenticated) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/login",
    "/registro",
    "/admin/:path*",
    "/barber/:path*",
    "/agenda/:path*",
  ],
};

import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Rutas que no requieren autenticación
const publicRoutes = ["/login", "/reset-password", "/api/auth/login", "/api/auth/session"]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Verificar si la ruta actual es pública
  const isPublicRoute = publicRoutes.some((route) => pathname === route || pathname.startsWith(`${route}/`))

  // Si es una ruta de API (excepto las de autenticación), permitir el acceso
  const isApiRoute = pathname.startsWith("/api/") && !pathname.startsWith("/api/auth/")

  // Si es una ruta pública o de API, permitir el acceso
  if (isPublicRoute || isApiRoute) {
    return NextResponse.next()
  }

  // Verificar si existe la cookie de sesión
  const hasSession = request.cookies.has("custom_auth_session")

  // Si no hay sesión, redirigir a login
  if (!hasSession) {
    console.log(`Middleware: Redirigiendo a login desde ${pathname} - No hay sesión`)
    return NextResponse.redirect(new URL("/login", request.url))
  }

  // Si hay sesión, permitir el acceso
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images/ (public images folder)
     * - public/ (public assets folder)
     */
    "/((?!_next/static|_next/image|favicon.ico|images|public).*)",
  ],
}


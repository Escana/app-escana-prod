import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"

// Rutas que no requieren autenticación
const publicRoutes = ["/login", "/reset-password"]

// Rutas que requieren roles específicos
const roleRestrictedRoutes = {
  "/employees": ["superadmin", "admin"],
  "/establishments": ["superadmin"],
  "/admin-dashboard": ["superadmin", "admin"],
}

export async function middleware(request: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req: request, res })
  const path = request.nextUrl.pathname

  // Si la ruta es pública, permitir acceso
  if (publicRoutes.some((route) => path.startsWith(route))) {
    return res
  }

  // Verificar si hay una sesión personalizada
  const customAuthCookie = request.cookies.get("custom_auth_session")
  let isAuthenticated = false
  let userRole = null

  if (customAuthCookie) {
    try {
      const sessionData = JSON.parse(Buffer.from(customAuthCookie.value, "base64").toString())

      // Verificar si la sesión no ha expirado
      if (sessionData.expires_at > Date.now()) {
        isAuthenticated = true
        userRole = sessionData.role
      }
    } catch (error) {
      console.error(`[Middleware] Error al decodificar la sesión personalizada:`, error)
    }
  }

  // Si no hay sesión personalizada válida, verificar con localStorage (client-side)
  if (!isAuthenticated) {
    // Verificar con Supabase Auth como fallback
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (session) {
      isAuthenticated = true

      // Obtener el rol del usuario desde Supabase
      const { data: userData } = await supabase.from("employees").select("role").eq("id", session.user.id).single()

      if (userData) {
        userRole = userData.role
      }
    }
  }

  // Si no está autenticado, redirigir a login
  if (!isAuthenticated) {
    const redirectUrl = new URL("/login", request.url)
    redirectUrl.searchParams.set("redirectedFrom", path)
    return NextResponse.redirect(redirectUrl)
  }

  // Verificar restricciones de rol para rutas específicas
  for (const [restrictedRoute, allowedRoles] of Object.entries(roleRestrictedRoutes)) {
    if (path.startsWith(restrictedRoute) && userRole && !allowedRoles.includes(userRole)) {
      // Si el usuario no tiene el rol requerido, redirigir a la página principal
      return NextResponse.redirect(new URL("/", request.url))
    }
  }

  return res
}

// Configurar el middleware para que se ejecute en todas las rutas excepto las estáticas
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
}


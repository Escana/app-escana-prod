import { cookies } from "next/headers"
import { createServerClient } from "@supabase/ssr"
import { cache } from "react"
import { ROLES, PERMISSIONS, type User, type UserRole } from "./auth-client"

export { ROLES, PERMISSIONS, type User, type UserRole }

// Función para obtener el usuario actual (cacheada) - solo para Server Components
export const getCurrentUser = cache(async (): Promise<User | null> => {
  try {
    const cookieStore = cookies()

    // Verificar si hay una sesión personalizada
    const customAuthCookie = cookieStore.get("custom_auth_session")

    if (customAuthCookie) {
      try {
        const sessionData = JSON.parse(Buffer.from(customAuthCookie.value, "base64").toString())

        // Verificar si la sesión no ha expirado
        if (sessionData.expires_at > Date.now()) {
          console.log(`[Auth-Server] Usando sesión personalizada para: ${sessionData.email}`)

          // Crear un objeto User a partir de los datos de la sesión
          return {
            id: sessionData.userId,
            email: sessionData.email,
            role: sessionData.role,
            establishment_id: sessionData.establishment_id || null,
            name: sessionData.name || null,
            created_at: sessionData.created_at || new Date().toISOString(),
          } as User
        } else {
          console.log(`[Auth-Server] Sesión personalizada expirada`)
        }
      } catch (error) {
        console.error(`[Auth-Server] Error al decodificar la sesión personalizada:`, error)
      }
    }

    // Si no hay sesión personalizada válida, verificar con Supabase Auth
    try {
      // Verificar si estamos en modo de bypass de autenticación
      if (process.env.BYPASS_AUTH === "true") {
        console.log("[Auth-Server] Usando modo de bypass de autenticación")
        return {
          id: "bypass-user-id",
          email: "bypass@example.com",
          role: ROLES.SUPERADMIN,
          establishment_id: null,
          name: "Bypass User",
          created_at: new Date().toISOString(),
        } as User
      }

      // Crear cliente de Supabase
      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: {
            get(name: string) {
              return cookieStore.get(name)?.value
            },
          },
        },
      )

      // Obtener sesión
      const { data, error } = await supabase.auth.getSession()

      if (error) {
        console.error("[Auth-Server] Error al obtener la sesión:", error.message)
        return null
      }

      const session = data?.session
      if (!session) {
        console.log("[Auth-Server] No hay sesión activa")
        return null
      }

      // Obtener datos del usuario
      const { data: userData, error: userError } = await supabase
        .from("employees")
        .select("id, email, role, establishment_id, name, created_at")
        .eq("id", session.user.id)
        .single()

      if (userError) {
        console.error("[Auth-Server] Error al obtener datos del usuario:", userError.message)
        return null
      }

      if (!userData) {
        console.log("[Auth-Server] No se encontraron datos del usuario")
        return null
      }

      console.log(`[Auth-Server] Usuario autenticado: ${userData.email} (${userData.role})`)
      return userData as User
    } catch (error) {
      console.error("[Auth-Server] Error inesperado:", error)
      return null
    }
  } catch (error) {
    console.error("[Auth-Server] Error general en getCurrentUser:", error)
    return null
  }
})


// Versión compatible con ambos entornos (pages/ y app/)
import { ROLES, PERMISSIONS, type User, type UserRole } from "./auth-client"
import { createClient } from "@supabase/supabase-js"

export { ROLES, PERMISSIONS, type User, type UserRole }

// Cliente de Supabase para uso general
const createSupabaseClient = () => {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
}

// Función para obtener el usuario actual
export async function getCurrentUser(): Promise<User | null> {
  try {
    console.log("[Server-Auth] Intentando obtener usuario actual")

    // Primero intentamos obtener la sesión de Supabase Auth
    const supabase = createSupabaseClient()

    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession()

    if (sessionError) {
      console.error("[Server-Auth] Error al obtener la sesión:", sessionError)
    }

    if (session) {
      console.log("[Server-Auth] Sesión encontrada, obteniendo datos del usuario")
      const { data: userData, error: userError } = await supabase
        .from("employees")
        .select("id, email, role, establishment_id, name, created_at")
        .eq("id", session.user.id)
        .single()

      if (userError || !userData) {
        console.error("[Server-Auth] Error al obtener datos del usuario:", userError)
      } else {
        console.log("[Server-Auth] Datos del usuario obtenidos correctamente")
        return userData as User
      }
    } else {
      console.log("[Server-Auth] No se encontró sesión en Supabase Auth")
    }

    // Si no hay sesión o hubo un error, intentamos obtener el usuario desde la cookie personalizada
    try {
      // Verificar si hay una cookie personalizada con los datos del usuario
      // Nota: Esto solo funcionará en el servidor, no en el cliente
      if (typeof document === "undefined") {
        // Estamos en el servidor
        const { cookies } = await import("next/headers")
        const cookieStore = cookies()
        const customAuthCookie = cookieStore.get("custom_auth_session")

        if (customAuthCookie) {
          try {
            const sessionData = JSON.parse(Buffer.from(customAuthCookie.value, "base64").toString())

            // Verificar si la sesión no ha expirado
            if (sessionData.expires_at > Date.now()) {
              console.log(`[Server-Auth] Usando sesión personalizada para: ${sessionData.email}`)

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
              console.log(`[Server-Auth] Sesión personalizada expirada`)
            }
          } catch (error) {
            console.error(`[Server-Auth] Error al decodificar la sesión personalizada:`, error)
          }
        } else {
          console.log("[Server-Auth] No se encontró cookie de sesión personalizada")
        }
      }
    } catch (error) {
      console.error("[Server-Auth] Error al intentar obtener la cookie:", error)
    }

    // Si llegamos aquí, no pudimos obtener el usuario
    console.log("[Server-Auth] No se pudo obtener el usuario actual")
    return null
  } catch (error) {
    console.error("[Server-Auth] Error en getCurrentUser:", error)
    return null
  }
}

// Función para verificar si el usuario tiene un rol específico
export async function hasRole(user: User | null, requiredRole: UserRole | UserRole[]): Promise<boolean> {
  if (!user) return false

  if (Array.isArray(requiredRole)) {
    return requiredRole.includes(user.role)
  }

  return user.role === requiredRole
}

// Function to check if a user has a specific permission
export function hasPermission(user: User | null, permission: string): boolean {
  console.log(`[Auth] Verificando permiso ${permission} para usuario ${user?.email} con rol ${user?.role}`)

  if (!user) {
    console.log("[Auth] No hay usuario, permiso denegado")
    return false
  }

  // Superadmin tiene todos los permisos
  if (user.role === ROLES.SUPERADMIN) {
    console.log("[Auth] Usuario es superadmin, permiso concedido")
    return true
  }

  // Permisos específicos por rol
  switch (permission) {
    case PERMISSIONS.MANAGE_ESTABLISHMENTS:
      // Solo superadmin puede gestionar establecimientos
      console.log("[Auth] Permiso para gestionar establecimientos: denegado (solo superadmin)")
      return false

    case PERMISSIONS.CREATE_ADMIN:
      // Solo superadmin puede crear administradores
      console.log("[Auth] Permiso para crear administradores: denegado (solo superadmin)")
      return false

    case PERMISSIONS.CREATE_GUARDIA:
      // Superadmin y admin pueden crear guardias
      const hasPermission = user.role === ROLES.ADMIN
      console.log(`[Auth] Permiso para crear guardias: ${hasPermission ? "concedido" : "denegado"}`)
      return hasPermission

    default:
      console.log(`[Auth] Permiso desconocido: ${permission}, denegado por defecto`)
      return false
  }
}

// Función para obtener el establecimiento del usuario actual
export async function getUserEstablishment() {
  const user = await getCurrentUser()

  if (!user || !user.establishment_id) return null

  const supabase = createSupabaseClient()

  const { data, error } = await supabase.from("establishments").select("*").eq("id", user.establishment_id).single()

  if (error) {
    console.error("Error al obtener el establecimiento:", error)
    return null
  }

  return data
}

// Función para obtener un usuario por ID (útil para server actions)
export async function getUserById(userId: string): Promise<User | null> {
  try {
    console.log(`[Server-Auth] Obteniendo usuario por ID: ${userId}`)

    if (!userId) {
      console.error("[Server-Auth] ID de usuario no proporcionado")
      return null
    }

    const supabase = createSupabaseClient()

    const { data: userData, error: userError } = await supabase
      .from("employees")
      .select("id, email, role, establishment_id, name, created_at")
      .eq("id", userId)
      .single()

    if (userError || !userData) {
      console.error("[Server-Auth] Error al obtener datos del usuario por ID:", userError)
      return null
    }

    console.log(`[Server-Auth] Usuario obtenido correctamente: ${userData.email}`)
    return userData as User
  } catch (error) {
    console.error("[Server-Auth] Error en getUserById:", error)
    return null
  }
}


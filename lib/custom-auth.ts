import { createClient } from "@supabase/supabase-js"
import { ROLES, PERMISSIONS, type User, type UserRole } from "./auth-client"

export { ROLES, PERMISSIONS, type User, type UserRole }

// Cliente de Supabase para uso general
const createSupabaseClient = () => {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
}

// Función para verificar si el usuario tiene un rol específico
export function hasRole(user: User | null, requiredRole: UserRole | UserRole[]): boolean {
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

// Función para verificar un usuario directamente con la base de datos
export async function verifyUserInDatabase(userId: string): Promise<User | null> {
  try {
    console.log(`[CustomAuth] Verificando usuario en la base de datos: ${userId}`)

    if (!userId) {
      console.log("[CustomAuth] ID de usuario no proporcionado")
      return null
    }

    const supabase = createSupabaseClient()

    const { data, error } = await supabase
      .from("employees")
      .select("id, email, role, establishment_id, name, created_at, status")
      .eq("id", userId)
      .single()

    if (error) {
      console.error("[CustomAuth] Error al verificar usuario:", error)
      return null
    }

    if (!data) {
      console.log("[CustomAuth] Usuario no encontrado en la base de datos")
      return null
    }

    console.log(`[CustomAuth] Usuario verificado: ${data.email}`)
    return data as User
  } catch (error) {
    console.error("[CustomAuth] Error al verificar usuario:", error)
    return null
  }
}


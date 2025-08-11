"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

export const ROLES = {
  SUPERADMIN: "superadmin",
  ADMIN: "admin",
  GUARDIA: "guardia",
}

export const PERMISSIONS = {
  MANAGE_ESTABLISHMENTS: "manage_establishments",
  CREATE_ADMIN: "create_admin",
  CREATE_GUARDIA: "create_guardia",
}

export type UserRole = "superadmin" | "admin" | "guardia"

export type User = {
  id: string
  email: string
  role: UserRole
  name?: string | null
  establishment_id?: string | null
  created_at: string
}

// Función para obtener el usuario actual (para compatibilidad con código existente)
export async function getCurrentUser(): Promise<User | null> {

  console.log('estamos cargando')
  try {
    console.log("auth-client - Obteniendo usuario desde localStorage...")

    // Intentar obtener el usuario desde localStorage primero
    const storedUser = localStorage.getItem("user_session")
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser)
      console.log("auth-client - Usuario encontrado en localStorage:", parsedUser)

      // Normalizar el objeto de usuario para asegurar que tenga la propiedad 'id'
      if (parsedUser.userId && !parsedUser.id) {
        parsedUser.id = parsedUser.userId
      }

      // Verificar que el usuario tiene los campos mínimos necesarios
      if (!parsedUser.id || !parsedUser.role) {
        console.warn("auth-client - Usuario en localStorage incompleto, consultando API...")
        localStorage.removeItem("user_session")
        return await fetchUserFromAPI()
      }

      return parsedUser as User
    }

    return await fetchUserFromAPI()
  } catch (error) {
    console.error("auth-client - Error al obtener el usuario:", error)
    return null
  }
}

// Función auxiliar para obtener el usuario desde la API
async function fetchUserFromAPI(): Promise<User | null> {
  console.log("auth-client - Consultando API para obtener sesión...")

  try {
    const response = await fetch("/api/auth/session")
    if (!response.ok) {
      console.error("auth-client - Error al obtener la sesión:", response.statusText)
      return null
    }

    const data = await response.json()
    if (data.user) {
      console.log("auth-client - Usuario obtenido de la API:", data.user)

      // Guardar el usuario en localStorage para futuras consultas
      localStorage.setItem("user_session", JSON.stringify(data.user))

      return data.user
    }

    console.log("auth-client - No se encontró usuario en la API")
    return null
  } catch (error) {
    console.error("auth-client - Error al consultar la API:", error)
    return null
  }
}

// Hook para obtener la sesión actual
export function useSession() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    async function loadUser() {
      try {
        setLoading(true)
        const user = await getCurrentUser()
        setUser(user)
      } catch (error) {
        console.error("Error loading user:", error)
      } finally {
        setLoading(false)
      }
    }

    loadUser()
  }, [router])

  return { user, loading }
}

// Actualizar la función de logout para ser más robusta
export async function logout() {
  try {
    console.log("Iniciando proceso de cierre de sesión...")

    // Eliminar la sesión del localStorage
    localStorage.removeItem("user_session")
    console.log("Sesión eliminada del localStorage")

    // Llamar al endpoint de logout
    const response = await fetch("/api/auth/logout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      console.error("Error en el servidor al cerrar sesión:", response.statusText)
    } else {
      console.log("Sesión cerrada correctamente en el servidor")
    }

    // Redirigir a login independientemente de la respuesta del servidor
    console.log("Redirigiendo a la página de login...")
    window.location.href = "/login"
  } catch (error) {
    console.error("Error al cerrar sesión:", error)
    // Asegurar que el usuario sea redirigido incluso si hay un error
    window.location.href = "/login"
  }
}

// Función para verificar si el usuario tiene un rol específico
export function hasRole(user: User | null, requiredRole: UserRole | UserRole[]): boolean {
  if (!user) return false

  if (Array.isArray(requiredRole)) {
    return requiredRole.includes(user.role)
  }

  return user.role === requiredRole
}

// Función para verificar si el usuario tiene un permiso específico
export function hasPermission(user: User | null, permission: string): boolean {
  if (!user) return false

  // Superadmins tienen todos los permisos
  if (user.role === ROLES.SUPERADMIN) {
    return true
  }

  // Implementar verificación de permisos basada en el rol
  switch (permission) {
    case PERMISSIONS.MANAGE_ESTABLISHMENTS:
      return user.role === ROLES.SUPERADMIN
    case PERMISSIONS.CREATE_ADMIN:
      return user.role === ROLES.SUPERADMIN
    case PERMISSIONS.CREATE_GUARDIA:
      return user.role === ROLES.SUPERADMIN || user.role === ROLES.ADMIN
    default:
      return false
  }
}


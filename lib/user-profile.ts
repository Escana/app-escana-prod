import { createClient } from "@supabase/supabase-js"
import type { CompleteUserProfile, UserProfileData } from "@/types/user-profile"
import { ROLES } from "@/lib/auth-client"

// Cliente de Supabase para uso general
const createSupabaseClient = () => {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
}

// Función para obtener el perfil completo de un usuario
export async function getUserProfile(userId: string): Promise<CompleteUserProfile | null> {
  try {
    const supabase = createSupabaseClient()

    // Obtener datos básicos del usuario
    const { data: userData, error: userError } = await supabase
      .from("employees")
      .select(`
        id, 
        name, 
        email, 
        role, 
        status, 
        establishment_id, 
        created_at,
        establishments(name)
      `)
      .eq("id", userId)
      .single()

    if (userError || !userData) {
      console.error("Error al obtener datos del usuario:", userError)
      return null
    }

    // Formatear datos básicos
    const userProfile: UserProfileData = {
      id: userData.id,
      name: userData.name || "",
      email: userData.email,
      role: userData.role,
      status: userData.status,
      establishment_id: userData.establishment_id,
      establishment_name: userData.establishments?.name,
      created_at: userData.created_at,
    }

    // Obtener registros de acceso (simulados para este ejemplo)
    const accessLogs = [
      {
        id: "1",
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        action: "entry" as const,
        location: userProfile.establishment_name || "Local principal",
        device: "Entrada principal",
      },
      {
        id: "2",
        timestamp: new Date(Date.now() - 86400000).toISOString(),
        action: "exit" as const,
        location: userProfile.establishment_name || "Local principal",
        device: "Entrada principal",
      },
      {
        id: "3",
        timestamp: new Date(Date.now() - 90000000).toISOString(),
        action: "entry" as const,
        location: userProfile.establishment_name || "Local principal",
        device: "Entrada secundaria",
      },
    ]

    // Permisos (simulados para este ejemplo)
    const permissions = [
      {
        id: "1",
        name: "Escanear documentos",
        description: "Permite escanear documentos de identidad",
        granted: true,
      },
      {
        id: "2",
        name: "Gestionar clientes",
        description: "Permite ver y editar información de clientes",
        granted: userProfile.role !== ROLES.GUARDIA,
      },
      {
        id: "3",
        name: "Gestionar incidentes",
        description: "Permite crear y gestionar incidentes",
        granted: true,
      },
      {
        id: "4",
        name: "Ver estadísticas",
        description: "Permite ver estadísticas del establecimiento",
        granted: userProfile.role !== ROLES.GUARDIA,
      },
    ]

    // Información de contacto (simulada para este ejemplo)
    const contactInfo = {
      phone: "+56 9 1234 5678",
      emergency_contact: "+56 9 8765 4321",
      address: "Av. Ejemplo 123, Santiago, Chile",
    }

    // Combinar todo en un perfil completo
    return {
      ...userProfile,
      access_logs: accessLogs,
      permissions,
      contact_info: contactInfo,
    }
  } catch (error) {
    console.error("Error en getUserProfile:", error)
    return null
  }
}

// Función para determinar si un usuario puede ver el perfil completo de otro usuario
export function canViewFullProfile(viewerRole: string, targetRole: string): boolean {
  // Superadmin puede ver todo
  if (viewerRole === ROLES.SUPERADMIN) return true

  // Admin puede ver perfiles de guardias pero no de otros admins o superadmins
  if (viewerRole === ROLES.ADMIN) {
    return targetRole === ROLES.GUARDIA
  }

  // Guardia solo puede ver su propio perfil (esto se maneja en el componente)
  return false
}


import { createClient } from "@supabase/supabase-js"
import type { SupabaseClient } from "@supabase/supabase-js"
import { getConfig } from "./config"

let supabaseInstance: SupabaseClient | null = null

// Update the Supabase client configuration to handle rate limiting
function getSupabaseClient() {
  if (supabaseInstance) return supabaseInstance

  const config = getConfig()

  try {
    console.log("Inicializando cliente Supabase...")
    supabaseInstance = createClient(config.supabaseUrl, config.supabaseAnonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: true,
      },
      db: {
        schema: "public",
      },
      global: {
        headers: {
          "x-client-info": "escana",
        },
      },
      // Add retry configuration
      fetch: (url, options) => {
        return fetch(url, {
          ...options,
          // Add a longer timeout
          signal: AbortSignal.timeout(30000), // 30 second timeout
        })
      },
      // Configuración adicional para mejorar la estabilidad
      realtime: {
        params: {
          eventsPerSecond: 5,
        },
      },
    })
    console.log("Supabase client initialized successfully")
    return supabaseInstance
  } catch (error) {
    console.error("Error initializing Supabase client:", error)
    throw error
  }
}

// Export the singleton instance
export const supabase = getSupabaseClient()

// Test the connection
supabase
  .from("clients")
  .select("count")
  .single()
  .then(({ data, error }) => {
    if (error) {
      console.error("Error connecting to Supabase:", error)
    } else {
      console.log("Successfully connected to Supabase. Client count:", data?.count)
    }
  })

// Export types
export type Client = {
  id: string
  nombres: string
  apellidos: string
  rut: string
  nacionalidad: string
  sexo: "M" | "F"
  edad: number
  nacimiento: string
  vencimiento?: string
  photo: string
  document_image?: string
  ingreso: string
  is_banned: boolean
  is_guest: boolean
  ban_level?: number
  ban_duration?: string
  ban_start_date?: string
  ban_end_date?: string
  ban_reason?: string
  ban_description?: string
  guest_list_id?: string
  created_at: string
  updated_at: string
}

export type GuestList = {
  id: string
  nombre: string
  codigo: string
  anfitrion: string
  rut: string
  fecha: string
  hora: string
  estado: "REALIZADO" | "CONFIRMADO" | "CANCELADO" | "NO CONFIRMADO"
  descripcion?: string
  guests?: Guest[] // Make sure this is defined
  created_at: string
  updated_at: string
  establishment_id:string
}

export type Guest = {
  id: string
  guest_list_id: string
  nombres: string
  apellidos: string
  rut: string
  created_at: string
  updated_at: string
}

// Updated Employee type with role field
export type Employee = {
  id: string
  name: string
  email: string
  role: "superadmin" | "admin" | "guardia"
  status: "Activo" | "Inactivo"
  establishment_id?: string
  created_by?: string
  created_at: string
  updated_at: string
  // Additional fields
  rut?: string
  telefono?: string
  direccion?: string
  cargo?: string
  last_login?: string
  profile_image?: string
}

// New type for establishments
export type Establishment = {
  id: string
  name: string
  address: string
  city: string
  country: string
  created_by: string
  created_at: string
  updated_at: string
}

export type Incident = {
  id: string
  client_id: string
  employee_id: string
  establishment_id: string
  type:
    | "AGRESION"
    | "ACOSO"
    | "CONSUMO_DROGAS"
    | "ROBO"
    | "DANOS"
    | "ALTERACION_ORDEN"
    | "DOCUMENTO_FALSO"
    | "EXCESO_ALCOHOL"
    | "AMENAZAS"
    | "ACCESO_NO_AUTORIZADO"
  description: string
  status: "PENDING" | "IN_PROGRESS" | "RESOLVED" | "ARCHIVED"
  severity: 1 | 2 | 3 | 4 | 5
  location?: string
  created_at: string
  updated_at: string
  resolved_at?: string
  resolved_by?: string
  resolution_notes?: string
  evidence_urls?: string[]
  witnesses?: string[]
  client?: Client
  employee?: Employee
}

// Add a test function to verify the connection
export async function testSupabaseConnection() {
  console.log("Testing Supabase connection...")

  try {
    // Test incidents table
    const { data: incidentsCount, error: incidentsError } = await supabase.from("incidents").select("count").single()

    console.log("Incidents table check:", {
      count: incidentsCount?.count,
      error: incidentsError ? `${incidentsError.code}: ${incidentsError.message}` : null,
    })

    // Test clients table
    const { data: clientsCount, error: clientsError } = await supabase.from("clients").select("count").single()

    console.log("Clients table check:", {
      count: clientsCount?.count,
      error: clientsError ? `${clientsError.code}: ${clientsError.message}` : null,
    })

    // Test employees table
    const { data: employeesCount, error: employeesError } = await supabase.from("employees").select("count").single()

    console.log("Employees table check:", {
      count: employeesCount?.count,
      error: employeesError ? `${employeesError.code}: ${employeesError.message}` : null,
    })

    return {
      incidents: !incidentsError,
      clients: !clientsError,
      employees: !employeesError,
      details: {
        incidents: incidentsError ? incidentsError.message : "OK",
        clients: clientsError ? clientsError.message : "OK",
        employees: employeesError ? employeesError.message : "OK",
      },
    }
  } catch (error) {
    console.error("Error testing connection:", error)
    return {
      incidents: false,
      clients: false,
      employees: false,
      details: {
        error: error instanceof Error ? error.message : "Unknown error",
      },
    }
  }
}

// Execute the connection test on initialization
testSupabaseConnection()


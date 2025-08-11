export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      clients: {
        Row: {
          ban_description: string | null
          ban_duration: string | null
          ban_end_date: string | null
          ban_level: number | null
          ban_reason: string | null
          ban_start_date: string | null
          created_at: string
          edad: number | null
          id: string
          is_banned: boolean
          is_guest: boolean
          nacimiento: string
          nacionalidad: string
          nombres: string
          photo: string | null
          rut: string
          sexo: "M" | "F"
          updated_at: string
          vencimiento: string | null
          document_image: string | null
        }
        Insert: {
          ban_description?: string | null
          ban_duration?: string | null
          ban_end_date?: string | null
          ban_level?: number | null
          ban_reason?: string | null
          ban_start_date?: string | null
          created_at?: string
          edad?: number | null
          id?: string
          is_banned?: boolean
          is_guest?: boolean
          nacimiento: string
          nacionalidad: string
          nombres: string
          photo?: string | null
          rut: string
          sexo: "M" | "F"
          updated_at?: string
          vencimiento?: string | null
          document_image?: string | null
        }
        Update: {
          ban_description?: string | null
          ban_duration?: string | null
          ban_end_date?: string | null
          ban_level?: number | null
          ban_reason?: string | null
          ban_start_date?: string | null
          created_at?: string
          edad?: number | null
          id?: string
          is_banned?: boolean
          is_guest?: boolean
          nacimiento?: string
          nacionalidad?: string
          nombres?: string
          photo?: string | null
          rut?: string
          sexo?: "M" | "F"
          updated_at?: string
          vencimiento?: string | null
          document_image?: string | null
        }
        Relationships: []
      }
      employees: {
        Row: {
          created_at: string
          email: string
          id: string
          name: string
          role: "Seguridad" | "Administrador" | "Recepcionista"
          status: "Activo" | "Inactivo"
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          name: string
          role?: "Seguridad" | "Administrador" | "Recepcionista"
          status?: "Activo" | "Inactivo"
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          name?: string
          role?: "Seguridad" | "Administrador" | "Recepcionista"
          status?: "Activo" | "Inactivo"
          updated_at?: string
        }
        Relationships: []
      }
      incidents: {
        Row: {
          client_id: string
          created_at: string
          description: string
          employee_id: string | null
          id: string
          location: string | null
          resolution_notes: string | null
          resolved_at: string | null
          resolved_by: string | null
          severity: number
          status: string
          type: string
          updated_at: string
        }
        Insert: {
          client_id: string
          created_at?: string
          description: string
          employee_id: string | null
          id?: string
          location?: string | null
          resolution_notes?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity: number
          status?: string
          type: string
          updated_at?: string
        }
        Update: {
          client_id?: string
          created_at?: string
          description?: string
          employee_id?: string | null
          id?: string
          location?: string | null
          resolution_notes?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: number
          status?: string
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "incidents_client_id_fkey"
            columns: ["client_id"]
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "incidents_employee_id_fkey"
            columns: ["employee_id"]
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      visits: {
        Row: {
          id: string
          client_id: string
          entry_time: string
          exit_time: string | null
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          client_id: string
          entry_time?: string
          exit_time?: string | null
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          client_id?: string
          entry_time?: string
          exit_time?: string | null
          status?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "visits_client_id_fkey"
            columns: ["client_id"]
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      employee_role: "Seguridad" | "Administrador" | "Recepcionista"
      employee_status: "Activo" | "Inactivo"
      incident_severity: "1" | "2" | "3" | "4" | "5"
      incident_status: "PENDING" | "IN_PROGRESS" | "RESOLVED" | "ARCHIVED"
      incident_type:
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
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

export type Visit = {
  id: string
  client_id: string
  entry_time: string
  exit_time?: string
  status: string
  created_at: string
  updated_at: string
}


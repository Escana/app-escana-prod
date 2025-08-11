export interface Client {
  id: string
  rut: string
  nombres: string
  apellidos: string
  nacionalidad: string
  sexo: string
  fecha_nacimiento: string
  photo?: string
  document_image?: string
  is_guest?: boolean
  is_banned?: boolean
  ban_level?: number
  guest_list?: string
  visits?: Visit[]
  created_at: string
}

export interface Visit {
  id: string
  entry_time: string
  exit_time?: string
  status: string
}

export interface GuestList {
  id: string
  nombre: string
  anfitrion: string
  rut: string
  fecha: string
  hora: string
  estado: string
  descripcion?: string
}

export interface Guest {
  id: string
  guest_list_id: string
  nombres: string
  apellidos: string
  rut: string
}

export interface Incident {
  id: string
  client_id: string
  employee_id: string
  type: string
  description: string
  status: string
  severity: number
  location?: string
  document_image?: string
  created_at: string
  updated_at: string
  resolved_at?: string
  resolved_by?: string
  resolution_notes?: string
  client?: Client
  employee?: any
}

export interface Establishment {
  id: string
  name: string
  address: string | null
  city: string | null
  country: string | null
  created_by: string | null
  created_at: string | null
  updated_at: string | null
  status: "active" | "inactive" | string
  plan: "basic" | "premium" | "empresarial" | string
  description: string | null
  contact_name: string | null
  contact_email: string | null
  contact_phone: string | null
  opening_hours: string | null
  max_capacity: number | null
  payment_method: "monthly" | "yearly" | "quarterly" | string
  notes: string | null
  last_payment_date: string | null
  next_payment_date: string | null
  payment_status: "pending" | "paid" | "overdue" | string
  userCount?: number // Campo calculado, no está en la base de datos
}


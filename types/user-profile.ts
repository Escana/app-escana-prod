// Tipos para los perfiles de usuario
export interface UserProfileData {
  id: string
  name: string
  email: string
  role: string
  status: string
  establishment_id?: string
  establishment_name?: string
  created_at: string
  last_login?: string
  photo_url?: string
}

export interface AccessLog {
  id: string
  timestamp: string
  action: "entry" | "exit"
  location: string
  device?: string
}

export interface UserPermission {
  id: string
  name: string
  description: string
  granted: boolean
}

export interface UserContact {
  phone?: string
  emergency_contact?: string
  address?: string
}

export interface CompleteUserProfile extends UserProfileData {
  access_logs: AccessLog[]
  permissions: UserPermission[]
  contact_info: UserContact
}


export interface User {
  id: string
  name?: string
  email: string
  role: string
  establishment_id?: string
}

export interface Establishment {
  id: string
  name: string
  address?: string
  city?: string
  country?: string
  status?: string
  created_at?: string
  updated_at?: string
  subscription_status?: string
  subscription_end_date?: string
  owner_id?: string
  owner_name?: string
  owner_email?: string
}

export interface Employee {
  id: string
  name: string
  email: string
  role: string
  establishment_id: string
  establishment_name?: string
  created_at?: string
  last_login?: string
  status?: string
}

export interface Payment {
  id: string
  establishment_id: string
  establishment_name: string
  amount: number
  status: string
  date: string
  invoice_url?: string
  subscription_period?: string
}

export interface SupportTicket {
  id: string
  establishment_id?: string
  establishment_name?: string
  user_id: string
  user_name: string
  user_email: string
  subject: string
  message: string
  status: string
  priority: string
  created_at: string
  updated_at: string
  assigned_to?: string
  assigned_to_name?: string
}


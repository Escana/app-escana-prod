export interface Guard {
  id: string
  name: string
  email: string
  phone: string
  status: "active" | "inactive" | "disconnected"
  lastActive: Date
  role: string
  establishment: string
  createdAt: Date
  updatedAt: Date
}

export interface GuardFormData {
  name: string
  email: string
  phone: string
}


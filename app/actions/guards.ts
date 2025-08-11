"use server"
import type { Guard, GuardFormData } from "@/types/guard"
import { revalidatePath } from "next/cache"

// Mock data para demostración
const mockGuards: Guard[] = [
  {
    id: "1",
    name: "Ana Martínez",
    email: "ana.martinez@example.com",
    phone: "+56 9 1234 5678",
    status: "active",
    lastActive: new Date(Date.now() - 5 * 60 * 1000), // 5 minutos atrás
    role: "guard",
    establishment: "demo-establishment-id",
    createdAt: new Date("2023-01-15"),
    updatedAt: new Date("2023-10-10"),
  },
  {
    id: "2",
    name: "Carlos Rodríguez",
    email: "carlos.rodriguez@example.com",
    phone: "+56 9 8765 4321",
    status: "inactive",
    lastActive: new Date(Date.now() - 60 * 60 * 1000), // 1 hora atrás
    role: "guard",
    establishment: "demo-establishment-id",
    createdAt: new Date("2023-02-20"),
    updatedAt: new Date("2023-09-15"),
  },
  {
    id: "3",
    name: "Laura Sánchez",
    email: "laura.sanchez@example.com",
    phone: "+56 9 2345 6789",
    status: "active",
    lastActive: new Date(Date.now() - 2 * 60 * 1000), // 2 minutos atrás
    role: "guard",
    establishment: "demo-establishment-id",
    createdAt: new Date("2023-03-10"),
    updatedAt: new Date("2023-10-05"),
  },
  {
    id: "4",
    name: "Miguel Ángel Torres",
    email: "miguel.torres@example.com",
    phone: "+56 9 3456 7890",
    status: "disconnected",
    lastActive: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 horas atrás
    role: "guard",
    establishment: "demo-establishment-id",
    createdAt: new Date("2023-04-05"),
    updatedAt: new Date("2023-08-20"),
  },
  {
    id: "5",
    name: "Isabel Fernández",
    email: "isabel.fernandez@example.com",
    phone: "+56 9 4567 8901",
    status: "active",
    lastActive: new Date(Date.now() - 10 * 60 * 1000), // 10 minutos atrás
    role: "guard",
    establishment: "demo-establishment-id",
    createdAt: new Date("2023-05-15"),
    updatedAt: new Date("2023-09-25"),
  },
]

export async function getGuards(establishmentId: string): Promise<Guard[]> {
  // En un entorno de producción, usaríamos Supabase
  // const supabase = createClient()
  // const { data, error } = await supabase
  //   .from('employees')
  //   .select('*')
  //   .eq('establishment_id', establishmentId)
  //   .eq('role', 'guard')

  // if (error) throw new Error('Error fetching guards')

  // return data.map(guard => ({
  //   id: guard.id,
  //   name: guard.name,
  //   status: guard.status || 'inactive',
  //   lastActive: new Date(guard.last_active || guard.updated_at),
  //   email: guard.email,
  //   phone: guard.phone || '',
  //   role: guard.role,
  //   establishment: guard.establishment_id,
  //   createdAt: new Date(guard.created_at),
  //   updatedAt: new Date(guard.updated_at)
  // }))

  // Para demostración, usamos datos mock
  return mockGuards.filter((guard) => guard.establishment === establishmentId)
}

export async function createGuard(data: GuardFormData, establishmentId: string) {
  // En un entorno de producción, usaríamos Supabase
  // const supabase = createClient()
  // const { error } = await supabase
  //   .from('employees')
  //   .insert({
  //     name: data.name,
  //     email: data.email,
  //     phone: data.phone,
  //     role: 'guard',
  //     establishment_id: establishmentId,
  //     status: 'inactive'
  //   })

  // if (error) throw new Error('Error creating guard')

  // Para demostración, simplemente revalidamos el path
  revalidatePath("/admin-profile")
  return { success: true }
}

export async function updateGuard(id: string, data: Partial<GuardFormData>) {
  // En un entorno de producción, usaríamos Supabase
  // const supabase = createClient()
  // const { error } = await supabase
  //   .from('employees')
  //   .update(data)
  //   .eq('id', id)

  // if (error) throw new Error('Error updating guard')

  // Para demostración, simplemente revalidamos el path
  revalidatePath("/admin-profile")
  return { success: true }
}

export async function deleteGuard(id: string) {
  // En un entorno de producción, usaríamos Supabase
  // const supabase = createClient()
  // const { error } = await supabase
  //   .from('employees')
  //   .delete()
  //   .eq('id', id)

  // if (error) throw new Error('Error deleting guard')

  // Para demostración, simplemente revalidamos el path
  revalidatePath("/admin-profile")
  return { success: true }
}


"use server"

import { supabase } from "@/lib/supabase"
import { revalidatePath } from "next/cache"
import type { Establishment } from "@/lib/supabase/types"
import { logger } from "@/lib/utils"
import { getCurrentUser } from "@/lib/auth-client" // Si lo necesitas en otros casos

// Obtener todos los establecimientos para selector de formularios
export async function getEstablishmentsForSelect() {
  try {
    logger.info("Obteniendo establecimientos para selector...")

    const { data, error } = await supabase
      .from("establishments")
      .select("id, name, city")
      .order("name", { ascending: true })

    if (error) {
      logger.error("Error al obtener establecimientos para selector:", error)
      throw new Error(`Error al obtener establecimientos: ${error.message}`)
    }

    const formattedEstablishments =
      data?.map((est) => ({
        value: est.id,
        label: `${est.name} (${est.city})`,
        id: est.id,
      })) || []

    logger.info(`Establecimientos obtenidos para selector: ${formattedEstablishments.length}`)

    return formattedEstablishments
  } catch (error) {
    logger.error("Error en getEstablishmentsForSelect:", error)
    return []
  }
}

// Obtener todos los establecimientos con conteo de usuarios
export async function getEstablishments() {
  try {
    logger.info("Obteniendo establecimientos...")

    const { data: establishments, error } = await supabase
      .from("establishments")
      .select(`
        id, 
        name, 
        address, 
        city, 
        country, 
        created_by, 
        created_at, 
        updated_at, 
        status, 
        plan, 
        description, 
        contact_name, 
        contact_email, 
        contact_phone, 
        opening_hours, 
        max_capacity, 
        payment_method, 
        notes, 
        last_payment_date, 
        next_payment_date, 
        payment_status
      `)
      .order("created_at", { ascending: false })

    if (error) {
      logger.error("Error al obtener establecimientos:", { error: error.message })
      return []
    }

    if (!establishments || establishments.length === 0) {
      logger.warn("No se encontraron establecimientos")
      return []
    }

    const establishmentsWithCounts = await Promise.all(
      establishments.map(async (establishment) => {
        try {
          const { count, error: countError } = await supabase
            .from("employees")
            .select("*", { count: "exact", head: true })
            .eq("establishment_id", establishment.id)

          if (countError) {
            logger.error(`Error al contar empleados para establecimiento ${establishment.id}:`, {
              error: countError.message,
            })
            return { ...establishment, userCount: 0 }
          }

          return { ...establishment, userCount: count || 0 }
        } catch (e: any) {
          logger.error(`Error al procesar establecimiento ${establishment.id}:`, {
            error: e.message,
          })
          return { ...establishment, userCount: 0 }
        }
      }),
    )

    logger.info("Establecimientos obtenidos exitosamente", {
      count: establishmentsWithCounts.length,
    })

    return establishmentsWithCounts
  } catch (error) {
    logger.error("Error en getEstablishments", {
      error: error.message,
    })
    return []
  }
}

// Obtener un establecimiento por ID
export async function getEstablishmentById(id: string) {
  try {
    const { data, error } = await supabase
      .from("establishments")
      .select(`
        id, 
        name, 
        address, 
        city, 
        country, 
        created_by, 
        created_at, 
        updated_at, 
        status, 
        plan, 
        description, 
        contact_name, 
        contact_email, 
        contact_phone, 
        opening_hours, 
        max_capacity, 
        payment_method, 
        notes, 
        last_payment_date, 
        next_payment_date, 
        payment_status
      `)
      .eq("id", id)
      .single()

    if (error) {
      logger.error("Error al obtener establecimiento:", {
        id,
        error: error.message,
      })
      return null
    }

    return data
  } catch (error) {
    logger.error("Error en getEstablishmentById:", {
      id,
      error: error.message,
    })
    return null
  }
}

// Crear un nuevo establecimiento
export async function createEstablishment(
  establishmentData: Partial<Establishment>,
  currentUser: { id: string; email?: string; role?: string }
) {
  try {
    if (!establishmentData.name) {
      throw new Error("El nombre del establecimiento es obligatorio")
    }

    // Usamos currentUser pasado desde el cliente (sin supabase.auth.getSession)
    if (!currentUser || !currentUser.userId) {
      logger.error("Error de autenticación: Usuario no autenticado al crear establecimiento")
      throw new Error("Debe iniciar sesión para crear un establecimiento")
    }

    logger.info("Sesión de usuario al crear establecimiento:", {
      userId: currentUser.userId,
      email: currentUser.email,
      role: currentUser.role,
    })

    const newEstablishment = {
      ...establishmentData,
      created_by: currentUser.userId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      status: establishmentData.status || "active",
      plan: establishmentData.plan || "basic",
      payment_method: establishmentData.payment_method || "monthly",
      payment_status: establishmentData.payment_status || "pending",
      country: establishmentData.country || "Chile",
    }

    logger.info("Datos de establecimiento a insertar:", newEstablishment)

    const { data, error } = await supabase
      .from("establishments")
      .insert(newEstablishment)
      .select()
      .single()

    if (error) {
      logger.error("Error de Supabase al crear establecimiento:", {
        error: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
      })
      throw new Error(`Error al crear establecimiento: ${error.message}`)
    }

    logger.info("Establecimiento creado exitosamente", {
      id: data.id,
      name: data.name,
    })

    return data
  } catch (error: any) {
    logger.error("Error en createEstablishment", {
      error: error.message,
      data: establishmentData,
    })
    throw error
  }
}

// Actualizar un establecimiento existente
export async function updateEstablishment(
  id: string,
  establishmentData: Partial<Establishment>,
  currentUser: { id: string; email?: string; role?: string }
) {
  try {
    // Verificar autenticación utilizando currentUser pasado desde el cliente
    if (!currentUser || !currentUser.userId) {
      throw new Error("Debe iniciar sesión para actualizar un establecimiento")
    }

    const updatedEstablishment = {
      ...establishmentData,
      updated_at: new Date().toISOString(),
    }

    // Eliminar campos que no queremos actualizar directamente
    delete updatedEstablishment.id
    delete updatedEstablishment.created_at
    delete updatedEstablishment.created_by
    delete updatedEstablishment.userCount

    const { data, error } = await supabase
      .from("establishments")
      .update(updatedEstablishment)
      .eq("id", id)
      .select()
      .single()

    if (error) {
      logger.error("Error de Supabase al actualizar establecimiento:", {
        error: error.message,
        code: error.code,
        details: error.details,
      })
      throw new Error(`Error al actualizar establecimiento: ${error.message}`)
    }

    revalidatePath("/admin-dashboard")
    revalidatePath("/")

    logger.info("Establecimiento actualizado exitosamente", {
      id,
      updates: Object.keys(establishmentData),
    })

    return data
  } catch (error: any) {
    logger.error("Error en updateEstablishment", {
      error: error.message,
      id,
      data: establishmentData,
    })
    throw error
  }
}

// Actualizar el estado de pago de un establecimiento
export async function updatePaymentStatus(
  id: string,
  paymentData: {
    payment_status: string
    last_payment_date?: string
  },
  currentUser: { id: string; email?: string; role?: string }
) {
  try {
    // Verificar autenticación utilizando currentUser
    if (!currentUser || !currentUser.userId) {
      throw new Error("Debe iniciar sesión para actualizar el estado de pago")
    }

    const updateData: any = {
      payment_status: paymentData.payment_status,
      updated_at: new Date().toISOString(),
    }

    if (paymentData.last_payment_date) {
      updateData.last_payment_date = paymentData.last_payment_date
    }

    const { data, error } = await supabase
      .from("establishments")
      .update(updateData)
      .eq("id", id)
      .select()
      .single()

    if (error) {
      logger.error("Error de Supabase al actualizar estado de pago:", {
        error: error.message,
        code: error.code,
        details: error.details,
      })
      throw new Error(`Error al actualizar estado de pago: ${error.message}`)
    }

    revalidatePath("/admin-dashboard")
    revalidatePath("/")

    logger.info("Estado de pago actualizado exitosamente", {
      id,
      payment_status: paymentData.payment_status,
    })

    return data
  } catch (error: any) {
    logger.error("Error en updatePaymentStatus", {
      error: error.message,
      id,
      data: paymentData,
    })
    throw error
  }
}

// Eliminar un establecimiento
export async function deleteEstablishment(
  id: string,
  currentUser: { id: string; email?: string; role?: string }
) {
  try {
    console.log(currentUser)
    // Verificar autenticación utilizando currentUser
    if (!currentUser || !currentUser.userId) {
      throw new Error("Debe iniciar sesión para eliminar un establecimiento")
    }

    // Verificar si hay empleados asociados
    const { count, error: countError } = await supabase
      .from("employees")
      .select("*", { count: "exact", head: true })
      .eq("establishment_id", id)

    if (countError) throw new Error(countError.message)

    if (count && count > 0) {
      throw new Error(`No se puede eliminar el establecimiento porque tiene ${count} empleados asociados`)
    }

    const { error } = await supabase
      .from("establishments")
      .delete()
      .eq("id", id)

    if (error) {
      logger.error("Error de Supabase al eliminar establecimiento:", {
        error: error.message,
        code: error.code,
        details: error.details,
      })
      throw new Error(`Error al eliminar establecimiento: ${error.message}`)
    }

    revalidatePath("/admin-dashboard")
    revalidatePath("/")

    logger.info("Establecimiento eliminado exitosamente", { id })

    return { success: true }
  } catch (error: any) {
    logger.error("Error en deleteEstablishment", {
      error: error.message,
      id,
    })
    throw error
  }
}

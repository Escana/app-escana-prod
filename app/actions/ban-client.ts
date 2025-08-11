"use server"

import { revalidatePath } from "next/cache"
import { supabase } from "@/lib/supabase"
import type { Client } from "@/lib/supabase"
import { createClient, getClientByRut } from "./clients"

export async function banClient(
  rut: string,
  data: {
    banLevel: number            // 0 = desbanear, >0 = niveles de ban
    banDuration: string
    banReason: string
    banDescription: string
    nombres?: string
    apellidos?: string
    nacionalidad?: string
    sexo?: string
    nacimiento?: string
    edad?: number
    document_image?: string
  },
  currentUser: { id: string; role: string; establishment_id?: string }
): Promise<Client> {
  try {
    // 1) Validar autenticación
    if (!currentUser?.id) {
      throw new Error("No autorizado")
    }

    // 2) Si es intento de DESBANEAR (banLevel === 0) y el rol es 'guardia', bloquear
    if (data.banLevel === 0 && currentUser.role === "guardia") {
      throw new Error("No tienes permiso para desbanear usuarios")
    }

    // 3) Calcular fechas de ban
    const banStartDate = new Date()
    let banEndDate: Date | null = null
    if (data.banDuration !== "Permanente") {
      const days = parseInt(data.banDuration, 10)
      banEndDate = new Date(banStartDate.getTime() + days * 24 * 60 * 60 * 1000)
    }

    // 4) Buscar cliente
    let client = await getClientByRut(rut)
    let clientId: string

    if (!client) {
      // Crear nuevo cliente (solo en ban) — no aplicaría al desban porque banLevel === 0 no entra aquí
      if (!data.nombres || !data.apellidos) {
        throw new Error("Se requieren nombres y apellidos para crear un cliente")
      }
      const newClient = await createClient({
        rut,
        nombres: data.nombres,
        apellidos: data.apellidos,
        nacionalidad: data.nacionalidad ?? "CHILENA",
        sexo: (data.sexo as "M" | "F") ?? "M",
        nacimiento: data.nacimiento ?? null,
        edad: data.edad ?? 0,
        is_banned: true,
        ban_level: data.banLevel,
        ban_duration: data.banDuration,
        ban_reason: data.banReason,
        ban_description: data.banDescription,
        ban_start_date: banStartDate.toISOString(),
        ban_end_date: banEndDate?.toISOString() ?? null,
        document_image: data.document_image,
        establishment_id: currentUser.establishment_id,
      })
      clientId = newClient.id
      client = newClient
    } else {
      clientId = client.id

      // Actualizar estado de ban/unban
      const updatePayload: Record<string, any> = {}
      if (data.banLevel === 0) {
        // Desbanear
        updatePayload.is_banned = false
        updatePayload.ban_level = null
        updatePayload.ban_duration = null
        updatePayload.ban_reason = null
        updatePayload.ban_description = null
        updatePayload.ban_start_date = null
        updatePayload.ban_end_date = null
      } else {
        // Banear
        updatePayload.is_banned = true
        updatePayload.ban_level = data.banLevel
        updatePayload.ban_duration = data.banDuration
        updatePayload.ban_reason = data.banReason
        updatePayload.ban_description = data.banDescription
        updatePayload.ban_start_date = banStartDate.toISOString()
        updatePayload.ban_end_date = banEndDate?.toISOString() ?? null
        updatePayload.document_image = data.document_image
      }
      updatePayload.establishment_id = currentUser.establishment_id

      const { data: updatedClient, error: updateError } = await supabase
        .from("clients")
        .update(updatePayload)
        .eq("rut", rut)
        .select()
        .single()

      if (updateError) {
        console.error("Error banning/unbanning client:", updateError)
        throw new Error("Error actualizando el estado de ban")
      }
      client = updatedClient as Client
    }

    // 5) Registrar incidente (solo para bans, no para desban)
    if (data.banLevel > 0) {
      const { error: incidentError } = await supabase.from("incidents").insert([
        {
          client_id:      clientId,
          type:           "DOCUMENTO_FALSO",
          description:    data.banDescription,
          status:         "RESOLVED",
          severity:       data.banLevel,
          location:       "Entrada principal",
          resolved_at:    new Date().toISOString(),
          resolution_notes: `Cliente baneado: ${data.banReason}. Duración: ${data.banDuration} días.`,
        },
      ])
      if (incidentError) {
        console.error("Error creando incidente:", incidentError)
        throw new Error("Error registrando incidente de ban")
      }
    }

    // 6) Refrescar cache de la página de clientes
    revalidatePath("/clients")
    return client

  } catch (error: any) {
    console.error("Error in banClient:", error)
    throw error
  }
}

"use server"

import { revalidatePath } from "next/cache"
import { supabase } from "@/lib/supabase"
import type { GuestList, Guest } from "@/lib/supabase/types"

export async function getGuestLists(establishmentId?: string): Promise<GuestList[]> {
  console.log("[SERVER] Starting getGuestLists request")
  try {
    console.log("[SERVER] Fetching guest lists from Supabase")
    let query = supabase
      .from("guest_lists")
      .select(`
        *,
        guests:guests(*)
      `)
      .order("created_at", { ascending: false })

    // Si se proporciona el establishmentId, lo usamos para filtrar
    if (establishmentId) {
      query = query.eq("establishment_id", establishmentId)
    }
console.log(establishmentId)
    const { data, error } = await query

    if (error) {
      console.error("[SERVER] Error fetching guest lists:", error)
      throw error
    }

    if (!data) {
      console.log("[SERVER] No guest lists found")
      return []
    }

    console.log("[SERVER] Successfully fetched guest lists:", data.length)
    const formattedData = data.map((list) => {
      try {
        // Aseguramos que guests sea un array
        const guests = Array.isArray(list.guests) ? list.guests : []
        return {
          ...list,
          guests,
          created_at: new Date(list.created_at).toLocaleString("es-CL"),
          updated_at: new Date(list.updated_at).toLocaleString("es-CL"),
        }
      } catch (e) {
        console.error(`[SERVER] Error formatting guest list ${list.id}:`, e)
        return { ...list, guests: [] }
      }
    })

    console.log("[SERVER] Successfully formatted all guest lists")
    console.log("[SERVER] Total guest lists:", formattedData.length)
    console.log(
      "[SERVER] Total guests:",
      formattedData.reduce((acc, list) => acc + list.guests.length, 0),
    )

    return formattedData
  } catch (error) {
    console.error("[SERVER] Error in getGuestLists:", error)
    throw error
  }
}



export type CreateGuestListData = {
  nombre: string
  codigo: string
  anfitrion: string
  rut: string
  fecha: string
  hora: string
  estado: GuestList["estado"]
  descripcion?: string
  establishment_id: string
  invitados: Array<{
    nombres: string
    apellidos: string
    rut: string
  }>
}

export async function createGuestList(data: CreateGuestListData): Promise<GuestList> {
  console.log("[SERVER] Starting createGuestList request", { data })
  try {
    console.log("[SERVER] Creating guest list in Supabase")
    // First, create the guest list
    const { data: guestList, error: guestListError } = await supabase
      .from("guest_lists")
      .insert([
        {
          nombre: data.nombre,
          codigo: data.codigo,
          anfitrion: data.anfitrion,
          rut: data.rut,
          fecha: data.fecha,
          hora: data.hora,
          estado: data.estado,
          descripcion: data.descripcion,
          establishment_id: data.establishment_id,
        },
      ])
      .select()
      .single()

    if (guestListError) {
      console.error("[SERVER] Error creating guest list:", guestListError)
      throw guestListError
    }

    console.log("[SERVER] Successfully created guest list:", guestList)

    // Then, create all guests for this list if any
    if (data.invitados && data.invitados.length > 0) {
      console.log(`[SERVER] Adding ${data.invitados.length} guests to list`)
      const guestsData = data.invitados.map((guest) => ({
        ...guest,
        guest_list_id: guestList.id,
      }))

      const { error: guestsError } = await supabase.from("guests").insert(guestsData)

      if (guestsError) {
        console.error("[SERVER] Error adding guests:", guestsError)
        throw guestsError
      }

      console.log("[SERVER] Successfully added all guests")
    }

    revalidatePath("/guests")
    return guestList
  } catch (error) {
    console.error("[SERVER] Error in createGuestList:", error)
    throw error
  }
}

export async function updateGuestList(
  id: string,
  data: Partial<Omit<GuestList, "id" | "created_at" | "updated_at">>,
): Promise<void> {
  console.log("[SERVER] Starting updateGuestList request", { id, data })
  try {
    console.log("[SERVER] Updating guest list in Supabase")
    const { error } = await supabase.from("guest_lists").update(data).eq("id", id)

    if (error) {
      console.error("[SERVER] Error updating guest list:", error)
      throw error
    }

    console.log("[SERVER] Successfully updated guest list")
    revalidatePath("/guests")
  } catch (error) {
    console.error("[SERVER] Error in updateGuestList:", error)
    throw error
  }
}

export async function deleteGuestList(id: string): Promise<void> {
  console.log("[SERVER] Starting deleteGuestList request", { id })
  try {
    console.log("[SERVER] Deleting guests from list")
    // First delete all guests associated with this list
    const { error: guestsError } = await supabase.from("guests").delete().eq("guest_list_id", id)

    if (guestsError) {
      console.error("[SERVER] Error deleting guests:", guestsError)
      throw guestsError
    }

    console.log("[SERVER] Successfully deleted guests")
    console.log("[SERVER] Deleting guest list")

    // Then delete the guest list itself
    const { error: listError } = await supabase.from("guest_lists").delete().eq("id", id)

    if (listError) {
      console.error("[SERVER] Error deleting guest list:", listError)
      throw listError
    }

    console.log("[SERVER] Successfully deleted guest list")
    revalidatePath("/guests")
  } catch (error) {
    console.error("[SERVER] Error in deleteGuestList:", error)
    throw error
  }
}

export async function addGuestToList(
  guestListId: string,
  guest: Omit<Guest, "id" | "guest_list_id" | "created_at" | "updated_at">,
): Promise<Guest> {
  console.log("[SERVER] Starting addGuestToList request", { guestListId, guest })
  try {
    console.log("[SERVER] Adding guest to list in Supabase")
    const { data, error } = await supabase
      .from("guests")
      .insert([
        {
          ...guest,
          guest_list_id: guestListId,
        },
      ])
      .select()
      .single()

    if (error) {
      console.error("[SERVER] Error adding guest:", error)
      throw error
    }

    console.log("[SERVER] Successfully added guest:", data)
    revalidatePath("/guests")
    return data
  } catch (error) {
    console.error("[SERVER] Error in addGuestToList:", error)
    throw error
  }
}

export async function removeGuestFromList(guestListId: string, guestId: string): Promise<void> {
  console.log("[SERVER] Starting removeGuestFromList request", { guestListId, guestId })
  try {
    console.log("[SERVER] Removing guest from list in Supabase")
    const { error } = await supabase.from("guests").delete().eq("id", guestId).eq("guest_list_id", guestListId)

    if (error) {
      console.error("[SERVER] Error removing guest:", error)
      throw error
    }

    console.log("[SERVER] Successfully removed guest")
    revalidatePath("/guests")
  } catch (error) {
    console.error("[SERVER] Error in removeGuestFromList:", error)
    throw error
  }
}

export async function updateGuest(
  guestListId: string,
  guestId: string,
  data: Partial<Omit<Guest, "id" | "guest_list_id" | "created_at" | "updated_at">>,
): Promise<void> {
  console.log("[SERVER] Starting updateGuest request", { guestListId, guestId, data })
  try {
    console.log("[SERVER] Updating guest in Supabase")
    const { error } = await supabase.from("guests").update(data).eq("id", guestId).eq("guest_list_id", guestListId)

    if (error) {
      console.error("[SERVER] Error updating guest:", error)
      throw error
    }

    console.log("[SERVER] Successfully updated guest")
    revalidatePath("/guests")
  } catch (error) {
    console.error("[SERVER] Error in updateGuest:", error)
    throw error
  }
}

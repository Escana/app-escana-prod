"use server"

import { revalidatePath } from "next/cache"
import { supabase } from "@/lib/supabase"
import type { Incident } from "@/lib/supabase/types"

export async function getIncidents(id?: string):Promise<Incident[]> {
  console.log("[SERVER] Starting getIncidents request")
  console.log("[SERVER] Establishment ID:", id)
  try {
    console.log("[SERVER] Fetching establishment details")
    console.log("[SERVER] Fetching incidents from Supabase")
    // Get all incidents with client and employee details
    const { data: incidents, error: incidentsError } = await supabase
      .from("incidents")
      .select(`
        *,
        client:client_id(*),
        employee:employee_id(*)
      `)
      .eq("establishment_id",id)
      .order("created_at", { ascending: false })

    if (incidentsError) {
      console.error("[SERVER] Error fetching incidents:", incidentsError)
      throw incidentsError
    }

    console.log("[SERVER] Successfully fetched incidents:", incidents?.length)
    console.log("[SERVER] Fetching banned clients")
    
    // Get all banned clients
    const { data: bannedClients, error: bannedError } = await supabase
      .from("clients")
      .select("*")
      .eq("is_banned", true)
      .eq("establishment_id",id)
      .order("ban_start_date", { ascending: false })

    if (bannedError) {
      console.error("[SERVER] Error fetching banned clients:", bannedError)
      throw bannedError
    }

    console.log("[SERVER] Successfully fetched banned clients:", bannedClients?.length)
    console.log("[SERVER] Formatting incidents data")

    // Format dates for frontend display
    const formattedIncidents = (incidents || []).map((incident) => ({
      ...incident,
      created_at: new Date(incident.created_at).toLocaleString("es-CL"),
      updated_at: new Date(incident.updated_at).toLocaleString("es-CL"),
      resolved_at: incident.resolved_at ? new Date(incident.resolved_at).toLocaleString("es-CL") : null,
      isBanned: false,
      document_image: incident.client?.document_image || null,
    }))

    console.log("[SERVER] Formatting banned clients data")

    // Format banned clients as incidents for display
    const bannedIncidents = (bannedClients || []).map((client) => ({
      id: `ban-${client.id}`,
      client_id: client.id,
      type: "BAN" as const,
      description: client.ban_description || "Cliente baneado",
      status: "RESOLVED" as const,
      severity: client.ban_level || 1,
      created_at: new Date(client.ban_start_date || client.created_at).toLocaleString("es-CL"),
      client: client,
      isBanned: true,
      ban_level: client.ban_level,
      ban_start_date: client.ban_start_date ? new Date(client.ban_start_date).toLocaleString("es-CL") : null,
      ban_end_date: client.ban_end_date ? new Date(client.ban_end_date).toLocaleString("es-CL") : null,
      ban_reason: client.ban_reason,
      ban_duration: client.ban_duration,
      document_image: client.document_image || null,
    }))

    console.log("[SERVER] Successfully formatted all data")
    console.log("[SERVER] Total incidents:", formattedIncidents.length)
    console.log("[SERVER] Total banned clients:", bannedIncidents.length)

    // Combine regular incidents and banned clients
    return [...formattedIncidents, ...bannedIncidents]
  } catch (error) {
    console.error("[SERVER] Error in getIncidents:", error)
    throw error
  }
}

export async function createIncident(data: {
  client_id: string
  employee_id: string
  type: Incident["type"]
  description: string
  severity: Incident["severity"]
  location?: string
}): Promise<Incident> {
  console.log("[SERVER] Starting createIncident request", { data })
  try {
    console.log("[SERVER] Inserting new incident into Supabase")
    const { data: incident, error } = await supabase
      .from("incidents")
      .insert([
        {
          ...data,
          status: "PENDING",
        },
      ])
      .select()
      .single()

    if (error) {
      console.error("[SERVER] Error creating incident:", error)
      throw error
    }

    console.log("[SERVER] Successfully created incident:", incident)
    revalidatePath("/incidents")
    return incident
  } catch (error) {
    console.error("[SERVER] Error in createIncident:", error)
    throw error
  }
}


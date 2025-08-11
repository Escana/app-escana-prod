import { supabase } from "./supabase"

export async function checkClientType(rut: string): Promise<"regular" | "banned" | "guest"> {
  try {
    const { data: client, error } = await supabase.from("clients").select("is_banned, is_guest").eq("rut", rut).single()

    if (error) throw error

    if (!client) return "regular"
    if (client.is_banned) return "banned"
    if (client.is_guest) return "guest"
    return "regular"
  } catch (error) {
    console.error("Error checking client type:", error)
    return "regular"
  }
}


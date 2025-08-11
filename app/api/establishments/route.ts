import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    // Verificar si el usuario está autenticado
    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    // Obtener información del usuario actual
    const { data: userData, error: userError } = await supabase
      .from("employees")
      .select("id, role, establishment_id")
      .eq("id", session.user.id)
      .single()

    if (userError) {
      return NextResponse.json({ error: "Error al obtener datos del usuario" }, { status: 500 })
    }

    // Consultar establecimientos según el rol del usuario
    let query = supabase.from("establishments").select("id, name, status")

    // Si el usuario no es superadmin, filtrar por su establecimiento
    if (userData.role !== "superadmin") {
      query = query.eq("id", userData.establishment_id)
    }

    // Ordenar por nombre
    query = query.order("name")

    const { data: establishments, error } = await query

    if (error) {
      return NextResponse.json({ error: "Error al obtener establecimientos" }, { status: 500 })
    }

    return NextResponse.json(establishments)
  } catch (error) {
    console.error("Error en la API de establecimientos:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}


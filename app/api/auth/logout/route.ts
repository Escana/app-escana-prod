import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function POST() {
  try {
    console.log("API - Procesando solicitud de cierre de sesión")

    // Eliminar todas las cookies relacionadas con la autenticación
    cookies().delete("custom_auth_session")
    cookies().delete("supabase-auth-token")
    cookies().delete("sb-access-token")
    cookies().delete("sb-refresh-token")

    console.log("API - Cookies de sesión eliminadas")

    // También cerrar sesión en Supabase
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (supabaseUrl && supabaseKey) {
      const supabase = createClient(supabaseUrl, supabaseKey)
      await supabase.auth.signOut()
      console.log("API - Sesión de Supabase cerrada")
    } else {
      console.warn("API - No se pudo cerrar sesión en Supabase: faltan credenciales")
    }

    return NextResponse.json({
      success: true,
      message: "Sesión cerrada correctamente",
    })
  } catch (error) {
    console.error("API - Error al cerrar sesión:", error)
    return NextResponse.json(
      {
        error: "Error al cerrar sesión",
        details: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 },
    )
  }
}


import { NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function GET() {
  try {
    // Verificar si hay una sesión personalizada
    const customAuthCookie = cookies().get("custom_auth_session")

    if (customAuthCookie) {
      try {
        const sessionData = JSON.parse(customAuthCookie.value)
        const currentTime = Date.now()

        // Verificar si la sesión no ha expirado
        if (sessionData.expires_at > currentTime) {
          return NextResponse.json({
            status: "ok",
            authenticated: true,
            user: sessionData.user,
          })
        }
      } catch (error) {
        console.error("Error al decodificar la sesión personalizada:", error)
      }
    }

    return NextResponse.json({
      status: "ok",
      authenticated: false,
    })
  } catch (error) {
    console.error("Error en health-check:", error)
    return NextResponse.json(
      {
        status: "error",
        message: "Error interno del servidor",
      },
      { status: 500 },
    )
  }
}


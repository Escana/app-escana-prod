import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function GET() {
  const cookieStore = cookies()
  const sessionCookie = cookieStore.get("custom_auth_session")

  if (!sessionCookie) {
    return NextResponse.json({ data: null })
  }

  try {
    const sessionData = JSON.parse(Buffer.from(sessionCookie.value, "base64").toString())

    // Verificar si la sesión ha expirado
    if (sessionData.expires_at < Date.now()) {
      return NextResponse.json({ data: null })
    }

    return NextResponse.json({ data: sessionData })
  } catch (error) {
    console.error("Error al parsear la sesión:", error)
    return NextResponse.json({ data: null })
  }
}


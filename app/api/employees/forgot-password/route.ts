// file: app/api/employees/forgot-password/route.ts
'use server'
import { NextResponse, NextRequest } from "next/server"
import { forgotPassword, resetPassword } from "@/app/actions/employees"
export async function POST(request: NextRequest) {
  // Obtenemos el FormData de la petición
  const formData = await request.formData()

  // Determinar flujo según presencia de token
  const token = formData.get("token")
  let result: { error?: string; success?: boolean }

  if (typeof token === "string" && token.trim() !== "") {
    // Flujo de restablecer contraseña
    result = await resetPassword(formData)
  } else {
    // Flujo de olvidar contraseña
    result = await forgotPassword(formData)
  }

  // Manejo de errores
  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: 400 })
  }

  // Respuesta exitosa
  return NextResponse.json({ success: true })
}

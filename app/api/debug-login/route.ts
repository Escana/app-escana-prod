import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import bcrypt from "bcryptjs"
import { getConfig } from "@/lib/config"

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: "Email y contraseña son requeridos" }, { status: 400 })
    }

    console.log(`[Debug-Auth] Intentando iniciar sesión para: ${email}`)

    // Inicializar cliente de Supabase
    const config = getConfig()
    const supabase = createClient(config.supabaseUrl, config.supabaseAnonKey)

    // Buscar el usuario por email
    const { data: user, error: userError } = await supabase
      .from("employees")
      .select("*")
      .eq("email", email.toLowerCase())
      .single()

    if (userError || !user) {
      console.error(`[Debug-Auth] Usuario no encontrado: ${email}`, userError)
      return NextResponse.json({ error: "Credenciales incorrectas" }, { status: 401 })
    }

    // Verificar si el usuario está activo
    if (user.status !== "Activo") {
      console.error(`[Debug-Auth] Usuario inactivo: ${email}`)
      return NextResponse.json({ error: "Usuario inactivo. Contacte al administrador." }, { status: 403 })
    }

    // Verificar la contraseña
    let passwordValid = false

    try {
      // Verificar si la contraseña está hasheada con bcrypt
      if (user.password && user.password.startsWith("$2")) {
        passwordValid = await bcrypt.compare(password, user.password)
      } else if (user.password) {
        // Para compatibilidad con contraseñas antiguas (sin hash)
        passwordValid = password === user.password

        // Si la contraseña es válida pero no está hasheada, actualizarla
        if (passwordValid) {
          const hashedPassword = await bcrypt.hash(password, 10)
          await supabase.from("employees").update({ password: hashedPassword }).eq("id", user.id)
          console.log(`[Debug-Auth] Contraseña actualizada con hash para: ${email}`)
        }
      }
    } catch (error) {
      console.error(`[Debug-Auth] Error al verificar contraseña:`, error)
      return NextResponse.json({ error: "Error al verificar credenciales" }, { status: 500 })
    }

    if (!passwordValid) {
      console.error(`[Debug-Auth] Contraseña incorrecta para: ${email}`)
      return NextResponse.json({ error: "Credenciales incorrectas" }, { status: 401 })
    }

    // Crear sesión
    const sessionExpiry = 24 * 60 * 60 * 1000 // 1 día
    const expiryDate = Date.now() + sessionExpiry

    const sessionData = {
      userId: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
      establishment_id: user.establishment_id,
      created_at: user.created_at,
      expires_at: expiryDate,
      exp: Math.floor(expiryDate / 1000), // Para compatibilidad con JWT
    }

    // Convertir a base64 para almacenar en cookie
    const sessionString = Buffer.from(JSON.stringify(sessionData)).toString("base64")

    // Configurar cookie de sesión
    cookies().set({
      name: "custom_auth_session",
      value: sessionString,
      httpOnly: true,
      path: "/",
      secure: process.env.NODE_ENV === "production",
      maxAge: sessionExpiry / 1000, // En segundos
      sameSite: "lax",
    })

    // Actualizar último login
    await supabase.from("employees").update({ last_login: new Date().toISOString() }).eq("id", user.id)

    console.log(`[Debug-Auth] Inicio de sesión exitoso para: ${email}`)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[Debug-Auth] Error en login:", error)
    return NextResponse.json({ error: "Error al iniciar sesión. Intente nuevamente." }, { status: 500 })
  }
}


import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { cookies } from "next/headers"
import bcrypt from "bcryptjs"

export async function POST(request: Request) {
  try {
    const { email, password, remember } = await request.json()

    console.log(`[Auth] Iniciando proceso de login para: ${email}`)
    console.log(`[Auth] Entorno: ${process.env.NODE_ENV}`)

    // Validar datos de entrada
    if (!email || !password) {
      return NextResponse.json({ error: "Email y contraseña son requeridos" }, { status: 400 })
    }

    // Crear cliente de Supabase
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!, 
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    console.log(`[Auth] Intentando iniciar sesión para: ${email}`)

    // Buscar al usuario en la tabla employees
    const { data: employeeData, error: employeeError } = await supabase
      .from("employees")
      .select("id, email, role, name, establishment_id, created_at, password")
      .eq("email", email)
      .single()

    if (employeeError || !employeeData) {
      console.error(`[Auth] Error al buscar empleado:`, employeeError)
      return NextResponse.json({ error: "Credenciales inválidas" }, { status: 401 })
    }

    console.log(`[Auth] Empleado encontrado: ${employeeData.email}, rol: ${employeeData.role}`)
    console.log(`[Auth] Contraseña almacenada: "${employeeData.password}" (longitud: ${employeeData.password?.length})`)
    console.log(`[Auth] Contraseña proporcionada: "${password}" (longitud: ${password.length})`)

    let passwordMatches = false

    // Si la contraseña almacenada es un hash (bcrypt), se usa bcrypt.compare
    if (employeeData.password && employeeData.password.startsWith("$2")) {
      try {
        passwordMatches = await bcrypt.compare(password, employeeData.password)
        console.log(`[Auth] Verificación bcrypt: ${passwordMatches ? "exitosa" : "fallida"}`)
      } catch (error) {
        console.error(`[Auth] Error en verificación bcrypt:`, error)
        return NextResponse.json({ error: "Error en la verificación de contraseña" }, { status: 500 })
      }
    } else {
      // Si la contraseña está en texto plano, se compara directamente
      passwordMatches = employeeData.password === password
      console.log(`[Auth] Verificación directa (texto plano): ${passwordMatches ? "exitosa" : "fallida"}`)

      // Si la verificación es exitosa, actualizar el registro con el hash de bcrypt
      if (passwordMatches) {
        const salt = await bcrypt.genSalt(10)
        const hash = await bcrypt.hash(password, salt)
        await supabase.from("employees").update({ password: hash }).eq("id", employeeData.id)
        console.log(`[Auth] Contraseña actualizada a hash para el usuario: ${email}`)
      }
    }

    // Modo desarrollo: opción para bypass (solo para testing)
    if (process.env.NODE_ENV === "development" && process.env.BYPASS_AUTH === "true") {
      passwordMatches = true
      console.log(`[Auth] Modo desarrollo con bypass: omitiendo verificación de contraseña`)
    }

    if (!passwordMatches) {
      console.error(`[Auth] Contraseña incorrecta para: ${email}`)
      return NextResponse.json({ error: "Credenciales inválidas" }, { status: 401 })
    }

    // Crear sesión personalizada
    const expiresIn = remember ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000 // 30 días o 1 día
    const sessionData = {
      userId: employeeData.id,
      email: employeeData.email,
      role: employeeData.role,
      name: employeeData.name,
      establishment_id: employeeData.establishment_id,
      created_at: employeeData.created_at,
      expires_at: Date.now() + expiresIn,
    }

    // Establecer cookie de sesión
    const cookieValue = Buffer.from(JSON.stringify(sessionData)).toString("base64")
    cookies().set({
      name: "custom_auth_session",
      value: cookieValue,
      httpOnly: true,
      path: "/",
      secure: process.env.NODE_ENV === "production",
      maxAge: expiresIn / 1000, // Convertir a segundos
      sameSite: "lax",
    })

    console.log(`[Auth] Inicio de sesión exitoso para: ${email}`)

    // Determinar la URL de redirección según rol
    let redirectUrl = "/"
    if (employeeData.role === "guardia") {
      redirectUrl = "/scan"
    }

    return NextResponse.json({
      success: true,
      user: {
        id: employeeData.id,
        email: employeeData.email,
        role: employeeData.role,
        name: employeeData.name,
        establishment_id: employeeData.establishment_id,
      },
      redirectUrl,
    })
  } catch (error) {
    console.error("[Auth] Error en inicio de sesión:", error)
    return NextResponse.json({ error: "Error en el servidor" }, { status: 500 })
  }
}

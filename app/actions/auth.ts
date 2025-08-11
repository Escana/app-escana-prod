"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { createClient } from "@supabase/supabase-js"
import bcrypt from "bcryptjs"
import { getConfig } from "@/lib/config"

// Inicializar cliente de Supabase para acciones del servidor
const config = getConfig()
const supabase = createClient(config.supabaseUrl, config.supabaseAnonKey)

// Función para iniciar sesión
export async function login(formData: FormData) {
  try {
    const email = formData.get("email") as string
    const password = formData.get("password") as string
    const remember = formData.get("remember") === "on"

    if (!email || !password) {
      return {
        error: "Email y contraseña son requeridos",
      }
    }

    console.log(`[Auth] Intentando iniciar sesión para: ${email}`)

    // Buscar el usuario por email
    const { data: user, error: userError } = await supabase
      .from("employees")
      .select("*")
      .eq("email", email.toLowerCase())
      .single()

    if (userError || !user) {
      console.error(`[Auth] Usuario no encontrado: ${email}`, userError)
      // Usar un mensaje genérico para no revelar si el email existe
      return {
        error: "Credenciales incorrectas",
      }
    }

    // Verificar si el usuario está activo
    if (user.status !== "Activo") {
      console.error(`[Auth] Usuario inactivo: ${email}`)
      return {
        error: "Usuario inactivo. Contacte al administrador.",
      }
    }

    // Verificar la contraseña
    // Primero intentamos con bcrypt (para usuarios nuevos)
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
          console.log(`[Auth] Contraseña actualizada con hash para: ${email}`)
        }
      }
    } catch (error) {
      console.error(`[Auth] Error al verificar contraseña:`, error)
      return {
        error: "Error al verificar credenciales",
      }
    }

    if (!passwordValid) {
      console.error(`[Auth] Contraseña incorrecta para: ${email}`)
      return {
        error: "Credenciales incorrectas",
      }
    }

    // Crear sesión
    const sessionExpiry = remember ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000 // 30 días o 1 día
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

    console.log(`[Auth] Inicio de sesión exitoso para: ${email}`)

    // Redirigir a la página principal
    return { success: true }
  } catch (error) {
    console.error("[Auth] Error en login:", error)
    return {
      error: "Error al iniciar sesión. Intente nuevamente.",
    }
  }
}

// Función para cerrar sesión
export async function logout() {
  cookies().delete("custom_auth_session")
  redirect("/login")
}

// Función para restablecer contraseña
export async function resetPassword(formData: FormData) {
  try {
    const email = formData.get("email") as string
    const newPassword = formData.get("newPassword") as string
    const confirmPassword = formData.get("confirmPassword") as string

    if (!email || !newPassword || !confirmPassword) {
      return {
        error: "Todos los campos son requeridos",
      }
    }

    if (newPassword !== confirmPassword) {
      return {
        error: "Las contraseñas no coinciden",
      }
    }

    // Verificar si el usuario existe
    const { data: user, error: userError } = await supabase
      .from("employees")
      .select("id, email, status")
      .eq("email", email.toLowerCase())
      .single()

    if (userError || !user) {
      console.error(`[Auth] Usuario no encontrado para reset: ${email}`, userError)
      // Usar un mensaje genérico para no revelar si el email existe
      return {
        error: "Si el email existe, recibirá instrucciones para restablecer su contraseña",
      }
    }

    // Verificar si el usuario está activo
    if (user.status !== "Activo") {
      console.error(`[Auth] Usuario inactivo para reset: ${email}`)
      return {
        error: "Si el email existe, recibirá instrucciones para restablecer su contraseña",
      }
    }

    // Hashear la nueva contraseña
    const hashedPassword = await bcrypt.hash(newPassword, 10)

    // Actualizar la contraseña
    const { error: updateError } = await supabase
      .from("employees")
      .update({ password: hashedPassword })
      .eq("id", user.id)

    if (updateError) {
      console.error(`[Auth] Error al actualizar contraseña:`, updateError)
      return {
        error: "Error al restablecer contraseña. Intente nuevamente.",
      }
    }

    console.log(`[Auth] Contraseña restablecida para: ${email}`)

    return {
      success: true,
      message: "Contraseña restablecida exitosamente",
    }
  } catch (error) {
    console.error("[Auth] Error en resetPassword:", error)
    return {
      error: "Error al restablecer contraseña. Intente nuevamente.",
      details: error instanceof Error ? error.message : String(error),
    }
  }
}

// Función para cambiar contraseña
export async function changePassword(formData: FormData) {
  try {
    const userId = formData.get("userId") as string
    const currentPassword = formData.get("currentPassword") as string
    const newPassword = formData.get("newPassword") as string
    const confirmPassword = formData.get("confirmPassword") as string

    if (!userId || !currentPassword || !newPassword || !confirmPassword) {
      return {
        error: "Todos los campos son requeridos",
      }
    }

    if (newPassword !== confirmPassword) {
      return {
        error: "Las nuevas contraseñas no coinciden",
      }
    }

    // Verificar si el usuario existe
    const { data: user, error: userError } = await supabase
      .from("employees")
      .select("id, email, password, status")
      .eq("id", userId)
      .single()

    if (userError || !user) {
      console.error(`[Auth] Usuario no encontrado para cambio de contraseña: ${userId}`, userError)
      return {
        error: "Usuario no encontrado",
      }
    }

    // Verificar si el usuario está activo
    if (user.status !== "Activo") {
      console.error(`[Auth] Usuario inactivo para cambio de contraseña: ${userId}`)
      return {
        error: "Usuario inactivo. Contacte al administrador.",
      }
    }

    // Verificar la contraseña actual
    let passwordValid = false

    try {
      // Verificar si la contraseña está hasheada con bcrypt
      if (user.password && user.password.startsWith("$2")) {
        passwordValid = await bcrypt.compare(currentPassword, user.password)
      } else if (user.password) {
        // Para compatibilidad con contraseñas antiguas (sin hash)
        passwordValid = currentPassword === user.password
      }
    } catch (error) {
      console.error(`[Auth] Error al verificar contraseña actual:`, error)
      return {
        error: "Error al verificar contraseña actual",
      }
    }

    if (!passwordValid) {
      console.error(`[Auth] Contraseña actual incorrecta para: ${user.email}`)
      return {
        error: "Contraseña actual incorrecta",
      }
    }

    // Hashear la nueva contraseña
    const hashedPassword = await bcrypt.hash(newPassword, 10)

    // Actualizar la contraseña
    const { error: updateError } = await supabase
      .from("employees")
      .update({ password: hashedPassword })
      .eq("id", user.id)

    if (updateError) {
      console.error(`[Auth] Error al actualizar contraseña:`, updateError)
      return {
        error: "Error al cambiar contraseña. Intente nuevamente.",
      }
    }

    console.log(`[Auth] Contraseña cambiada para: ${user.email}`)

    return {
      success: true,
      message: "Contraseña cambiada exitosamente",
    }
  } catch (error) {
    console.error("[Auth] Error en changePassword:", error)
    return {
      error: "Error al cambiar contraseña. Intente nuevamente.",
      details: error instanceof Error ? error.message : String(error),
    }
  }
}


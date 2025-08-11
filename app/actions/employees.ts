"use server"

import { revalidatePath } from "next/cache"
import { supabase } from "@/lib/supabase"
import type { Employee } from "@/lib/supabase"
import { hasPermission, PERMISSIONS, ROLES, verifyUserInDatabase } from "@/lib/custom-auth"
import type { User } from "@/lib/auth-client"
import crypto from "crypto"

import { logger } from "@/lib/utils"
import { cookies } from "next/headers"
import { createServerClient } from "@supabase/ssr"
import bcrypt from "bcryptjs"
import nodemailer from "nodemailer"






const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

export async function forgotPassword(formData: FormData) {
  try {
    const email = formData.get("email") as string
    if (!email) {
      return { error: "El correo electrónico es requerido" }
    }
    console.log("[Auth] forgotPassword", { email })
    // Verificar si el usuario existe
    const { data: user, error: userError } = await supabase
      .from("employees")
      .select("id,email,status")
      .eq("email", email.toLowerCase())
      .single()

    if (userError || !user) {
      // No revelar existencia
      return { success: true }
    }
    if (user.status !== "Activo") {
      return { success: true }
    }
    console.log("[Auth] forgotPassword - user", { user })
    // Generar token y expiración (1h)
    const token = crypto.randomBytes(32).toString("hex")
    const expires = new Date(Date.now() + 1000 * 60 * 60)

    // Guardar token en DB
    await supabase
      .from("employees")
      .update({ reset_token: token, reset_token_expires: expires })
      .eq("id", user.id)
      const year = new Date().getFullYear()

      const logoUrl = "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Logo%20principal%20(1)-CsVSuWQ2PnSCq8owjvJ5fHvYdAy5XL.png"
      const resetUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/reset-password?token=${token}`

      // Enviar correo con diseño personalizado
      await transporter.sendMail({
        from: process.env.SMTP_FROM,
        to: email,
        subject: "Recupera tu contraseña",
        html: `<!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    <title>Recupera tu contraseña</title>
  </head>
  <body style="margin:0;padding:0;background-color:#f5f5f5;font-family:Arial,sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td align="center" style="padding:20px 0;">
          <img src="${logoUrl}" alt="Escana" width="200" style="display:block;" />
        </td>
      </tr>
      <tr>
        <td align="center">
          <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:8px;overflow:hidden;">
            <tr>
              <td style="padding:40px;text-align:left;color:#333333;">
                <h1 style="margin:0 0 20px;font-size:24px;color:#0D2940;">Restablece tu contraseña</h1>
                <p style="margin:0 0 20px;font-size:16px;line-height:1.5;">
                  Hemos recibido una solicitud para restablecer la contraseña de tu cuenta Escana. Haz clic en el botón de abajo para continuar:
                </p>
                <p style="text-align:center;margin:30px 0;">
                  <a href="${resetUrl}" style="background-color:#3B82F6;color:#ffffff;text-decoration:none;padding:12px 24px;border-radius:4px;display:inline-block;font-weight:bold;">
                    Restablecer Contraseña
                  </a>
                </p>
                <p style="margin:0 0 20px;font-size:14px;line-height:1.5;color:#666666;">
                  Si no solicitaste este cambio, puedes ignorar este mensaje. Este enlace expirará en 1 hora.
                </p>
                <p style="margin:0;font-size:14px;line-height:1.5;color:#666666;">
                  Equipo Escana
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
      <tr>
        <td align="center" style="padding:20px;font-size:12px;color:#999999;">
          © ${year} Escana. Todos los derechos reservados.
        </td>
      </tr>
    </table>
  </body>
  </html>`,
      })

    console.log("[Auth] forgotPassword - email sent", { email })
    return { success: true }
  } catch (err) {
    console.error("[Auth] forgotPassword error:", err)
    return { error: err instanceof Error ? err.message : String(err) }
  }
}

// Función para restablecer password usando token
export async function resetPassword(formData: FormData) {
  try {
    const token = formData.get("token") as string
    const newPassword = formData.get("newPassword") as string
    const confirmPassword = formData.get("confirmPassword") as string

    if (!token || !newPassword || !confirmPassword) {
      return { error: "Todos los campos son requeridos" }
    }
    if (newPassword !== confirmPassword) {
      return { error: "Las contraseñas no coinciden" }
    }

    // Buscar usuario por token
    const { data: user, error: tokenError } = await supabase
      .from("employees")
      .select("id,email, reset_token_expires, status")
      .eq("reset_token", token)
      .single()

    if (tokenError || !user) {
      return { error: "Token inválido o expirado" }
    }
    // Verificar expiración
    if (new Date() > new Date(user.reset_token_expires)) {
      return { error: "El enlace ha expirado" }
    }
    if (user.status !== "Activo") {
      return { error: "Usuario inactivo" }
    }
    console.log("Imprimendo user" ,user)
    // Hashear password
    const hashed = await bcrypt.hash(newPassword, 10)
    await supabase
      .from("employees")
      .update({ password: hashed, reset_token: null, reset_token_expires: null })
      .eq("id", user.id)
 // Preparar datos para el email de confirmación
 const logoUrl = "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Logo%20principal%20(1)-CsVSuWQ2PnSCq8owjvJ5fHvYdAy5XL.png"
 const year = new Date().getFullYear()

 // Enviar correo de confirmación con diseño de Escana
 await transporter.sendMail({
   from: process.env.SMTP_FROM,
   to: user.email,
   subject: "Contraseña Actualizada",
   html: `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>Contraseña Actualizada</title>
</head>
<body style="margin:0;padding:0;background-color:#f5f5f5;font-family:Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0">
 <tr>
   <td align="center" style="padding:20px 0;">
     <img src="${logoUrl}" alt="Escana" width="200" style="display:block;" />
   </td>
 </tr>
 <tr>
   <td align="center">
     <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:8px;overflow:hidden;">
       <tr>
         <td style="padding:40px;text-align:left;color:#333333;">
           <h1 style="margin:0 0 20px;font-size:24px;color:#0D2940;">Contraseña Actualizada</h1>
           <p style="margin:0 0 20px;font-size:16px;line-height:1.5;">
             Tu contraseña se ha cambiado correctamente. Ya puedes iniciar sesión con tu nueva contraseña.
           </p>
           <p style="text-align:center;margin:30px 0;">
             <a href="${process.env.NEXT_PUBLIC_SITE_URL}/login" style="background-color:#3B82F6;color:#ffffff;text-decoration:none;padding:12px 24px;border-radius:4px;display:inline-block;font-weight:bold;">
               Iniciar Sesión
             </a>
           </p>
           <p style="margin:0;font-size:14px;line-height:1.5;color:#666666;">
             Si no reconoces esta acción, contacta al administrador inmediatamente.
           </p>
           <p style="margin:0;font-size:14px;line-height:1.5;color:#666666;">
             Equipo Escana
           </p>
         </td>
       </tr>
     </table>
   </td>
 </tr>
 <tr>
   <td align="center" style="padding:20px;font-size:12px;color:#999999;">
     © ${year} Escana. Todos los derechos reservados.
   </td>
 </tr>
</table>
</body>
</html>`
 })

 return { success: true, message: "Contraseña restablecida exitosamente" }
} catch (err) {
 console.error("[Auth] resetPassword error:", err)
 return { error: err instanceof Error ? err.message : String(err) }
}
}


// Función para verificar y obtener el usuario actual
async function getAuthenticatedUser(userInfo: any): Promise<User | null> {
  try {
    logger.info("Verificando usuario", {
      id: userInfo?.id,
      email: userInfo?.email,
      role: userInfo?.role,
    })

    if (!userInfo || !userInfo.id) {
      logger.error("Información de usuario no proporcionada o incompleta")
      return null
    }

    // Si el usuario ya tiene toda la información necesaria, lo usamos directamente
    if (userInfo.id && userInfo.email && userInfo.role) {
      logger.info("Usuario ya autenticado con información completa", {
        id: userInfo.id,
        email: userInfo.email,
        role: userInfo.role,
      })
      return userInfo as User
    }

    // Verificar que el usuario existe en la base de datos
    const verifiedUser = await verifyUserInDatabase(userInfo.id)

    if (!verifiedUser) {
      logger.error("Usuario no verificado en la base de datos")
      return null
    }

    logger.info("Usuario autenticado desde la base de datos", {
      id: verifiedUser.id,
      email: verifiedUser.email,
      role: verifiedUser.role,
    })
    return verifiedUser
  } catch (error) {
    logger.error("Error al autenticar usuario", { error })
    return null
  }
}

// Función para generar un hash de contraseña seguro usando bcrypt
async function generatePasswordHash(password: string): Promise<{ hash: string }> {
  const salt = await bcrypt.genSalt(10)
  const hash = await bcrypt.hash(password, salt)
  return { hash }
}

// Función para generar una contraseña aleatoria
function generateRandomPassword(length = 10): string {
  const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+"
  const randomValues = new Uint8Array(length)
  crypto.getRandomValues(randomValues)

  let password = ""
  for (let i = 0; i < length; i++) {
    const randomIndex = randomValues[i] % charset.length
    password += charset[randomIndex]
  }
  return password
}

// Obtener todos los empleados
export async function getEmployees(currentUser?: any) {
  try {
    logger.info("Obteniendo empleados...")

    // Si no hay usuario actual, devolver una lista vacía
    if (!currentUser) {
      logger.warn("No hay usuario actual, devolviendo lista vacía")
      return []
    }

    let query = supabase.from("employees").select(`
        id, 
        name, 
        email, 
        role, 
        establishment_id, 
        created_at, 
        updated_at, 
        status
      `)

    // Si el usuario no es superadmin, filtrar por establishment_id
    if (currentUser.role !== "superadmin" && currentUser.establishment_id) {
      query = query.eq("establishment_id", currentUser.establishment_id)
    }

    // Ordenar por fecha de creación
    query = query.order("created_at", { ascending: false })

    const { data: employees, error } = await query

    if (error) {
      logger.error("Error al obtener empleados:", { error: error.message })
      return []
    }

    logger.info("Empleados obtenidos exitosamente", {
      count: employees?.length || 0,
    })

    return employees || []
  } catch (error) {
    logger.error("Error en getEmployees", {
      error: error.message,
    })
    return []
  }
}

// Crear un nuevo empleado
export async function addEmployee({
  name,
  email,
  role,
  status,
  establishment_id,
  password,
  userInfo,
}: {
  name: string
  email: string
  role: Employee["role"]
  status: Employee["status"]
  establishment_id?: string
  password?: string
  userInfo: { id: string; role: string; establishment_id?: string }
}) {
  try {
    logger.info("Añadiendo empleado...", { name, email, role, status, establishment_id })

    // Usar el usuario actual pasado como parámetro
    const currentUser = userInfo

    if (!currentUser || !currentUser.id) {
      logger.error("No autorizado - Usuario no autenticado")
      throw new Error("No autorizado")
    }

    // Verificar permisos según rol para crear empleados
   
    

    // Definir el establishment_id final en función del rol
    let finalEstablishmentId = establishment_id
    if (role !== "superadmin" && currentUser.role !== "superadmin") {
      console.log('entramos a agregar como usuario admin')
      // Los usuarios que no son superadmin solo pueden crear empleados para su propio establecimiento
      finalEstablishmentId = currentUser.establishment_id
    }

    // SOLUCIÓN TEMPORAL: Si el ID es numérico, intentar buscar el UUID correspondiente
    if (finalEstablishmentId && !isNaN(Number(finalEstablishmentId))) {
      logger.warn("Detectado ID numérico para establecimiento, intentando convertir a UUID", {
        numeric_id: finalEstablishmentId,
      })

      try {
        const { data, error } = await supabase
          .from("temp_establishment_id_map")
          .select("new_id")
          .eq("old_id", finalEstablishmentId)
          .single()

        if (error || !data) {
          logger.error("No se pudo encontrar el UUID correspondiente", { error })
          throw new Error("ID de establecimiento inválido - no se pudo convertir a UUID")
        }

        finalEstablishmentId = data.new_id
        logger.info("ID numérico convertido exitosamente a UUID", {
          numeric_id: establishment_id,
          uuid: finalEstablishmentId,
        })
      } catch (mapError: any) {
        logger.warn("Tabla de mapeo no encontrada, buscando establecimiento directamente", { error: mapError })

        const { data, error } = await supabase.from("establishments").select("id").limit(1)
        if (error || !data || data.length === 0) {
          logger.error("No se pudo encontrar ningún establecimiento", { error })
          throw new Error("No se pudo encontrar un establecimiento válido")
        }
        finalEstablishmentId = data[0].id
        logger.info("Usando el primer establecimiento disponible", { uuid: finalEstablishmentId })
      }
    }

    // Verificar que el establecimiento existe (si se proporciona un ID)
    if (finalEstablishmentId) {
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
      if (!uuidRegex.test(finalEstablishmentId)) {
        logger.error("Formato de UUID inválido para establishment_id", { establishment_id: finalEstablishmentId })
        throw new Error("Formato de UUID inválido para establishment_id")
      }
      const { data: establishment, error: estError } = await supabase
        .from("establishments")
        .select("id")
        .eq("id", finalEstablishmentId)
        .single()
      if (estError || !establishment) {
        logger.error("El establecimiento especificado no existe", { error: estError })
        throw new Error("El establecimiento especificado no existe")
      }
    }

    // Verificar si el email ya existe
    const { data: existingUser } = await supabase
      .from("employees")
      .select("id")
      .eq("email", email)
      .single()
    if (existingUser) {
      logger.error("El email ya está registrado", { email })
      throw new Error("El email ya está registrado")
    }

    // Usar la contraseña enviada o generar una aleatoria si no se proporciona
    const finalPassword = password && password.trim() ? password : generateRandomPassword()
    // Generar el hash de la contraseña usando bcrypt
    const { hash } = await generatePasswordHash(finalPassword)

    logger.info("Creando empleado con establishment_id", { establishment_id: finalEstablishmentId || "null" })

    // Inserción en la base de datos, usando la columna "password"
    const { data, error } = await supabase
      .from("employees")
      .insert([
        {
          name,
          email,
          role,
          status,
          establishment_id: finalEstablishmentId,
          created_by: currentUser.id,
          password: hash,
        },
      ])
      .select()

    if (error) {
      logger.error("Error adding employee", { error })
      throw new Error(`Error adding employee: ${error.message}`)
    }

    logger.info("Empleado añadido correctamente", { id: data[0].id, email })

    // Retornamos el empleado creado junto con la contraseña utilizada (en texto plano)
    const employeeWithPassword = {
      ...data[0],
      generated_password: finalPassword,
    }

    return employeeWithPassword
  } catch (error: any) {
    logger.error("Error in addEmployee", { error })
    throw error
  }
}

export async function updateEmployee(
  id: string,
  {
    name,
    email,
    role,
    status,
    establishment_id,
    password, // campo opcional para actualizar la contraseña
    userInfo,
  }: {
    name: string
    email: string
    role: Employee["role"]
    status: Employee["status"]
    establishment_id?: string
    password?: string
    userInfo: any
  },
) {
  try {
    console.log("[Server] Actualizando empleado...")
    console.log(userInfo)
    // Autenticar al usuario
    const currentUser = await getAuthenticatedUser(userInfo)

    if (!currentUser) {
      console.error("[Server] No autorizado - Usuario no autenticado")
      throw new Error("No autorizado")
    }

    // Obtener el empleado a actualizar
    const { data: employee, error: fetchError } = await supabase
      .from("employees")
      .select("*")
      .eq("id", id)
      .single()

    if (fetchError || !employee) {
      console.error("[Server] Empleado no encontrado:", fetchError)
      throw new Error("Empleado no encontrado")
    }

    // Verificar permisos según rol
    if (currentUser.role !== "superadmin") {
      // Los administradores solo pueden actualizar empleados de su establecimiento
      if (currentUser.role === "admin" && employee.establishment_id !== currentUser.establishment_id) {
        console.error("[Server] No puede editar empleados de otro establecimiento")
        throw new Error("No puede editar empleados de otro establecimiento")
      }
      
      // Si se envía establishment_id, debe coincidir con el del usuario (no se permite modificar)
      if (currentUser.role !== "superadmin" && establishment_id && establishment_id !== currentUser.establishment_id) {
        console.log(currentUser.role)
        console.error("[Server] No puede cambiar el establecimiento")
        throw new Error("No puede cambiar el establecimiento")
      }
    }

    // Si el usuario es superadmin, se respeta el establishment_id enviado desde el front;
    // de lo contrario, se utiliza el del usuario autenticado.

    console.log(establishment_id,currentUser.role ,"superadmin" )
    const finalEstablishmentId =
      currentUser.role === "superadmin" ? establishment_id : currentUser.establishment_id
console.log(currentUser.establishment_id,finalEstablishmentId)
    console.log(`[Server] Actualizando empleado con establishment_id: ${finalEstablishmentId || "null"}`)

    // Construir el objeto con los datos a actualizar
    const updateData: any = {
      name,
      email,
      role,
      status,
      establishment_id: finalEstablishmentId,
    }
console.log(updateData)
    // Si se envía una nueva contraseña, generar su hash usando bcrypt y agregarla a los datos a actualizar
    if (password && password.trim()) {
      const { hash } = await generatePasswordHash(password)
      updateData.password = hash
    }

    const { error } = await supabase
      .from("employees")
      .update(updateData)
      .eq("id", id)

    if (error) {
      console.error("[Server] Error updating employee:", error)
      throw new Error("Error updating employee")
    }

    console.log("[Server] Empleado actualizado correctamente")
    revalidatePath("/employees")
  } catch (error) {
    console.error("[Server] Error in updateEmployee:", error)
    throw error
  }
}
export async function deleteEmployee(id: string, userInfo: any) {
  try {
    console.log("[Server] Eliminando empleado...")

    // Autenticar al usuario
    const currentUser = await getAuthenticatedUser(userInfo)

    if (!currentUser) {
      console.error("[Server] No autorizado - Usuario no autenticado")
      throw new Error("No autorizado")
    }

    // Obtener el empleado a eliminar
    const { data: employee, error: fetchError } = await supabase
      .from("employees")
      .select("*")
      .eq("id", id)
      .single()

    if (fetchError || !employee) {
      console.error("[Server] Empleado no encontrado:", fetchError)
      throw new Error("Empleado no encontrado")
    }

    // Verificar que el usuario tenga permiso para eliminar este empleado
    if (currentUser.role !== "superadmin") {
      // Los administradores solo pueden eliminar empleados de su establecimiento
      if (currentUser.role === "admin" && employee.establishment_id !== currentUser.establishment_id) {
        console.error("[Server] No puede eliminar empleados de otro establecimiento")
        throw new Error("No puede eliminar empleados de otro establecimiento")
      }

      // No se permite eliminar administradores si no es superadmin
      if (employee.role === "admin" && currentUser.role !== "superadmin") {
        console.error("[Server] No tiene permisos para eliminar administradores")
        throw new Error("No tiene permisos para eliminar administradores")
      }

      // No se permite eliminarse a sí mismo
      if (employee.id === currentUser.id) {
        console.error("[Server] No puede eliminarse a sí mismo")
        throw new Error("No puede eliminarse a sí mismo")
      }
    }

    console.log(`[Server] Eliminando empleado con ID: ${id}`)

    const { error } = await supabase.from("employees").delete().eq("id", id)

    if (error) {
      console.error("[Server] Error deleting employee:", error)
      throw new Error("Error deleting employee")
    }

    console.log("[Server] Empleado eliminado correctamente")
    revalidatePath("/employees")
  } catch (error) {
    console.error("[Server] Error in deleteEmployee:", error)
    throw error
  }
}

export async function getEstablishments(userInfo: any) {
  try {
    console.log("[Server] Obteniendo establecimientos...")

    // Autenticar al usuario
    const currentUser = await getAuthenticatedUser(userInfo)

    if (!currentUser) {
      console.error("[Server] No autorizado - Usuario no autenticado")
      throw new Error("No autorizado")
    }

    let query = supabase.from("establishments").select("*")

    // Filtrar según el rol
    if (currentUser.role !== "superadmin") {
      console.log(`[Server] Usuario no es superadmin, filtrando por establishment_id: ${currentUser.establishment_id}`)
      query = query.eq("id", currentUser.establishment_id)
    } else {
      console.log("[Server] Usuario es superadmin, mostrando todos los establecimientos")
    }

    const { data, error } = await query.order("name", { ascending: true })

    if (error) {
      console.error("[Server] Error fetching establishments:", error)
      throw new Error("Error fetching establishments")
    }

    console.log(`[Server] Establecimientos obtenidos: ${data?.length || 0}`)
    return data
  } catch (error) {
    console.error("[Server] Error in getEstablishments:", error)
    throw error
  }
}

export async function addEstablishment({
  name,
  address,
  city,
  country,
  userInfo,
}: {
  name: string
  address: string
  city: string
  country: string
  userInfo: any
}) {
  try {
    console.log("[Server] Iniciando creación de establecimiento:", { name, address, city, country })

    // Autenticar al usuario
    const currentUser = await getAuthenticatedUser(userInfo)

    if (!currentUser) {
      console.error("[Server] No autorizado - Usuario no autenticado")
      throw new Error("No autorizado")
    }

    if (!hasPermission(currentUser, PERMISSIONS.MANAGE_ESTABLISHMENTS)) {
      console.error("[Server] Usuario sin permisos para gestionar establecimientos")
      throw new Error("No tiene permisos para gestionar establecimientos")
    }

    console.log("[Server] Insertando establecimiento en la base de datos")
    const { data, error } = await supabase
      .from("establishments")
      .insert([
        {
          name,
          address,
          city,
          country,
          created_by: currentUser.id,
        },
      ])
      .select()

    if (error) {
      logger.error("[Server] Error al añadir establecimiento:", error)
      throw new Error(`Error al añadir establecimiento: ${error.message}`)
    }

    console.log("[Server] Establecimiento creado correctamente:", data?.[0]?.id)
    revalidatePath("/employees")
    return data?.[0]
  } catch (error) {
    console.error("[Server] Error en addEstablishment:", error)
    throw error
  }
}

export async function updateEstablishment(
  id: string,
  {
    name,
    address,
    city,
    country,
    userInfo,
  }: {
    name: string
    address: string
    city: string
    country: string
    userInfo: any
  },
) {
  try {
    console.log("[Server] Actualizando establecimiento...")

    // Autenticar al usuario
    const currentUser = await getAuthenticatedUser(userInfo)

    if (!currentUser || !hasPermission(currentUser, PERMISSIONS.MANAGE_ESTABLISHMENTS)) {
      console.error("[Server] No autorizado - No tiene permisos para gestionar establecimientos")
      throw new Error("No autorizado")
    }

    console.log(`[Server] Actualizando establecimiento con ID: ${id}`)

    const { error } = await supabase
      .from("establishments")
      .update({
        name,
        address,
        city,
        country,
      })
      .eq("id", id)

    if (error) {
      console.error("[Server] Error updating establishment:", error)
      throw new Error("Error updating establishment")
    }

    console.log("[Server] Establecimiento actualizado correctamente")
    revalidatePath("/employees")
  } catch (error) {
    console.error("[Server] Error in updateEstablishment:", error)
    throw error
  }
}

export async function deleteEstablishment(id: string, userInfo: any) {
  try {
    console.log("[Server] Eliminando establecimiento...")

    // Autenticar al usuario
    const currentUser = await getAuthenticatedUser(userInfo)

    if (!currentUser || !hasPermission(currentUser, PERMISSIONS.MANAGE_ESTABLISHMENTS)) {
      console.error("[Server] No autorizado - No tiene permisos para gestionar establecimientos")
      throw new Error("No autorizado")
    }

    // Verificar si hay empleados asignados a este establecimiento
    const { data: employees, error: countError } = await supabase
      .from("employees")
      .select("id")
      .eq("establishment_id", id)

    if (countError) {
      console.error("[Server] Error checking employees:", countError)
      throw new Error("Error checking employees")
    }

    if (employees && employees.length > 0) {
      console.error("[Server] No se puede eliminar un establecimiento con empleados asignados")
      throw new Error("No se puede eliminar un establecimiento con empleados asignados")
    }

    console.log(`[Server] Eliminando establecimiento con ID: ${id}`)

    const { error } = await supabase.from("establishments").delete().eq("id", id)

    if (error) {
      console.error("[Server] Error deleting establishment:", error)
      throw new Error("Error deleting establishment")
    }

    console.log("[Server] Establecimiento eliminado correctamente")
    revalidatePath("/employees")
  } catch (error) {
    console.error("[Server] Error in deleteEstablishment:", error)
    throw error
  }
}


/**
 * Obtiene un empleado (o usuario) por su email.
 * @param email - El correo electrónico del empleado.
 * @returns El objeto con los datos completos del empleado.
 */
export async function getByEmail(email: string) {
  try {
    logger.info("[Server] Buscando usuario por email", { email })

    const { data, error } = await supabase
      .from("employees")
      .select("*")
      .eq("email", email)
      .single()

    if (error) {
      logger.error("[Server] Error al obtener usuario por email", { error })
      throw new Error("Error al obtener usuario por email")
    }

    logger.info("[Server] Usuario obtenido correctamente", { data })
    return data
  } catch (error) {
    logger.error("[Server] Error en getByEmail", { error })
    throw error
  }
}
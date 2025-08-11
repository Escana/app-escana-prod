import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { createServerClient } from "@supabase/ssr"

export async function GET() {
  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookies().get(name)?.value
          },
        },
      },
    )

    // Verificar la sesión actual
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession()

    // Obtener todos los empleados para depuración
    const { data: employees, error: employeesError } = await supabase
      .from("employees")
      .select("id, email, role, password, name, last_login")
      .order("email")

    // Verificar cookies
    const allCookies = cookies().getAll()
    const authCookies = allCookies.filter(
      (cookie) => cookie.name.includes("supabase") || cookie.name.includes("auth") || cookie.name.includes("session"),
    )

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      session: session
        ? {
            id: session.user.id,
            email: session.user.email,
            role: session.user.user_metadata?.role,
            expires_at: session.expires_at,
          }
        : null,
      sessionError: sessionError
        ? {
            message: sessionError.message,
            status: sessionError.status,
          }
        : null,
      employees: employees
        ? employees.map((emp) => ({
            id: emp.id,
            email: emp.email,
            role: emp.role,
            hasPassword: !!emp.password,
            passwordLength: emp.password ? emp.password.length : 0,
            name: emp.name,
            lastLogin: emp.last_login,
          }))
        : null,
      employeesError: employeesError
        ? {
            message: employeesError.message,
            code: employeesError.code,
          }
        : null,
      cookies: {
        count: authCookies.length,
        items: authCookies.map((c) => ({
          name: c.name,
          value: c.value ? `${c.value.substring(0, 10)}...` : null,
          expires: c.expires,
        })),
      },
    })
  } catch (error) {
    console.error("Error en debug-auth:", error)
    return NextResponse.json(
      {
        error: "Error interno del servidor",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}


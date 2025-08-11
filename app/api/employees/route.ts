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

    // Obtener todos los empleados
    const { data: employees, error: employeesError } = await supabase
      .from("employees")
      .select("id, email, role, password, name")
      .order("email")

    if (employeesError) {
      return NextResponse.json(
        {
          error: "Error al obtener empleados",
          details: employeesError.message,
        },
        { status: 500 },
      )
    }

    return NextResponse.json({
      employees: employees || [],
    })
  } catch (error) {
    console.error("Error en /api/employees:", error)
    return NextResponse.json(
      {
        error: "Error interno del servidor",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}


import { cookies } from "next/headers"
import { createServerClient } from "@supabase/ssr"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  const { action } = await request.json()

  const cookieStore = cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          cookieStore.set({ name, value, ...options })
        },
        remove(name: string, options: any) {
          cookieStore.set({ name, value: "", ...options })
        },
      },
    },
  )

  if (action === "logout") {
    // Cerrar sesión en Supabase
    await supabase.auth.signOut()
    // Eliminar cookie de usuario
    cookieStore.set({ name: "user", value: "", path: "/" })

    return NextResponse.json({ success: true })
  }

  return NextResponse.json({ error: "Acción no válida" }, { status: 400 })
}


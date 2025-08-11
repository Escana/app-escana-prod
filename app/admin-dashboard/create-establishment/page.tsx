import type { Metadata } from "next"
import { cookies } from "next/headers"
import { createServerClient } from "@supabase/ssr"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ROLES } from "@/lib/auth-client"

export const metadata: Metadata = {
  title: "Crear Establecimiento | Panel de Administración",
  description: "Crea un nuevo establecimiento en la plataforma",
}

export default async function CreateEstablishmentPage() {
  // Crear cliente de Supabase con cookies para obtener la sesión actual
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

  // Obtener la sesión actual
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Si no hay sesión, mostrar un mensaje en lugar de redirigir
  if (!session || !session.user) {
    return (
      <div className="flex flex-col min-h-screen items-center justify-center">
        <Card className="w-full max-w-md p-6">
          <CardHeader>
            <CardTitle>Acceso no autorizado</CardTitle>
            <CardDescription>Debe iniciar sesión para acceder a esta página.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/login">Iniciar sesión</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Obtener información del usuario actual
  const { data: userData, error: userError } = await supabase
    .from("employees")
    .select("id, role, name, email, establishment_id")
    .eq("id", session.user.id)
    .single()

  // Si hay un error o no hay datos, mostrar un mensaje en lugar de redirigir
  if (userError || !userData) {
    console.error("Error al obtener datos del usuario:", userError)
    return (
      <div className="flex flex-col min-h-screen items-center justify-center">
        <Card className="w-full max-w-md p-6">
          <CardHeader>
            <CardTitle>Error de autenticación</CardTitle>
            <CardDescription>No se pudo obtener la información del usuario.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/login">Iniciar sesión</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Verificar si el usuario tiene permisos para crear establecimientos
  if (userData.role !== ROLES.SUPERADMIN && userData.role !== ROLES.ADMIN) {
    return (
      <div className="flex flex-col min-h-screen items-center justify-center">
        <Card className="w-full max-w-md p-6">
          <CardHeader>
            <CardTitle>Acceso denegado</CardTitle>
            <CardDescription>No tiene permisos para crear establecimientos.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/admin-dashboard">Volver al dashboard</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Crear Nuevo Establecimiento</CardTitle>
          <CardDescription>Complete el formulario para crear un nuevo establecimiento.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-10">
            <p className="text-muted-foreground mb-4">
              Esta funcionalidad está en desarrollo. Por favor, vuelva más tarde.
            </p>
            <Button asChild>
              <Link href="/admin-dashboard">Volver al dashboard</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}


"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { useAuth } from "@/lib/auth-client"
import { ROLES } from "@/lib/auth-client"

export function Nav() {
  const pathname = usePathname()
  const { user, loading, signOut } = useAuth()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted || loading) {
    console.log("Nav - Usuario cargando, no mostrando elementos")
    return null
  }

  if (!user) {
    return (
      <nav className="flex items-center space-x-4 lg:space-x-6">
        <Link
          href="/login"
          className={cn(
            "text-sm font-medium transition-colors hover:text-primary",
            pathname === "/login" ? "text-primary" : "text-muted-foreground",
          )}
        >
          Iniciar sesión
        </Link>
      </nav>
    )
  }

  // Log para depuración
  console.log(
    `Nav - Usuario con rol ${user.role}, mostrando menú completo${user.role === ROLES.SUPERADMIN ? " con panel de administración" : ""}`,
  )

  return (
    <nav className="flex items-center space-x-4 lg:space-x-6">
      <Link
        href="/"
        className={cn(
          "text-sm font-medium transition-colors hover:text-primary",
          pathname === "/" ? "text-primary" : "text-muted-foreground",
        )}
      >
        Inicio
      </Link>
      <Link
        href="/scanner"
        className={cn(
          "text-sm font-medium transition-colors hover:text-primary",
          pathname === "/scanner" ? "text-primary" : "text-muted-foreground",
        )}
      >
        Escáner
      </Link>
      <Link
        href="/guests"
        className={cn(
          "text-sm font-medium transition-colors hover:text-primary",
          pathname === "/guests" ? "text-primary" : "text-muted-foreground",
        )}
      >
        Invitados
      </Link>
      <Link
        href="/incidents"
        className={cn(
          "text-sm font-medium transition-colors hover:text-primary",
          pathname === "/incidents" ? "text-primary" : "text-muted-foreground",
        )}
      >
        Incidentes
      </Link>
      <Link
        href="/statistics"
        className={cn(
          "text-sm font-medium transition-colors hover:text-primary",
          pathname === "/statistics" ? "text-primary" : "text-muted-foreground",
        )}
      >
        Estadísticas
      </Link>
      {user.role === ROLES.SUPERADMIN && (
        <Link
          href="/admin-dashboard"
          className={cn(
            "text-sm font-medium transition-colors hover:text-primary",
            pathname === "/admin-dashboard" ? "text-primary" : "text-muted-foreground",
          )}
        >
          Administración
        </Link>
      )}
    </nav>
  )
}


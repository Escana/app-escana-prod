"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-client"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ROLES } from "@/lib/auth-client"

export function UserNav() {
  const { user, loading, signOut } = useAuth()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted || loading) {
    console.log("UserNav - Usuario cargando, no mostrando elementos")
    return null
  }

  if (!user) {
    return (
      <Button variant="outline" onClick={() => router.push("/login")}>
        Iniciar sesión
      </Button>
    )
  }

  // Log para depuración
  console.log(
    `UserNav - Usuario con rol ${user.role}, mostrando menú completo${user.role === ROLES.SUPERADMIN ? " con panel de administración" : ""}`,
  )

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${user.name}`} alt={user.name} />
            <AvatarFallback>{user.name.substring(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user.name}</p>
            <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link href="/profile">Perfil</Link>
          </DropdownMenuItem>
          {user.role === ROLES.SUPERADMIN && (
            <DropdownMenuItem asChild>
              <Link href="/admin-dashboard">Panel de Administración</Link>
            </DropdownMenuItem>
          )}
          <DropdownMenuItem asChild>
            <Link href="/settings">Configuración</Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => {
            signOut().then(() => router.push("/login"))
          }}
          className="text-red-600 cursor-pointer"
        >
          Cerrar sesión
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}


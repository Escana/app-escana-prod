"use client"

import Link from "next/link"
import {
  Camera,
  ClipboardList,
  Crown,
  BarChart3,
  AlertCircle,
  Ban,
  Settings,
  User,
  LayoutDashboard,
} from "lucide-react"
import { getCurrentUser, ROLES, logout } from "@/lib/auth-client"
import { useEffect, useState } from "react"
import { Poppins } from "next/font/google"
import type { User as UserType } from "@/lib/auth-client"
import { useRouter } from "next/navigation"

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
})

export default function HomePage() {
  const [currentUser, setCurrentUser] = useState<UserType | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [authError, setAuthError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    async function loadUser() {
      try {
        setIsLoading(true)
        const user = await getCurrentUser()
        console.log("Usuario cargado:", user)

        if (!user) {
          console.log("No hay usuario autenticado, redirigiendo a login")
          setAuthError("No se encontró una sesión activa")
          // Redirigir a login después de un breve retraso
          setTimeout(() => {
            router.push("/login")
          }, 2000)
          return
        }

        // Verificar que el usuario tiene un rol válido
        if (!user.role || !Object.values(ROLES).includes(user.role as any)) {
          console.error("Usuario sin rol válido:", user)
          setAuthError("El usuario no tiene un rol válido")
          // Cerrar sesión y redirigir a login
          setTimeout(async () => {
            await logout()
          }, 2000)
          return
        }

        console.log("Rol del usuario:", user.role)
        setCurrentUser(user)
      } catch (error) {
        console.error("Error loading user:", error)
        setAuthError("Error al cargar la información del usuario")
        // Redirigir a login después de un breve retraso
        setTimeout(() => {
          router.push("/login")
        }, 2000)
      } finally {
        setIsLoading(false)
      }
    }
    loadUser()
  }, [router])

  // Define navigation items based on user role
  const getNavItems = () => {
    // Items para rol guardia
    const guardiaItems = [
      { icon: Camera, label: "Escanear", href: "/scan", functional: true },
      { icon: ClipboardList, label: "Clientes", href: "/clients", functional: true },
      { icon: Crown, label: "Listas de invitados", href: "/guests", functional: true },
      { icon: Ban, label: "Baneados", href: "/clients?filter=banned", functional: true },
      { icon: AlertCircle, label: "Incidentes", href: "/incidents", functional: true },
    ]

    // Items adicionales para admin y superadmin
    const adminItems = [
      ...guardiaItems,
      { icon: BarChart3, label: "Estadísticas", href: "/stats", functional: true },
      //{ icon: Settings, label: "Configuración", href: "/settings", functional: true },
      { icon: User, label: "Perfil", href: "/admin-profile", functional: true },
    ]

    // Items exclusivos para superadmin
    const superAdminItems = [
      ...adminItems,
      { icon: LayoutDashboard, label: "Panel de Administración", href: "/admin-dashboard", functional: true },
    ]

    // Si no hay usuario o está cargando, mostrar elementos de guardia por defecto
    if (isLoading || !currentUser) {
      console.log("Usuario no cargado o cargando, mostrando menú de guardia por defecto")
      return guardiaItems
    }

    // Retornar elementos según el rol de forma explícita
    if (currentUser.role === ROLES.GUARDIA) {
      console.log("Usuario con rol GUARDIA, mostrando menú de guardia")
      return guardiaItems
    } else if (currentUser.role === ROLES.ADMIN) {
      console.log("Usuario con rol ADMIN, mostrando menú de admin")
      return adminItems
    } else if (currentUser.role === ROLES.SUPERADMIN) {
      console.log("Usuario con rol SUPERADMIN, mostrando menú completo")
      return superAdminItems
    } else {
      console.log("Rol no reconocido:", currentUser.role, "mostrando menú de guardia por defecto")
      return guardiaItems
    }
  }

  const menuItems = getNavItems()

  if (isLoading) {
    return (
      <div
        className={`min-h-[calc(100vh-theme(spacing.16))] p-4 sm:p-8 flex items-center justify-center ${poppins.className}`}
      >
        <div className="text-white text-xl">Cargando...</div>
      </div>
    )
  }

  if (authError) {
    return (
      <div
        className={`min-h-[calc(100vh-theme(spacing.16))] p-4 sm:p-8 flex flex-col items-center justify-center ${poppins.className}`}
      >
        <div className="text-red-500 text-xl mb-4">{authError}</div>
        <div className="text-white text-lg">Redirigiendo a la página de inicio de sesión...</div>
      </div>
    )
  }

  return (
    <div className={`min-h-[calc(100vh-theme(spacing.16))] p-4 sm:p-8 ${poppins.className}`}>
      <h1 className="text-3xl font-bold text-white mb-8 text-center">
        {currentUser?.role === ROLES.GUARDIA ? "Panel de Guardia" : "Panel de Administrador"}
      </h1>

      {currentUser?.role === ROLES.SUPERADMIN && (
        <div className="flex flex-col sm:flex-row justify-center gap-4 mb-8">
          <Link
            href="/admin-dashboard"
            className="bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white font-bold py-3 px-6 rounded-lg shadow-lg flex items-center gap-2 transition-all hover:scale-105"
          >
            <LayoutDashboard className="w-5 h-5" />
            Acceder al Panel de SuperAdmin
          </Link>

          <Link
            href="/admin-profile"
            className="bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900 text-white font-bold py-3 px-6 rounded-lg shadow-lg flex items-center justify-center gap-2 transition-all hover:scale-105"
          >
            <User className="w-5 h-5" />
            Perfil de Administrador
          </Link>

          <Link
            href="/guard-profile"
            className="bg-gradient-to-r from-green-600 to-green-800 hover:from-green-700 hover:to-green-900 text-white font-bold py-3 px-6 rounded-lg shadow-lg flex items-center justify-center gap-2 transition-all hover:scale-105"
          >
            <User className="w-5 h-5" />
            Perfil de Guardia
          </Link>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 max-w-6xl mx-auto">
        {menuItems.map((item, i) => (
          <Link
            key={i}
            href={item.functional ? item.href : "#"}
            className={`bg-secondary rounded-[20px] p-4 sm:p-6 flex flex-col items-center justify-center gap-2 sm:gap-4 ${
              !item.functional ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            <div className="bg-white/20 p-3 sm:p-5 rounded-full w-16 h-16 sm:w-24 sm:h-24 flex items-center justify-center">
              <item.icon className="w-8 h-8 sm:w-12 sm:h-12 text-white" />
            </div>
            <span className="text-white text-center text-sm sm:text-base font-poppins">{item.label}</span>
          </Link>
        ))}
      </div>
    </div>
  )
}


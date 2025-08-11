"use client"

import Link from "next/link"
import { Poppins } from "next/font/google"
import { useRouter, usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Camera, BarChart3, AlertCircle, ClipboardList, Crown, Ban, LayoutDashboard } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu"
import { LogOut, User, Settings, HelpCircle, BookOpen } from "lucide-react"
import { useState, useContext } from "react"
import { AppContext } from "./status-bar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useSession, logout, ROLES } from "@/lib/auth-client"

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
})

const Logo = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 860.17 300" className="h-14 w-auto" fill="currentColor">
    <g>
      <path d="M523.08,130.83a.32.32,0,0,0,0-.09c-.61-1.49-1.29-3-2-4.39a46.56,46.56,0,0,0-11-14c-.32-.29-.65-.55-1-.83s-1-.77-1.5-1.15q-12.09-8.88-29.22-9-17.16.12-29.23,9c-.28.21-.57.43-.84.65s-.54.41-.81.63-.77.63-1.14,1a2.32,2.32,0,0,0-.25.21,46.52,46.52,0,0,0-10.49,13.55,48.36,48.36,0,0,0-2,4.39.16.16,0,0,0,0,.09,58.59,58.59,0,0,0-.56,40.68s0,.05,0,.07a53.67,53.67,0,0,0,2.59,5.87,46.25,46.25,0,0,0,10.24,13.4l.84.74c.31.27.63.54,0.95.79.49.4,1,.78,1.5,1.15q12.08,8.9,29.23,9,17.13-.1,29.22-9c.51-.37,1-.75,1.5-1.15a6.63,6.63,0,0,0,.66-.55c.23-.18.45-.37.67-.56.66-.58,1.31-1.19,1.94-1.81V201H527V151.07c0-.22,0-.44,0-.66A55.3,55.3,0,0,0,523.08,130.83Zm-10.83,22.85a40.17,40.17,0,0,1-4.28,16.8,33.07,33.07,0,0,1-59.43,0,42.16,42.16,0,0,1-.2-36.77A30.4,30.4,0,0,1,459,120q7.37-5.31,17.76-5.3.73,0,1.47,0t1.47,0c6.92,0,12.85,1.76,17.75,5.3a30.4,30.4,0,0,1,10.69,13.73,40,40,0,0,1,4.09,16.7c0,.51,0,1,0,1.54S512.28,153.1,512.25,153.68Z" />
      <path d="M730.5,130.83a.32.32,0,0,0,0-.09c-.61-1.49-1.29-3-2-4.39a46.56,46.56,0,0,0-11-14c-.32-.29-.65-.55-1-.83s-1-.77-1.5-1.15q-12.09-8.88-29.22-9-17.16.12-29.23,9c-.28.21-.57.43-.84.65l-.81.63c-.39.3-.77.63-1.14,1a2.32,2.32,0,0,0-.25.21,46.52,46.52,0,0,0-10.49,13.55,48.36,48.36,0,0,0-2,4.39.16.16,0,0,0,0,.09,58.59,58.59,0,0,0-.56,40.68s0,.05,0,.07a53.67,53.67,0,0,0,2.59,5.87,46.25,46.25,0,0,0,10.24,13.4l.84.74c.31.27.63.54,1,.79.49.4,1,.78,1.5,1.15q12.07,8.9,29.23,9,17.13-.1,29.22-9c.51-.37,1-.75,1.5-1.15a6.63,6.63,0,0,0,.66-.55c.23-.18.45-.37.67-.56.67-.58,1.31-1.19,1.94-1.81V201h14.74V151.07c0-.22,0-.44,0-.66A55.3,55.3,0,0,0,730.5,130.83Zm-10.83,22.85a40.17,40.17,0,0,1-4.28,16.8,33.07,33.07,0,0,1-59.43,0,42.25,42.25,0,0,1-.2-36.77A30.4,30.4,0,0,1,666.45,120q7.37-5.31,17.76-5.3.74,0,1.47,0t1.47,0c6.92,0,12.85,1.76,17.75,5.3a30.4,30.4,0,0,1,10.69,13.73,40,40,0,0,1,4.09,16.7c0,.51,0,1,0,1.54S719.7,153.1,719.67,153.68Z" />
      <path d="M299.72,150.19a93,93,0,0,0-15.79-4.61q-8.34-1.67-15.79-3.53a38.92,38.92,0,0,1-12.16-5,10.19,10.19,0,0,1-4.71-9q0-14.13,23.35-14.13,12.35,0,17.75,4.52a16.49,16.49,0,0,1,6.18,10.78h14.9a29.71,29.71,0,0,0-5-13.53,31,31,0,0,0-12.36-10.3q-8.13-4-21.08-4-19,0-28.74,7.36t-9.71,20.69q0,9,4.71,14.22a30.84,30.84,0,0,0,12.16,8,104.27,104.27,0,0,0,15.79,4.61Q277.56,158,285,159.9a36.29,36.29,0,0,1,12.16,5.2,10.85,10.85,0,0,1,4.71,9.41,11.83,11.83,0,0,1-2.74,8.05,17.13,17.13,0,0,1-6.77,4.7,36,36,0,0,1-8.34,2.16,55.81,55.81,0,0,1-7.26.59q-9.4,0-15.3-2.84a20.26,20.26,0,0,1-8.73-7.46,23.3,23.3,0,0,1-3.43-9.51H234a32.45,32.45,0,0,0,5.49,16,34.73,34.73,0,0,0,14.23,11.86q9.32,4.51,22.85,4.51,18.24,0,29.13-7.55t10.88-21.87q0-9.21-4.7-14.61A30.81,30.81,0,0,0,299.72,150.19Z" />
      <path d="M340.17,152c-2.41-36.35,50.59-53.49,64.07-17.35h16a46.21,46.21,0,0,0-1.81-5.2c-21.72-47.91-95-31.11-93,22.56-1.89,56,76.54,70.65,94.46,18.45h0c.26-.78.53-1.68.76-2.49h-15.9C392.16,205.52,338.16,189.42,340.17,152Z" />
      <path d="M199.59,108.12q-10.89-6.77-26-6.77-14.91,0-25.89,6.77a45.33,45.33,0,0,0-16.87,18.24A55.3,55.3,0,0,0,125,152a53.25,53.25,0,0,0,6.18,25.5,46.83,46.83,0,0,0,17.36,18.34q11.19,6.76,26.09,6.76,17.46,0,28.54-8.33a48,48,0,0,0,16.14-21.37h0a8.51,8.51,0,0,0,.68-2.53l-15.78-.05a8,8,0,0,1-.95,2.47,32.31,32.31,0,0,1-11,11.87q-7,4.62-17.45,4.61A34.52,34.52,0,0,1,157.51,185a32.46,32.46,0,0,1-11.86-11.38,39.9,39.9,0,0,1-5.59-15.79h82.18V152a55.3,55.3,0,0,0-5.88-25.6A45.5,45.5,0,0,0,199.59,108.12Zm-59.34,36a37.73,37.73,0,0,1,10.69-21q8.53-8.43,22.66-8.43t22.75,8.43a36.32,36.32,0,0,1,10.59,21Z" />
      <polygon points="783.1 234.48 734.51 234.48 734.51 248.21 796.84 248.21 796.84 185.88 783.1 185.88 783.1 234.48" />
      <polygon points="76.65 68.87 125.25 68.87 125.25 55.14 62.92 55.14 62.92 117.47 76.65 117.47 76.65 68.87" />
      <path d="M624,132.19a0,0,0,0,0,0,0c-3.78-15.07-16.82-26.87-33.31-30h-.06a53.93,53.93,0,0,0-9.22-.8h-1a45.07,45.07,0,0,0-27,9.87V101.15h-14.7v99.72h14.71V144.74c0-.31,0-.61,0-.91s0-.67,0-1a29.09,29.09,0,0,1,4-13.48,28.49,28.49,0,0,1,10.69-10.5,27.63,27.63,0,0,1,27.66,0,28.56,28.56,0,0,1,10.69,10.5,29.21,29.21,0,0,1,4,13.48c0,.34,0,.67,0,1s0,.74,0,1.1v55.94h14.71V144.34c0-1.59-.06-3.15-.16-4.67A52.18,52.18,0,0,0,624,132.19Z" />
    </g>
  </svg>
)

export function MainNav() {
  const pathname = usePathname()
  const isHomePage = pathname === "/"
  const { user, loading } = useSession()
  const [isOpen, setIsOpen] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)

  // Si estamos en la página de login o reset-password, no mostrar la barra de navegación
  if (pathname === "/login" || pathname === "/reset-password") {
    return null
  }

  return (
    <nav className={`bg-secondary-dark ${isHomePage ? "h-16" : ""} ${poppins.className}`}>
      {isHomePage ? <SimpleNav /> : <FullNav currentUser={user} isLoading={loading} loadError={loadError} />}
    </nav>
  )
}

function SimpleNav() {
  return (
    <nav
      className={`bg-secondary-dark h-16 px-8 flex items-center justify-between border-b border-[#2A3B51] ${poppins.className}`}
    >
      <Link href="/" className="text-white shrink-0">
        <Logo />
      </Link>
      <LogoutButton />
    </nav>
  )
}

function FullNav({
  currentUser,
  isLoading,
  loadError,
}: { currentUser: any | null; isLoading: boolean; loadError: string | null }) {
  const pathname = usePathname()
  const isResetPasswordPage = pathname === "/reset-password" || pathname === "/reset-password/"
  const isLoginPage = pathname === "/login" || pathname === "/login/"

  // Don't show nav on login or reset password pages
  if (isLoginPage || isResetPasswordPage) return null

  // Define navigation items based on user role
  // Modificar la función getNavItems para ser más explícita con los roles
  const getNavItems = () => {
    // Items para rol guardia
    const guardiaItems = [
      { icon: Camera, text: "Escanear", href: "/scan" },
      { icon: ClipboardList, text: "Clientes", href: "/clients", activePaths: ["/clients", "/guests"] },
      { icon: AlertCircle, text: "Incidentes", href: "/incidents" },
    ]

    // Items adicionales para admin y superadmin
    const adminItems = [
      ...guardiaItems,
      { icon: BarChart3, text: "Estadísticas", href: "/stats" },
      { icon: User, text: "Perfil Admin", href: "/admin-profile" },
   
    ]

    // Items exclusivos para superadmin
    const superadminItems = [
      ...adminItems,
      { icon: LayoutDashboard, text: "Panel de Administración", href: "/admin-dashboard" },
    ]

    // Si el usuario está cargando, no mostrar elementos
    if (isLoading) {
      console.log("Nav - Usuario cargando, no mostrando elementos")
      return []
    }

    // Retornar elementos según el rol de forma explícita
    if (!currentUser) {
      console.log("Nav - No hay usuario, mostrando menú de guardia por defecto")
      return guardiaItems
    } else if (currentUser.role === ROLES.GUARDIA) {
      console.log("Nav - Usuario con rol GUARDIA, mostrando menú de guardia")
      return guardiaItems
    } else if (currentUser.role === ROLES.ADMIN) {
      console.log("Nav - Usuario con rol ADMIN, mostrando menú de admin")
      return adminItems
    } else if (currentUser.role === ROLES.SUPERADMIN) {
      console.log("Nav - Usuario con rol SUPERADMIN, mostrando menú completo con panel de administración")
      return superadminItems
    } else {
      console.log("Nav - Rol no reconocido:", currentUser.role, "mostrando menú de guardia por defecto")
      return guardiaItems
    }
  }

  const navItems = getNavItems()

  return (
    <nav className={`bg-secondary-dark border-b border-[#2A3B51] ${poppins.className} max-h-screen overflow-y-auto`}>
      <div className="flex items-center justify-between px-8">
        <div className="flex items-center gap-12">
          <Link href="/" className="text-white shrink-0">
            <Logo />
          </Link>
          <ul className="flex items-center space-x-1">
            {navItems.map((item) => (
              <li key={item.href}>
                <NavItem icon={item.icon} text={item.text} href={item.href} activePaths={item.activePaths} />
              </li>
            ))}
          </ul>
        </div>
        <UserNav currentUser={currentUser} isLoading={isLoading} />
      </div>
    </nav>
  )
}

function NavItem({ icon: Icon, text, href, activePaths = [] }) {
  const pathname = usePathname()
  const isActive = activePaths.includes(pathname) || pathname === href

  return (
    <Link
      href={href}
      className={`flex items-center gap-3 transition-colors relative py-5 px-6 ${
        isActive ? "text-white bg-[#3B82F6] font-medium" : "text-white/70 hover:text-white hover:bg-[#3B82F6]"
      }`}
    >
      <Icon className="w-6 h-6" />
      <span className="text-base">{text}</span>
      {isActive && <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#7DD3FC]" />}
    </Link>
  )
}

function UserNav({ currentUser, isLoading }: { currentUser: any | null; isLoading: boolean }) {
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()
  const { userName, barName } = useContext(AppContext)

  const handleLogout = () => {
    console.log("UserNav - Cerrando sesión...")
    logout()
  }

  // Define menu items based on user role
  // Modificar la función getMenuItems para ser más explícita con los roles
  const getMenuItems = () => {
    // Items para rol guardia
    const guardiaItems = [
      {
        component: (
          <Link href="/scan" className="flex items-center gap-2 cursor-pointer">
            <Camera className="w-4 h-4" />
            Escanear
          </Link>
        ),
        className:
          "hover:bg-[#3B82F6] hover:text-white focus:bg-[#3B82F6] focus:text-white border-b border-[#2A3B51] py-2 px-1",
      },
      {
        component: (
          <Link href="/clients" className="flex items-center gap-2 cursor-pointer">
            <ClipboardList className="w-4 h-4" />
            Clientes
          </Link>
        ),
        className:
          "hover:bg-[#3B82F6] hover:text-white focus:bg-[#3B82F6] focus:text-white border-b border-[#2A3B51] py-2 px-1",
      },
      {
        component: (
          <Link href="/guests" className="flex items-center gap-2 cursor-pointer">
            <Crown className="w-4 h-4" />
            Listas de invitados
          </Link>
        ),
        className:
          "hover:bg-[#3B82F6] hover:text-white focus:bg-[#3B82F6] focus:text-white border-b border-[#2A3B51] py-2 px-1",
      },
      {
        component: (
          <Link href="/clients?filter=banned" className="flex items-center gap-2 cursor-pointer">
            <Ban className="w-4 h-4" />
            Baneados
          </Link>
        ),
        className:
          "hover:bg-[#3B82F6] hover:text-white focus:bg-[#3B82F6] focus:text-white border-b border-[#2A3B51] py-2 px-1",
      },
      {
        component: (
          <Link href="/incidents" className="flex items-center gap-2 cursor-pointer">
            <AlertCircle className="w-4 h-4" />
            Incidentes
          </Link>
        ),
        className:
          "hover:bg-[#3B82F6] hover:text-white focus:bg-[#3B82F6] focus:text-white border-b border-[#2A3B51] py-2 px-1",
      },
    ]

    // Items adicionales para admin y superadmin
    const adminItems = [
      ...guardiaItems,
      {
        component: (
          <Link href="/stats" className="flex items-center gap-2 cursor-pointer">
            <BarChart3 className="w-4 h-4" />
            Estadísticas
          </Link>
        ),
        className:
          "hover:bg-[#3B82F6] hover:text-white focus:bg-[#3B82F6] focus:text-white border-b border-[#2A3B51] py-2 px-1",
      },
      {
        component: (
          <Link href="/profile" className="flex items-center gap-2 cursor-pointer">
            <User className="w-4 h-4" />
            Perfil de Administrador
          </Link>
        ),
        className:
          "hover:bg-[#3B82F6] hover:text-white focus:bg-[#3B82F6] focus:text-white border-b border-[#2A3B51] py-2 px-1",
      },
      {
        component: (
          <Link href="/settings" className="flex items-center gap-2 cursor-pointer">
            <Settings className="w-4 h-4" />
            Configuración
          </Link>
        ),
        className:
          "hover:bg-[#3B82F6] hover:text-white focus:bg-[#3B82F6] focus:text-white border-b border-[#2A3B51] py-2 px-1",
      },
    ]

    // Items exclusivos para superadmin
    const superadminItems = [
      ...adminItems,
      {
        component: (
          <Link href="/admin-dashboard" className="flex items-center gap-2 cursor-pointer">
            <LayoutDashboard className="w-4 h-4" />
            Panel de Administración
          </Link>
        ),
        className:
          "hover:bg-[#3B82F6] hover:text-white focus:bg-[#3B82F6] focus:text-white border-b border-[#2A3B51] py-2 px-1",
      },
    ]

    // Settings, Help, and Tutorial items - disabled for all roles for now
    const commonItems = [
      {
        component: (
          <Link href="/help" className="flex items-center gap-2 cursor-pointer">
            <HelpCircle className="w-4 h-4" />
            Ayuda
          </Link>
        ),
        className:
          "hover:bg-[#3B82F6] hover:text-white focus:bg-[#3B82F6] focus:text-white border-b border-[#2A3B51] py-2 px-1",
      },
      {
        component: (
          <Link href="/tutorial" className="flex items-center gap-2 cursor-pointer">
            <BookOpen className="w-4 h-4" />
            Tutorial
          </Link>
        ),
        className: "hover:bg-[#3B82F6] hover:text-white focus:bg-[#3B82F6] focus:text-white py-2 px-1",
      },
    ]

    // Si el usuario está cargando, no mostrar elementos
    if (isLoading) {
      console.log("UserNav - Usuario cargando, no mostrando elementos")
      return []
    }

    // Retornar elementos según el rol de forma explícita
    if (!currentUser) {
      console.log("UserNav - No hay usuario, mostrando menú de guardia por defecto")
      return [...guardiaItems, ...commonItems]
    } else if (currentUser.role === ROLES.GUARDIA) {
      console.log("UserNav - Usuario con rol GUARDIA, mostrando menú de guardia")
      return [...guardiaItems, ...commonItems]
    } else if (currentUser.role === ROLES.ADMIN) {
      console.log("UserNav - Usuario con rol ADMIN, mostrando menú de admin")
      return [...adminItems, ...commonItems]
    } else if (currentUser.role === ROLES.SUPERADMIN) {
      console.log("UserNav - Usuario con rol SUPERADMIN, mostrando menú completo con panel de administración")
      return [...superadminItems, ...commonItems]
    } else {
      console.log("UserNav - Rol no reconocido:", currentUser.role, "mostrando menú de guardia por defecto")
      return [...guardiaItems, ...commonItems]
    }
  }

  const menuItems = getMenuItems()

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className={`text-white transition-colors duration-300 h-16 px-4 ml-8 hover:bg-transparent hover:text-white ${
            isOpen ? "bg-[#3B82F6] text-white" : ""
          }`}
        >
          Menú
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="bg-[#1A2B41] border-[#2A3B51] text-white max-h-[calc(100vh-80px)] overflow-y-auto"
        align="end"
      >
        <DropdownMenuLabel className="flex flex-col items-start gap-1 text-base font-normal border-b border-[#2A3B51] pb-2 mb-1">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5" />
            {isLoading ? "Cargando..." : currentUser?.name || userName || "Usuario"}
          </div>
          <div className="text-sm text-gray-400">{barName}</div>
          <div className="text-sm text-gray-400">Rol: {currentUser?.role || "No definido"}</div>
        </DropdownMenuLabel>
        <DropdownMenuGroup>
          {menuItems.map((item, index) => (
            <DropdownMenuItem key={index} asChild className={item.className}>
              {item.component}
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
        <DropdownMenuSeparator className="bg-[#2A3B51]" />
        {currentUser?.role === ROLES.SUPERADMIN && (
          <DropdownMenuItem asChild>
            <Link href="/admin-dashboard" className="cursor-pointer">
              <LayoutDashboard className="mr-2 h-4 w-4" />
              <span>Panel de Administración</span>
            </Link>
          </DropdownMenuItem>
        )}
        <DropdownMenuItem className="bg-[#3B82F6] hover:bg-[#2563EB] text-white cursor-pointer" onClick={handleLogout}>
          <LogOut className="w-4 h-4 mr-2" />
          Cerrar sesión
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function LogoutButton() {
  const router = useRouter()
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const handleLogoutClick = () => {
    setShowConfirmation(true)
  }

  const handleConfirmLogout = async () => {
    try {
      setIsLoggingOut(true)
      console.log("LogoutButton - Iniciando cierre de sesión...")
      await logout()
      // No es necesario hacer nada más aquí, ya que la función logout redirige automáticamente
    } catch (error) {
      console.error("LogoutButton - Error al cerrar sesión:", error)
      // En caso de error, intentar redirigir manualmente
      window.location.href = "/login"
    }
  }

  return (
    <>
      <Button
        variant="ghost"
        className="text-white h-16 px-4 hover:bg-transparent hover:text-white"
        onClick={handleLogoutClick}
      >
        <LogOut className="w-4 h-4 mr-2" />
        Cerrar sesión
      </Button>

      <Dialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <DialogContent className="sm:max-w-[425px] bg-[#1A2B41] text-white">
          <DialogHeader>
            <DialogTitle>Confirmar cierre de sesión</DialogTitle>
            <DialogDescription className="text-gray-300">¿Estás seguro de que deseas cerrar sesión?</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="secondary"
              onClick={() => setShowConfirmation(false)}
              className="bg-gray-600 text-white hover:bg-gray-700"
              disabled={isLoggingOut}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleConfirmLogout}
              className="bg-[#3B82F6] text-white hover:bg-[#2563EB]"
              disabled={isLoggingOut}
            >
              {isLoggingOut ? "Cerrando sesión..." : "Cerrar sesión"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}


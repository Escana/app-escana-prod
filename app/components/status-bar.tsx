"use client"

import { Clock } from "lucide-react"
import { usePathname } from "next/navigation"
import {
  useState,
  useEffect,
  createContext,
  useContext,
  useCallback,
} from "react"
import { getCurrentUser } from "@/lib/auth-client"
import {
  getEstablishmentById,
} from "@/app/actions/establishments"

// --- Contexto ---
interface AppContextType {
  userName: string
  barName: string
  updateUserName: (newName: string) => void
  updateBarName: (newName: string) => void
}

const defaultContext: AppContextType = {
  userName: "Rodrigo Bustamante",
  barName: "Nebula Nights",
  updateUserName: () => {},
  updateBarName: () => {},
}

export const AppContext = createContext<AppContextType>(defaultContext)

export function StatusBarProvider({
  children,
  userName = "Rodrigo Bustamante",
}: {
  children: React.ReactNode
  userName?: string
}) {
  const [context, setContext] = useState({
    userName,
    barName: "Nebula",
  })

  const updateUserName = useCallback((newName: string) => {
    setContext((prev) =>
      prev.userName === newName ? prev : { ...prev, userName: newName }
    )
  }, [])

  const updateBarName = useCallback((newName: string) => {
    setContext((prev) =>
      prev.barName === newName ? prev : { ...prev, barName: newName }
    )
  }, [])

  return (
    <AppContext.Provider
      value={{
        userName: context.userName,
        barName: context.barName,
        updateUserName,
        updateBarName,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

// --- StatusBar ---
export function StatusBar() {
  const pathname = usePathname()
  const isAuthPage = ["/login", "/reset-password"].includes(pathname)

  const {
    userName: defaultUserName,
    barName: defaultBarName,
    updateUserName,
    updateBarName,
  } = useContext(AppContext)
  const [currentUser, setCurrentUser] = useState<any>(null)

  useEffect(() => {
    // cada vez que cambia la ruta volvemos a leer la sesión
    ;(async () => {
      const user = await getCurrentUser()
      setCurrentUser(user)

      if (user?.name) {
        updateUserName(user.name)
        try {
          const est = await getEstablishmentById(user.establishment_id)
          updateBarName(est.name)
        } catch (err) {
          console.error("Error al obtener establecimiento:", err)
        }
      }
    })()
  }, [pathname, updateUserName, updateBarName])

  if (isAuthPage) {
    return null
  }

  const displayUser = currentUser?.name || defaultUserName
  const displayBar  = currentUser?.establishment_id ? defaultBarName : defaultBarName

  return (
    <div className="bg-[#1A2B41] px-6 py-3 grid grid-cols-3 items-center text-white/70 text-sm border-t border-[#2A3B51]">
      <div><SessionTimer /></div>
      <div className="text-center font-medium">{displayUser}</div>
      <div className="text-right">
        {displayBar} <CurrentTime />
      </div>
    </div>
  )
}

function SessionTimer() {
  const [sessionTime, setSessionTime] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setSessionTime((t) => t + 1)
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const hh = String(Math.floor(sessionTime / 3600)).padStart(2, "0")
  const mm = String(Math.floor((sessionTime % 3600) / 60)).padStart(2, "0")
  const ss = String(sessionTime % 60).padStart(2, "0")

  return <span>Tiempo de sesión: {`${hh}:${mm}:${ss}`}</span>
}

function CurrentTime() {
  const [now, setNow] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="flex items-center gap-2">
      <Clock className="w-4 h-4" />
      <span>{now.toLocaleTimeString()}</span>
    </div>
  )
}

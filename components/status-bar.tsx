"use client"

import { Clock } from "lucide-react"
import { usePathname } from "next/navigation"
import { useState, useEffect, createContext, useContext } from "react"

export const AppContext = createContext({ userName: "Rodrigo Bustamante", barName: "Nebula Nights" })

export function StatusBarProvider({ children, userName = "Rodrigo Bustamante" }) {
  return <AppContext.Provider value={{ userName, barName: "Nebula Nights" }}>{children}</AppContext.Provider>
}

export function StatusBar() {
  const pathname = usePathname()
  const isResetPasswordPage = pathname === "/reset-password"
  const { userName, barName } = useContext(AppContext)

  if (isResetPasswordPage) {
    return null
  }

  return (
    <div className="bg-[#1A2B41] px-6 py-3 grid grid-cols-3 items-center text-white/70 text-sm border-t border-[#2A3B51]">
      <div className="flex items-center gap-4">
        <SessionTimer />
      </div>
      <div className="flex items-center justify-center gap-4">
        <span className="font-medium">{userName}</span>
        <span className="text-[#7DD3FC]">{barName}</span>
      </div>
      <div className="flex items-center justify-end">
        <CurrentTime />
      </div>
    </div>
  )
}

function SessionTimer() {
  const [sessionTime, setSessionTime] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setSessionTime((prevTime) => prevTime + 1)
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const remainingSeconds = seconds % 60

    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`
  }

  return <span>Tiempo de sesión: {formatTime(sessionTime)}</span>
}

function CurrentTime() {
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  return (
    <div className="flex items-center gap-2">
      <Clock className="w-4 h-4" />
      <span>{currentTime.toLocaleTimeString()}</span>
    </div>
  )
}


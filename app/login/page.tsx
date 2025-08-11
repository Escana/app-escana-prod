"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Poppins } from "next/font/google"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Link from "next/link"

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
})

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      console.log("[Login] Intentando iniciar sesión...")
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Error al iniciar sesión")
      }

      console.log("[Login] Inicio de sesión exitoso, redirigiendo...")

      // Guardar la sesión en localStorage
      const sessionData = {
        userId: data.user.id,
        email: data.user.email,
        role: data.user.role,
        name: data.user.name,
        establishment_id: data.user.establishment_id,
        created_at: new Date().toISOString(),
        expires_at: Date.now() + 24 * 60 * 60 * 1000, // 1 día
      }

      localStorage.setItem("user_session", JSON.stringify(sessionData))
      console.log("[Login] Sesión guardada en localStorage:", sessionData)

      // Redirigir según la respuesta del servidor
      router.push(data.redirectUrl || "/")
    } catch (err: any) {
      console.error("[Login] Error:", err)
      setError(err.message || "Error al iniciar sesión")
      setIsLoading(false)
    }
  }

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 bg-[#111111] ${poppins.className}`}>
      <div className="w-full max-w-md space-y-8 p-8 rounded-2xl bg-[#1A1A1A]">
        {/* Logo */}
        <div className="text-center">
          <h1 className="text-4xl font-light text-white tracking-wider">
            <span className="inline-block">⌜</span>
            escana
            <span className="inline-block">⌟</span>
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <Alert variant="destructive" className="bg-red-900/20 border-red-900 text-red-300">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <label htmlFor="email" className="block text-sm font-medium text-white">
              Usuario
            </label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-[#2A2A2A] border-none text-white h-12 text-sm"
              placeholder="ejemplo@correo.com"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="block text-sm font-medium text-white">
              Contraseña
            </label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="bg-[#2A2A2A] border-none text-white h-12 text-sm"
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-[#2563EB] hover:bg-[#1D4ED8] text-white h-12 rounded-lg text-sm font-medium"
            disabled={isLoading}
          >
            {isLoading ? "Iniciando sesión..." : "Iniciar sesión"}
          </Button>

          <div className="text-center">
            <Link href="/reset-password" className="text-sm text-[#60A5FA] hover:text-[#3B82F6] transition-colors">
              ¿Olvidaste tu contraseña?
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}


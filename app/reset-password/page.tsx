"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, AlertCircle, Check, ArrowLeft } from "lucide-react"

export default function ResetPasswordPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get("token")

  const [email, setEmail] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")

  // Verificar token al cargar la página
  useEffect(() => {
    if (token) {
      // Validar que el token tenga un formato válido
      if (token.length < 10) {
        setError("Enlace inválido o expirado. Por favor, solicita el restablecimiento de nuevo.")
      }
    }
  }, [token])

  // Manejar solicitud de restablecimiento de contraseña
  async function handleRequestReset(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setLoading(true)

    if (!email) {
      setError("Por favor, ingresa tu correo electrónico.")
      setLoading(false)
      return
    }

    try {
      const formData = new FormData()
      formData.append("email", email)

      const response = await fetch("/api/employees/forgot-password", {
        method: "POST",
        body: formData,
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || "Error al enviar el correo de restablecimiento")
      }

      setSuccess(true)
      setSuccessMessage(
        "Se ha enviado un enlace de restablecimiento a tu correo electrónico si existe una cuenta asociada.",
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al enviar el correo de restablecimiento")
    } finally {
      setLoading(false)
    }
  }

  // Manejar restablecimiento de contraseña
  async function handleResetPassword(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setLoading(true)

    if (!token) {
      setError("Token no válido.")
      setLoading(false)
      return
    }

    if (newPassword !== confirmPassword) {
      setError("Las contraseñas no coinciden.")
      setLoading(false)
      return
    }

    if (newPassword.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.")
      setLoading(false)
      return
    }

    try {
      const formData = new FormData()
      formData.append("token", token)
      formData.append("newPassword", newPassword)
      formData.append("confirmPassword", confirmPassword)

      const response = await fetch("/api/employees/forgot-password", {
        method: "POST",
        body: formData,
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || "Error al restablecer contraseña")
      }

      setSuccess(true)
      setSuccessMessage("¡Contraseña restablecida exitosamente!")
      // Redirigir tras unos segundos
      setTimeout(() => {
        router.push("/login")
      }, 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al restablecer contraseña")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 bg-gradient-to-b from-black to-[#121212]">
      <Card className="w-full max-w-md bg-[#1A1B1C] border border-gray-800 shadow-xl">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center text-white">
            {token ? "Restablecer Contraseña" : "Recuperar Contraseña"}
          </CardTitle>
          <CardDescription className="text-center text-gray-400">
            {token
              ? "Ingresa tu nueva contraseña"
              : "Ingresa tu correo electrónico para recibir un enlace de recuperación"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success ? (
            <div className="text-center space-y-6 py-4">
              <div className="relative">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="h-16 w-16 rounded-full bg-green-900/20 animate-pulse"></div>
                </div>
                <div className="relative flex items-center justify-center w-16 h-16 rounded-full bg-green-100/10 mx-auto border-2 border-green-500">
                  <Check className="h-8 w-8 text-green-500" />
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-medium text-white">¡Operación Exitosa!</h3>
                <p className="text-sm text-gray-400">{successMessage}</p>
              </div>
              <div className="pt-2">
                <Button
                  asChild
                  className="w-full bg-gradient-to-r from-[#3B82F6] to-[#2563EB] hover:from-[#2563EB] hover:to-[#1D4ED8] text-white font-medium transition-all duration-300 shadow-lg shadow-blue-500/20"
                >
                  <Link href="/login">Ir a Iniciar Sesión</Link>
                </Button>
              </div>
            </div>
          ) : token ? (
            // Formulario para restablecer contraseña (con token)
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="newPassword" className="text-gray-300">
                  Nueva Contraseña
                </Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  className="bg-[#252525] border-gray-700 focus:border-[#3B82F6] focus:ring-[#3B82F6] text-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-gray-300">
                  Confirmar Contraseña
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="bg-[#252525] border-gray-700 focus:border-[#3B82F6] focus:ring-[#3B82F6] text-white"
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-[#3B82F6] to-[#2563EB] hover:from-[#2563EB] hover:to-[#1D4ED8] text-white font-medium transition-all duration-300 shadow-lg shadow-blue-500/20"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin text-white" />
                    Restableciendo...
                  </>
                ) : (
                  "Restablecer Contraseña"
                )}
              </Button>
            </form>
          ) : (
            // Formulario para solicitar enlace de restablecimiento (sin token)
            <form onSubmit={handleRequestReset} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-300">
                  Correo Electrónico
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-[#252525] border-gray-700 focus:border-[#3B82F6] focus:ring-[#3B82F6] text-white"
                  placeholder="tu@correo.com"
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-[#3B82F6] to-[#2563EB] hover:from-[#2563EB] hover:to-[#1D4ED8] text-white font-medium transition-all duration-300 shadow-lg shadow-blue-500/20"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin text-white" />
                    Enviando...
                  </>
                ) : (
                  "Enviar Enlace de Recuperación"
                )}
              </Button>
            </form>
          )}

          {!success && (
            <div className="text-center mt-6 text-sm">
              <Link
                href="/login"
                className="text-gray-400 hover:text-white flex items-center justify-center transition-colors duration-300"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Volver al inicio de sesión
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

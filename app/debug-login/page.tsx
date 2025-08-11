"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AlertCircle, Loader2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function DebugLoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const router = useRouter()

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsLoading(true)
    setError(null)
    setSuccess(null)

    const formData = new FormData(event.currentTarget)
    const email = formData.get("email") as string
    const password = formData.get("password") as string

    try {
      const response = await fetch("/api/debug-login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Error al iniciar sesión")
        setIsLoading(false)
        return
      }

      setSuccess("Inicio de sesión exitoso. Redirigiendo...")

      // Esperar un momento para mostrar el mensaje de éxito
      setTimeout(() => {
        router.push("/")
        router.refresh()
      }, 1000)
    } catch (err) {
      console.error("Error al iniciar sesión:", err)
      setError("Error al iniciar sesión. Intente nuevamente.")
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-900 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Debug Login</CardTitle>
          <CardDescription>Esta página es solo para depuración</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            {success && (
              <Alert variant="default" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="nombre@ejemplo.com"
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input id="password" name="password" type="password" required disabled={isLoading} />
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              <p>Usuarios de prueba:</p>
              <ul className="list-disc pl-5 mt-1">
                <li>superadmin@test.com / superadmin123</li>
                <li>admin@test.com / admin123</li>
                <li>guardia@test.com / guardia123</li>
              </ul>
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Iniciando sesión...
                </>
              ) : (
                "Iniciar sesión (Debug)"
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}


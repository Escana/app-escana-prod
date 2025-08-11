"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { getCurrentUser } from "@/lib/auth-client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { User, Building, Calendar, Phone, BadgeIcon as IdCard, Clock, Shield, ScanLine } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import Link from "next/link"

export default function GuardProfilePage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    async function loadUser() {
      try {
        setLoading(true)
        const currentUser = await getCurrentUser()

        // Si no hay usuario, usar datos de demostración en lugar de redirigir
        if (!currentUser) {
          console.log("No se encontró usuario, usando datos de demostración")
          setUser({
            name: "Carlos Rodríguez Vega",
            email: "guardia@escana.com",
          })
        } else {
          setUser(currentUser)
        }
      } catch (error) {
        console.error("Error loading user:", error)
        // Usar un usuario simulado para demostración
        setUser({
          name: "Carlos Rodríguez Vega",
          email: "guardia@escana.com",
        })
      } finally {
        setLoading(false)
      }
    }

    loadUser()
  }, [router])

  if (loading) {
    return (
      <div className="container mx-auto py-6 flex items-center justify-center min-h-screen bg-[#1A1B1C]">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="h-12 w-12 rounded-full border-4 border-secondary border-t-transparent animate-spin"></div>
          </div>
          <h2 className="text-xl font-semibold mb-2 text-white">Cargando perfil</h2>
          <p className="text-muted-foreground">Por favor espere</p>
        </div>
      </div>
    )
  }

  // Datos simplificados para la demostración
  const guardData = {
    name: user?.name || "Carlos Rodríguez Vega",
    rut: "18.765.432-1",
    location: "Club Nocturno Estrella",
    phone: "+56 9 1234 5678",
    creationDate: "15 de enero, 2024",
    email: "guardia@escana.com",
    role: "Guardia de Seguridad",
    status: "Activo",
    lastLogin: "Hoy, 08:45 AM",
    emergencyContact: "+56 9 8765 4321 (Familiar)",
  }

  return (
    <div className="min-h-screen bg-[#1A1B1C] text-white">
      <main className="container mx-auto py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <Card className="bg-[#1A2B41] border-secondary-dark/30 shadow-lg overflow-hidden">
            <CardHeader className="pb-0">
              <div className="flex justify-between items-center">
                <CardTitle className="text-xl font-bold text-white">Información Personal</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-6 pb-6 px-6">
              <div className="flex items-center mb-6">
                <div className="h-20 w-20 rounded-full bg-secondary flex items-center justify-center mr-4">
                  <User className="h-10 w-10 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">{guardData.name}</h2>
                  <p className="text-muted-foreground">{guardData.email}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <Badge className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-1 px-3">
                      {guardData.role}
                    </Badge>
                    <Badge className="bg-green-600 hover:bg-green-700 text-white font-medium py-1 px-3">
                      {guardData.status}
                    </Badge>
                  </div>
                </div>
              </div>

              <Separator className="bg-secondary-dark/30 my-5" />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center">
                    <IdCard className="h-5 w-5 mr-4 text-secondary" />
                    <div>
                      <p className="text-sm text-muted-foreground">RUT</p>
                      <p className="font-medium text-white">{guardData.rut}</p>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <Phone className="h-5 w-5 mr-4 text-secondary" />
                    <div>
                      <p className="text-sm text-muted-foreground">Teléfono</p>
                      <p className="font-medium text-white">{guardData.phone}</p>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <Calendar className="h-5 w-5 mr-4 text-secondary" />
                    <div>
                      <p className="text-sm text-muted-foreground">Fecha de Registro</p>
                      <p className="font-medium text-white">{guardData.creationDate}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center">
                    <Building className="h-5 w-5 mr-4 text-secondary" />
                    <div>
                      <p className="text-sm text-muted-foreground">Ubicación Asignada</p>
                      <p className="font-medium text-white">{guardData.location}</p>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <Clock className="h-5 w-5 mr-4 text-secondary" />
                    <div>
                      <p className="text-sm text-muted-foreground">Último Acceso</p>
                      <p className="font-medium text-white">{guardData.lastLogin}</p>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <Shield className="h-5 w-5 mr-4 text-secondary" />
                    <div>
                      <p className="text-sm text-muted-foreground">Contacto de Emergencia</p>
                      <p className="font-medium text-white">{guardData.emergencyContact}</p>
                    </div>
                  </div>
                </div>
              </div>

              <Separator className="bg-secondary-dark/30 my-5" />

              <div className="flex justify-center">
                <Link href="/scan">
                  <Button className="bg-secondary hover:bg-secondary/80 text-white" variant="default" size="lg">
                    <ScanLine className="mr-2 h-5 w-5" />
                    Volver a Escanear
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}


"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { getCurrentUser } from "@/lib/auth-client"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getEstablishments } from "@/app/actions/establishments"

import { Button } from "@/components/ui/button"
import { User, Calendar, Phone, BadgeIcon as IdCard, Shield, Settings, Search, Clock, Home } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import Link from "next/link"
import UsersManagement from "../admin-dashboard/components/users-management"

// Datos de demostración para guardias
const mockGuards = [
  
]

export default function AdminProfilePage() {
  const [user, setUser] = useState<any>(null)
  const [establishments, setEstablishments] = useState<any[]>([])

  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const router = useRouter()

  useEffect(() => {
     async function loadData() {
          try {
            setLoading(true)
    
            // Cargar usuario actual
            const user = await getCurrentUser()
    
            if (!user) {
              toast({
                title: "Error",
                description: "No se pudo cargar la información del usuario",
                variant: "destructive",
              })
              router.push("/login")
              return
            }
    
  setUser(user)
    
    
            // Cargar establecimientos - usar mockEstablishments como fallback
            try {
              const establishmentsData = await getEstablishments()
              setEstablishments(
                establishmentsData && establishmentsData.length > 0 ? establishmentsData : mockEstablishments,
              )
            } catch (error) {
              console.error("Error loading establishments:", error)
              setEstablishments(mockEstablishments)
            }
          } catch (error) {
            console.error("Error loading data:", error)
            toast({
              title: "Error",
              description: "No se pudieron cargar los datos",
              variant: "destructive",
            })
            // Usar datos mock en caso de error
            setEstablishments(mockEstablishments)
          } finally {
            setLoading(false)
          }
        }
    
        loadData()
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
  const adminData = {
    name: user?.name || "Juan Pérez Soto",
    rut: "12.345.678-9",
    phone: "+56 9 8765 4321",
    creationDate: "10 de octubre, 2023",
    role: "Administrador",
    email: "juan.perez@escana.com",
  }

  // Filtrar guardias según la búsqueda
  const filteredGuards = mockGuards.filter((guard) => guard.name.toLowerCase().includes(searchQuery.toLowerCase()))

  // Formatear tiempo de última actividad
  const formatLastActive = (date: Date) => {
    const minutes = Math.floor((Date.now() - date.getTime()) / 60000)
    if (minutes < 60) {
      return `Hace ${minutes} minutos`
    } else {
      const hours = Math.floor(minutes / 60)
      return `Hace ${hours} ${hours === 1 ? "hora" : "horas"}`
    }
  }

  return (
    <div className="min-h-screen bg-[#1A1B1C] text-white">
      {/* Main Content */}
      <main className="container mx-auto py-8 px-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Profile Info */}
          <div className="lg:col-span-1 flex flex-col">
            {/* Profile Card */}
            <Card className="bg-[#1A2B41] border-secondary-dark/30 shadow-lg overflow-hidden flex-1">
              <CardHeader className="pb-0">
                <CardTitle className="text-xl font-bold text-white">Perfil de Usuario</CardTitle>
              </CardHeader>
              <CardContent className="pt-6 pb-6 px-6">
                <div className="flex items-center mb-6">
                  <div className="h-20 w-20 rounded-full bg-secondary flex items-center justify-center mr-4">
                    <User className="h-10 w-10 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">{user.name}</h2>
                    <p className="text-muted-foreground">{user.email}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <Badge className="bg-red-600 hover:bg-red-700 text-white font-medium py-1 px-3">
                        {user.role}
                      </Badge>
                      <Badge className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-1 px-3">
                        {adminData.location}
                      </Badge>
                    </div>
                  </div>
                </div>

                <Separator className="bg-secondary-dark/30 my-5" />

                <div className="space-y-4">
                 


                  <div className="flex items-center">
                    <Calendar className="h-5 w-5 mr-4 text-secondary" />
                    <div>
                      <p className="text-sm text-muted-foreground">Fecha de Registro</p>
                      <p className="font-medium text-white">{user.created_at}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Guards Management */}
          <div className="lg:col-span-2 flex flex-col">
            <Card className="bg-[#1A2B41] border-secondary-dark/30 shadow-md flex-1">
              <CardHeader className="pb-2">
                <div>
                  <CardTitle className="text-xl font-bold flex items-center">
                    <Shield className="h-5 w-5 mr-2 text-secondary" />
                    Administración de Guardias
                  </CardTitle>
                  <CardDescription>Gestiona los guardias de {adminData.location}</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="pt-4 flex-1">
                <div className="space-y-4 h-full flex flex-col">
                  <div className="flex flex-col sm:flex-row gap-4 items-center">
                    <div className="relative w-full">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Buscar guardias..."
                        className="pl-10 bg-[#1A1B1C]/60 border-secondary-dark/20 focus-visible:ring-secondary"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                  </div>

                  <Separator className="bg-secondary-dark/20" />
                  <UsersManagement establishments={establishments} currentUser={user} />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 overflow-auto">

                    {filteredGuards.map((guard) => (
                      <div
                        key={guard.id}
                        className="bg-[#1A1B1C]/60 rounded-lg border border-secondary-dark/20 p-4 hover:border-secondary-dark/50 transition-all"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center">
                            <div
                              className={`h-2 w-2 rounded-full mr-2 ${
                                guard.status === "active"
                                  ? "bg-green-500"
                                  : guard.status === "inactive"
                                    ? "bg-yellow-500"
                                    : "bg-red-500"
                              }`}
                            />
                            <h3 className="text-lg font-semibold text-white">{guard.name}</h3>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-gray-400 hover:text-white hover:bg-secondary-dark/20"
                          >
                            <Settings className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="flex justify-between items-center mt-3">
                          <div
                            className={`text-sm font-medium ${
                              guard.status === "active"
                                ? "text-green-500"
                                : guard.status === "inactive"
                                  ? "text-yellow-500"
                                  : "text-red-500"
                            }`}
                          >
                            {guard.status === "active"
                              ? "Activo"
                              : guard.status === "inactive"
                                ? "Inactivo"
                                : "Desconectado"}
                          </div>
                          <div className="text-sm text-gray-400">
                            <Clock className="h-3 w-3 inline mr-1" />
                            {formatLastActive(guard.lastActive)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Botón para volver al menú principal */}
        <div className="flex justify-center mt-8">
          <Link href="/">
            <Button variant="default" size="lg" className="bg-secondary hover:bg-secondary/80 text-white font-medium">
              <Home className="h-5 w-5 mr-2" />
              Volver al Menú Principal
            </Button>
          </Link>
        </div>
      </main>
    </div>
  )
}


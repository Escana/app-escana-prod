"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { getCurrentUser } from "@/lib/auth-client"
import { ROLES } from "@/lib/auth-client"
import { Building, Users, BarChart3 } from "lucide-react"
import { getEstablishments } from "@/app/actions/employees"
import LocalsManagement from "./components/locals-management"
import { mockEstablishments } from "./mock/establishments-data"

export default function AdminDashboardClientPage() {
  const [activeTab, setActiveTab] = useState("locals")
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [establishments, setEstablishments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [unauthorized, setUnauthorized] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true)
    
        console.log('creo que ya encontramos el problema')
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

        // Verificar si el usuario tiene permiso (solo SUPERADMIN)
        if (user.role !== ROLES.SUPERADMIN) {
          setUnauthorized(true)
          toast({
            title: "Acceso denegado",
            description: "No tienes permiso para acceder a esta página",
            variant: "destructive",
          })
          setTimeout(() => {
            router.push("/")
          }, 2000)
          return
        }

        setCurrentUser(user)
        console.log(user)
        // Cargar establecimientos - usar mockEstablishments como fallback
        try {
          const establishmentsData = await getEstablishments(user)
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
  }, [router, toast])

  if (loading) {
    return (
      <div className="container mx-auto py-10">
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl">Panel de Administración</CardTitle>
            <CardDescription>Cargando información...</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  if (unauthorized) {
    return (
      <div className="container mx-auto py-10">
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl">Acceso Denegado</CardTitle>
            <CardDescription>No tienes permiso para acceder a esta página. Redirigiendo...</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex flex-col space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-white">Panel de Administrador de Escana</h1>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-400">Bienvenido, {currentUser?.name || "Administrador"}</span>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="bg-gray-800 border border-gray-700 grid grid-cols-3 h-auto p-1">
            <TabsTrigger
              value="dashboard"
              className="data-[state=active]:bg-blue-600 data-[state=active]:text-white py-3"
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              Resumen de actividad
            </TabsTrigger>
            <TabsTrigger value="locals" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white py-3">
              <Building className="h-4 w-4 mr-2" />
              Locales
            </TabsTrigger>
            <TabsTrigger value="users" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white py-3">
              <Users className="h-4 w-4 mr-2" />
              Usuarios
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <Card className="bg-gray-900 border border-gray-700">
              <CardHeader>
                <CardTitle>Dashboard</CardTitle>
                <CardDescription>Vista general del sistema</CardDescription>
              </CardHeader>
              <CardContent>
                <p>Contenido del dashboard</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="locals">
            <LocalsManagement
              establishments={establishments.length > 0 ? establishments : mockEstablishments}
              currentUser={currentUser}
            />
          </TabsContent>

          <TabsContent value="users">
            <Card className="bg-gray-900 border border-gray-700">
              <CardHeader>
                <CardTitle>Gestión de Usuarios</CardTitle>
                <CardDescription>Administra los usuarios del sistema</CardDescription>
              </CardHeader>
              <CardContent>
                <p>Contenido de gestión de usuarios</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}


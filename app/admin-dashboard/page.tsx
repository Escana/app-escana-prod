"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { getCurrentUser, ROLES } from "@/lib/auth-client"
import { Building, Users, BarChart3, CheckCircle2, XCircle } from "lucide-react"
import { getEstablishments } from "@/app/actions/establishments"
import LocalsManagement from "./components/locals-management"
import UsersManagement from "./components/users-management"
import { mockEstablishments } from "./mock/establishments-data"

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState("dashboard")
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [establishments, setEstablishments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [unauthorized, setUnauthorized] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  // Datos de ejemplo para el dashboard
  const dashboardStats = {
    totalLocals: establishments.length,
    activeLocals: establishments.filter((est) => est.status === "active").length,
    totalUsers: 45,
    pendingPayments: 3,
    supportTickets: 7,
    recentActivity: [
      {
        id: 1,
        type: "payment",
        local: "Club Nocturno XYZ",
        amount: "$299.99",
        status: "completed",
        date: "2023-11-15",
      },
      {
        id: 2,
        type: "support",
        local: "Bar ABC",
        message: "Problema con escaneo",
        status: "pending",
        date: "2023-11-14",
      },
      { id: 3, type: "new_local", local: "Discoteca 123", status: "active", date: "2023-11-12" },
      { id: 4, type: "payment", local: "Pub El Rincón", amount: "$199.99", status: "overdue", date: "2023-11-10" },
    ],
  }

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
  }, [router, toast])

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

          <TabsContent value="dashboard" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-gray-900 border border-gray-700">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Locales Activos</CardTitle>
                  <Building className="h-4 w-4 text-gray-300" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {dashboardStats.activeLocals} / {dashboardStats.totalLocals}
                  </div>
                  <p className="text-xs text-gray-300">+2 nuevos este mes</p>
                </CardContent>
              </Card>

              <Card className="bg-gray-900 border border-gray-700">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Usuarios Registrados</CardTitle>
                  <Users className="h-4 w-4 text-gray-300" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{dashboardStats.totalUsers}</div>
                  <p className="text-xs text-gray-300">+5 nuevos este mes</p>
                </CardContent>
              </Card>

              <Card className="bg-gray-900 border border-gray-700">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Tasa de Ocupación</CardTitle>
                  <BarChart3 className="h-4 w-4 text-gray-300" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {Math.round((dashboardStats.activeLocals / Math.max(dashboardStats.totalLocals, 1)) * 100)}%
                  </div>
                  <p className="text-xs text-gray-300">Locales activos vs. total</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-1 gap-4">
              

              <Card className="bg-gray-900 border border-gray-700">
                <CardHeader>
                  <CardTitle>Estado de Locales</CardTitle>
                  <CardDescription>Resumen de estado de los locales</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 h-[300px] overflow-y-auto pr-2">
                    {establishments.map((establishment) => (
                      <div
                        key={establishment.id}
                        className="flex items-center justify-between border-b border-[#3F3F46] pb-2 mb-2"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`p-2 rounded-full ${establishment.status === "active" ? "bg-green-500/20" : "bg-yellow-500/20"}`}
                          >
                            {establishment.status === "active" ? (
                              <CheckCircle2 className="h-4 w-4 text-green-500" />
                            ) : (
                              <XCircle className="h-4 w-4 text-yellow-500" />
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-medium">{establishment.name}</p>
                            <p className="text-xs text-gray-300">
                              {establishment.address}, {establishment.city}
                            </p>
                          </div>
                        </div>
                        
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="locals">
            <LocalsManagement establishments={establishments} currentUser={currentUser} />
          </TabsContent>

          <TabsContent value="users">
            <UsersManagement establishments={establishments} currentUser={currentUser} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}


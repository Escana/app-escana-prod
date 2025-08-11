"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  User,
  Shield,
  Key,
  Save,
  Edit,
  CheckCircle,
  XCircle,
  FileText,
  UserPlus,
  Ban,
  Download,
  Eye,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useSession } from "@/lib/hooks/use-session"

export default function ProfilePage() {
  const router = useRouter()
  const { session, isLoading } = useSession()
  const [isEditing, setIsEditing] = useState(false)
  const [userData, setUserData] = useState({
    name: "",
    email: "",
    role: "",
    establishment: "Nebula Nights",
  })

  // Simulate loading user data
  useEffect(() => {
    if (session?.user) {
      setUserData({
        name: session.user.name || "Usuario",
        email: session.user.email || "usuario@example.com",
        role: session.user.role || "security",
        establishment: "Nebula Nights",
      })
    }
  }, [session])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-120px)]">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-32 w-32 bg-secondary-dark rounded-full mb-4"></div>
          <div className="h-6 w-48 bg-secondary-dark rounded mb-2"></div>
          <div className="h-4 w-64 bg-secondary-dark rounded"></div>
        </div>
      </div>
    )
  }

  const isAdmin = userData.role === "admin" || userData.role === "superadmin"

  const handleEdit = () => {
    setIsEditing(true)
  }

  const handleSave = () => {
    setIsEditing(false)
    // Aquí iría la lógica para guardar los cambios
  }

  const renderPermissionBadge = (hasPermission) => {
    return hasPermission ? (
      <Badge variant="default" className="bg-success text-white">
        <CheckCircle className="w-3 h-3 mr-1" /> Permitido
      </Badge>
    ) : (
      <Badge variant="destructive">
        <XCircle className="w-3 h-3 mr-1" /> Denegado
      </Badge>
    )
  }

  return (
    <div className="container mx-auto py-6 px-4 md:px-6">
      <h1 className="text-3xl font-bold mb-6 text-white">Perfil de Usuario</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Columna izquierda - Información básica */}
        <div className="md:col-span-1">
          <Card className="bg-[#1A2B41] border-[#2A3B51]">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl text-white">Información Básica</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="flex flex-col items-center mb-6">
                <div className="w-24 h-24 rounded-full bg-secondary-dark flex items-center justify-center mb-4">
                  <User className="w-12 h-12 text-secondary-light" />
                </div>
                <h2 className="text-xl font-semibold text-white">{userData.name}</h2>
                <Badge className="mt-2 bg-secondary text-white">
                  {userData.role === "admin" ? "Administrador" : "Seguridad"}
                </Badge>
              </div>

              <div className="space-y-4 text-white">
                <div>
                  <p className="text-sm text-gray-400">Establecimiento</p>
                  <p>{userData.establishment}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Correo Electrónico</p>
                  <p>{userData.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Último Acceso</p>
                  <p>{new Date().toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Columna derecha - Tabs con detalles */}
        <div className="md:col-span-2">
          <Tabs defaultValue="details" className="w-full">
            <TabsList className="bg-[#1A2B41] border-[#2A3B51] mb-4">
              <TabsTrigger value="details" className="data-[state=active]:bg-secondary data-[state=active]:text-white">
                <User className="w-4 h-4 mr-2" />
                Detalles
              </TabsTrigger>
              <TabsTrigger
                value="permissions"
                className="data-[state=active]:bg-secondary data-[state=active]:text-white"
              >
                <Shield className="w-4 h-4 mr-2" />
                Permisos
              </TabsTrigger>
              <TabsTrigger value="password" className="data-[state=active]:bg-secondary data-[state=active]:text-white">
                <Key className="w-4 h-4 mr-2" />
                Contraseña
              </TabsTrigger>
            </TabsList>

            {/* Contenido de Detalles */}
            <TabsContent value="details">
              <Card className="bg-[#1A2B41] border-[#2A3B51]">
                <CardHeader>
                  <CardTitle className="text-white flex justify-between items-center">
                    Información Personal
                    {isEditing ? (
                      <Button onClick={handleSave} size="sm" className="bg-success hover:bg-success/90">
                        <Save className="w-4 h-4 mr-2" /> Guardar
                      </Button>
                    ) : (
                      <Button
                        onClick={handleEdit}
                        size="sm"
                        variant="outline"
                        className="border-secondary-light text-secondary-light hover:bg-secondary-dark"
                      >
                        <Edit className="w-4 h-4 mr-2" /> Editar
                      </Button>
                    )}
                  </CardTitle>
                  <CardDescription className="text-gray-400">Actualiza tu información personal</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm text-gray-400">Nombre Completo</label>
                    <Input
                      value={userData.name}
                      onChange={(e) => setUserData({ ...userData, name: e.target.value })}
                      disabled={!isEditing}
                      className="bg-[#0D2940] border-[#2A3B51] text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-gray-400">Correo Electrónico</label>
                    <Input
                      value={userData.email}
                      onChange={(e) => setUserData({ ...userData, email: e.target.value })}
                      disabled={!isEditing}
                      className="bg-[#0D2940] border-[#2A3B51] text-white"
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Contenido de Permisos */}
            <TabsContent value="permissions">
              <Card className="bg-[#1A2B41] border-[#2A3B51]">
                <CardHeader>
                  <CardTitle className="text-white">Permisos de Usuario</CardTitle>
                  <CardDescription className="text-gray-400">
                    Permisos asignados según tu rol: {isAdmin ? "Administrador" : "Seguridad"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center py-2">
                      <div className="flex items-center">
                        <Eye className="w-5 h-5 mr-3 text-secondary-light" />
                        <span className="text-white">Ver listas de invitados</span>
                      </div>
                      {renderPermissionBadge(true)}
                    </div>
                    <Separator className="bg-[#2A3B51]" />

                    <div className="flex justify-between items-center py-2">
                      <div className="flex items-center">
                        <FileText className="w-5 h-5 mr-3 text-secondary-light" />
                        <span className="text-white">Escanear documentos</span>
                      </div>
                      {renderPermissionBadge(true)}
                    </div>
                    <Separator className="bg-[#2A3B51]" />

                    <div className="flex justify-between items-center py-2">
                      <div className="flex items-center">
                        <UserPlus className="w-5 h-5 mr-3 text-secondary-light" />
                        <span className="text-white">Crear listas de invitados</span>
                      </div>
                      {renderPermissionBadge(isAdmin)}
                    </div>
                    <Separator className="bg-[#2A3B51]" />

                    <div className="flex justify-between items-center py-2">
                      <div className="flex items-center">
                        <Ban className="w-5 h-5 mr-3 text-secondary-light" />
                        <span className="text-white">Banear usuarios</span>
                      </div>
                      {renderPermissionBadge(isAdmin)}
                    </div>
                    <Separator className="bg-[#2A3B51]" />

                    <div className="flex justify-between items-center py-2">
                      <div className="flex items-center">
                        <Download className="w-5 h-5 mr-3 text-secondary-light" />
                        <span className="text-white">Descargar datos estadísticos</span>
                      </div>
                      {renderPermissionBadge(isAdmin)}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Contenido de Contraseña */}
            <TabsContent value="password">
              <Card className="bg-[#1A2B41] border-[#2A3B51]">
                <CardHeader>
                  <CardTitle className="text-white">Cambiar Contraseña</CardTitle>
                  <CardDescription className="text-gray-400">Actualiza tu contraseña de acceso</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm text-gray-400">Contraseña Actual</label>
                    <Input
                      type="password"
                      placeholder="••••••••"
                      className="bg-[#0D2940] border-[#2A3B51] text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-gray-400">Nueva Contraseña</label>
                    <Input
                      type="password"
                      placeholder="••••••••"
                      className="bg-[#0D2940] border-[#2A3B51] text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-gray-400">Confirmar Nueva Contraseña</label>
                    <Input
                      type="password"
                      placeholder="••••••••"
                      className="bg-[#0D2940] border-[#2A3B51] text-white"
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="w-full bg-secondary hover:bg-secondary/90">
                    <Key className="w-4 h-4 mr-2" /> Actualizar Contraseña
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}


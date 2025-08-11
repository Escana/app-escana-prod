"use client"

import { useState } from "react"
import type { CompleteUserProfile } from "@/types/user-profile"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  User,
  Mail,
  Phone,
  Home,
  Calendar,
  Shield,
  Clock,
  LogIn,
  LogOut,
  AlertTriangle,
  Edit,
  Save,
  Lock,
} from "lucide-react"

interface AdminUserProfileViewProps {
  profile: CompleteUserProfile
  isOwnProfile: boolean
}

export function AdminUserProfileView({ profile, isOwnProfile }: AdminUserProfileViewProps) {
  const [activeTab, setActiveTab] = useState("general")
  const [isEditing, setIsEditing] = useState(false)
  const [editedProfile, setEditedProfile] = useState(profile)

  // Función para formatear fechas
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("es-CL", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  // Función para manejar cambios en los permisos
  const handlePermissionChange = (permissionId: string, granted: boolean) => {
    setEditedProfile((prev) => ({
      ...prev,
      permissions: prev.permissions.map((p) => (p.id === permissionId ? { ...p, granted } : p)),
    }))
  }

  // Función para guardar cambios
  const handleSaveChanges = () => {
    // Aquí iría la lógica para guardar los cambios en la base de datos
    console.log("Guardando cambios:", editedProfile)
    setIsEditing(false)
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Perfil de Usuario</h1>
          <p className="text-muted-foreground">Información detallada y configuración del usuario</p>
        </div>
        {!isEditing ? (
          <Button onClick={() => setIsEditing(true)} disabled={!isOwnProfile}>
            <Edit className="mr-2 h-4 w-4" /> Editar Perfil
          </Button>
        ) : (
          <Button onClick={handleSaveChanges}>
            <Save className="mr-2 h-4 w-4" /> Guardar Cambios
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Panel lateral con información básica */}
        <Card className="md:col-span-1">
          <CardHeader className="pb-2">
            <div className="flex justify-center mb-4">
              <div className="relative">
                <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center">
                  {profile.photo_url ? (
                    <img
                      src={profile.photo_url || "/placeholder.svg"}
                      alt={profile.name}
                      className="h-24 w-24 rounded-full object-cover"
                    />
                  ) : (
                    <User className="h-12 w-12 text-primary" />
                  )}
                </div>
                <Badge
                  className={`absolute bottom-0 right-0 ${profile.status === "Activo" ? "bg-green-500" : "bg-red-500"}`}
                >
                  {profile.status}
                </Badge>
              </div>
            </div>
            <CardTitle className="text-center">{profile.name}</CardTitle>
            <CardDescription className="text-center">
              <Badge variant="outline" className="mt-1">
                {profile.role === "superadmin"
                  ? "Super Administrador"
                  : profile.role === "admin"
                    ? "Administrador"
                    : "Guardia de Seguridad"}
              </Badge>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center">
                <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                <span className="text-sm">{profile.email}</span>
              </div>
              <div className="flex items-center">
                <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                <span className="text-sm">{profile.contact_info.phone || "No registrado"}</span>
              </div>
              <div className="flex items-center">
                <Home className="h-4 w-4 mr-2 text-muted-foreground" />
                <span className="text-sm">{profile.establishment_name || "No asignado"}</span>
              </div>
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                <span className="text-sm">Creado: {formatDate(profile.created_at)}</span>
              </div>
            </div>
            <Separator />
            <div>
              <h3 className="text-sm font-medium mb-2">Contacto de emergencia</h3>
              <p className="text-sm">{profile.contact_info.emergency_contact || "No registrado"}</p>
            </div>
          </CardContent>
        </Card>

        {/* Panel principal con pestañas */}
        <Card className="md:col-span-2">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <CardHeader className="pb-0">
              <TabsList className="grid grid-cols-3">
                <TabsTrigger value="general">General</TabsTrigger>
                <TabsTrigger value="permissions">Permisos</TabsTrigger>
                <TabsTrigger value="activity">Actividad</TabsTrigger>
              </TabsList>
            </CardHeader>
            <CardContent className="pt-6">
              <TabsContent value="general" className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium mb-2">Información Personal</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Nombre completo</Label>
                      <div className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2">
                        {profile.name}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Correo electrónico</Label>
                      <div className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2">
                        {profile.email}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Teléfono</Label>
                      <div className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2">
                        {profile.contact_info.phone || "No registrado"}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="role">Rol</Label>
                      <div className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2">
                        {profile.role === "superadmin"
                          ? "Super Administrador"
                          : profile.role === "admin"
                            ? "Administrador"
                            : "Guardia de Seguridad"}
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="text-lg font-medium mb-2">Dirección</h3>
                  <div className="space-y-2">
                    <Label htmlFor="address">Dirección completa</Label>
                    <div className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2">
                      {profile.contact_info.address || "No registrada"}
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="text-lg font-medium mb-2">Establecimiento</h3>
                  <div className="space-y-2">
                    <Label htmlFor="establishment">Establecimiento asignado</Label>
                    <div className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2">
                      {profile.establishment_name || "No asignado"}
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="permissions" className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium mb-4">Permisos del Sistema</h3>
                  <div className="space-y-4">
                    {profile.permissions.map((permission) => (
                      <div key={permission.id} className="flex items-start justify-between">
                        <div className="space-y-0.5">
                          <div className="flex items-center">
                            <Shield className="h-4 w-4 mr-2 text-muted-foreground" />
                            <Label htmlFor={`permission-${permission.id}`} className="font-medium">
                              {permission.name}
                            </Label>
                          </div>
                          <p className="text-sm text-muted-foreground ml-6">{permission.description}</p>
                        </div>
                        <Switch
                          id={`permission-${permission.id}`}
                          checked={permission.granted}
                          onCheckedChange={(checked) => handlePermissionChange(permission.id, checked)}
                          disabled={!isEditing}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="text-lg font-medium mb-4">Seguridad</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <div className="flex items-center">
                          <Lock className="h-4 w-4 mr-2 text-muted-foreground" />
                          <Label htmlFor="reset-password" className="font-medium">
                            Restablecer contraseña
                          </Label>
                        </div>
                        <p className="text-sm text-muted-foreground ml-6">
                          Enviar un correo para restablecer la contraseña
                        </p>
                      </div>
                      <Button variant="outline" size="sm" disabled={!isEditing}>
                        Enviar correo
                      </Button>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="activity" className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium mb-2">Registro de Actividad</h3>
                  <p className="text-sm text-muted-foreground mb-4">Historial de accesos y actividades del usuario</p>

                  <ScrollArea className="h-[300px] rounded-md border">
                    <div className="p-4 space-y-4">
                      {profile.access_logs.map((log) => (
                        <div key={log.id} className="flex items-start space-x-3 pb-3 border-b last:border-0">
                          <div className={`p-2 rounded-full ${log.action === "entry" ? "bg-green-100" : "bg-red-100"}`}>
                            {log.action === "entry" ? (
                              <LogIn className={`h-4 w-4 text-green-600`} />
                            ) : (
                              <LogOut className={`h-4 w-4 text-red-600`} />
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="font-medium">{log.action === "entry" ? "Entrada" : "Salida"}</p>
                                <p className="text-sm text-muted-foreground">
                                  {log.location} {log.device ? `- ${log.device}` : ""}
                                </p>
                              </div>
                              <p className="text-sm text-muted-foreground">{formatDate(log.timestamp)}</p>
                            </div>
                          </div>
                        </div>
                      ))}

                      {/* Actividades adicionales simuladas */}
                      <div className="flex items-start space-x-3 pb-3 border-b">
                        <div className="p-2 rounded-full bg-blue-100">
                          <Clock className="h-4 w-4 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium">Cambio de turno</p>
                              <p className="text-sm text-muted-foreground">Turno nocturno asignado</p>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {formatDate(new Date(Date.now() - 172800000).toISOString())}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-start space-x-3 pb-3 border-b">
                        <div className="p-2 rounded-full bg-yellow-100">
                          <AlertTriangle className="h-4 w-4 text-yellow-600" />
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium">Incidente reportado</p>
                              <p className="text-sm text-muted-foreground">Cliente con comportamiento agresivo</p>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {formatDate(new Date(Date.now() - 259200000).toISOString())}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </ScrollArea>
                </div>
              </TabsContent>
            </CardContent>
          </Tabs>
        </Card>
      </div>
    </div>
  )
}


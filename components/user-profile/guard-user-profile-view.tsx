"use client"

import type { CompleteUserProfile } from "@/types/user-profile"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { User, Mail, Phone, Home, Clock, LogIn, LogOut, CheckCircle } from "lucide-react"

interface GuardUserProfileViewProps {
  profile: CompleteUserProfile
}

export function GuardUserProfileView({ profile }: GuardUserProfileViewProps) {
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

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Mi Perfil</h1>
          <p className="text-muted-foreground">Información personal y registro de actividad</p>
        </div>
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
                Guardia de Seguridad
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
            </div>
            <Separator />
            <div>
              <h3 className="text-sm font-medium mb-2">Contacto de emergencia</h3>
              <p className="text-sm">{profile.contact_info.emergency_contact || "No registrado"}</p>
            </div>
          </CardContent>
        </Card>

        {/* Panel principal con información simplificada */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Información de Acceso</CardTitle>
            <CardDescription>Registro de entradas y salidas recientes</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Estado actual */}
            <div className="bg-muted p-4 rounded-lg">
              <h3 className="text-lg font-medium mb-2">Estado Actual</h3>
              <div className="flex items-center space-x-2">
                <div className="h-3 w-3 rounded-full bg-green-500"></div>
                <span>Activo - En servicio</span>
              </div>
              <div className="mt-2 text-sm text-muted-foreground">
                Turno actual: {formatDate(new Date().toISOString())}
              </div>
            </div>

            {/* Permisos simplificados */}
            <div>
              <h3 className="text-lg font-medium mb-2">Permisos Activos</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {profile.permissions
                  .filter((p) => p.granted)
                  .map((permission) => (
                    <div key={permission.id} className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>{permission.name}</span>
                    </div>
                  ))}
              </div>
            </div>

            <Separator />

            {/* Registro de actividad simplificado */}
            <div>
              <h3 className="text-lg font-medium mb-2">Registro de Actividad</h3>
              <ScrollArea className="h-[250px] rounded-md border">
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

                  {/* Actividades adicionales simplificadas */}
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
                </div>
              </ScrollArea>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}


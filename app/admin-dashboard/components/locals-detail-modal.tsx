"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Building, Users, CreditCard, Calendar, MapPin, Phone, Mail, CheckCircle2, XCircle } from "lucide-react"

export function LocalsDetailModal({ establishments = [] }) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedEstablishment, setSelectedEstablishment] = useState(null)

  useEffect(() => {
    // Escuchar el evento personalizado para abrir el modal
    const handleOpenModal = () => setIsOpen(true)
    document.addEventListener("open-locals-details", handleOpenModal)

    return () => {
      document.removeEventListener("open-locals-details", handleOpenModal)
    }
  }, [])

  const handleEstablishmentClick = (establishment) => {
    setSelectedEstablishment(establishment)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="bg-gray-900 border border-gray-700 text-white max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl text-white">Detalles de Locales</DialogTitle>
          <DialogDescription className="text-gray-400">
            Información detallada sobre todos los locales registrados en la plataforma
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <div className="md:col-span-1 border border-gray-700 rounded-md p-2 h-[500px] overflow-y-auto">
            <h3 className="font-medium text-white mb-2">Lista de Locales</h3>
            <div className="space-y-2">
              {establishments.length === 0 ? (
                <p className="text-gray-400">No hay locales registrados</p>
              ) : (
                establishments.map((establishment) => (
                  <div
                    key={establishment.id}
                    className={`p-2 rounded-md cursor-pointer transition-colors ${
                      selectedEstablishment?.id === establishment.id
                        ? "bg-blue-900 border border-blue-700"
                        : "hover:bg-gray-800 border border-gray-700"
                    }`}
                    onClick={() => handleEstablishmentClick(establishment)}
                  >
                    <div className="flex items-center gap-2">
                      <Building className="h-4 w-4 text-blue-500" />
                      <span className="font-medium">{establishment.name}</span>
                    </div>
                    <div className="text-sm text-gray-400 mt-1 flex items-center gap-1">
                      <MapPin className="h-3 w-3" /> {establishment.city}, {establishment.country}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge
                        variant={establishment.status === "active" ? "default" : "secondary"}
                        className={establishment.status === "active" ? "bg-green-500" : "bg-yellow-500"}
                      >
                        {establishment.status === "active" ? "Activo" : "Inactivo"}
                      </Badge>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="md:col-span-2">
            {selectedEstablishment ? (
              <Tabs defaultValue="general" className="w-full">
                <TabsList className="bg-gray-800 border border-gray-700">
                  <TabsTrigger value="general" className="data-[state=active]:bg-gray-700">
                    General
                  </TabsTrigger>
                  <TabsTrigger value="users" className="data-[state=active]:bg-gray-700">
                    Usuarios
                  </TabsTrigger>
                  <TabsTrigger value="payments" className="data-[state=active]:bg-gray-700">
                    Pagos
                  </TabsTrigger>
                  <TabsTrigger value="stats" className="data-[state=active]:bg-gray-700">
                    Estadísticas
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="general" className="mt-4">
                  <Card className="bg-gray-800 border border-gray-700">
                    <CardHeader>
                      <CardTitle className="text-white">{selectedEstablishment.name}</CardTitle>
                      <CardDescription className="text-gray-400">Información general del local</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-gray-400" />
                            <span className="text-white font-medium">Dirección:</span>
                          </div>
                          <p className="text-gray-300 ml-6">{selectedEstablishment.address}</p>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-gray-400" />
                            <span className="text-white font-medium">Ciudad/País:</span>
                          </div>
                          <p className="text-gray-300 ml-6">
                            {selectedEstablishment.city}, {selectedEstablishment.country}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <span className="text-white font-medium">Fecha de registro:</span>
                          </div>
                          <p className="text-gray-300 ml-6">
                            {selectedEstablishment.createdAt
                              ? new Date(selectedEstablishment.createdAt).toLocaleDateString()
                              : "No disponible"}
                          </p>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Badge
                              variant={selectedEstablishment.status === "active" ? "default" : "secondary"}
                              className={`${
                                selectedEstablishment.status === "active" ? "bg-green-500" : "bg-yellow-500"
                              } ml-0`}
                            >
                              {selectedEstablishment.status === "active" ? (
                                <div className="flex items-center gap-1">
                                  <CheckCircle2 className="h-3 w-3" /> Activo
                                </div>
                              ) : (
                                <div className="flex items-center gap-1">
                                  <XCircle className="h-3 w-3" /> Inactivo
                                </div>
                              )}
                            </Badge>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-gray-400" />
                          <span className="text-white font-medium">Contacto:</span>
                        </div>
                        <div className="ml-6 space-y-2">
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-gray-400" />
                            <span className="text-gray-300">
                              {selectedEstablishment.contactEmail || "No disponible"}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-gray-400" />
                            <span className="text-gray-300">
                              {selectedEstablishment.contactPhone || "No disponible"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="users" className="mt-4">
                  <Card className="bg-gray-800 border border-gray-700">
                    <CardHeader>
                      <CardTitle className="text-white">Usuarios del Local</CardTitle>
                      <CardDescription className="text-gray-400">
                        Empleados y administradores registrados
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center py-8 text-gray-400">
                        <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p>Información de usuarios no disponible</p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="payments" className="mt-4">
                  <Card className="bg-gray-800 border border-gray-700">
                    <CardHeader>
                      <CardTitle className="text-white">Historial de Pagos</CardTitle>
                      <CardDescription className="text-gray-400">Registro de pagos y facturación</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center py-8 text-gray-400">
                        <CreditCard className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p>Historial de pagos no disponible</p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="stats" className="mt-4">
                  <Card className="bg-gray-800 border border-gray-700">
                    <CardHeader>
                      <CardTitle className="text-white">Estadísticas</CardTitle>
                      <CardDescription className="text-gray-400">Métricas y análisis de uso</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center py-8 text-gray-400">
                        <Building className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p>Estadísticas no disponibles</p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            ) : (
              <div className="flex items-center justify-center h-full border border-gray-700 rounded-md p-8">
                <div className="text-center text-gray-400">
                  <Building className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Seleccione un local para ver sus detalles</p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end mt-4">
          <DialogClose asChild>
            <Button variant="outline" className="bg-gray-800 text-white hover:bg-gray-700 border border-gray-700">
              Cerrar
            </Button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  )
}


"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ROLES } from "@/lib/auth-client"
import Link from "next/link"

export default function EstablishmentsManagement({ establishments = [], currentUser }) {
  console.log("[EstablishmentsManagement] Recibidos:", {
    establishmentsCount: establishments.length,
    currentUser: currentUser?.email,
  })
  console.log("[EstablishmentsManagement] Establecimientos:", establishments)
  const [searchTerm, setSearchTerm] = useState("")

  // Vamos a simplificar este componente para mantener el diseño original
  // pero adaptarlo a la estructura de datos

  // Modificar la función de filtrado para asegurar que funcione con los datos de Supabase

  // Modificar la función de filtrado para manejar campos opcionales
  const filteredEstablishments = establishments.filter(
    (establishment) =>
      (establishment.name && establishment.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (establishment.address && establishment.address.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (establishment.city && establishment.city.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (establishment.country && establishment.country.toLowerCase().includes(searchTerm.toLowerCase())),
  )

  // Modificar la agrupación por estado para manejar diferentes formatos
  const activeEstablishments = filteredEstablishments.filter(
    (est) => est.status === "active" || est.status === "activo" || est.status === true,
  )
  const inactiveEstablishments = filteredEstablishments.filter(
    (est) => est.status === "inactive" || est.status === "inactivo" || est.status === false,
  )
  const pendingEstablishments = filteredEstablishments.filter(
    (est) => !activeEstablishments.includes(est) && !inactiveEstablishments.includes(est),
  )

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Gestión de Establecimientos</h2>
        {currentUser.role === ROLES.SUPERADMIN && (
          <Button asChild>
            <Link href="/admin-dashboard/create-establishment">Crear Establecimiento</Link>
          </Button>
        )}
      </div>

      <div className="grid gap-4">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <Label htmlFor="search-establishments" className="sr-only">
              Buscar
            </Label>
            <Input
              id="search-establishments"
              placeholder="Buscar establecimientos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <Tabs defaultValue="all" className="space-y-4">
          <TabsList>
            <TabsTrigger value="all">Todos ({filteredEstablishments.length})</TabsTrigger>
            <TabsTrigger value="active">Activos ({activeEstablishments.length})</TabsTrigger>
            <TabsTrigger value="inactive">Inactivos ({inactiveEstablishments.length})</TabsTrigger>
            <TabsTrigger value="pending">Pendientes ({pendingEstablishments.length})</TabsTrigger>
          </TabsList>
          <TabsContent value="all" className="space-y-4">
            <EstablishmentsList establishments={filteredEstablishments} currentUser={currentUser} />
          </TabsContent>
          <TabsContent value="active" className="space-y-4">
            <EstablishmentsList establishments={activeEstablishments} currentUser={currentUser} />
          </TabsContent>
          <TabsContent value="inactive" className="space-y-4">
            <EstablishmentsList establishments={inactiveEstablishments} currentUser={currentUser} />
          </TabsContent>
          <TabsContent value="pending" className="space-y-4">
            <EstablishmentsList establishments={pendingEstablishments} currentUser={currentUser} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

// 3. Modificar el componente EstablishmentsList para manejar campos opcionales
function EstablishmentsList({ establishments, currentUser }) {
  if (establishments.length === 0) {
    return (
      <Card className="bg-gray-900 border border-gray-700">
        <CardContent className="pt-6">
          <div className="text-center py-4 text-gray-400">No hay establecimientos que mostrar</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {establishments.map((establishment) => (
        <Card key={establishment.id} className="bg-gray-900 border border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle>{establishment.name || "Sin nombre"}</CardTitle>
            <CardDescription>
              {establishment.address && `${establishment.address}, `}
              {establishment.city && `${establishment.city}, `}
              {establishment.country || ""}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="text-gray-400">Estado:</div>
                <div
                  className={`font-medium ${
                    establishment.status === "active"
                      ? "text-green-400"
                      : establishment.status === "inactive"
                        ? "text-red-400"
                        : "text-yellow-400"
                  }`}
                >
                  {establishment.status === "active"
                    ? "Activo"
                    : establishment.status === "inactive"
                      ? "Inactivo"
                      : establishment.status || "Pendiente"}
                </div>

                {establishment.created_at && (
                  <>
                    <div className="text-gray-400">Creado:</div>
                    <div className="font-medium">{new Date(establishment.created_at).toLocaleDateString()}</div>
                  </>
                )}
              </div>

              <div className="flex justify-end gap-2 mt-4">
                <Button variant="outline" size="sm">
                  Ver detalles
                </Button>
                {currentUser.role === ROLES.SUPERADMIN && (
                  <Button variant="outline" size="sm">
                    Editar
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}


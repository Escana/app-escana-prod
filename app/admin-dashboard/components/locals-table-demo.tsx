"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Building, CheckCircle2, XCircle, MapPin, Users, CreditCard } from "lucide-react"

// Datos de ejemplo directamente en el componente
const mockEstablishments = [
  {
    id: 1,
    name: "Escana Santiago Centro",
    address: "Av. Libertador Bernardo O'Higgins 1234",
    city: "Santiago",
    country: "Chile",
    status: "active",
    plan: "premium",
    userCount: 12,
    lastPayment: "15/05/2024",
  },
  {
    id: 2,
    name: "Escana Providencia",
    address: "Av. Providencia 2345",
    city: "Santiago",
    country: "Chile",
    status: "active",
    plan: "enterprise",
    userCount: 18,
    lastPayment: "10/05/2024",
  },
  {
    id: 3,
    name: "Escana Viña del Mar",
    address: "Av. San Martín 789",
    city: "Viña del Mar",
    country: "Chile",
    status: "inactive",
    plan: "basic",
    userCount: 5,
    lastPayment: "01/04/2024",
  },
  {
    id: 4,
    name: "Escana Concepción",
    address: "Barros Arana 456",
    city: "Concepción",
    country: "Chile",
    status: "active",
    plan: "premium",
    userCount: 10,
    lastPayment: "20/05/2024",
  },
  {
    id: 5,
    name: "Escana Antofagasta",
    address: "Av. Balmaceda 789",
    city: "Antofagasta",
    country: "Chile",
    status: "active",
    plan: "basic",
    userCount: 7,
    lastPayment: "05/05/2024",
  },
  {
    id: 6,
    name: "Escana Puerto Montt",
    address: "Urmeneta 498",
    city: "Puerto Montt",
    country: "Chile",
    status: "inactive",
    plan: "premium",
    userCount: 9,
    lastPayment: "28/04/2024",
  },
]

export default function LocalsTableDemo() {
  return (
    <Card className="bg-gray-900 border border-gray-700">
      <CardHeader>
        <CardTitle className="text-xl">Demostración de Tabla de Locales</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border border-gray-700">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-gray-800">
                <TableHead className="text-white">Nombre</TableHead>
                <TableHead className="text-white">Ubicación</TableHead>
                <TableHead className="text-white">Estado</TableHead>
                <TableHead className="text-white">Plan</TableHead>
                <TableHead className="text-white">Usuarios</TableHead>
                <TableHead className="text-white">Último Pago</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockEstablishments.map((establishment) => (
                <TableRow key={establishment.id} className="hover:bg-gray-800">
                  <TableCell className="font-medium text-white">
                    <div className="flex items-center gap-2">
                      <Building className="h-4 w-4 text-[#3B82F6]" />
                      {establishment.name}
                    </div>
                  </TableCell>
                  <TableCell className="text-white">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      {establishment.city}, {establishment.country}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={establishment.status === "active" ? "default" : "secondary"}
                      className={establishment.status === "active" ? "bg-green-500" : "bg-yellow-500"}
                    >
                      {establishment.status === "active" ? (
                        <div className="flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3" /> Activo
                        </div>
                      ) : (
                        <div className="flex items-center gap-1">
                          <XCircle className="h-3 w-3" /> Inactivo
                        </div>
                      )}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-white">
                    <Badge variant="outline" className="bg-[#3F3F46] text-white">
                      {establishment.plan === "basic"
                        ? "Básico"
                        : establishment.plan === "premium"
                          ? "Premium"
                          : "Empresarial"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-white">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-gray-400" />
                      {establishment.userCount || 0}
                    </div>
                  </TableCell>
                  <TableCell className="text-white">
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4 text-gray-400" />
                      {establishment.lastPayment || "No registrado"}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}


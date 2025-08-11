"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  Search,
  Download,
  Building,
  DollarSign,
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
} from "lucide-react"

// Datos de ejemplo para pagos
const MOCK_PAYMENTS = [
  {
    id: "PAY-001",
    establishment_id: "1",
    establishment_name: "Club Nocturno XYZ",
    amount: 299.99,
    status: "completed",
    date: "2023-11-15",
    dueDate: "2023-11-15",
    plan: "premium",
    paymentMethod: "credit_card",
    invoiceNumber: "INV-2023-001",
  },
  {
    id: "PAY-002",
    establishment_id: "2",
    establishment_name: "Bar ABC",
    amount: 199.99,
    status: "pending",
    date: "2023-11-14",
    dueDate: "2023-11-20",
    plan: "basic",
    paymentMethod: "bank_transfer",
    invoiceNumber: "INV-2023-002",
  },
  {
    id: "PAY-003",
    establishment_id: "3",
    establishment_name: "Discoteca 123",
    amount: 499.99,
    status: "completed",
    date: "2023-11-12",
    dueDate: "2023-11-12",
    plan: "enterprise",
    paymentMethod: "credit_card",
    invoiceNumber: "INV-2023-003",
  },
  {
    id: "PAY-004",
    establishment_id: "4",
    establishment_name: "Pub El Rincón",
    amount: 199.99,
    status: "overdue",
    date: "2023-11-10",
    dueDate: "2023-11-10",
    plan: "basic",
    paymentMethod: "bank_transfer",
    invoiceNumber: "INV-2023-004",
  },
  {
    id: "PAY-005",
    establishment_id: "5",
    establishment_name: "Club La Noche",
    amount: 299.99,
    status: "completed",
    date: "2023-11-05",
    dueDate: "2023-11-05",
    plan: "premium",
    paymentMethod: "credit_card",
    invoiceNumber: "INV-2023-005",
  },
]

export default function PaymentsManagement({ establishments, currentUser }) {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  // Filtrar pagos según búsqueda y filtro de estado
  const filteredPayments = MOCK_PAYMENTS.filter((payment) => {
    const matchesSearch =
      payment.establishment_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || payment.status === statusFilter

    return matchesSearch && matchesStatus
  })

  // Estadísticas de pagos
  const paymentStats = {
    total: MOCK_PAYMENTS.length,
    completed: MOCK_PAYMENTS.filter((p) => p.status === "completed").length,
    pending: MOCK_PAYMENTS.filter((p) => p.status === "pending").length,
    overdue: MOCK_PAYMENTS.filter((p) => p.status === "overdue").length,
    totalAmount: MOCK_PAYMENTS.reduce((sum, p) => sum + p.amount, 0).toFixed(2),
  }

  return (
    <Card className="bg-gray-900 border border-gray-700">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl">Gestión de Pagos</CardTitle>
            <CardDescription>Administra los pagos de todos los locales</CardDescription>
          </div>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Download className="mr-2 h-4 w-4" /> Exportar Reporte
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
          <Card className="bg-gray-800 border border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Facturado</CardTitle>
              <DollarSign className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${paymentStats.totalAmount}</div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pagos Completados</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{paymentStats.completed}</div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pagos Pendientes</CardTitle>
              <Clock className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{paymentStats.pending}</div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pagos Atrasados</CardTitle>
              <AlertCircle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{paymentStats.overdue}</div>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mt-4">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              type="text"
              placeholder="Buscar pagos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-gray-800 border border-gray-700 text-white placeholder-gray-400 pl-10"
            />
          </div>

          <div className="flex gap-2">
            <Button
              variant={statusFilter === "all" ? "default" : "outline"}
              onClick={() => setStatusFilter("all")}
              className={statusFilter === "all" ? "bg-blue-600" : "bg-gray-800 border border-gray-700"}
            >
              Todos
            </Button>
            <Button
              variant={statusFilter === "completed" ? "default" : "outline"}
              onClick={() => setStatusFilter("completed")}
              className={statusFilter === "completed" ? "bg-green-600" : "bg-gray-800 border border-gray-700"}
            >
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Completados
            </Button>
            <Button
              variant={statusFilter === "pending" ? "default" : "outline"}
              onClick={() => setStatusFilter("pending")}
              className={statusFilter === "pending" ? "bg-yellow-600" : "bg-gray-800 border border-gray-700"}
            >
              <Clock className="mr-2 h-4 w-4" />
              Pendientes
            </Button>
            <Button
              variant={statusFilter === "overdue" ? "default" : "outline"}
              onClick={() => setStatusFilter("overdue")}
              className={statusFilter === "overdue" ? "bg-red-600" : "bg-gray-800 border border-gray-700"}
            >
              <XCircle className="mr-2 h-4 w-4" />
              Atrasados
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border border-gray-700">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-gray-800">
                <TableHead className="text-white">Factura</TableHead>
                <TableHead className="text-white">Local</TableHead>
                <TableHead className="text-white">Plan</TableHead>
                <TableHead className="text-white">Monto</TableHead>
                <TableHead className="text-white">Fecha</TableHead>
                <TableHead className="text-white">Vencimiento</TableHead>
                <TableHead className="text-white">Estado</TableHead>
                <TableHead className="text-white text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPayments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-4 text-muted-foreground">
                    No se encontraron pagos
                  </TableCell>
                </TableRow>
              ) : (
                filteredPayments.map((payment) => (
                  <TableRow key={payment.id} className="hover:bg-gray-800">
                    <TableCell className="font-medium text-white">{payment.invoiceNumber}</TableCell>
                    <TableCell className="text-white">
                      <div className="flex items-center gap-2">
                        <Building className="h-4 w-4 text-[#3B82F6]" />
                        {payment.establishment_name}
                      </div>
                    </TableCell>
                    <TableCell className="text-white">
                      <Badge variant="outline" className="bg-[#3F3F46] text-white">
                        {payment.plan === "basic" ? "Básico" : payment.plan === "premium" ? "Premium" : "Empresarial"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-white font-medium">${payment.amount.toFixed(2)}</TableCell>
                    <TableCell className="text-white">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        {payment.date}
                      </div>
                    </TableCell>
                    <TableCell className="text-white">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        {payment.dueDate}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={`
                          ${
                            payment.status === "completed"
                              ? "bg-green-500/20 text-green-300"
                              : payment.status === "pending"
                                ? "bg-yellow-500/20 text-yellow-300"
                                : "bg-red-500/20 text-red-300"
                          }
                        `}
                      >
                        <div className="flex items-center gap-1">
                          {payment.status === "completed" ? (
                            <>
                              <CheckCircle2 className="h-3 w-3" /> Completado
                            </>
                          ) : payment.status === "pending" ? (
                            <>
                              <Clock className="h-3 w-3" /> Pendiente
                            </>
                          ) : (
                            <>
                              <XCircle className="h-3 w-3" /> Atrasado
                            </>
                          )}
                        </div>
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm" className="h-8 bg-[#3F3F46]">
                          <Download className="h-4 w-4 mr-2" /> Factura
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}


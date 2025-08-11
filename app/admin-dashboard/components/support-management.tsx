"use client"

import { Label } from "@/components/ui/label"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { LifeBuoy, Search, Building, MessageSquare, Calendar, CheckCircle2, XCircle, Clock, Send } from "lucide-react"

// Datos de ejemplo para tickets de soporte
const MOCK_TICKETS = [
  {
    id: "TIC-001",
    establishment_id: "1",
    establishment_name: "Club Nocturno XYZ",
    subject: "Problema con escaneo de documentos",
    message: "El escáner no reconoce algunos documentos de identidad extranjeros. Necesitamos ayuda urgente.",
    status: "open",
    priority: "high",
    date: "2023-11-15",
    lastUpdate: "2023-11-15",
    messages: [
      {
        id: 1,
        sender: "client",
        senderName: "Juan Pérez",
        message: "El escáner no reconoce algunos documentos de identidad extranjeros. Necesitamos ayuda urgente.",
        date: "2023-11-15 10:30",
      },
    ],
  },
  {
    id: "TIC-002",
    establishment_id: "2",
    establishment_name: "Bar ABC",
    subject: "Error en el sistema de listas de invitados",
    message: "No podemos crear nuevas listas de invitados. Aparece un error al intentar guardar.",
    status: "in_progress",
    priority: "medium",
    date: "2023-11-14",
    lastUpdate: "2023-11-14",
    messages: [
      {
        id: 1,
        sender: "client",
        senderName: "María López",
        message: "No podemos crear nuevas listas de invitados. Aparece un error al intentar guardar.",
        date: "2023-11-14 15:45",
      },
      {
        id: 2,
        sender: "support",
        senderName: "Soporte Técnico",
        message: "Estamos revisando el problema. ¿Podría proporcionarnos una captura de pantalla del error?",
        date: "2023-11-14 16:20",
      },
    ],
  },
  {
    id: "TIC-003",
    establishment_id: "3",
    establishment_name: "Discoteca 123",
    subject: "Solicitud de nueva funcionalidad",
    message:
      "Nos gustaría tener la opción de enviar notificaciones a los clientes cuando son agregados a una lista VIP.",
    status: "open",
    priority: "low",
    date: "2023-11-12",
    lastUpdate: "2023-11-12",
    messages: [
      {
        id: 1,
        sender: "client",
        senderName: "Carlos Rodríguez",
        message:
          "Nos gustaría tener la opción de enviar notificaciones a los clientes cuando son agregados a una lista VIP.",
        date: "2023-11-12 09:15",
      },
    ],
  },
  {
    id: "TIC-004",
    establishment_id: "4",
    establishment_name: "Pub El Rincón",
    subject: "Problema con la facturación",
    message: "La última factura tiene un error en el monto. Necesitamos una corrección.",
    status: "closed",
    priority: "medium",
    date: "2023-11-10",
    lastUpdate: "2023-11-11",
    messages: [
      {
        id: 1,
        sender: "client",
        senderName: "Ana Martínez",
        message: "La última factura tiene un error en el monto. Necesitamos una corrección.",
        date: "2023-11-10 14:00",
      },
      {
        id: 2,
        sender: "support",
        senderName: "Soporte Técnico",
        message:
          "Hemos revisado la factura y efectivamente hay un error. Estamos generando una nueva factura con el monto correcto.",
        date: "2023-11-10 16:30",
      },
      {
        id: 3,
        sender: "support",
        senderName: "Soporte Técnico",
        message:
          "Hemos enviado la factura corregida a su correo electrónico. Por favor, confirme si la ha recibido correctamente.",
        date: "2023-11-11 09:45",
      },
      {
        id: 4,
        sender: "client",
        senderName: "Ana Martínez",
        message: "Recibí la factura correctamente. Gracias por la rápida solución.",
        date: "2023-11-11 10:20",
      },
    ],
  },
  {
    id: "TIC-005",
    establishment_id: "5",
    establishment_name: "Club La Noche",
    subject: "Capacitación para nuevos empleados",
    message:
      "Necesitamos programar una sesión de capacitación para 3 nuevos guardias que se incorporarán la próxima semana.",
    status: "in_progress",
    priority: "medium",
    date: "2023-11-08",
    lastUpdate: "2023-11-09",
    messages: [
      {
        id: 1,
        sender: "client",
        senderName: "Roberto Gómez",
        message:
          "Necesitamos programar una sesión de capacitación para 3 nuevos guardias que se incorporarán la próxima semana.",
        date: "2023-11-08 11:20",
      },
      {
        id: 2,
        sender: "support",
        senderName: "Soporte Técnico",
        message: "Podemos programar la capacitación para el próximo lunes o martes. ¿Qué día les vendría mejor?",
        date: "2023-11-09 10:15",
      },
    ],
  },
]

export default function SupportManagement({ establishments, currentUser }) {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedTicket, setSelectedTicket] = useState(null)
  const [isTicketDialogOpen, setIsTicketDialogOpen] = useState(false)
  const [replyMessage, setReplyMessage] = useState("")

  // Filtrar tickets según búsqueda y filtro de estado
  const filteredTickets = MOCK_TICKETS.filter((ticket) => {
    const matchesSearch =
      ticket.establishment_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.message.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || ticket.status === statusFilter

    return matchesSearch && matchesStatus
  })

  // Estadísticas de tickets
  const ticketStats = {
    total: MOCK_TICKETS.length,
    open: MOCK_TICKETS.filter((t) => t.status === "open").length,
    inProgress: MOCK_TICKETS.filter((t) => t.status === "in_progress").length,
    closed: MOCK_TICKETS.filter((t) => t.status === "closed").length,
    highPriority: MOCK_TICKETS.filter((t) => t.priority === "high" && t.status !== "closed").length,
  }

  const handleReplySubmit = () => {
    if (!replyMessage.trim() || !selectedTicket) return

    // En una implementación real, aquí enviaríamos la respuesta a la API
    console.log("Enviando respuesta al ticket:", selectedTicket.id, replyMessage)

    // Limpiar el campo de respuesta
    setReplyMessage("")

    // Cerrar el diálogo
    setIsTicketDialogOpen(false)
  }

  return (
    <Card className="bg-gray-900 border border-gray-700">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl">Gestión de Soporte</CardTitle>
            <CardDescription>Administra las solicitudes de soporte de los locales</CardDescription>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
          <Card className="bg-gray-800 border border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Tickets</CardTitle>
              <LifeBuoy className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{ticketStats.total}</div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tickets Abiertos</CardTitle>
              <MessageSquare className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{ticketStats.open}</div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">En Progreso</CardTitle>
              <Clock className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{ticketStats.inProgress}</div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Alta Prioridad</CardTitle>
              <XCircle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{ticketStats.highPriority}</div>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mt-4">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              type="text"
              placeholder="Buscar tickets..."
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
              variant={statusFilter === "open" ? "default" : "outline"}
              onClick={() => setStatusFilter("open")}
              className={statusFilter === "open" ? "bg-yellow-600" : "bg-gray-800 border border-gray-700"}
            >
              <MessageSquare className="mr-2 h-4 w-4" />
              Abiertos
            </Button>
            <Button
              variant={statusFilter === "in_progress" ? "default" : "outline"}
              onClick={() => setStatusFilter("in_progress")}
              className={statusFilter === "in_progress" ? "bg-blue-600" : "bg-gray-800 border border-gray-700"}
            >
              <Clock className="mr-2 h-4 w-4" />
              En Progreso
            </Button>
            <Button
              variant={statusFilter === "closed" ? "default" : "outline"}
              onClick={() => setStatusFilter("closed")}
              className={statusFilter === "closed" ? "bg-green-600" : "bg-gray-800 border border-gray-700"}
            >
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Cerrados
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border border-gray-700">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-gray-800">
                <TableHead className="text-white">ID</TableHead>
                <TableHead className="text-white">Local</TableHead>
                <TableHead className="text-white">Asunto</TableHead>
                <TableHead className="text-white">Prioridad</TableHead>
                <TableHead className="text-white">Fecha</TableHead>
                <TableHead className="text-white">Estado</TableHead>
                <TableHead className="text-white text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTickets.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-4 text-muted-foreground">
                    No se encontraron tickets de soporte
                  </TableCell>
                </TableRow>
              ) : (
                filteredTickets.map((ticket) => (
                  <TableRow key={ticket.id} className="hover:bg-gray-800">
                    <TableCell className="font-medium text-white">{ticket.id}</TableCell>
                    <TableCell className="text-white">
                      <div className="flex items-center gap-2">
                        <Building className="h-4 w-4 text-[#3B82F6]" />
                        {ticket.establishment_name}
                      </div>
                    </TableCell>
                    <TableCell className="text-white">{ticket.subject}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={`
                          ${
                            ticket.priority === "high"
                              ? "bg-red-500/20 text-red-300"
                              : ticket.priority === "medium"
                                ? "bg-yellow-500/20 text-yellow-300"
                                : "bg-blue-500/20 text-blue-300"
                          }
                        `}
                      >
                        {ticket.priority === "high" ? "Alta" : ticket.priority === "medium" ? "Media" : "Baja"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-white">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        {ticket.date}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={`
                          ${
                            ticket.status === "open"
                              ? "bg-yellow-500/20 text-yellow-300"
                              : ticket.status === "in_progress"
                                ? "bg-blue-500/20 text-blue-300"
                                : "bg-green-500/20 text-green-300"
                          }
                        `}
                      >
                        <div className="flex items-center gap-1">
                          {ticket.status === "open" ? (
                            <>
                              <MessageSquare className="h-3 w-3" /> Abierto
                            </>
                          ) : ticket.status === "in_progress" ? (
                            <>
                              <Clock className="h-3 w-3" /> En Progreso
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="h-3 w-3" /> Cerrado
                            </>
                          )}
                        </div>
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 bg-[#3F3F46]"
                        onClick={() => {
                          setSelectedTicket(ticket)
                          setIsTicketDialogOpen(true)
                        }}
                      >
                        <MessageSquare className="h-4 w-4 mr-2" /> Ver
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>

      {/* Diálogo para ver y responder tickets */}
      <Dialog open={isTicketDialogOpen} onOpenChange={setIsTicketDialogOpen}>
        <DialogContent className="bg-gray-900 border border-gray-700 text-white max-w-3xl">
          {selectedTicket && (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl flex items-center gap-2">
                  <LifeBuoy className="h-5 w-5 text-[#3B82F6]" />
                  Ticket: {selectedTicket.id} - {selectedTicket.subject}
                </DialogTitle>
                <DialogDescription>
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-2">
                      <Building className="h-4 w-4 text-[#3B82F6]" />
                      <span className="text-white">{selectedTicket.establishment_name}</span>
                    </div>
                    <Badge
                      variant="outline"
                      className={`
                        ${
                          selectedTicket.status === "open"
                            ? "bg-yellow-500/20 text-yellow-300"
                            : selectedTicket.status === "in_progress"
                              ? "bg-blue-500/20 text-blue-300"
                              : selectedTicket.status === "closed"
                                ? "bg-green-500/20 text-green-300"
                                : ""
                        }
                      `}
                    >
                      <div className="flex items-center gap-1">
                        {selectedTicket.status === "open" ? (
                          <>
                            <MessageSquare className="h-3 w-3" /> Abierto
                          </>
                        ) : selectedTicket.status === "in_progress" ? (
                          <>
                            <Clock className="h-3 w-3" /> En Progreso
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="h-3 w-3" /> Cerrado
                          </>
                        )}
                      </div>
                    </Badge>
                  </div>
                </DialogDescription>
              </DialogHeader>

              <div className="bg-gray-950 border border-gray-800 rounded-md p-4 max-h-[400px] overflow-y-auto">
                {selectedTicket.messages.map((message) => (
                  <div
                    key={message.id}
                    className={`mb-4 ${
                      message.sender === "support"
                        ? "ml-8 bg-blue-900/40 rounded-lg p-3 border border-blue-800"
                        : "mr-8 bg-gray-800 rounded-lg p-3 border border-gray-700"
                    }`}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <div className="font-medium text-sm">
                        {message.senderName}
                        {message.sender === "support" && <span className="text-blue-400 ml-2">(Soporte)</span>}
                      </div>
                      <div className="text-xs text-gray-400">{message.date}</div>
                    </div>
                    <p className="text-sm">{message.message}</p>
                  </div>
                ))}
              </div>

              {selectedTicket.status !== "closed" && (
                <div className="mt-4">
                  <Label htmlFor="reply" className="text-sm text-gray-400 mb-2 block">
                    Responder
                  </Label>
                  <div className="flex gap-2">
                    <Textarea
                      id="reply"
                      placeholder="Escribe tu respuesta..."
                      value={replyMessage}
                      onChange={(e) => setReplyMessage(e.target.value)}
                      className="bg-gray-800 border border-gray-700 text-white resize-none"
                    />
                    <Button
                      className="bg-[#3B82F6] hover:bg-[#2563EB]"
                      onClick={handleReplySubmit}
                      disabled={!replyMessage.trim()}
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}

              <DialogFooter className="flex justify-between">
                <div className="flex gap-2">
                  {selectedTicket.status !== "closed" && (
                    <Button variant="outline" className="bg-green-600 hover:bg-green-700 text-white">
                      <CheckCircle2 className="h-4 w-4 mr-2" /> Marcar como Resuelto
                    </Button>
                  )}
                  {selectedTicket.status === "open" && (
                    <Button variant="outline" className="bg-blue-600 hover:bg-blue-700 text-white">
                      <Clock className="h-4 w-4 mr-2" /> Marcar En Progreso
                    </Button>
                  )}
                </div>
                <Button
                  variant="outline"
                  onClick={() => setIsTicketDialogOpen(false)}
                  className="bg-[#3F3F46] text-white hover:bg-[#52525B]"
                >
                  Cerrar
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  )
}


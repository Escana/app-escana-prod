"use client"
import React from "react"
import { useState, useEffect} from "react"
import { Search, ChevronRight, ChevronLeft, Crown, Filter, ClipboardList, Loader2 } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { ClientDetailsModal } from "@/components/client-details-modal"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { getClients, unbanClient } from "../actions/clients"
import { banClient } from "@/app/actions/ban-client"
import { getCurrentUser } from "@/lib/auth-client"
import { CheckCircle, XCircle } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

import type { Client } from "@/lib/supabase"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { BanModal } from "@/app/components/ban-modal"
import { BannedClientModal } from "@/app/components/banned-client-modal"

const getBanLevelColor = (level: number) => {
  switch (level) {
    case 1:
      return "bg-blue-500"
    case 2:
      return "bg-yellow-500"
    case 3:
      return "bg-orange-500"
    case 4:
      return "bg-purple-500"
    case 5:
      return "bg-red-500"
    default:
      return "bg-gray-500"
  }
}

const formatDateTime = (dateString: string) => {
  try {
    return format(new Date(dateString), "dd/MM/yyyy HH:mm", { locale: es })
  } catch (error) {
    console.error("Error formatting date:", error)
    return dateString
  }
}

const formatDate = (dateString: string) => {
  try {
    return format(new Date(dateString), "dd/MM/yyyy HH:mm", { locale: es })
  } catch (error) {
    console.error("Error formatting date:", error)
    return dateString
  }
}

const calculateAge = (fechaNacimiento: string): number => {
  try {

    // Parse the ISO date string directly
    const birth = new Date(fechaNacimiento)

    const today = new Date()
    let age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--
    }

    return age
  } catch (error) {
    return 0
  }
}

export default function ClientsTable() {
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [bannedClientData, setBannedClientData] = useState<any>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [filters, setFilters] = useState({
    orderBy: "all",
    estado: "all",
  })
  const { toast } = useToast()

  const [banModalOpen, setBanModalOpen] = useState(false)
  const [clientToBan, setClientToBan] = useState<string | null>(null)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [successAction, setSuccessAction] = useState<"ban" | "accept" | null>(null)

  
  useEffect(() => {
    (async () => {
      const user = await getCurrentUser()
      setCurrentUser(user)
    })()
  }, [])

  const handleConfirmBan = async (rut: any, banData: any) => {
    try {
      console.log("estamos aca")
      console.log(banData,rut)
      if (!banData) return
      console.log('ddentro')
      // Buscar el cliente a banear en la lista (por RUT)
      const client = await clients.find((c) => c.rut === rut)
      console.log(client)
      await banClient(
        rut,
        {
          ...banData,
          nombres: client?.nombres,
          apellidos: client?.apellidos,
          nacionalidad: client?.nacionalidad,
          sexo: client?.sexo,
          nacimiento: client?.nacimiento,
          edad: client ? calculateAge(client.nacimiento) : 0,
          document_image: client?.document_image,
        },
        currentUser
      )
      queryClient.invalidateQueries({ queryKey: ["clients"] })
      setShowSuccessModal(true)
      setSuccessAction("ban")
      setClientToBan(null)
      setBanModalOpen(false)   
    } catch (error: any) {
      console.error("Error banning client:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Error al banear al cliente",
      })
      throw error
    }
  }

 // Mutación de desbaneo:
const unbanMutation = useMutation({
  mutationFn: async (rut: string) => {
    const currentUser = await getCurrentUser();
    if (!currentUser) throw new Error("Usuario no autenticado");
    return unbanClient(rut);
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["clients"] });
    toast({
      title: "Éxito",
      description: "Cliente desbaneado correctamente",
    });
  },
  onError: () => {
    toast({
      title: "Error",
      description: "No se pudo desbanear al cliente",
      variant: "destructive",
    });
  },
});

// Handler para desbanear
const handleUnban = async (rut: string) => {
  try {
    await unbanMutation.mutateAsync(rut);
    // Cierra el modal de detalles del cliente
    setSelectedClient(null);
  } catch (error: any) {
    console.error("Error unbanning client:", error);
  }
};


  const queryClient = useQueryClient()

  // Queries
  const {
    data: clients = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["clients"],
    queryFn: async () => {
      try {
        console.log("Iniciando petición de clientes")
        const result = await getClients()
        console.log(`Obtenidos ${result.length} clientes`
        )
                console.log("Clientes obtenidos:", result)

        return result
      } catch (err) {
        console.error("Error en queryFn de clientes:", err)
        throw err
      }
    },
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
  })


  const handleFilterChange = (filterType: string, value: string) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      [filterType]: value,
    }))
    setCurrentPage(1)
  }

 

  const clientsByEstablishment = currentUser
  ? clients.filter((client) => client.establishment_id === currentUser.establishment_id)
  : clients;

// Luego, en lugar de iterar sobre "clients", usamos "clientsByEstablishment":
const uniqueClientsMap = new Map();
clientsByEstablishment.forEach((client) => {
  // Keep only the most recent entry for each RUT
  if (
    !uniqueClientsMap.has(client.rut) ||
    new Date(client.created_at) > new Date(uniqueClientsMap.get(client.rut).created_at)
  ) {
    uniqueClientsMap.set(client.rut, client);
  }
});

const filteredClients = Array.from(uniqueClientsMap.values()).filter((client) => {
  const matchesSearch =
    searchTerm === "" ||
    client.nombres.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.apellidos.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.rut.toLowerCase().includes(searchTerm.toLowerCase());

  const matchesEstado =
    filters.estado === "all" ||
    (filters.estado === "baneado" && client.is_banned) ||
    (filters.estado === "invitado" && client.is_guest);

  return matchesSearch && matchesEstado;
});



const sortedClients = [...filteredClients].sort((a, b) => {
    switch (filters.orderBy) {
      case "apellidos_asc":
        return a.apellidos.localeCompare(b.apellidos)
      case "ingreso_reciente":
        return (b.visits?.[0]?.entry_time || "").localeCompare(a.visits?.[0]?.entry_time || "")
      case "edad_asc":
        return calculateAge(a.nacimiento) - calculateAge(b.nacimiento)
      case "sexo":
        return a.sexo.localeCompare(b.sexo)
      default:
        return 0
    }
  })

  const clientsPerPage = 40
  const indexOfLastClient = currentPage * clientsPerPage
  const indexOfFirstClient = indexOfLastClient - clientsPerPage
  const currentClients = sortedClients
  const totalPages = Math.ceil(sortedClients.length / clientsPerPage)

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#1A1B1C] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#3B82F6] animate-spin" />
      </div>
    )
  }

  if (error) {
    console.error("Error en ClientsTable:", error)
    return (
      <div className="min-h-screen bg-[#1A1B1C] flex items-center justify-center">
        <div className="text-white text-center max-w-md bg-[#27272A] p-6 rounded-lg">
          <h2 className="text-xl font-bold mb-2">Error al cargar los clientes</h2>
          <p className="text-gray-400 mb-4">
            {error instanceof Error ? `${error.name}: ${error.message}` : "Error desconocido al cargar los datos"}
          </p>
          <div className="bg-black/30 p-3 rounded text-xs text-left mb-4 overflow-auto max-h-32">
            <pre>{JSON.stringify(error, null, 2)}</pre>
          </div>
          <Button
            onClick={() => queryClient.invalidateQueries({ queryKey: ["clients"] })}
            className="mt-4 bg-[#3B82F6] hover:bg-[#2563EB]"
          >
            Reintentar
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6">
      <div className="max-w-[1800px] mx-auto">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left Sidebar - Filters */}
          <div className="w-full lg:w-64 flex-shrink-0">
            <div className="bg-[#27272A] rounded-lg p-4 shadow-lg">
              <h2 className="text-white text-lg font-semibold mb-4 flex items-center">
                <Filter className="w-5 h-5 mr-2" />
                Filtros de búsqueda
              </h2>

              <div className="space-y-6">
                {/* Search */}
                <div className="relative">
                  <Input
                    type="text"
                    placeholder="Buscar cliente..."
                    className="w-full bg-[#3F3F46] border-0 text-white placeholder:text-gray-400"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <Search className="absolute right-3 top-2.5 text-gray-400 w-5 h-5" />
                </div>

                {/* Client Type Filter */}
                <div className="space-y-2">
                  <label className="text-[#7DD3FC] text-sm">Ver clientes:</label>
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name="clientType"
                        value="all"
                        checked={filters.estado === "all"}
                        onChange={() => handleFilterChange("estado", "all")}
                        className="text-[#3B82F6] bg-[#3F3F46]"
                      />
                      <span className="text-white text-sm">Todos</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name="clientType"
                        value="baneado"
                        checked={filters.estado === "baneado"}
                        onChange={() => handleFilterChange("estado", "baneado")}
                        className="text-[#3B82F6] bg-[#3F3F46]"
                      />
                      <span className="text-white text-sm">Baneados</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name="clientType"
                        value="invitado"
                        checked={filters.estado === "invitado"}
                        onChange={() => handleFilterChange("estado", "invitado")}
                        className="text-[#3B82F6] bg-[#3F3F46]"
                      />
                      <span className="text-white text-sm">Invitados</span>
                    </label>
                  </div>
                </div>

                {/* Sorting Options */}
                <div className="space-y-2">
                  <label className="text-[#7DD3FC] text-sm">Ordenar por:</label>
                  <Select value={filters.orderBy} onValueChange={(value) => handleFilterChange("orderBy", value)}>
                    <SelectTrigger className="w-full bg-[#3F3F46] border-0 text-white">
                      <SelectValue placeholder="Seleccionar orden" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Por defecto</SelectItem>
                      <SelectItem value="apellidos_asc">Apellidos</SelectItem>
                      <SelectItem value="ingreso_reciente">Más recientes</SelectItem>
                      <SelectItem value="edad_asc">Edad</SelectItem>
                      <SelectItem value="sexo">Sexo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  onClick={() => {
                    setFilters({
                      orderBy: "all",
                      estado: "all",
                    })
                    setSearchTerm("")
                    setCurrentPage(1)
                  }}
                  className="w-full bg-[#3F3F46] hover:bg-[#52525B] text-white"
                >
                  Limpiar filtros
                </Button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 w-full overflow-x-auto">
            {/* Tabs */}
            <div className="flex gap-4 mb-6">
              <Button
                variant="default"
                className="bg-[#3B82F6] hover:bg-[#2563EB] text-white px-4 py-2 h-10 whitespace-nowrap text-sm font-medium"
              >
                <ClipboardList className="w-4 h-4 mr-2" />
                Listas de clientes
              </Button>
              <Button
                asChild
                variant="default"
                className="bg-[#3F3F46] hover:bg-[#52525B] text-white px-4 py-2 h-10 whitespace-nowrap text-sm font-medium"
              >
                <Link href="/guests" className="flex items-center">
                  <Crown className="w-4 h-4 mr-2" />
                  <span>Listas de invitados</span>
                </Link>
              </Button>
            </div>

            {/* Table */}
            <div className="bg-[#27272A]/50 rounded-lg overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-[#3F3F46] text-gray-200 text-sm font-medium border-b-2 border-[#3B82F6]">
                    <th className="py-4 px-6 text-left">Foto</th>
                    <th className="py-4 px-6 text-left">Nombres</th>
                    <th className="py-4 px-6 text-left">Apellidos</th>
                    <th className="py-4 px-6 text-left">Rut</th>
                    <th className="py-4 px-6 text-left">Nacionalidad</th>
                    <th className="py-4 px-6 text-left">Sexo</th>
                    <th className="py-4 px-6 text-left">Edad</th>
                    <th className="py-4 px-6 text-left">Ingreso</th>
                    <th className="py-4 px-6 text-left">Estado</th>
                    <th className="py-4 px-6"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {currentClients.map((client) => (
                    <tr
                      key={client.id}
                      className="text-sm text-gray-300 hover:bg-white/5 transition-colors cursor-pointer"
                      onClick={() => setSelectedClient(client)}
                    >
                      <td className="py-4 px-6">
                        <div className="w-10 h-10 rounded overflow-hidden bg-gray-700 flex-shrink-0">
                          <Image
                            src={client.document_image || "/placeholder.svg"}
                            alt=""
                            width={40}
                            height={40}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </td>
                      <td className="py-4 px-6">{client.nombres}</td>
                      <td className="py-4 px-6">{client.apellidos}</td>
                      <td className="py-4 px-6 font-mono">{client.rut}</td>
                      <td className="py-4 px-6">{client.nacionalidad}</td>
                      <td className="py-4 px-6">
                        {client.sexo === "FEMENINO" ? "F" : client.sexo === "MASCULINO" ? "M" : client.sexo}
                      </td>
                      <td className="py-4 px-6">
                        {client.nacimiento
                          ? (() => {
                              const age = calculateAge(client.nacimiento)
                              return `${age} años`
                            })()
                          : "N/A"}
                      </td>
                      <td className="py-4 px-6">
                         {client.visits?.length > 0
    ? formatDateTime(client.visits[0].entry_time)
    : "Sin visitas"}
                      </td>
                      <td className="py-4 px-6">
                        {client.is_banned && (
                          <span
                            className={`text-white text-xs px-2 py-0.5 rounded flex items-center w-fit ${getBanLevelColor(
                              client.ban_level || 1,
                            )}`}
                          >
                            Nivel {client.ban_level}
                          </span>
                        )}
                        {client.is_guest && (
                          <span className="bg-emerald-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1 w-fit">
                            <Crown className="w-3 h-3" />
                            Invitado
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-6">
                        <ChevronRight className="w-5 h-5 text-gray-500" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-center gap-1 mt-4">
              <button
                className="text-gray-400 hover:text-white flex items-center gap-1 disabled:opacity-50"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="w-4 h-4" />
                Anterior
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((page) => page === 1 || page === totalPages || Math.abs(currentPage - page) <= 2)
                .reduce(
                  (acc, page, i, arr) => {
                    if (i > 0 && arr[i - 1] !== page - 1) {
                      acc.push("...")
                    }
                    acc.push(page)
                    return acc
                  },
                  [] as (number | string)[],
                )
                .map((page, index) => (
                  <button
                    key={index}
                    onClick={() => typeof page === "number" && setCurrentPage(page)}
                    className={cn(
                      "w-8 h-8 rounded flex items-center justify-center text-sm",
                      page === currentPage
                        ? "bg-[#3B82F6] text-white"
                        : "text-gray-400 hover:text-white hover:bg-white/10",
                    )}
                    disabled={typeof page !== "number"}
                  >
                    {page}
                  </button>
                ))}
              <button
                className="text-gray-400 hover:text-white flex items-center gap-1 disabled:opacity-50"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                Siguiente
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Client Details Modal */}
      {selectedClient && (
  <ClientDetailsModal
    isOpen={!!selectedClient}
    onClose={() => setSelectedClient(null)}
    client={selectedClient}
    onUnbanClient={(rut) => handleUnban(rut)}
    onBanClient={(rut, banData) => {
      setClientToBan(rut);
      setBanModalOpen(true);
      setSelectedClient(null);
      handleConfirmBan(rut,banData);
    }}
  />
)}

 
      {/* Modal de confirmación del baneo */}
      {showSuccessModal && (
        <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
          <DialogContent className="bg-[#1A1B1C] border-[#3F3F46] max-w-md mx-4">
            <DialogHeader>
              <DialogTitle className="text-center text-white text-xl">
                {successAction === "ban" ? "Cliente Baneado" : "Cliente Aceptado"}
              </DialogTitle>
            </DialogHeader>
            <div className="flex flex-col items-center py-6">
              {successAction === "ban" ? (
                <>
                  <div className="bg-red-500/10 p-4 rounded-full mb-4">
                    <XCircle className="h-16 w-16 text-red-500" />
                  </div>
                  <p className="text-white text-center">
                    El cliente ha sido baneado exitosamente del sistema.
                  </p>
                </>
              ) : (
                <>
                  <div className="bg-green-500/10 p-4 rounded-full mb-4">
                    <CheckCircle className="h-16 w-16 text-green-500" />
                  </div>
                  <p className="text-white text-center">
                    El cliente ha sido aceptado exitosamente y su visita ha sido registrada.
                  </p>
                </>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}


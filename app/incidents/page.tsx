"use client"

import { useState, useEffect, useContext } from "react"
import { Search, ChevronRight, Filter, AlertCircle, Ban, ChevronLeft, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Image from "next/image"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { getIncidents } from "@/app/actions/incidents"
import { useToast } from "@/components/ui/use-toast"
import { unbanClient } from "@/app/actions/clients"
import { AppContext } from "@/components/status-bar"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { getCurrentUser } from "@/lib/auth-client"

const formatRut = (rut: string) => {
  if (!rut) return ""
  // Remove any existing dots and dashes
  rut = rut.replace(/\./g, "").replace(/-/g, "")
  // Extract the verification digit
  const dv = rut.slice(-1)
  // Format the main part with dots
  const rutBody = rut.slice(0, -1).replace(/\B(?=(\d{3})+(?!\d))/g, ".")
  return `${rutBody}-${dv}`
}

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

const getBanDuration = (level: number) => {
  switch (level) {
    case 1:
      return "7 días"
    case 2:
      return "15 días"
    case 3:
      return "30 días"
    case 4:
      return "90 días"
    case 5:
      return "Permanente"
    default:
      return "No especificado"
  }
}

export default function IncidentsPage() {
  useEffect(() => {
    (async () => {
      const user = await getCurrentUser()
      setCurrentUser(user)
    })()
  }, [])
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedIncident, setSelectedIncident] = useState<any>(null)
  const [activeTab, setActiveTab] = useState("incidentes")
  const [selectedBannedUser, setSelectedBannedUser] = useState<any>(null)
  const [unbanConfirmation, setUnbanConfirmation] = useState<{ open: boolean; rut: string | null }>({
    open: false,
    rut: null,
  })
  const itemsPerPage = 10
  const [filters, setFilters] = useState({
    orderBy: "all",
    nivelBan: "all",
  })

  const { userName } = useContext(AppContext)

  const { toast } = useToast()
  const queryClient = useQueryClient()

  // Queries with logging
  const {
    data: incidents = [],
    isLoading,
    error,
    isError,
  } = useQuery({
    queryKey: ["incidents"],
    queryFn: async () => {
      console.log("[CLIENT] Fetching incidents data")
      try {
        console.log("[CLIENT] Current user:", currentUser)
        const data = await getIncidents(currentUser.establishment_id)
        console.log("[CLIENT] Successfully fetched incidents:", data.length)
        return data
      } catch (error) {
        console.error("[CLIENT] Error fetching incidents:", error)
        throw error
      }
    },
    staleTime: 1000 * 60, // 1 minute
    cacheTime: 1000 * 60 * 5, // 5 minutes
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    refetchOnWindowFocus: false,
  })

  const handleFilterChange = (filterType: string, value: string) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      [filterType]: value,
    }))
    setCurrentPage(1)
  }

  const sortIncidents = (incidents: any[]) => {
    const sorted = [...incidents]
    switch (filters.orderBy) {
      case "fecha_reciente":
        return sorted.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      case "fecha_antigua":
        return sorted.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
      case "titulo_az":
        return sorted.sort((a, b) => (a.type ?? "No especificado").localeCompare(b.type ?? "No especificado"))
      case "titulo_za":
        return sorted.sort((a, b) => (b.type ?? "No especificado").localeCompare(a.type ?? "No especificado"))
      case "empleado_az":
        return sorted.sort((a, b) => (a.created_by || "Sistema").localeCompare(b.created_by || "Sistema"))
      case "empleado_za":
        return sorted.sort((a, b) => (b.created_by || "Sistema").localeCompare(a.created_by || "Sistema"))
      default:
        return sorted
    }
  }

  const filteredIncidents = sortIncidents(
    incidents?.filter((incident: any) => {
      if (!incident) return false

      // If we're on the banned tab, only show banned clients
      if (activeTab === "baneados") {
        if (!incident.isBanned) return false
      } else {
        // If we're on the incidents tab, don't show banned clients
        if (incident.isBanned) return false
      }

      const matchesSearch =
        searchTerm === "" ||
        incident.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        incident.client?.nombres?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        incident.client?.apellidos?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        incident.client?.rut?.toLowerCase().includes(searchTerm.toLowerCase())

      if (activeTab === "baneados") {
        const matchesNivelBan =
          filters.nivelBan === "all" || (incident.ban_level && incident.ban_level.toString() === filters.nivelBan)
        return matchesSearch && matchesNivelBan
      }

      return matchesSearch
    }) || [],
  )

  const totalPages = Math.ceil(filteredIncidents.length / itemsPerPage)
  const currentIncidents = filteredIncidents.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#1A1B1C] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#3B82F6] animate-spin" />
      </div>
    )
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-[#1A1B1C] flex items-center justify-center">
        <div className="text-white text-center">
          <h2 className="text-xl font-bold mb-2">Error al cargar los incidentes</h2>
          <p className="text-gray-400 mb-2">
            {error instanceof Error ? error.message : "Por favor, intente de nuevo más tarde"}
          </p>
          <Button
            onClick={() => queryClient.invalidateQueries({ queryKey: ["incidents"] })}
            className="mt-4 bg-[#3B82F6] hover:bg-[#2563EB]"
          >
            Reintentar
          </Button>
        </div>
      </div>
    )
  }

  // Add logging to unban action
  const handleUnban = async (rut: string) => {
    console.log("[CLIENT] Starting unban process for RUT:", rut)
    try {
      await unbanClient(rut)
      console.log("[CLIENT] Successfully unbanned client")
      queryClient.invalidateQueries({ queryKey: ["incidents"] })
      toast({
        title: "Éxito",
        description: "Cliente desbaneado correctamente",
      })
      setSelectedBannedUser(null)
    } catch (error) {
      console.error("[CLIENT] Error unbanning client:", error)
      toast({
        title: "Error",
        description: "No se pudo desbanear al cliente",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="p-4 sm:p-6 bg-[#1A1B1C] min-h-screen">
      <div className="max-w-[1800px] mx-auto px-4">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left Sidebar - Filters */}
          <div className="w-full lg:w-64 flex-shrink-0">
            <div className="bg-[#27272A] rounded-lg p-4 shadow-lg">
              <h2 className="text-white text-lg font-semibold mb-4 flex items-center">
                <Filter className="w-5 h-5 mr-2" />
                Filtros de búsqueda
              </h2>

              <div className="space-y-6">
                <div className="relative">
                  <Input
                    type="text"
                    placeholder="Buscar..."
                    className="w-full bg-[#3F3F46] border-0 text-white placeholder-gray-400 focus:ring-2 focus:ring-[#7DD3FC]"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <Search className="absolute right-3 top-2.5 text-gray-400 w-5 h-5" />
                </div>

                <div className="space-y-2">
                  <label className="text-[#7DD3FC] text-sm">Ordenar por:</label>
                  <Select value={filters.orderBy} onValueChange={(value) => handleFilterChange("orderBy", value)}>
                    <SelectTrigger className="w-full bg-[#3F3F46] border-0 text-white">
                      <SelectValue placeholder="Ordenar por" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Por defecto</SelectItem>
                      <SelectItem value="fecha_reciente">Fecha (Más reciente)</SelectItem>
                      <SelectItem value="fecha_antigua">Fecha (Más antigua)</SelectItem>
                      <SelectItem value="titulo_az">Título (A-Z)</SelectItem>
                      <SelectItem value="titulo_za">Título (Z-A)</SelectItem>
                      <SelectItem value="empleado_az">Empleado (A-Z)</SelectItem>
                      <SelectItem value="empleado_za">Empleado (Z-A)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  className="w-full bg-[#3F3F46] hover:bg-[#52525B] text-white"
                  onClick={() => {
                    setFilters({
                      orderBy: "all",
                      nivelBan: "all",
                    })
                    setSearchTerm("")
                    setCurrentPage(1)
                  }}
                >
                  Limpiar filtros
                </Button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 w-full overflow-x-auto">
            {/* Tab Buttons */}
            <div className="flex gap-4 mb-6">
              <Button
                variant="default"
                className={`${
                  activeTab === "incidentes" ? "bg-[#3B82F6] hover:bg-[#2563EB]" : "bg-[#27272A] hover:bg-[#3F3F46]"
                } text-white px-4 py-2 h-10 whitespace-nowrap text-sm font-medium`}
                onClick={() => setActiveTab("incidentes")}
              >
                <AlertCircle className="w-4 h-4 mr-2" />
                Registro de incidentes
              </Button>
              <Button
                variant="default"
                className={`${
                  activeTab === "baneados" ? "bg-[#EF4444] hover:bg-[#DC2626]" : "bg-[#27272A] hover:bg-[#3F3F46]"
                } text-white px-4 py-2 h-10 whitespace-nowrap text-sm font-medium`}
                onClick={() => setActiveTab("baneados")}
              >
                <Ban className="w-4 h-4 mr-2" />
                Clientes baneados
              </Button>
            </div>

            {/* Table */}
            <div className="responsive-table-container overflow-x-auto">
              <table className="w-full responsive-table">
                <thead>
                  <tr className="bg-[#3F3F46] text-gray-200 text-sm font-medium border-b-2 border-[#3B82F6]">
                    {activeTab === "baneados" ? (
                      <>
                        <th className="py-4 px-6 text-left w-24">Nivel</th>
                        <th className="py-4 px-6 text-left w-16"></th>
                        <th className="py-4 px-6 text-left">Nombres</th>
                        <th className="py-4 px-6 text-left">Apellidos</th>
                        <th className="py-4 px-6 text-left w-32">RUT</th>
                        <th className="py-4 px-6 text-left">Inicio</th>
                        <th className="py-4 px-6 text-left">Fin</th>
                        <th className="py-4 px-6"></th>
                      </>
                    ) : (
                      <>
                        <th className="py-4 px-6 text-left">Título del incidente</th>
                        <th className="py-4 px-6 text-left">Descripción</th>
                        <th className="py-4 px-6 text-left">Fecha y hora</th>
                        <th className="py-4 px-6 text-left">Empleado</th>
                        <th className="py-4 px-6"></th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {currentIncidents.map((incident: any) => {
                    if (activeTab === "baneados" && incident.isBanned) {
                      return (
                        <tr
                          key={incident.id}
                          className="border-b border-[#3F3F46] hover:bg-[#3F3F46] cursor-pointer transition-colors duration-150 text-xs"
                          onClick={() => setSelectedBannedUser(incident)}
                        >
                          <td className="py-3 px-4" data-label="Nivel">
                            <span
                              className={`text-white text-xs px-2 py-0.5 rounded flex items-center w-fit ${getBanLevelColor(
                                incident.ban_level || 1,
                              )}`}
                            >
                              Nivel {incident.ban_level}
                            </span>
                          </td>
                          <td className="py-3 px-4" data-label="Foto">
                            <div className="w-10 h-10 rounded-lg overflow-hidden">
                              <Image
                                src={
                                  incident.document_image ||
                                  incident.client?.document_image ||
                                  incident.client?.photo ||
                                  "/placeholder.svg" ||
                                  "/placeholder.svg" ||
                                  "/placeholder.svg" ||
                                  "/placeholder.svg" ||
                                  "/placeholder.svg" ||
                                  "/placeholder.svg" ||
                                  "/placeholder.svg" ||
                                  "/placeholder.svg" ||
                                  "/placeholder.svg"
                                }
                                alt={incident.client?.nombres || ""}
                                width={40}
                                height={40}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          </td>
                          <td className="py-3 px-4 text-white" data-label="Nombres">
                            {incident.client?.nombres || "No especificado"}
                          </td>
                          <td className="py-3 px-4 text-white" data-label="Apellidos">
                            {incident.client?.apellidos || "No especificado"}
                          </td>
                          <td className="py-3 px-4 text-white font-mono" data-label="RUT">
                            {formatRut(incident.client?.rut)}
                          </td>
                          <td className="py-3 px-4 text-white" data-label="Inicio">
                            {incident.ban_start_date}
                          </td>
                          <td className="py-3 px-4 text-white" data-label="Fin">
                            {incident.ban_end_date || "Permanente"}
                          </td>
                          <td className="py-3 px-4" data-label="">
                            <ChevronRight className="w-5 h-5 text-gray-400" />
                          </td>
                        </tr>
                      )
                    } else if (!incident.isBanned) {
                      const [date, time] = (incident.created_at || "").split(", ")
                      return (
                        <tr
                          key={incident.id}
                          className="border-b border-[#3F3F46] hover:bg-[#3F3F46] cursor-pointer transition-colors duration-150 text-xs"
                          onClick={() => setSelectedIncident(incident)}
                        >
                          <td className="py-3 px-4 text-white" data-label="Título">
                            {incident.type ?? "No especificado"}
                          </td>
                          <td className="py-3 px-4 text-white" data-label="Descripción">
                            <div className="line-clamp-2">{incident.description}</div>
                          </td>
                          <td className="py-3 px-4 text-white" data-label="Fecha y hora">
                            {incident.created_at}
                          </td>
                          <td className="py-3 px-4 text-white" data-label="Empleado">
                            {incident.created_by || "Sistema"}
                          </td>
                          <td className="py-3 px-4" data-label="">
                            <ChevronRight className="w-5 h-5 text-gray-400" />
                          </td>
                        </tr>
                      )
                    }
                    return null
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-center gap-1 py-2 bg-[#1A1B1C] text-xs">
              <button
                className="text-gray-400 hover:text-white flex items-center gap-1 disabled:opacity-50 text-xs"
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
                    className={`w-8 h-8 rounded-lg ${
                      page === currentPage
                        ? "bg-[#3B82F6] text-white"
                        : typeof page === "number"
                          ? "text-gray-400 hover:text-white"
                          : "text-gray-400"
                    }`}
                  >
                    {page}
                  </button>
                ))}
              <button
                className="text-gray-400 hover:text-white flex items-center gap-1 disabled:opacity-50 text-xs"
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

      {/* Incident Details Modal */}
      {selectedIncident && (
        <Dialog open={!!selectedIncident} onOpenChange={() => setSelectedIncident(null)}>
          <DialogContent className="max-w-2xl bg-[#1E1E1E] border-[#3F3F46] text-white p-6">
            <DialogHeader>
              <h2 className="text-2xl font-bold text-[#7DD3FC]">Detalles del Incidente</h2>
            </DialogHeader>

            <div className="space-y-6">
              {/* Título y Fecha */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[#7DD3FC] text-sm mb-1">Título:</p>
                  <p className="text-white font-medium">{selectedIncident.type ?? "No especificado"}</p>
                </div>
                <div></div>
              </div>

              {/* Información adicional */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[#7DD3FC] text-sm mb-1">Fecha y hora:</p>
                  <p className="text-white">{selectedIncident.created_at}</p>
                </div>
                <div>
                  <p className="text-[#7DD3FC] text-sm mb-1">Registrado por:</p>
                  <p className="text-white">{selectedIncident.created_by || "Sistema"}</p>
                </div>
              </div>

              {/* Descripción del incidente */}
              <div className="bg-[#27272A] p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-[#7DD3FC] mb-2">Descripción del incidente</h3>
                <p className="text-white whitespace-pre-wrap">{selectedIncident.description}</p>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Banned User Details Modal */}
      {selectedBannedUser && (
        <Dialog open={!!selectedBannedUser} onOpenChange={() => setSelectedBannedUser(null)}>
          <DialogContent className="max-w-2xl bg-[#1E1E1E] border-[#3F3F46] text-white p-6">
            <DialogHeader>
              <h2 className="text-2xl font-bold text-[#7DD3FC]">Cliente Baneado</h2>
            </DialogHeader>

            <div className="space-y-6">
              <div className="flex items-start gap-6">
                {/* Increased image size here */}
                <div className="w-32 h-32 relative rounded-lg overflow-hidden flex-shrink-0">
                  <Image
                    src={
                      selectedBannedUser.document_image ||
                      selectedBannedUser.client?.document_image ||
                      "/placeholder.svg" ||
                      "/placeholder.svg" ||
                      "/placeholder.svg" ||
                      "/placeholder.svg" ||
                      "/placeholder.svg"
                    }
                    alt="Document"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-white mb-2">
                    {selectedBannedUser.client?.nombres} {selectedBannedUser.client?.apellidos}
                  </h3>
                  <p className="text-gray-400">RUT: {selectedBannedUser.client?.rut}</p>
                  <div className="mt-2 space-y-1">
                    <p className="text-gray-400">
                      Nacionalidad: {selectedBannedUser.client?.nacionalidad || "No especificada"}
                    </p>
                    <p className="text-gray-400">Edad: {selectedBannedUser.client?.edad || "No especificada"}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[#7DD3FC] text-sm">Nivel de ban:</p>
                  <span
                    className={`inline-block mt-1 px-2 py-0.5 rounded text-xs ${getBanLevelColor(
                      selectedBannedUser.ban_level,
                    )}`}
                  >
                    Nivel {selectedBannedUser.ban_level}
                  </span>
                </div>
                <div>
                  <p className="text-[#7DD3FC] text-sm">Duración:</p>
                  <p className="text-white">{getBanDuration(selectedBannedUser.ban_level)}</p>
                </div>
                <div>
                  <p className="text-[#7DD3FC] text-sm">Fecha de inicio:</p>
                  <p className="text-white">{selectedBannedUser.ban_start_date}</p>
                </div>
                <div>
                  <p className="text-[#7DD3FC] text-sm">Fecha de fin:</p>
                  <p className="text-white">{selectedBannedUser.ban_end_date || "Permanente"}</p>
                </div>
              </div>

              <div className="bg-[#27272A] p-4 rounded-lg space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-[#7DD3FC] mb-2">Motivo del ban</h3>
                  <p className="text-white">{selectedBannedUser.ban_reason}</p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-[#7DD3FC] mb-2">Descripción detallada</h3>
                  <p className="text-white whitespace-pre-wrap">{selectedBannedUser.description}</p>
                </div>
              </div>

              <div className="flex justify-end gap-4 mt-6">
                <Button
                  onClick={() => setSelectedBannedUser(null)}
                  variant="outline"
                  className="bg-[#27272A] text-white hover:bg-[#3F3F46]"
                >
                  Cerrar
                </Button>
                <Button
                  onClick={() => {
                    setUnbanConfirmation({ open: true, rut: selectedBannedUser.client.rut })
                    setSelectedBannedUser(null)
                  }}
                  className="bg-[#22C55E] text-white hover:bg-[#16A34A]"
                >
                  Desbanear Cliente
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
      <AlertDialog open={unbanConfirmation.open} onOpenChange={(open) => setUnbanConfirmation({ open, rut: null })}>
        <AlertDialogContent className="max-w-2xl bg-[#1E1E1E] border-[#3F3F46] text-white p-6">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl font-bold text-[#7DD3FC]">¿Confirmar desbaneo?</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400 mt-2">
              Esta acción desbaneará al cliente y le permitirá volver a ingresar al establecimiento. ¿Estás seguro de
              que deseas continuar?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-6 space-x-2">
            <AlertDialogCancel className="min-w-[100px] bg-[#27272A] text-white hover:bg-[#3F3F46] border-0 px-4 py-2 rounded-md">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              className="min-w-[100px] bg-[#22C55E] text-white hover:bg-[#16A34A] px-4 py-2 rounded-md"
              onClick={async () => {
                if (unbanConfirmation.rut) {
                  await handleUnban(unbanConfirmation.rut)
                }
                setUnbanConfirmation({ open: false, rut: null })
              }}
            >
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}


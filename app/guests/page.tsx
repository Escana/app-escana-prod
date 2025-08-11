"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import {
  Search,
  ChevronRight,
  ChevronLeft,
  ClipboardList,
  Crown,
  Filter,
  Loader2,
  Plus,
  FileDown,
} from "lucide-react"
import { GuestListModal } from "@/components/guest-list-modal"
import Link from "next/link"
import { NewGuestListForm } from "@/components/new-guest-list-form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { getGuestLists, createGuestList, updateGuestList, deleteGuestList } from "../actions/guest-lists"
import type { GuestList } from "@/lib/supabase"
import { logger } from "@/lib/utils"
import { getCurrentUser } from "@/lib/auth-client"
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
//
// Simulación: Función para generar un RUT chileno aleatorio
const generateRandomRut = () => {
  const number = Math.floor(Math.random() * 30000000) + 1000000
  const dv = "0123456789K"[number % 11]
  return `${number}-${dv}`
}

// Función para generar una lista de invitados aleatoria (simulación)
const generateRandomGuestList = (index: number): GuestList => {
  const eventTypes = ["CUMPLEAÑOS", "ANIVERSARIO", "BODA", "GRADUACIÓN", "FIESTA CORPORATIVA"]
  const names = ["JUAN", "MARÍA", "PEDRO", "ANA", "CARLOS", "LAURA", "DIEGO", "SOFÍA", "ANDRÉS", "VALENTINA"]
  const lastNames = [
    "GONZÁLEZ",
    "RODRÍGUEZ",
    "FERNÁNDEZ",
    "LÓPEZ",
    "MARTÍNEZ",
    "PÉREZ",
    "GÓMEZ",
    "SÁNCHEZ",
    "DÍAZ",
    "TORRES",
  ]
  const statuses = ["REALIZADO", "CONFIRMADO", "CANCELADO", "NO CONFIRMADO"]

  const randomDate = () => {
    const start = new Date(2024, 0, 1)
    const end = new Date(2024, 11, 31)
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()))
  }

  const date = randomDate()
  const formattedDate = `${date.getDate().toString().padStart(2, "0")}/${(date.getMonth() + 1)
    .toString()
    .padStart(2, "0")}/${date.getFullYear()}`
  const formattedTime = `${date.getHours().toString().padStart(2, "0")}:${date
    .getMinutes()
    .toString()
    .padStart(2, "0")}`

  const guestCount = Math.floor(Math.random() * 20) + 5
  const guests = Array.from({ length: guestCount }, () => ({
    nombres: names[Math.floor(Math.random() * names.length)],
    apellidos: `${lastNames[Math.floor(Math.random() * lastNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`,
    rut: generateRandomRut(),
  }))

  return {
    id: Math.random().toString(36).substring(2, 10),
    nombre: `${eventTypes[Math.floor(Math.random() * eventTypes.length)]} ${names[Math.floor(Math.random() * names.length)]}`,
    codigo: Math.random().toString(36).substring(2, 10).toUpperCase(),
    anfitrion: `${names[Math.floor(Math.random() * names.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`,
    rut: generateRandomRut(),
    invitados: guests,
    fecha: formattedDate,
    hora: formattedTime,
    estado: statuses[Math.floor(Math.random() * statuses.length)],
    descripcion: `Evento de celebración con ${guestCount} invitados.`,
    // Para simulación, asignamos establishment_id de forma alterna
    establishment_id: index % 2 === 0 ? "estab-1" : "estab-2",
  }
}

const guestListsSimulated = Array.from({ length: 50 }, (_, index) => generateRandomGuestList(index))

export default function GuestsPage() {
  useEffect(() => {
    logger.info("Guests page mounted")
  }, [])

  const [searchTerm, setSearchTerm] = useState("")
  const [filters, setFilters] = useState({
    orderBy: "all",
    estado: "all",
    invitados: "all",
  })
  const [currentPage, setCurrentPage] = useState(1)
  const [activeTab, setActiveTab] = useState("existing")
  const itemsPerPage = 10
  const [selectedGuestList, setSelectedGuestList] = useState<GuestList | null>(null)
  const [currentUser, setCurrentUser] = useState<any>(null)

  const queryClient = useQueryClient()

  // Obtener el current user
  useEffect(() => {
    (async () => {
      const user = await getCurrentUser()
      setCurrentUser(user)
      console.log(currentUser.establishment_id)
    })()
  }, [])

  // Query: se pasan currentUser.establishment_id para filtrar en el servidor
  const {
    data: guestListsData = guestListsSimulated,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["guest-lists", currentUser?.establishment_id],
    queryFn: async () => {
      logger.info("Fetching guest lists data")
      try {
        const data = await getGuestLists(currentUser?.establishment_id)
        logger.info(`Successfully fetched ${data.length} guest lists`)
        return data
      } catch (error) {
        logger.error("Error fetching guest lists:", error)
        throw error
      }
    },
    enabled: !!currentUser,
    onError: (error) => {
      logger.error("Query error:", error)
    },
  })

  // Filtrado, ordenamiento y paginación
  const filteredGuestLists = useMemo(() => {
    return guestListsData.filter((list: GuestList) => {
      const searchTermLower = searchTerm.toLowerCase()
      const matchesSearch =
        list.nombre.toLowerCase().includes(searchTermLower) ||
        list.anfitrion.toLowerCase().includes(searchTermLower)
      const matchesEstado = filters.estado === "all" || list.estado === filters.estado
      // Aquí puedes agregar lógica para filtrar por número de invitados si es necesario
      return matchesSearch && matchesEstado
    })
  }, [guestListsData, searchTerm, filters.estado])

  const sortedGuestLists = useMemo(() => {
    const sorted = [...filteredGuestLists]
    if (filters.orderBy === "nombre_asc") {
      sorted.sort((a, b) => a.nombre.localeCompare(b.nombre))
    } else if (filters.orderBy === "fecha_reciente") {
      sorted.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
    } else if (filters.orderBy === "invitados_asc") {
      sorted.sort((a, b) => (a.invitados?.length || 0) - (b.invitados?.length || 0))
    }
    return sorted
  }, [filteredGuestLists, filters.orderBy])

  const currentGuestLists = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    return sortedGuestLists.slice(startIndex, endIndex)
  }, [sortedGuestLists, currentPage, itemsPerPage])

  const totalPages = useMemo(() => {
    return Math.ceil(sortedGuestLists.length / itemsPerPage)
  }, [sortedGuestLists, itemsPerPage])

  console.log("currentGuestLists", currentGuestLists)
  // Definición de las funciones para crear y cancelar una nueva lista
  const handleNewGuestList = (newGuestList: Parameters<typeof createGuestList>[0]) => {
    // Se utiliza la mutación de creación para agregar la nueva lista
    createMutation.mutate(newGuestList, {
      onSuccess: () => {
        toast({
           title: "Lista creada",
           description: "Tu nueva lista de invitados se creó exitosamente.",
         })
       }
   })
    setActiveTab("existing")
  }

  const handleCancelNewList = () => {
    setActiveTab("existing")
  }

  // Mutations con logging
  const createMutation = useMutation({
    mutationFn: async (data: Parameters<typeof createGuestList>[0]) => {
      logger.info("Creating new guest list:", data)
      return await createGuestList(data)
    },
    onSuccess: (newList) => {
      logger.info("Successfully created guest list:", newList)
      queryClient.setQueryData(["guest-lists"], (old: GuestList[]) => [...(old || []), newList])
      toast({
        title: "Éxito",
        description: "Lista de invitados creada correctamente",
      })
      setActiveTab("existing")
    },
    onError: (error) => {
      logger.error("Error creating guest list:", error)
      toast({
        title: "Error",
        description: "No se pudo crear la lista de invitados",
        variant: "destructive",
      })
    },
  })

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Parameters<typeof updateGuestList>[1] }) => {
      return await updateGuestList(id, data)
    },
    onSuccess: (_, { id, data }) => {
      queryClient.setQueryData(["guest-lists"], (old: GuestList[]) =>
        (old || []).map((list) => (list.id === id ? { ...list, ...data } : list))
      )
      toast({
        title: "Éxito",
        description: "Lista de invitados actualizada correctamente",
      })
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "No se pudo actualizar la lista de invitados",
        variant: "destructive",
      })
    },
  })
  const handleStatusChange = (id: string, newStatus: GuestList["estado"]) => {
    updateMutation.mutate({
      id,
      data: { estado: newStatus },
    })
  }
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return await deleteGuestList(id)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["guest-lists"] })
      toast({
        title: "Éxito",
        description: "Lista de invitados eliminada correctamente",
      })
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "No se pudo eliminar la lista de invitados",
        variant: "destructive",
      })
    },
  })

  // Funciones para filtrar y paginar
  const handleFilterChange = (filterType: string, value: string) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      [filterType]: value,
    }))
    setCurrentPage(1)
  }

  const isInInvitadosRange = useCallback((count: number, range: string) => {
    if (range === "all") return true
    if (range === "100+") return count > 100
    const [min, max] = range.split("-").map(Number)
    return count >= min && count <= max
  }, [])

  const handleRowClick = (guestList: GuestList) => {
    setSelectedGuestList(guestList)
  }
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#1A1B1C] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#3B82F6] animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#1A1B1C] flex items-center justify-center">
        <div className="text-white text-center">
          <h2 className="text-xl font-bold mb-2">Error al cargar las listas de invitados</h2>
          <p className="text-gray-400">Por favor, intente de nuevo más tarde</p>
          <Button
            onClick={() => queryClient.invalidateQueries({ queryKey: ["guest-lists"] })}
            className="mt-4 bg-[#3B82F6] hover:bg-[#2563EB]"
          >
            Reintentar
          </Button>
        </div>
      </div>
    )
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
                {/* Search */}
                <div className="relative">
                  <Input
                    type="text"
                    placeholder="Buscar lista..."
                    className="w-full bg-[#3F3F46] border-0 text-white placeholder-gray-400 focus:ring-2 focus:ring-[#7DD3FC]"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <Search className="absolute right-3 top-2.5 text-gray-400 w-5 h-5" />
                </div>
                {/* Status Filter */}
                <div className="space-y-2">
                  <label className="text-[#7DD3FC] text-sm">Ver listas:</label>
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name="listType"
                        value="all"
                        checked={filters.estado === "all"}
                        onChange={() => handleFilterChange("estado", "all")}
                        className="text-[#3B82F6] bg-[#3F3F46]"
                      />
                      <span className="text-white text-sm">Todas</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name="listType"
                        value="REALIZADO"
                        checked={filters.estado === "REALIZADO"}
                        onChange={() => handleFilterChange("estado", "REALIZADO")}
                        className="text-[#3B82F6] bg-[#3F3F46]"
                      />
                      <span className="text-white text-sm">Realizadas</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name="listType"
                        value="CONFIRMADO"
                        checked={filters.estado === "CONFIRMADO"}
                        onChange={() => handleFilterChange("estado", "CONFIRMADO")}
                        className="text-[#3B82F6] bg-[#3F3F46]"
                      />
                      <span className="text-white text-sm">Confirmadas</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name="listType"
                        value="NO CONFIRMADO"
                        checked={filters.estado === "NO CONFIRMADO"}
                        onChange={() => handleFilterChange("estado", "NO CONFIRMADO")}
                        className="text-[#3B82F6] bg-[#3F3F46]"
                      />
                      <span className="text-white text-sm">No confirmadas</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name="listType"
                        value="CANCELADO"
                        checked={filters.estado === "CANCELADO"}
                        onChange={() => handleFilterChange("estado", "CANCELADO")}
                        className="text-[#3B82F6] bg-[#3F3F46]"
                      />
                      <span className="text-white text-sm">Canceladas</span>
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
                      <SelectItem value="nombre_asc">Nombre del evento (A-Z)</SelectItem>
                      <SelectItem value="fecha_reciente">Fecha (Más reciente)</SelectItem>
                      <SelectItem value="invitados_asc">Número de invitados</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {/* Guest Count Filter */}
                <div className="space-y-2">
                  <label className="text-[#7DD3FC] text-sm">Número de invitados:</label>
                  <Select value={filters.invitados} onValueChange={(value) => handleFilterChange("invitados", value)}>
                    <SelectTrigger className="w-full bg-[#3F3F46] border-0 text-white">
                      <SelectValue placeholder="Seleccionar rango" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="1-10">1-10 invitados</SelectItem>
                      <SelectItem value="11-50">11-50 invitados</SelectItem>
                      <SelectItem value="51-100">51-100 invitados</SelectItem>
                      <SelectItem value="100+">Más de 100 invitados</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  onClick={() => {
                    setFilters({
                      orderBy: "all",
                      estado: "all",
                      invitados: "all",
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
            <div className="flex gap-4 mb-6">
              <Button
                asChild
                variant="default"
                className="bg-[#3F3F46] hover:bg-[#52525B] text-white px-4 py-2 h-10 whitespace-nowrap text-sm font-medium"
              >
                <Link href="/clients" className="flex items-center">
                  <ClipboardList className="w-5 h-5 mr-2" />
                  Listas de clientes
                </Link>
              </Button>
              <Button
                variant="default"
                className="bg-[#3B82F6] hover:bg-[#2563EB] text-white px-4 py-2 h-10 whitespace-nowrap text-sm font-medium"
              >
                <Crown className="w-5 h-5 mr-2" />
                Listas de invitados
              </Button>
              <Button
                onClick={() => setActiveTab("new")}
                className="bg-[#22C55E] hover:bg-[#16A34A] text-white px-4 py-2 h-10 whitespace-nowrap text-sm font-medium"
              >
                <Plus className="w-5 h-5 mr-2" />
                Crear nueva lista
              </Button>
              <Button
                onClick={() => {
                  const headers = "Nombres,Apellidos,RUT\n"
                  const blob = new Blob([headers], { type: "text/csv" })
                  const url = window.URL.createObjectURL(blob)
                  const a = document.createElement("a")
                  a.href = url
                  a.download = "plantilla_invitados.csv"
                  document.body.appendChild(a)
                  a.click()
                  window.URL.revokeObjectURL(url)
                  document.body.removeChild(a)
                }}
                className="bg-[#3F3F46] hover:bg-[#52525B] text-white px-4 py-2 h-10 whitespace-nowrap text-sm font-medium"
              >
                <FileDown className="w-5 h-5 mr-2" />
                Descargar plantilla
              </Button>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsContent value="existing">
                <div className="bg-[#27272A]/50 rounded-lg overflow-hidden">
                  <table className="w-full responsive-table">
                    <thead>
                      <tr className="bg-[#3F3F46] text-gray-200 text-sm font-medium border-b-2 border-[#3B82F6]">
                        <th className="py-4 px-6 text-left border-b border-[#7DD3FC]">Nombre del evento</th>
                        <th className="py-4 px-6 text-left border-b border-[#7DD3FC]">Anfitrión</th>
                        <th className="py-4 px-6 text-left border-b border-[#7DD3FC]">Invitados</th>
                        <th className="py-4 px-6 text-left border-b border-[#7DD3FC]">Fecha</th>
                        <th className="py-4 px-6 text-left border-b border-[#7DD3FC]">Hora</th>
                        <th className="py-4 px-6 text-left border-b border-[#7DD3FC]">Estado</th>
                        <th className="py-4 px-6 border-b border-[#7DD3FC]"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentGuestLists.map((list, index) => (
                        <tr
                          key={index}
                          onClick={() => handleRowClick(list)}
                          className="border-b border-[#3F3F46] hover:bg-[#3F3F46] cursor-pointer transition-colors duration-150"
                        >
                          <td className="py-4 px-6 text-white text-sm" data-label="Nombre">
                            {list.nombre}
                          </td>
                          <td className="py-4 px-6 text-white text-sm" data-label="Anfitrión">
                            {list.anfitrion}
                          </td>
                          <td className="py-4 px-6 text-white text-sm" data-label="Invitados">
                            {list.guests?.length || 0}
                          </td>
                          <td className="py-4 px-6 text-white text-sm" data-label="Fecha">
                            {list.fecha}
                          </td>
                          <td className="py-4 px-6 text-white text-sm" data-label="Hora">
                            {list.hora}
                          </td>
                          <td className="py-4 px-6" data-label="Estado">
                            <span
                              className={`inline-block px-2 py-0.5 rounded text-xs text-white ${
                                list.estado === "REALIZADO"
                                  ? "bg-emerald-500"
                                  : list.estado === "CONFIRMADO"
                                  ? "bg-amber-500"
                                  : list.estado === "CANCELADO"
                                  ? "bg-red-500"
                                  : "bg-gray-500"
                              }`}
                            >
                              {list.estado}
                            </span>
                          </td>
                          <td className="py-4 px-6" data-label="">
                            <ChevronRight className="w-4 h-4 text-gray-400" />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

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
                      [] as (number | string)[]
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
              </TabsContent>
          
              <TabsContent value="new">
                <NewGuestListForm  id= {currentUser} onSubmit={handleNewGuestList} onClose={handleCancelNewList} />
              </TabsContent>
           
            </Tabs>
          </div>
        </div>
      </div>

      {selectedGuestList && (
        <GuestListModal
          isOpen={!!selectedGuestList}
          onClose={() => setSelectedGuestList(null)}
          guestList={selectedGuestList}
          onStatusChange={handleStatusChange}
        />
      )}
    <ToastContainer position="top-right" autoClose={3000} />

    </div>
  )
}

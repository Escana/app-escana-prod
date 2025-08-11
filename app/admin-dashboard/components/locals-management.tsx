"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { Building, Plus, Search, Edit, Trash2, CheckCircle2, XCircle, MapPin, Users, CreditCard } from "lucide-react"
import { createEstablishment, updateEstablishment, deleteEstablishment } from "@/app/actions/establishments"
import { mockEstablishments } from "../mock/establishments-data"
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

export default function LocalsManagement({ establishments, currentUser }) {
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedEstablishment, setSelectedEstablishment] = useState(null)
  const [newEstablishment, setNewEstablishment] = useState({
    name: "",
    address: "",
    city: "",
    country: "Chile",
    status: "active" as const,
    plan: "basic" as const,
    contact_name: "",
    contact_email: "",
    contact_phone: "",
    description: "",
    max_capacity: "",
    payment_method: "monthly",
    notes: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false)
  const [authError, setAuthError] = useState("")

  // Usar mockEstablishments como datos iniciales
  const [localEstablishments, setLocalEstablishments] = useState(establishments || mockEstablishments)

  // Modificar la variable filteredEstablishments para usar localEstablishments
  const filteredEstablishments = localEstablishments.filter(
    (establishment) =>
      establishment.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      establishment.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      establishment.address?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // Nueva función para mostrar el diálogo de confirmación
  const showConfirmDialog = () => {
    // Validar datos
    if (!newEstablishment.name || !newEstablishment.address || !newEstablishment.city) {
      toast({
        title: "Error",
        description: "Por favor complete los campos obligatorios",
        variant: "destructive",
      })
      return
    }
    console.log(currentUser.userId)
    // Verificar si el usuario está autenticado
    if (!currentUser || !currentUser.userId) {
      console.log("estamos dentro")
      setAuthError("Debe iniciar sesión para crear un establecimiento")
      toast({
        title: "Error de autenticación",
        description: "Debe iniciar sesión para crear un establecimiento",
        variant: "destructive",
      })
      return
    }

    // Mostrar diálogo de confirmación
    setIsConfirmDialogOpen(true)
  }

  const handleAddEstablishment = async () => {
    try {
      setIsSubmitting(true)
      setAuthError("")
console.log('estamos acá')
      // Verificar si el usuario está autenticado
      if (!currentUser || !currentUser.userId) {
        setAuthError("Debe iniciar sesión para crear un establecimiento")
        toast({
          title: "Error de autenticación",
          description: "Debe iniciar sesión para crear un establecimiento",
          variant: "destructive",
        })
        return
      }

      // Preparar datos para la creación
      const establishmentData = {
        name: newEstablishment.name,
        address: newEstablishment.address,
        city: newEstablishment.city,
        country: newEstablishment.country,
        status: newEstablishment.status || "active",
        plan: newEstablishment.plan,
        contact_name: newEstablishment.contact_name || undefined,
        contact_email: newEstablishment.contact_email || undefined,
        contact_phone: newEstablishment.contact_phone || undefined,
        created_by: currentUser.userId, // Asegurarse de que se incluya el ID del usuario
      }

      console.log("Creando establecimiento con datos:", establishmentData)

      // Llamar a la acción del servidor para crear el establecimiento
      const result = await createEstablishment(establishmentData, currentUser)

      toast({
        title: "Éxito",
        description: "Local creado correctamente",
      })

      // Actualizar el estado local con el nuevo establecimiento
      setLocalEstablishments([result, ...localEstablishments])

      // Resetear formulario
      setNewEstablishment({
        name: "",
        address: "",
        city: "",
        country: "Chile",
        status: "active",
        plan: "basic",
        contactName: "",
        contactEmail: "",
        contactPhone: "",
      })

      // Cerrar diálogos
      setIsAddDialogOpen(false)
      setIsConfirmDialogOpen(false)
    } catch (error) {
      console.error("Error al crear local:", error)

      // Manejar errores específicos de RLS
      if (error.message && error.message.includes("row-level security")) {
        setAuthError("No tiene permisos para crear establecimientos. Contacte al administrador.")
        toast({
          title: "Error de permisos",
          description: "No tiene permisos para crear establecimientos. Contacte al administrador.",
          variant: "destructive",
        })
      } else {
        toast({
          title: "Error",
          description: "No se pudo crear el local: " + (error instanceof Error ? error.message : String(error)),
          variant: "destructive",
        })
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteEstablishment = async () => {
    if (!selectedEstablishment) return

    try {
      setIsSubmitting(true)

      // Llamar a la acción del servidor para eliminar el establecimiento
      await deleteEstablishment(selectedEstablishment.id,currentUser)

      toast({
        title: "Éxito",
        description: "Local eliminado correctamente",
      })

      // Actualizar la lista localmente
      setLocalEstablishments(localEstablishments.filter((est) => est.id !== selectedEstablishment.id))

      // Cerrar diálogo
      setIsDeleteDialogOpen(false)
    } catch (error) {
      console.error("Error al eliminar local:", error)
      toast({
        title: "Error",
        description: "No se pudo eliminar el local: " + (error instanceof Error ? error.message : String(error)),
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Añadir estado para el diálogo de edición
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

  // Función para manejar la edición de un establecimiento
  const handleEditEstablishment = async () => {
    if (!selectedEstablishment) return

    try {
      setIsSubmitting(true)

      // Preparar datos para la actualización
      const establishmentData = {
        name: selectedEstablishment.name,
        address: selectedEstablishment.address,
        city: selectedEstablishment.city,
        country: selectedEstablishment.country,
        status: selectedEstablishment.status,
        plan: selectedEstablishment.plan,
        contact_name: selectedEstablishment.contact_name,
        contact_email: selectedEstablishment.contact_email,
        contact_phone: selectedEstablishment.contact_phone,
      }

      // Llamar a la acción del servidor para actualizar el establecimiento
      const result = await updateEstablishment(selectedEstablishment.id, establishmentData)

      toast({
        title: "Éxito",
        description: "Local actualizado correctamente",
      })

      // Actualizar el estado local
      setLocalEstablishments(localEstablishments.map((est) => (est.id === selectedEstablishment.id ? result : est)))

      // Cerrar diálogo
      setIsEditDialogOpen(false)
    } catch (error) {
      console.error("Error al actualizar local:", error)
      toast({
        title: "Error",
        description: "No se pudo actualizar el local: " + (error instanceof Error ? error.message : String(error)),
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Añadir este useEffect después de los estados
  useEffect(() => {
    if (establishments && establishments.length > 0) {
      setLocalEstablishments(establishments)
    }
  }, [establishments])

  return (
    <Card className="bg-gray-900 border border-gray-700">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl">Gestión de Locales</CardTitle>
            <CardDescription>Administra los locales registrados en la plataforma</CardDescription>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => setIsAddDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" /> Nuevo Local
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-gray-900 border border-gray-700 text-white max-w-2xl">
              <DialogHeader>
                <DialogTitle className="text-xl flex items-center gap-2">
                  <Building className="h-5 w-5 text-blue-500" /> Registrar Nuevo Local
                </DialogTitle>
                <DialogDescription>
                  Complete el formulario para registrar un nuevo establecimiento en la plataforma
                </DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="name" className="text-sm font-medium">
                      Nombre del local *
                    </label>
                    <div className="relative">
                      <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        id="name"
                        placeholder="Ej: Club Nocturno XYZ"
                        className="bg-gray-800 border-gray-700 pl-10"
                        value={newEstablishment.name}
                        onChange={(e) => setNewEstablishment({ ...newEstablishment, name: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="address" className="text-sm font-medium">
                      Dirección *
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        id="address"
                        placeholder="Ej: Av. Principal 123"
                        className="bg-gray-800 border-gray-700 pl-10"
                        value={newEstablishment.address}
                        onChange={(e) => setNewEstablishment({ ...newEstablishment, address: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label htmlFor="city" className="text-sm font-medium">
                        Ciudad *
                      </label>
                      <Input
                        id="city"
                        placeholder="Ej: Santiago"
                        className="bg-gray-800 border-gray-700"
                        value={newEstablishment.city}
                        onChange={(e) => setNewEstablishment({ ...newEstablishment, city: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="country" className="text-sm font-medium">
                        País
                      </label>
                      <Input
                        id="country"
                        placeholder="Ej: Chile"
                        className="bg-gray-800 border-gray-700"
                        value={newEstablishment.country}
                        onChange={(e) => setNewEstablishment({ ...newEstablishment, country: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="plan" className="text-sm font-medium">
                      Plan
                    </label>
                    <select
                      id="plan"
                      className="w-full bg-gray-800 border border-gray-700 rounded-md p-2 text-white"
                      value={newEstablishment.plan}
                      onChange={(e) => setNewEstablishment({ ...newEstablishment, plan: e.target.value })}
                    >
                      <option value="basic">Básico</option>
                      <option value="premium">Premium</option>
                      <option value="enterprise">Empresarial</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="contactName" className="text-sm font-medium">
                      Nombre de contacto
                    </label>
                    <div className="relative">
                      <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        id="contactName"
                        placeholder="Ej: Juan Pérez"
                        className="bg-gray-800 border-gray-700 pl-10"
                        value={newEstablishment.contactName}
                        onChange={(e) => setNewEstablishment({ ...newEstablishment, contactName: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="contactEmail" className="text-sm font-medium">
                      Email de contacto
                    </label>
                    <Input
                      id="contactEmail"
                      type="email"
                      placeholder="Ej: contacto@local.com"
                      className="bg-gray-800 border-gray-700"
                      value={newEstablishment.contactEmail}
                      onChange={(e) => setNewEstablishment({ ...newEstablishment, contactEmail: e.target.value })}
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsAddDialogOpen(false)}
                  className="bg-gray-800 text-white hover:bg-gray-700 border border-gray-700"
                >
                  Cancelar
                </Button>
                <Button onClick={showConfirmDialog} disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700">
                  {isSubmitting ? "Guardando..." : "Guardar"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        <div className="relative w-full max-w-sm mt-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            type="text"
            placeholder="Buscar locales..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-gray-800 border border-gray-700 text-white placeholder-gray-400 pl-10"
          />
        </div>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <div className="rounded-md border border-gray-700">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-gray-800">
                <TableHead className="text-white whitespace-nowrap">Nombre</TableHead>
                <TableHead className="text-white whitespace-nowrap">Ubicación</TableHead>
                <TableHead className="text-white whitespace-nowrap">Estado</TableHead>
                <TableHead className="text-white whitespace-nowrap">Plan</TableHead>
                <TableHead className="text-white whitespace-nowrap">Usuarios</TableHead>
                <TableHead className="text-white text-right whitespace-nowrap">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEstablishments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-4 text-muted-foreground">
                    No se encontraron locales
                  </TableCell>
                </TableRow>
              ) : (
                filteredEstablishments.map((establishment) => (
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
                        {establishment.userCount !== undefined ? establishment.userCount : 0}
                      </div>
                    </TableCell>
                  
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-blue-500"
                          onClick={() => {
                            setSelectedEstablishment(establishment)
                            setIsEditDialogOpen(true)
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-500"
                          onClick={() => {
                            setSelectedEstablishment(establishment)
                            setIsDeleteDialogOpen(true)
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
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

      {/* Diálogo de confirmación para eliminar */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="bg-gray-900 border border-gray-700 text-white">
          <DialogHeader>
            <DialogTitle>Confirmar Eliminación</DialogTitle>
            <DialogDescription>
              ¿Está seguro de que desea eliminar el local "{selectedEstablishment?.name}"? Esta acción no se puede
              deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              className="bg-gray-800 text-white hover:bg-gray-700 border border-gray-700"
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteEstablishment}
              disabled={isSubmitting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isSubmitting ? "Eliminando..." : "Eliminar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo de confirmación para crear */}
      <AlertDialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
        <AlertDialogContent className="bg-gray-900 border border-gray-700 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Creación</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Está seguro de que desea crear el local "{newEstablishment.name}"?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-gray-800 text-white hover:bg-gray-700 border border-gray-700">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleAddEstablishment} className="bg-blue-600 hover:bg-blue-700">
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Diálogo de edición */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="bg-gray-900 border border-gray-700 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center gap-2">
              <Edit className="h-5 w-5 text-blue-500" /> Editar Local
            </DialogTitle>
            <DialogDescription>Actualice la información del establecimiento</DialogDescription>
          </DialogHeader>
          {selectedEstablishment && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="edit-name" className="text-sm font-medium">
                    Nombre del local *
                  </label>
                  <div className="relative">
                    <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      id="edit-name"
                      placeholder="Ej: Club Nocturno XYZ"
                      className="bg-gray-800 border-gray-700 pl-10"
                      value={selectedEstablishment.name}
                      onChange={(e) => setSelectedEstablishment({ ...selectedEstablishment, name: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label htmlFor="edit-address" className="text-sm font-medium">
                    Dirección *
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      id="edit-address"
                      placeholder="Ej: Av. Principal 123"
                      className="bg-gray-800 border-gray-700 pl-10"
                      value={selectedEstablishment.address}
                      onChange={(e) => setSelectedEstablishment({ ...selectedEstablishment, address: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="edit-city" className="text-sm font-medium">
                      Ciudad *
                    </label>
                    <Input
                      id="edit-city"
                      placeholder="Ej: Santiago"
                      className="bg-gray-800 border-gray-700"
                      value={selectedEstablishment.city}
                      onChange={(e) => setSelectedEstablishment({ ...selectedEstablishment, city: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="edit-country" className="text-sm font-medium">
                      País
                    </label>
                    <Input
                      id="edit-country"
                      placeholder="Ej: Chile"
                      className="bg-gray-800 border-gray-700"
                      value={selectedEstablishment.country}
                      onChange={(e) => setSelectedEstablishment({ ...selectedEstablishment, country: e.target.value })}
                    />
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="edit-plan" className="text-sm font-medium">
                    Plan
                  </label>
                  <select
                    id="edit-plan"
                    className="w-full bg-gray-800 border border-gray-700 rounded-md p-2 text-white"
                    value={selectedEstablishment.plan}
                    onChange={(e) => setSelectedEstablishment({ ...selectedEstablishment, plan: e.target.value })}
                  >
                    <option value="basic">Básico</option>
                    <option value="premium">Premium</option>
                    <option value="enterprise">Empresarial</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label htmlFor="edit-status" className="text-sm font-medium">
                    Estado
                  </label>
                  <select
                    id="edit-status"
                    className="w-full bg-gray-800 border border-gray-700 rounded-md p-2 text-white"
                    value={selectedEstablishment.status}
                    onChange={(e) => setSelectedEstablishment({ ...selectedEstablishment, status: e.target.value })}
                  >
                    <option value="active">Activo</option>
                    <option value="inactive">Inactivo</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label htmlFor="edit-contactName" className="text-sm font-medium">
                    Nombre de contacto
                  </label>
                  <div className="relative">
                    <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      id="edit-contactName"
                      placeholder="Ej: Juan Pérez"
                      className="bg-gray-800 border-gray-700 pl-10"
                      value={selectedEstablishment.contact_name || ""}
                      onChange={(e) =>
                        setSelectedEstablishment({ ...selectedEstablishment, contact_name: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label htmlFor="edit-contactEmail" className="text-sm font-medium">
                    Email de contacto
                  </label>
                  <Input
                    id="edit-contactEmail"
                    type="email"
                    placeholder="Ej: contacto@local.com"
                    className="bg-gray-800 border-gray-700"
                    value={selectedEstablishment.contact_email || ""}
                    onChange={(e) =>
                      setSelectedEstablishment({ ...selectedEstablishment, contact_email: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="edit-contactPhone" className="text-sm font-medium">
                    Teléfono de contacto
                  </label>
                  <Input
                    id="edit-contactPhone"
                    placeholder="Ej: +56 9 1234 5678"
                    className="bg-gray-800 border-gray-700"
                    value={selectedEstablishment.contact_phone || ""}
                    onChange={(e) =>
                      setSelectedEstablishment({ ...selectedEstablishment, contact_phone: e.target.value })
                    }
                  />
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
              className="bg-gray-800 text-white hover:bg-gray-700 border border-gray-700"
            >
              Cancelar
            </Button>
            <Button onClick={handleEditEstablishment} disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700">
              {isSubmitting ? "Guardando..." : "Actualizar Local"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}


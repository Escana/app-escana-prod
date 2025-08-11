"use client"

import { useState, useEffect } from "react"
import { Plus, Edit, Trash2, Search, Loader2, Building } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useToast } from "@/components/ui/use-toast"
import {
  addEmployee,
  deleteEmployee,
  getEmployees,
  updateEmployee,
  getEstablishments,
  addEstablishment,
} from "../actions/employees"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { Employee, Establishment } from "@/lib/supabase"
import { ROLES } from "@/lib/auth"

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [establishments, setEstablishments] = useState<Establishment[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isAddEstablishmentOpen, setIsAddEstablishmentOpen] = useState(false)
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)
  const [newEmployee, setNewEmployee] = useState({
    name: "",
    email: "",
    role: "guardia" as Employee["role"],
    status: "Activo" as Employee["status"],
    establishment_id: "",
  })
  const [newEstablishment, setNewEstablishment] = useState({
    name: "",
    address: "",
    city: "",
    country: "Chile",
  })
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("employees")
  const [currentUserRole, setCurrentUserRole] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      setIsLoading(true)
      const employeesData = await getEmployees()
      setEmployees(employeesData)

      // Get the current user's role from the first employee (which should be the current user)
      if (employeesData.length > 0) {
        const currentUser = employeesData.find((emp) => emp.email === "current_user_email@example.com") // Replace with actual logic to find current user
        if (currentUser) {
          setCurrentUserRole(currentUser.role)
        }
      }

      const establishmentsData = await getEstablishments()
      setEstablishments(establishmentsData)

      // Set default establishment for new employee
      if (establishmentsData.length > 0) {
        setNewEmployee((prev) => ({
          ...prev,
          establishment_id: establishmentsData[0].id,
        }))
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron cargar los datos",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const filteredEmployees = employees.filter(
    (employee) =>
      employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.role.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleAddEmployee = async () => {
    try {
      await addEmployee(newEmployee)
      setNewEmployee({
        name: "",
        email: "",
        role: "guardia",
        status: "Activo",
        establishment_id: establishments[0]?.id || "",
      })
      setIsAddDialogOpen(false)
      loadData()
      toast({
        title: "Éxito",
        description: "Empleado agregado correctamente",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "No se pudo agregar el empleado",
        variant: "destructive",
      })
    }
  }

  const handleUpdateEmployee = async () => {
    if (!selectedEmployee) return

    try {
      await updateEmployee(selectedEmployee.id, {
        name: selectedEmployee.name,
        email: selectedEmployee.email,
        role: selectedEmployee.role,
        status: selectedEmployee.status,
        establishment_id: selectedEmployee.establishment_id,
      })
      setIsEditDialogOpen(false)
      loadData()
      toast({
        title: "Éxito",
        description: "Empleado actualizado correctamente",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "No se pudo actualizar el empleado",
        variant: "destructive",
      })
    }
  }

  const handleDeleteEmployee = async (id: string) => {
    if (!window.confirm("¿Está seguro de que desea eliminar este empleado?")) return

    try {
      await deleteEmployee(id)
      loadData()
      toast({
        title: "Éxito",
        description: "Empleado eliminado correctamente",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "No se pudo eliminar el empleado",
        variant: "destructive",
      })
    }
  }

  const handleAddEstablishment = async () => {
    try {
      await addEstablishment(newEstablishment)
      setNewEstablishment({ name: "", address: "", city: "", country: "Chile" })
      setIsAddEstablishmentOpen(false)
      loadData()
      toast({
        title: "Éxito",
        description: "Establecimiento agregado correctamente",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "No se pudo agregar el establecimiento",
        variant: "destructive",
      })
    }
  }

  // Get establishment name by ID
  const getEstablishmentName = (id: string) => {
    const establishment = establishments.find((est) => est.id === id)
    return establishment ? establishment.name : "No asignado"
  }

  // Check if user can manage establishments
  const canManageEstablishments = currentUserRole === ROLES.SUPERADMIN

  return (
    <div className="min-h-screen bg-[#1A1B1C] p-8">
      <div className="max-w-6xl mx-auto bg-[#27272A] rounded-lg shadow-lg overflow-hidden">
        <div className="p-6 border-b border-[#3F3F46]">
          <h1 className="text-3xl font-bold text-white">Gestión de Usuarios</h1>
        </div>
        <div className="p-6">
          <div className="bg-[#3F3F46] p-4 rounded-lg mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-white">Sesión actual</h2>
                <p className="text-[#7DD3FC]">Rodrigo Bustamante</p>
              </div>
              <div className="bg-[#22C55E] text-white px-3 py-1 rounded-full text-sm">
                {currentUserRole === ROLES.SUPERADMIN
                  ? "Superadministrador"
                  : currentUserRole === ROLES.ADMIN
                    ? "Administrador"
                    : "Guardia"}
              </div>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
            <TabsList className="bg-[#3F3F46]">
              <TabsTrigger value="employees" className="data-[state=active]:bg-[#3B82F6]">
                Empleados
              </TabsTrigger>
              {canManageEstablishments && (
                <TabsTrigger value="establishments" className="data-[state=active]:bg-[#3B82F6]">
                  Establecimientos
                </TabsTrigger>
              )}
            </TabsList>

            <TabsContent value="employees" className="mt-4">
              <div className="flex justify-between items-center mb-6">
                <div className="relative w-64">
                  <Input
                    type="text"
                    placeholder="Buscar empleados..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="bg-[#3F3F46] border-0 text-white placeholder-gray-400 pr-10"
                  />
                  <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                </div>
                <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-[#3B82F6] hover:bg-[#2563EB]">
                      <Plus className="mr-2 h-4 w-4" /> Agregar Empleado
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-[#27272A] text-white">
                    <DialogHeader>
                      <DialogTitle>Agregar Nuevo Empleado</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <label htmlFor="name" className="text-right">
                          Nombre
                        </label>
                        <Input
                          id="name"
                          value={newEmployee.name}
                          onChange={(e) => setNewEmployee({ ...newEmployee, name: e.target.value })}
                          className="col-span-3 bg-[#3F3F46] border-0 text-white"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <label htmlFor="email" className="text-right">
                          Email
                        </label>
                        <Input
                          id="email"
                          value={newEmployee.email}
                          onChange={(e) => setNewEmployee({ ...newEmployee, email: e.target.value })}
                          className="col-span-3 bg-[#3F3F46] border-0 text-white"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <label htmlFor="role" className="text-right">
                          Rol
                        </label>
                        <select
                          id="role"
                          value={newEmployee.role}
                          onChange={(e) => setNewEmployee({ ...newEmployee, role: e.target.value as Employee["role"] })}
                          className="col-span-3 bg-[#3F3F46] border-0 text-white p-2 rounded"
                        >
                          {currentUserRole === ROLES.SUPERADMIN && (
                            <>
                              <option value="superadmin">Superadministrador</option>
                              <option value="admin">Administrador</option>
                            </>
                          )}
                          {currentUserRole === ROLES.ADMIN && <option value="admin">Administrador</option>}
                          <option value="guardia">Guardia</option>
                        </select>
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <label htmlFor="establishment" className="text-right">
                          Establecimiento
                        </label>
                        <select
                          id="establishment"
                          value={newEmployee.establishment_id}
                          onChange={(e) => setNewEmployee({ ...newEmployee, establishment_id: e.target.value })}
                          className="col-span-3 bg-[#3F3F46] border-0 text-white p-2 rounded"
                          disabled={currentUserRole !== ROLES.SUPERADMIN}
                        >
                          {establishments.map((est) => (
                            <option key={est.id} value={est.id}>
                              {est.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <label htmlFor="status" className="text-right">
                          Estado
                        </label>
                        <select
                          id="status"
                          value={newEmployee.status}
                          onChange={(e) =>
                            setNewEmployee({ ...newEmployee, status: e.target.value as Employee["status"] })
                          }
                          className="col-span-3 bg-[#3F3F46] border-0 text-white p-2 rounded"
                        >
                          <option value="Activo">Activo</option>
                          <option value="Inactivo">Inactivo</option>
                        </select>
                      </div>
                    </div>
                    <Button onClick={handleAddEmployee} className="bg-[#3B82F6] hover:bg-[#2563EB]">
                      Agregar Empleado
                    </Button>
                  </DialogContent>
                </Dialog>
              </div>

              {isLoading ? (
                <div className="flex justify-center items-center h-64">
                  <Loader2 className="w-8 h-8 text-[#3B82F6] animate-spin" />
                </div>
              ) : (
                <div className="responsive-table-container">
                  <Table className="responsive-table">
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-white">Nombre</TableHead>
                        <TableHead className="text-white">Email</TableHead>
                        <TableHead className="text-white">Rol</TableHead>
                        <TableHead className="text-white">Establecimiento</TableHead>
                        <TableHead className="text-white">Estado</TableHead>
                        <TableHead className="text-white">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredEmployees.map((employee) => (
                        <TableRow key={employee.id}>
                          <TableCell className="font-medium text-white" data-label="Nombre">
                            {employee.name}
                          </TableCell>
                          <TableCell className="text-white" data-label="Email">
                            {employee.email}
                          </TableCell>
                          <TableCell className="text-white" data-label="Rol">
                            {employee.role === ROLES.SUPERADMIN
                              ? "Superadministrador"
                              : employee.role === ROLES.ADMIN
                                ? "Administrador"
                                : "Guardia"}
                          </TableCell>
                          <TableCell className="text-white" data-label="Establecimiento">
                            {employee.establishment_id
                              ? getEstablishmentName(employee.establishment_id)
                              : "No asignado"}
                          </TableCell>
                          <TableCell className="text-white" data-label="Estado">
                            <span
                              className={`px-2 py-1 rounded-full text-xs ${employee.status === "Activo" ? "bg-green-500" : "bg-red-500"}`}
                            >
                              {employee.status}
                            </span>
                          </TableCell>
                          <TableCell className="text-white" data-label="Acciones">
                            <Button
                              variant="ghost"
                              className="h-8 w-8 p-0"
                              onClick={() => {
                                setSelectedEmployee(employee)
                                setIsEditDialogOpen(true)
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              className="h-8 w-8 p-0"
                              onClick={() => handleDeleteEmployee(employee.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </TabsContent>

            {canManageEstablishments && (
              <TabsContent value="establishments" className="mt-4">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-semibold text-white">Establecimientos</h3>
                  <Dialog open={isAddEstablishmentOpen} onOpenChange={setIsAddEstablishmentOpen}>
                    <DialogTrigger asChild>
                      <Button className="bg-[#3B82F6] hover:bg-[#2563EB]">
                        <Plus className="mr-2 h-4 w-4" /> Agregar Establecimiento
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-[#27272A] text-white">
                      <DialogHeader>
                        <DialogTitle>Agregar Nuevo Establecimiento</DialogTitle>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                          <label htmlFor="est-name" className="text-right">
                            Nombre
                          </label>
                          <Input
                            id="est-name"
                            value={newEstablishment.name}
                            onChange={(e) => setNewEstablishment({ ...newEstablishment, name: e.target.value })}
                            className="col-span-3 bg-[#3F3F46] border-0 text-white"
                          />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <label htmlFor="address" className="text-right">
                            Dirección
                          </label>
                          <Input
                            id="address"
                            value={newEstablishment.address}
                            onChange={(e) => setNewEstablishment({ ...newEstablishment, address: e.target.value })}
                            className="col-span-3 bg-[#3F3F46] border-0 text-white"
                          />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <label htmlFor="city" className="text-right">
                            Ciudad
                          </label>
                          <Input
                            id="city"
                            value={newEstablishment.city}
                            onChange={(e) => setNewEstablishment({ ...newEstablishment, city: e.target.value })}
                            className="col-span-3 bg-[#3F3F46] border-0 text-white"
                          />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <label htmlFor="country" className="text-right">
                            País
                          </label>
                          <Input
                            id="country"
                            value={newEstablishment.country}
                            onChange={(e) => setNewEstablishment({ ...newEstablishment, country: e.target.value })}
                            className="col-span-3 bg-[#3F3F46] border-0 text-white"
                          />
                        </div>
                      </div>
                      <Button onClick={handleAddEstablishment} className="bg-[#3B82F6] hover:bg-[#2563EB]">
                        Agregar Establecimiento
                      </Button>
                    </DialogContent>
                  </Dialog>
                </div>

                {isLoading ? (
                  <div className="flex justify-center items-center h-64">
                    <Loader2 className="w-8 h-8 text-[#3B82F6] animate-spin" />
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {establishments.map((establishment) => (
                      <div key={establishment.id} className="bg-[#3F3F46] p-4 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-lg font-semibold text-white">{establishment.name}</h4>
                          <Building className="h-5 w-5 text-[#3B82F6]" />
                        </div>
                        <p className="text-sm text-gray-300">{establishment.address}</p>
                        <p className="text-sm text-gray-300">
                          {establishment.city}, {establishment.country}
                        </p>
                        <div className="flex justify-end mt-4">
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>
            )}
          </Tabs>
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="bg-[#27272A] text-white">
          <DialogHeader>
            <DialogTitle>Editar Empleado</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="edit-name" className="text-right">
                Nombre
              </label>
              <Input
                id="edit-name"
                value={selectedEmployee?.name || ""}
                onChange={(e) =>
                  setSelectedEmployee(selectedEmployee ? { ...selectedEmployee, name: e.target.value } : null)
                }
                className="col-span-3 bg-[#3F3F46] border-0 text-white"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="edit-email" className="text-right">
                Email
              </label>
              <Input
                id="edit-email"
                value={selectedEmployee?.email || ""}
                onChange={(e) =>
                  setSelectedEmployee(selectedEmployee ? { ...selectedEmployee, email: e.target.value } : null)
                }
                className="col-span-3 bg-[#3F3F46] border-0 text-white"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="edit-role" className="text-right">
                Rol
              </label>
              <select
                id="edit-role"
                value={selectedEmployee?.role || ""}
                onChange={(e) =>
                  setSelectedEmployee(
                    selectedEmployee ? { ...selectedEmployee, role: e.target.value as Employee["role"] } : null,
                  )
                }
                className="col-span-3 bg-[#3F3F46] border-0 text-white p-2 rounded"
              >
                {currentUserRole === ROLES.SUPERADMIN && (
                  <>
                    <option value="superadmin">Superadministrador</option>
                    <option value="admin">Administrador</option>
                  </>
                )}
                {currentUserRole === ROLES.ADMIN && <option value="admin">Administrador</option>}
                <option value="guardia">Guardia</option>
              </select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="edit-establishment" className="text-right">
                Establecimiento
              </label>
              <select
                id="edit-establishment"
                value={selectedEmployee?.establishment_id || ""}
                onChange={(e) =>
                  setSelectedEmployee(
                    selectedEmployee ? { ...selectedEmployee, establishment_id: e.target.value } : null,
                  )
                }
                className="col-span-3 bg-[#3F3F46] border-0 text-white p-2 rounded"
                disabled={currentUserRole !== ROLES.SUPERADMIN}
              >
                {establishments.map((est) => (
                  <option key={est.id} value={est.id}>
                    {est.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="edit-status" className="text-right">
                Estado
              </label>
              <select
                id="edit-status"
                value={selectedEmployee?.status || ""}
                onChange={(e) =>
                  setSelectedEmployee(
                    selectedEmployee ? { ...selectedEmployee, status: e.target.value as Employee["status"] } : null,
                  )
                }
                className="col-span-3 bg-[#3F3F46] border-0 text-white p-2 rounded"
              >
                <option value="Activo">Activo</option>
                <option value="Inactivo">Inactivo</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-4">
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
              className="bg-[#3F3F46] text-white hover:bg-[#52525B]"
            >
              Cancelar
            </Button>
            <Button onClick={handleUpdateEmployee} className="bg-[#3B82F6] hover:bg-[#2563EB]">
              Guardar Cambios
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}


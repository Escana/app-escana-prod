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
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Building,
  UserCircle,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Mail,
  ActivityIcon,
} from "lucide-react"
import { getEmployees, addEmployee, deleteEmployee, updateEmployee } from "@/app/actions/employees"
import { ROLES } from "@/lib/auth-client"
import { Checkbox } from "@/components/ui/checkbox"
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

export default function UsersManagement({ establishments, currentUser }) {
  const [searchTerm, setSearchTerm] = useState("")
  const [employees, setEmployees] = useState([])
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedEmployee, setSelectedEmployee] = useState(null)
  const [newEmployee, setNewEmployee] = useState({
    name: "",
    email: "",
    password: "",
    role: ROLES.ADMIN,
    status: "Activo",
    establishment_id: "",
  })
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [employeeToEdit, setEmployeeToEdit] = useState(null)
  const [editEmployeeData, setEditEmployeeData] = useState({
    name: "",
    email: "",
    password: "",
    role: ROLES.ADMIN,
    status: "Activo",
    establishment_id: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false)

  useEffect(() => {
    async function loadEmployees() {
      try {
        setLoading(true)
        const employeesData = await getEmployees(currentUser)
        setEmployees(employeesData || [])
      } catch (error) {
        console.error("Error loading employees:", error)
        toast({
          title: "Error",
          description: "No se pudieron cargar los empleados",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    loadEmployees()
  }, [currentUser, toast])

  const filteredEmployees = employees.filter(
    (employee) =>
      employee.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.role?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // Función para mostrar el diálogo de confirmación al crear
  const showConfirmDialog = () => {
    console.log('acaaa')
    setIsConfirmDialogOpen(true)
    if (
      !newEmployee.name ||
      !newEmployee.email ||
      !newEmployee.establishment_id ||
      !newEmployee.password
    ) {
      toast({
        title: "Error",
        description: "Por favor complete todos los campos obligatorios",
        variant: "destructive",
      })
      return
    }
    setIsConfirmDialogOpen(true)
    
  }

  // Función para agregar empleado (creación)
  const handleAddEmployee = async () => {
    console.log('ola')
    try {
      setIsSubmitting(true)
      console.log('aca')
      const createdEmployee = await addEmployee({
        name: newEmployee.name,
        email: newEmployee.email,
        password: newEmployee.password,
        role: newEmployee.role,
        status: newEmployee.status,
        establishment_id: newEmployee.establishment_id,
        userInfo: currentUser,
      })
      toast({
        title: "Éxito",
        description: `Usuario creado correctamente.`,
      })
      setNewEmployee({
        name: "",
        email: "",
        password: "",
        role: ROLES.ADMIN,
        status: "Activo",
        establishment_id: "",
      })
      setIsAddDialogOpen(false)
      setIsConfirmDialogOpen(false)
      const employeesData = await getEmployees(currentUser)
      setEmployees(employeesData || [])
    } catch (error) {
      console.error("Error al crear usuario:", error)
      toast({
        title: "Error",
        description:
          "No se pudo crear el usuario: " +
          (error instanceof Error ? error.message : String(error)),
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteEmployee = async () => {
    if (!selectedEmployee) return
    try {
      setIsSubmitting(true)
      await deleteEmployee(selectedEmployee.id, currentUser)
      toast({
        title: "Éxito",
        description: "Usuario eliminado correctamente",
      })
      setIsDeleteDialogOpen(false)
      const employeesData = await getEmployees(currentUser)
      setEmployees(employeesData || [])
    } catch (error) {
      console.error("Error al eliminar usuario:", error)
      toast({
        title: "Error",
        description:
          "No se pudo eliminar el usuario: " +
          (error instanceof Error ? error.message : String(error)),
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Función para abrir el diálogo de edición y cargar datos actuales
  const handleOpenEditDialog = (employee) => {
    console.log(employee)
    setEmployeeToEdit(employee)
    setEditEmployeeData({
      name: employee.name || "",
      email: employee.email || "",
      password: "", // Vacío: solo se actualizará si se ingresa un nuevo valor
      role: employee.role || ROLES.ADMIN,
      status: employee.status || "Activo",
      establishment_id: employee.establishment_id || "",
    })
    setIsEditDialogOpen(true)
  }

  // Función para guardar los cambios de edición
  const handleEditEmployee = async () => {
    if (!employeeToEdit) return
    try {
      setIsSubmitting(true)
      // Incluimos el currentUser en el objeto de datos
      await updateEmployee(employeeToEdit.id, { ...editEmployeeData, userInfo: currentUser })
      toast({
        title: "Éxito",
        description: "Usuario actualizado correctamente",
      })
      setIsEditDialogOpen(false)
      setEmployeeToEdit(null)
      const employeesData = await getEmployees(currentUser)
      setEmployees(employeesData || [])
    } catch (error) {
      console.error("Error al actualizar usuario:", error)
      toast({
        title: "Error",
        description:
          "No se pudo actualizar el usuario: " +
          (error instanceof Error ? error.message : String(error)),
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }
  
  const getEstablishmentName = (id) => {
    const establishment = establishments.find((est) => est.id === id)
    return establishment ? establishment.name : "No asignado"
  }

  return (
    <Card className="bg-gray-900 border border-gray-700">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl">Gestión de Usuarios</CardTitle>
            <CardDescription>Administra los usuarios de todos los locales</CardDescription>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => setIsAddDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" /> Nuevo Usuario
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-gray-900 border border-gray-700 text-white max-w-2xl">
              <DialogHeader>
                <DialogTitle className="text-xl flex items-center gap-2">
                  <UserCircle className="h-5 w-5 text-blue-500" /> Crear Nuevo Usuario
                </DialogTitle>
                <DialogDescription>
                  Complete los datos para registrar un nuevo usuario en la plataforma
                </DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="name" className="text-sm font-medium">
                      Nombre completo *
                    </label>
                    <div className="relative">
                      <UserCircle className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        id="name"
                        placeholder="Ej: Juan Pérez"
                        className="bg-gray-800 border-gray-700 pl-10"
                        value={newEmployee.name}
                        onChange={(e) => setNewEmployee({ ...newEmployee, name: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium">
                      Email *
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="Ej: usuario@ejemplo.com"
                        className="bg-gray-800 border-gray-700 pl-10"
                        value={newEmployee.email}
                        onChange={(e) => setNewEmployee({ ...newEmployee, email: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="password" className="text-sm font-medium">
                      Contraseña *
                    </label>
                    <div className="relative">
                      <UserCircle className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        id="password"
                        type="password"
                        placeholder="Ingresa una contraseña"
                        className="bg-gray-800 border-gray-700 pl-10"
                        value={newEmployee.password}
                        onChange={(e) => setNewEmployee({ ...newEmployee, password: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="role" className="text-sm font-medium">
                      Rol *
                    </label>
                    <div className="relative">
                      <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <select
                        id="role"
                        value={newEmployee.role}
                        onChange={(e) => setNewEmployee({ ...newEmployee, role: e.target.value })}
                        className="w-full bg-gray-800 border border-gray-700 rounded-md p-2 text-white pl-10"
                      >
                        <option value={ROLES.SUPERADMIN}>Super Administrador</option>
                        <option value={ROLES.ADMIN}>Administrador de Local</option>
                        <option value={ROLES.GUARDIA}>Guardia de Seguridad</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="establishment" className="text-sm font-medium">
                      Local asignado *
                    </label>
                    <div className="relative">
  <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
  {currentUser?.role === ROLES.ADMIN ? (
    <select
      id="establishment"
      value={newEmployee.establishment_id}
      onChange={(e) =>
        setNewEmployee({ ...newEmployee, establishment_id: e.target.value })
      }
      className="w-full bg-gray-800 border border-gray-700 rounded-md p-2 text-white pl-10"
      disabled
    >
      <option value={currentUser.establishment_id}>
        {establishments.find(est => est.id === currentUser.establishment_id)?.name || "Sin local asignado"}
      </option>
    </select>
  ) : (
    <select
      id="establishment"
      value={newEmployee.establishment_id}
      onChange={(e) =>
        setNewEmployee({ ...newEmployee, establishment_id: e.target.value })
      }
      className="w-full bg-gray-800 border border-gray-700 rounded-md p-2 text-white pl-10"
    >
      <option value="">Seleccione un local</option>
      {establishments.map((est) => (
        <option key={est.id} value={est.id}>
          {est.name}
        </option>
      ))}
    </select>
  )}
</div>
</div>
                  <div className="space-y-2">
                    <label htmlFor="status" className="text-sm font-medium">
                      Estado
                    </label>
                    <div className="relative">
                      <ActivityIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <select
                        id="status"
                        value={newEmployee.status}
                        onChange={(e) => setNewEmployee({ ...newEmployee, status: e.target.value })}
                        className="w-full bg-gray-800 border border-gray-700 rounded-md p-2 text-white pl-10"
                      >
                        <option value="Activo">Activo</option>
                        <option value="Inactivo">Inactivo</option>
                      </select>
                    </div>
                  </div>
                  <div className="space-y-2 pt-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="sendCredentials" />
                      <label htmlFor="sendCredentials" className="text-sm text-gray-300">
                        Enviar credenciales por email
                      </label>
                    </div>
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
                  {isSubmitting ? "Guardando..." : "Guardar Usuario"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        <div className="relative w-full max-w-sm mt-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            type="text"
            placeholder="Buscar usuarios..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-gray-800 border border-gray-700 text-white placeholder-gray-400 pl-10"
          />
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <p className="text-muted-foreground">Cargando usuarios...</p>
          </div>
        ) : (
          <div className="rounded-md border border-gray-700">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-gray-800">
                  <TableHead className="text-white">Nombre</TableHead>
                  <TableHead className="text-white">Email</TableHead>
                  <TableHead className="text-white">Rol</TableHead>
                  <TableHead className="text-white">Local</TableHead>
                  <TableHead className="text-white">Estado</TableHead>
                  <TableHead className="text-white text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEmployees.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-4 text-muted-foreground">
                      No se encontraron usuarios
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredEmployees.map((employee) => (
                    <TableRow key={employee.id} className="hover:bg-gray-800">
                      <TableCell className="font-medium text-white">
                        <div className="flex items-center gap-2">
                          <UserCircle className="h-4 w-4 text-[#3B82F6]" />
                          {employee.name}
                        </div>
                      </TableCell>
                      <TableCell className="text-white">{employee.email}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={`
                            ${
                              employee.role === ROLES.SUPERADMIN
                                ? "bg-purple-500 text-purple-200 border border-purple-400"
                                : employee.role === ROLES.ADMIN
                                ? "bg-blue-500 text-blue-200 border border-blue-400"
                                : "bg-green-500 text-green-200 border border-green-400"
                            }
                          `}
                        >
                          <div className="flex items-center gap-1">
                            {employee.role === ROLES.SUPERADMIN ? (
                              <>
                                <ShieldAlert className="h-3 w-3" /> Super Admin
                              </>
                            ) : employee.role === ROLES.ADMIN ? (
                              <>
                                <ShieldCheck className="h-3 w-3" /> Admin
                              </>
                            ) : (
                              <>
                                <Shield className="h-3 w-3" /> Guardia
                              </>
                            )}
                          </div>
                        </Badge>
                      </TableCell>
                      <TableCell className="text-white">
                        <div className="flex items-center gap-2">
                          <Building className="h-4 w-4 text-gray-400" />
                          {employee.establishment_id ? getEstablishmentName(employee.establishment_id) : "No asignado"}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={employee.status === "Activo" ? "default" : "secondary"}
                          className={employee.status === "Activo" ? "bg-green-500" : "bg-yellow-500"}
                        >
                          {employee.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-blue-500"
                            onClick={() => handleOpenEditDialog(employee)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-red-500"
                            onClick={() => {
                              setSelectedEmployee(employee)
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
        )}
      </CardContent>

      {/* Diálogo para eliminar usuario */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="bg-gray-900 border border-gray-700 text-white">
          <DialogHeader>
            <DialogTitle>Confirmar Eliminación</DialogTitle>
            <DialogDescription>
              ¿Está seguro de que desea eliminar al usuario "{selectedEmployee?.name}"? Esta acción no se puede deshacer.
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
              onClick={handleDeleteEmployee}
              disabled={isSubmitting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isSubmitting ? "Eliminando..." : "Eliminar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo de confirmación para crear usuario */}
      <AlertDialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
        <AlertDialogContent className="bg-gray-900 border border-gray-700 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Creación</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Está seguro de que desea crear el usuario "{newEmployee.name}"?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-gray-800 text-white hover:bg-gray-700 border border-gray-700">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleAddEmployee} className="bg-blue-600 hover:bg-blue-700">
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Diálogo para editar usuario */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="bg-gray-900 border border-gray-700 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar Usuario</DialogTitle>
            <DialogDescription>
              Modifique los datos del usuario. Ingrese una nueva contraseña solo si desea actualizarla.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="edit-name" className="text-sm font-medium">
                  Nombre completo *
                </label>
                <div className="relative">
                  <UserCircle className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="edit-name"
                    placeholder="Ej: Juan Pérez"
                    className="bg-gray-800 border-gray-700 pl-10"
                    value={editEmployeeData.name}
                    onChange={(e) =>
                      setEditEmployeeData({ ...editEmployeeData, name: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label htmlFor="edit-email" className="text-sm font-medium">
                  Email *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="edit-email"
                    type="email"
                    placeholder="Ej: usuario@ejemplo.com"
                    className="bg-gray-800 border-gray-700 pl-10"
                    value={editEmployeeData.email}
                    onChange={(e) =>
                      setEditEmployeeData({ ...editEmployeeData, email: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label htmlFor="edit-password" className="text-sm font-medium">
                  Nueva contraseña
                </label>
                <div className="relative">
                  <UserCircle className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="edit-password"
                    type="password"
                    placeholder="Dejar en blanco para mantener la actual"
                    className="bg-gray-800 border-gray-700 pl-10"
                    value={editEmployeeData.password}
                    onChange={(e) =>
                      setEditEmployeeData({ ...editEmployeeData, password: e.target.value })
                    }
                  />
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="edit-role" className="text-sm font-medium">
                  Rol *
                </label>
                <div className="relative">
                  <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <select
                    id="edit-role"
                    value={editEmployeeData.role}
                    onChange={(e) =>
                      setEditEmployeeData({ ...editEmployeeData, role: e.target.value })
                    }
                    className="w-full bg-gray-800 border border-gray-700 rounded-md p-2 text-white pl-10"
                  >
                    <option value={ROLES.ADMIN}>Administrador de Local</option>
                    <option value={ROLES.GUARDIA}>Guardia de Seguridad</option>
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <label htmlFor="edit-establishment" className="text-sm font-medium">
                  Local asignado *
                </label>
                <div className="relative">
                <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
  {currentUser?.role === ROLES.ADMIN ? (
    <select
      id="edit-establishment"
      value={editEmployeeData.establishment_id}
      onChange={(e) =>
        setEditEmployeeData({ ...editEmployeeData, establishment_id: e.target.value })
      }
      className="w-full bg-gray-800 border border-gray-700 rounded-md p-2 text-white pl-10"
      disabled
    >
      <option value={currentUser.establishment_id}>
        {establishments.find(est => est.id === currentUser.establishment_id)?.name || "Sin local asignado"}
      </option>
    </select>
  ) : (
    <select
      id="edit-establishment"
      value={editEmployeeData.establishment_id}
      onChange={(e) =>
        setEditEmployeeData({ ...editEmployeeData, establishment_id: e.target.value })
      }
      className="w-full bg-gray-800 border border-gray-700 rounded-md p-2 text-white pl-10"
    >
      <option value="">Seleccione un local</option>
      {establishments.map((est) => (
        <option key={est.id} value={est.id}>
          {est.name}
        </option>
      ))}
    </select>
  )}
   
</div>

              </div>
              <div className="space-y-2">
                <label htmlFor="edit-status" className="text-sm font-medium">
                  Estado
                </label>
                <div className="relative">
                  <ActivityIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <select
                    id="edit-status"
                    value={editEmployeeData.status}
                    onChange={(e) =>
                      setEditEmployeeData({ ...editEmployeeData, status: e.target.value })
                    }
                    className="w-full bg-gray-800 border border-gray-700 rounded-md p-2 text-white pl-10"
                  >
                    <option value="Activo">Activo</option>
                    <option value="Inactivo">Inactivo</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
              className="bg-gray-800 text-white hover:bg-gray-700 border border-gray-700"
            >
              Cancelar
            </Button>
            <Button onClick={handleEditEmployee} disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700">
              {isSubmitting ? "Guardando..." : "Guardar Cambios"}
            </Button>
          </DialogFooter> 
        </DialogContent>
      </Dialog>
    </Card>
  )
}

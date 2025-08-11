"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { addEmployee, updateEmployee } from "@/app/actions/employees"
import { EstablishmentSelect } from "@/components/establishment-select"
import { logger } from "@/lib/utils"

export function EmployeeForm({ currentUser, onSuccess, initialData = null }) {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    email: initialData?.email || "",
    role: initialData?.role || "guardia",
    status: initialData?.status || "active",
    establishment_id: initialData?.establishment_id || undefined,
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleEstablishmentChange = (value) => {
    logger.info("Establecimiento seleccionado", { value })
    setFormData((prev) => ({ ...prev, establishment_id: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Validar datos
      if (!formData.name || !formData.email) {
        throw new Error("Nombre y email son obligatorios")
      }

      // Log para depuración
      logger.info("Enviando formulario de empleado", {
        ...formData,
        establishment_id: formData.establishment_id || "null",
      })

      if (initialData) {
        // Actualizar empleado existente
        await updateEmployee(initialData.id, {
          ...formData,
          userInfo: currentUser,
        })
        toast({
          title: "Empleado actualizado",
          description: "El empleado ha sido actualizado correctamente",
        })
      } else {
        // Crear nuevo empleado
        await addEmployee({
          ...formData,
          userInfo: currentUser,
        })
        toast({
          title: "Empleado creado",
          description: "El empleado ha sido creado correctamente",
        })
      }

      // Resetear formulario y notificar éxito
      if (!initialData) {
        setFormData({
          name: "",
          email: "",
          role: "guardia",
          status: "active",
          establishment_id: undefined,
        })
      }

      if (onSuccess) onSuccess()
    } catch (error) {
      logger.error("Error al guardar empleado", error)
      toast({
        title: "Error",
        description: error.message || "Ocurrió un error al guardar el empleado",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Nombre</Label>
        <Input id="name" name="name" value={formData.name} onChange={handleChange} required />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} required />
      </div>

      <div className="space-y-2">
        <Label htmlFor="role">Rol</Label>
        <select
          id="role"
          name="role"
          value={formData.role}
          onChange={handleChange}
          className="w-full p-2 border rounded-md"
        >
          <option value="guardia">Guardia</option>
          <option value="admin">Administrador</option>
          {currentUser?.role === "superadmin" && <option value="superadmin">Super Administrador</option>}
        </select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="status">Estado</Label>
        <select
          id="status"
          name="status"
          value={formData.status}
          onChange={handleChange}
          className="w-full p-2 border rounded-md"
        >
          <option value="active">Activo</option>
          <option value="inactive">Inactivo</option>
        </select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="establishment">Establecimiento</Label>
        <EstablishmentSelect
          value={formData.establishment_id}
          onChange={handleEstablishmentChange}
          disabled={formData.role === "superadmin"}
        />
        {formData.role === "superadmin" && (
          <p className="text-sm text-gray-500">Los super administradores no están asociados a un establecimiento</p>
        )}
      </div>

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Guardando..." : initialData ? "Actualizar" : "Crear"}
      </Button>
    </form>
  )
}


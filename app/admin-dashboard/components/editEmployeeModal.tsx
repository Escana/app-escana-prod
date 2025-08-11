import React, { useState } from "react"
import { Modal, ModalHeader, ModalBody, ModalFooter } from "@/components/ui/modal" // Asegúrate de tener o crear estos componentes
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function EditEmployeeModal({ employee, onClose, onSave }) {
  // Inicializamos el estado del formulario con los datos actuales del empleado
  const [formData, setFormData] = useState({
    name: employee.name || "",
    email: employee.email || "",
    // El campo password queda vacío, para que el usuario decida si quiere cambiarla
    password: "",
  })

  // Manejar los cambios en los campos del formulario
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  // Al confirmar, se ejecuta onSave pasando los nuevos datos
  const handleSave = () => {
    // Aquí se podrían agregar validaciones adicionales (por ejemplo, confirmar la contraseña)
    onSave(formData)
  }

  return (
    <Modal>
      <ModalHeader>Editar Empleado</ModalHeader>
      <ModalBody>
        <div className="mb-4">
          <Label htmlFor="name">Nombre</Label>
          <Input id="name" name="name" value={formData.name} onChange={handleChange} />
        </div>
        <div className="mb-4">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" value={formData.email} onChange={handleChange} />
        </div>
        <div className="mb-4">
          <Label htmlFor="password">Nueva contraseña</Label>
          <Input
            id="password"
            name="password"
            type="password"
            placeholder="Dejar en blanco para mantener la actual"
            value={formData.password}
            onChange={handleChange}
          />
        </div>
      </ModalBody>
      <ModalFooter>
        <Button variant="outline" onClick={onClose}>
          Cancelar
        </Button>
        <Button onClick={handleSave}>Guardar cambios</Button>
      </ModalFooter>
    </Modal>
  )
}

"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { Guard, GuardFormData } from "@/types/guard"

interface GuardFormProps {
  guard?: Guard
  open: boolean
  onClose: () => void
  onSubmit: (data: GuardFormData) => void
}

export function GuardForm({ guard, open, onClose, onSubmit }: GuardFormProps) {
  const [formData, setFormData] = useState<GuardFormData>({
    name: guard?.name || "",
    email: guard?.email || "",
    phone: guard?.phone || "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    // Clear error when field is edited
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = "El nombre es requerido"
    }

    if (!formData.email.trim()) {
      newErrors.email = "El email es requerido"
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email inválido"
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "El teléfono es requerido"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (validateForm()) {
      onSubmit(formData)
      onClose()
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-[#1A2B41] text-white border-secondary-dark">
        <DialogHeader>
          <DialogTitle>{guard ? "Editar Guardia" : "Nuevo Guardia"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre Completo</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`bg-[#1A1B1C] border-secondary-dark/50 ${errors.name ? "border-red-500" : ""}`}
              />
              {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                className={`bg-[#1A1B1C] border-secondary-dark/50 ${errors.email ? "border-red-500" : ""}`}
              />
              {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Teléfono</Label>
              <Input
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className={`bg-[#1A1B1C] border-secondary-dark/50 ${errors.phone ? "border-red-500" : ""}`}
              />
              {errors.phone && <p className="text-red-500 text-sm">{errors.phone}</p>}
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} className="border-secondary-dark">
              Cancelar
            </Button>
            <Button type="submit">{guard ? "Actualizar" : "Crear"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}


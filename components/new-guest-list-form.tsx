"use client"

import type React from "react"
import { useState } from "react"
import { Plus, Trash2 } from "lucide-react"
import Papa from 'papaparse'
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"

interface NewGuestListFormProps {
  id: { establishment_id: string }
  onSubmit: (guestList: any) => void
  onClose: () => void
}

export function NewGuestListForm({ id, onSubmit, onClose }: NewGuestListFormProps) {
  const [formData, setFormData] = useState({
    nombre: "",
    anfitrion: "",
    rut: "",
    fecha: "",
    hora: "",
    descripcion: "",
    estado: "NO CONFIRMADO",
    invitados: [] as Array<{ nombres: string; apellidos: string; rut: string }>,
    establishment_id: id.establishment_id,
  })
  const [newGuest, setNewGuest] = useState({ nombres: "", apellidos: "", rut: "" })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const formatRut = (value: string) => {
    const cleaned = value.replace(/\D/g, "")
    const match = cleaned.match(/^(\d{1,2})(\d{0,3})(\d{0,3})(\w{0,1})$/)
    if (match) {
      const [, a, b, c, d] = match
      let formatted = ""
      if (a) formatted += a
      if (b) formatted += "." + b
      if (c) formatted += "." + c
      if (d) formatted += "-" + d
      return formatted
    }
    return value
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleAddGuest = () => {
    if (newGuest.nombres && newGuest.apellidos && newGuest.rut) {
      setFormData((prev) => ({
        ...prev,
        invitados: [...prev.invitados, newGuest],
      }))
      setNewGuest({ nombres: "", apellidos: "", rut: "" })
    } else {
      toast({
        title: "Error",
        description: "Complete todos los campos para agregar el invitado",
        variant: "destructive",
      })
    }
  }

  const handleRemoveGuest = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      invitados: prev.invitados.filter((_, i) => i !== index),
    }))
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          const parsed = (results.data as any[])
            .map((row) => {
              const nombres = row.nombres || row.Nombres || ''
              const apellidos = row.apellidos || row.Apellidos || ''
              const rut = row.rut || row.RUT || ''
              return { nombres: nombres.trim(), apellidos: apellidos.trim(), rut: rut.trim() }
            })
            .filter((g) => g.nombres && g.apellidos && g.rut)

          if (parsed.length === 0) {
            toast({
              title: "Error",
              description: "No se encontraron invitados válidos en el archivo",
              variant: "destructive",
            })
          } else {
            setFormData((prev) => ({
              ...prev,
              invitados: [...prev.invitados, ...parsed],
            }))
            toast({
              title: "Éxito",
              description: `${parsed.length} invitados cargados desde el CSV`,
            })
          }
        },
        error: (err) => {
          console.error('Error parsing CSV:', err)
          toast({
            title: "Error",
            description: "No se pudo parsear el archivo CSV",
            variant: "destructive",
          })
        },
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isSubmitting) return
    setIsSubmitting(true)

    try {
      if (!formData.nombre || !formData.anfitrion || !formData.rut || !formData.fecha || !formData.hora) {
        toast({
          title: "Error",
          description: "Por favor complete todos los campos requeridos",
          variant: "destructive",
        })
        return
      }

      const codigo = (formData as any).codigo || Math.random().toString(36).substring(2, 8).toUpperCase()

      await onSubmit({
        ...formData,
        codigo,
        estado: "NO CONFIRMADO" as const,
      })

      setFormData({
        nombre: "",
        anfitrion: "",
        rut: "",
        fecha: "",
        hora: "",
        descripcion: "",
        estado: "NO CONFIRMADO",
        invitados: [],
        establishment_id: id.establishment_id,
      })
      toast({
        title: "Éxito",
        description: "Lista de invitados creada correctamente",
      })
      onClose()
    } catch (error) {
      console.error("Error creating guest list:", error)
      toast({
        title: "Error",
        description: "No se pudo crear la lista de invitados",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-[#1E1E1E] p-6 rounded-lg shadow-lg max-w-4xl mx-auto">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-[#7DD3FC] mb-2">Nueva Lista de Invitados</h2>
        <p className="text-gray-400">Complete el formulario para crear una nueva lista de invitados para su evento.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="col-span-full">
          <Label htmlFor="nombre" className="text-white text-sm font-medium mb-2 block">
            Nombre del evento
          </Label>
          <Input
            id="nombre"
            name="nombre"
            value={formData.nombre}
            onChange={handleChange}
            className="bg-[#2A2A2A] text-white border border-[#3F3F46] focus:border-[#3B82F6] focus:ring-[#3B82F6]"
            required
          />
        </div>
        <div>
          <Label htmlFor="anfitrion" className="text-white text-sm font-medium mb-2 block">
            Anfitrión
          </Label>
          <Input
            id="anfitrion"
            name="anfitrion"
            value={formData.anfitrion}
            onChange={handleChange}
            className="bg-[#2A2A2A] text-white border border-[#3F3F46] focus:border-[#3B82F6] focus:ring-[#3B82F6]"
            required
          />
        </div>
        <div>
          <Label htmlFor="rut" className="text-white text-sm font-medium mb-2 block">
            RUT
          </Label>
          <Input
            id="rut"
            name="rut"
            value={formData.rut}
            onChange={handleChange}
            className="bg-[#2A2A2A] text-white border border-[#3F3F46] focus:border-[#3B82F6] focus:ring-[#3B82F6]"
            required
          />
        </div>
        <div>
          <Label htmlFor="fecha" className="text-white text-sm font-medium mb-2 block">
            Fecha del evento
          </Label>
          <Input
            id="fecha"
            name="fecha"
            type="date"
            value={formData.fecha}
            onChange={handleChange}
            className="bg-[#2A2A2A] text-white border border-[#3F3F46] focus:border-[#3B82F6] focus:ring-[#3B82F6]"
            required
          />
        </div>
        <div>
          <Label htmlFor="hora" className="text-white text-sm font-medium mb-2 block">
            Hora del evento
          </Label>
          <Input
            id="hora"
            name="hora"
            type="time"
            value={formData.hora}
            onChange={handleChange}
            className="bg-[#2A2A2A] text-white border border-[#3F3F46] focus:border-[#3B82F6] focus:ring-[#3B82F6]"
            required
          />
        </div>
        <div>
          <Label htmlFor="estado" className="text-white text-sm font-medium mb-2 block">
            Estado del evento
          </Label>
          <div className="relative">
            <Select value="NO CONFIRMADO" disabled>
              <SelectTrigger className="bg-[#2A2A2A] text-white border border-[#3F3F46] focus:border-[#3B82F6] focus:ring-[#3B82F6] opacity-50">
                <SelectValue placeholder="Estado del evento" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="NO CONFIRMADO">NO CONFIRMADO</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-400 mt-1">
              El estado inicial es "No confirmado". Podrá modificarlo después de crear la lista.
            </p>
          </div>
        </div>
      </div>

      <div className="col-span-full">
        <Label htmlFor="descripcion" className="text-white text-sm font-medium mb-2 block">
          Descripción
        </Label>
        <Textarea
          id="descripcion"
          name="descripcion"
          value={formData.descripcion}
          onChange={handleChange}
          className="bg-[#2A2A2A] text-white border border-[#3F3F46] focus:border-[#3B82F6] focus:ring-[#3B82F6] w-full"
          rows={3}
        />
      </div>

      <div className="space-y-6">
        {/* Guest List Table */}
        <div className="mt-8 mb-6">
          <h3 className="text-lg font-semibold text-white mb-4">Lista de invitados</h3>
          <div className="bg-[#27272A] rounded-lg overflow-hidden p-4">
            <div className="max-h-[400px] overflow-y-auto">
              {formData.invitados.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <p>No hay invitados agregados</p>
                  <p className="text-sm mt-2">Los invitados que agregues aparecerán aquí</p>
                </div>
              ) : (
                <table className="w-full text-sm text-left text-gray-400">
                  <thead className="text-xs uppercase bg-[#3F3F46] sticky top-0">
                    <tr>
                      <th scope="col" className="px-6 py-3">
                        Nombres
                      </th>
                      <th scope="col" className="px-6 py-3">
                        Apellidos
                      </th>
                      <th scope="col" className="px-6 py-3">
                        RUT
                      </th>
                      <th scope="col" className="px-6 py-3">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {formData.invitados.map((guest, index) => (
                      <tr key={index} className="border-b border-[#3F3F46] hover:bg-[#323232]">
                        <td className="px-6 py-4">{guest.nombres}</td>
                        <td className="px-6 py-4">{guest.apellidos}</td>
                        <td className="px-6 py-4">{guest.rut}</td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => handleRemoveGuest(index)}
                            className="text-red-500 hover:text-red-400 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Agregar Invitados</h3>
        <div className="bg-[#27272A] p-6 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              type="text"
              placeholder="Nombres"
              value={newGuest.nombres}
              onChange={(e) => setNewGuest({ ...newGuest, nombres: e.target.value })}
              className="bg-[#2A2A2A] text-white px-3 py-2 rounded-md border border-[#3F3F46] focus:border-[#3B82F6] focus:ring-[#3B82F6]"
            />
            <Input
              type="text"
              placeholder="Apellidos"
              value={newGuest.apellidos}
              onChange={(e) => setNewGuest({ ...newGuest, apellidos: e.target.value })}
              className="bg-[#2A2A2A] text-white px-3 py-2 rounded-md border border-[#3F3F46] focus:border-[#3B82F6] focus:ring-[#3B82F6]"
            />
            <div className="flex gap-2">
              <Input
                type="text"
                placeholder="12.345.678-9"
                value={newGuest.rut}
                onChange={(e) => {
                  const formatted = formatRut(e.target.value)
                  setNewGuest({ ...newGuest, rut: formatted })
                }}
                className="bg-[#2A2A2A] text-white px-3 py-2 rounded-md border border-[#3F3F46] focus:border-[#3B82F6] focus:ring-[#3B82F6]"
                pattern="\d{1,2}\.\d{3}\.\d{3}-[\dkK]"
                title="Formato: 12.345.678-9"
              />
              <Button
                type="button"
                onClick={handleAddGuest}
                className="h-10 bg-[#3B82F6] hover:bg-[#2563EB]"
                size="icon"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="mt-4 flex gap-3">
            <div className="relative flex-1">
              <input
                type="file"
                accept=".xlsx, .xls, .csv"
                onChange={handleFileUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                id="file-upload"
              />
              <Button type="button" className="w-full bg-[#3B82F6] hover:bg-[#2563EB]">
                Subir plantilla
              </Button>
            </div>
          </div>
        </div>
      </div>
      <div className="flex justify-end items-center gap-4 mt-6">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 bg-[#3F3F46] text-white rounded-md hover:bg-[#52525B]"
        >
          Cancelar
        </button>
        <button type="submit" className="px-4 py-2 bg-[#3B82F6] text-white rounded-md hover:bg-[#2563EB]">
          Crear lista
        </button>
      </div>
    </form>
  )
}

"use client"

import type React from "react"

import { useState } from "react"
import { X, Plus, Trash2, Upload } from "lucide-react"
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog"

interface NewGuestListModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (guestList: any) => void
}

export function NewGuestListModal({ isOpen, onClose, onSubmit }: NewGuestListModalProps) {
  const [formData, setFormData] = useState({
    nombre: "",
    codigo: "",
    anfitrion: "",
    rut: "",
    fecha: "",
    hora: "",
    estado: "",
    descripcion: "",
    invitados: [],
  })

  const [newGuest, setNewGuest] = useState({ nombres: "", apellidos: "", rut: "" })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
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
    }
  }

  const handleRemoveGuest = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      invitados: prev.invitados.filter((_, i) => i !== index),
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
    onClose()
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Here you would typically use a library like xlsx to parse the Excel file
      // For this example, we'll just log the file name
      console.log(`File uploaded: ${file.name}`)
      // You would then parse the file and update the formData.invitados array
      // setFormData(prev => ({ ...prev, invitados: [...prev.invitados, ...parsedData] }));
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl bg-[#1A1B1C] border-[#3F3F46] text-white p-6">
        <DialogHeader>
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Crear nueva lista de invitados</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-white">
              <X className="w-6 h-6" />
            </button>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium mb-1">Nombre del evento</label>
              <input
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                className="w-full bg-[#27272A] text-white px-3 py-2 rounded-md"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Código</label>
              <input
                type="text"
                name="codigo"
                value={formData.codigo}
                onChange={handleChange}
                className="w-full bg-[#27272A] text-white px-3 py-2 rounded-md"
                required
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium mb-1">Anfitrión</label>
              <input
                type="text"
                name="anfitrion"
                value={formData.anfitrion}
                onChange={handleChange}
                className="w-full bg-[#27272A] text-white px-3 py-2 rounded-md"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">RUT</label>
              <input
                type="text"
                name="rut"
                value={formData.rut}
                onChange={handleChange}
                className="w-full bg-[#27272A] text-white px-3 py-2 rounded-md"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Fecha del evento</label>
              <input
                type="date"
                name="fecha"
                value={formData.fecha}
                onChange={handleChange}
                className="w-full bg-[#27272A] text-white px-3 py-2 rounded-md"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Hora del evento</label>
              <input
                type="time"
                name="hora"
                value={formData.hora}
                onChange={handleChange}
                className="w-full bg-[#27272A] text-white px-3 py-2 rounded-md"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Estado</label>
              <select
                name="estado"
                value={formData.estado}
                onChange={handleChange}
                className="w-full bg-[#27272A] text-white px-3 py-2 rounded-md"
                required
              >
                <option value="">Seleccionar estado</option>
                <option value="REALIZADO">REALIZADO</option>
                <option value="CONFIRMADO">CONFIRMADO</option>
                <option value="CANCELADO">CANCELADO</option>
                <option value="NO CONFIRMADO">NO CONFIRMADO</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Descripción</label>
            <textarea
              name="descripcion"
              value={formData.descripcion}
              onChange={handleChange}
              className="w-full bg-[#27272A] text-white px-3 py-2 rounded-md"
              rows={3}
            ></textarea>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Invitados</h3>
            <div className="grid grid-cols-3 gap-2">
              <input
                type="text"
                placeholder="Nombres"
                value={newGuest.nombres}
                onChange={(e) => setNewGuest({ ...newGuest, nombres: e.target.value })}
                className="bg-[#27272A] text-white px-3 py-2 rounded-md"
              />
              <input
                type="text"
                placeholder="Apellidos"
                value={newGuest.apellidos}
                onChange={(e) => setNewGuest({ ...newGuest, apellidos: e.target.value })}
                className="bg-[#27272A] text-white px-3 py-2 rounded-md"
              />
              <input
                type="text"
                placeholder="RUT"
                value={newGuest.rut}
                onChange={(e) => setNewGuest({ ...newGuest, rut: e.target.value })}
                className="bg-[#27272A] text-white px-3 py-2 rounded-md"
              />
            </div>
            <div className="flex space-x-2">
              <button
                type="button"
                onClick={handleAddGuest}
                className="px-4 py-2 bg-[#3B82F6] text-white rounded-md flex items-center"
              >
                <Plus className="w-4 h-4 mr-2" />
                Agregar invitado
              </button>
              <div className="relative">
                <input
                  type="file"
                  accept=".xlsx, .xls, .csv"
                  onChange={handleFileUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <button type="button" className="px-4 py-2 bg-[#22C55E] text-white rounded-md flex items-center">
                  <Upload className="w-4 h-4 mr-2" />
                  Subir archivo Excel
                </button>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-2">Lista de invitados</h3>
            <div className="max-h-60 overflow-y-auto">
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
                    <tr key={index} className="border-b bg-[#27272A] border-gray-700">
                      <td className="px-6 py-4">{guest.nombres}</td>
                      <td className="px-6 py-4">{guest.apellidos}</td>
                      <td className="px-6 py-4">{guest.rut}</td>
                      <td className="px-6 py-4">
                        <button onClick={() => handleRemoveGuest(index)} className="text-red-500">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="flex justify-end space-x-4 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-[#3F3F46] text-white rounded-md hover:bg-[#52525B]"
            >
              Cancelar
            </button>
            <button type="submit" className="px-4 py-2 bg-[#3B82F6] text-white rounded-md hover:bg-[#2563EB]">
              Crear lista fddsfs
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}


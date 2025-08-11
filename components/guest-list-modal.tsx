"use client"

import { Dialog, DialogContent } from "@/components/ui/dialog"
import type React from "react"
import { useState } from "react"
import { X, Plus, Pencil, Trash2, Check, Upload } from "lucide-react"
import { globalStyles } from "@/styles/global"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import {
  updateGuestList,
  addGuestToList,
  removeGuestFromList,
  updateGuest,
} from "@/app/actions/guest-lists"
import type { GuestList, Guest } from "@/lib/supabase"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import Papa from 'papaparse'

globalStyles()

interface GuestListModalProps {
  isOpen: boolean
  onClose: () => void
  guestList: GuestList & { guests: Guest[] }
  onStatusChange?: (status: GuestList['estado']) => void
}

const generateEventDescription = (eventName: string) => {
  const descriptions = [
    `¡Celebremos juntos! ${eventName} promete ser una noche inolvidable con música en vivo, deliciosa comida y sorpresas para todos los invitados.`,
    `Únete a nosotros para ${eventName}, una velada elegante con cóctel de bienvenida, cena gourmet y baile hasta el amanecer.`,
    `${eventName} será un evento único, fusionando tradición y modernidad. Disfruta de espectáculos culturales, gastronomía local y un ambiente acogedor.`,
    `Prepárate para una experiencia extraordinaria en ${eventName}. Contaremos con un DJ de renombre, barra libre premium y zonas temáticas para todos los gustos.`,
    `${eventName} te invita a una celebración íntima y sofisticada. Ambiente relajado, música suave y una selección de vinos y tapas para deleitar tu paladar.`,
  ]
  return descriptions[Math.floor(Math.random() * descriptions.length)]
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "REALIZADO":
      return "bg-emerald-500"
    case "CONFIRMADO":
      return "bg-amber-500"
    case "CANCELADO":
      return "bg-red-500"
    case "NO CONFIRMADO":
      return "bg-gray-500"
    default:
      return "bg-gray-500"
  }
}

export function GuestListModal({ isOpen, onClose, guestList }: GuestListModalProps) {
  const queryClient = useQueryClient()
  const [newGuest, setNewGuest] = useState({ nombres: "", apellidos: "", rut: "" })
  const [currentStatus, setCurrentStatus] = useState<GuestList['estado']>(guestList.estado)
  const [editingGuest, setEditingGuest] = useState<{ index: number; guest: Guest } | null>(null)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  // Mutations
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<GuestList> }) => updateGuestList(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guest-lists'] })
      toast.success('Lista de invitados actualizada correctamente')
    },
    onError: () => toast.error('No se pudo actualizar la lista de invitados'),
  })

  const addGuestMutation = useMutation({
    mutationFn: ({ guestListId, guest }: { guestListId: string; guest: Omit<Guest, 'id'> }) =>
      addGuestToList(guestListId, guest),
    onSuccess: (createdGuest) => {
      queryClient.invalidateQueries({ queryKey: ['guest-lists'] })
      guestList.guests.push(createdGuest)
      toast.success('Invitado agregado correctamente')
      setNewGuest({ nombres: '', apellidos: '', rut: '' })
    },
    onError: () => toast.error('No se pudo agregar el invitado'),
  })

  const removeGuestMutation = useMutation({
    mutationFn: ({ guestListId, guestId }: { guestListId: string; guestId: string }) =>
      removeGuestFromList(guestListId, guestId),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['guest-lists'] })
      guestList.guests = guestList.guests.filter((g) => g.id !== variables.guestId)
      toast.success('Invitado eliminado correctamente')
    },
    onError: () => toast.error('No se pudo eliminar el invitado'),
  })

  const updateGuestMutation = useMutation({
    mutationFn: ({ guestListId, guestId, data }: { guestListId: string; guestId: string; data: Partial<Guest> }) =>
      updateGuest(guestListId, guestId, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['guest-lists'] })
      guestList.guests = guestList.guests.map((g) =>
        g.id === variables.guestId ? { ...g, ...variables.data } : g
      )
      setEditingGuest(null)
      toast.success('Invitado actualizado correctamente')
    },
    onError: () => toast.error('No se pudo actualizar el invitado'),
  })

  // Handlers
  const handleStatusChange = (newStatus: GuestList['estado']) => {
    setCurrentStatus(newStatus)
    setHasUnsavedChanges(true)
  }

  const handleAddGuest = async (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!newGuest.nombres || !newGuest.apellidos || !newGuest.rut) {
      toast.error('Complete todos los campos del invitado')
      return
    }
    await addGuestMutation.mutateAsync({ guestListId: guestList.id, guest: newGuest })
  }

  const handleDeleteGuest = (guestId: string) => {
    if (confirm('¿Eliminar este invitado?')) {
      removeGuestMutation.mutate({ guestListId: guestList.id, guestId })
    }
  }

  const handleUpdateGuest = () => {
    if (!editingGuest) return
    updateGuestMutation.mutate({
      guestListId: guestList.id,
      guestId: editingGuest.guest.id,
      data: editingGuest.guest,
    })
  }

  const formatRut = (value: string) => {
    const cleaned = value.replace(/[^0-9kK]/g, '')
    const match = cleaned.match(/^(\d{1,2})(\d{0,3})(\d{0,3})([0-9kK]?)$/)
    if (match) {
      const [, a, b, c, d] = match
      let formatted = a
      if (b) formatted += `.${b}`
      if (c) formatted += `.${c}`
      if (d) formatted += `-${d}`
      return formatted
    }
    return value
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        const parsed = (results.data as any[])
          .map((row) => ({
            nombres: (row.nombres || row.Nombres || '').trim(),
            apellidos: (row.apellidos || row.Apellidos || '').trim(),
            rut: formatRut((row.rut || row.RUT || '').trim()),
          }))
          .filter((g) => g.nombres && g.apellidos && g.rut)
        if (!parsed.length) {
          toast.error('No se encontraron invitados válidos')
          return
        }
        let added = 0
        for (const guest of parsed) {
          await addGuestMutation.mutateAsync({ guestListId: guestList.id, guest })
          added++
        }
        toast.success(`${added} invitados cargados desde el CSV`)
      },
      error: () => toast.error('Error al parsear el archivo CSV'),
    })
  }

  return (
    <div>
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] bg-[#1A2B41] text-white max-h-[85vh] p-0">
        <ScrollArea className="h-full max-h-[85vh]">
          <div className="p-6">
            {/* Header */}
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-[#7DD3FC] text-xl font-semibold">Detalles de lista de invitados</h2>
            </div>

            {/* Event Information */}
            <div className="bg-[#27272A] rounded-lg p-4 mb-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[#7DD3FC] text-sm mb-1">NOMBRE DEL EVENTO:</p>
                  <p className="text-white font-medium">{guestList.nombre}</p>
                </div>
                <div>
                  <p className="text-[#7DD3FC] text-sm mb-1">ESTADO:</p>
                  <Select value={currentStatus} onValueChange={handleStatusChange}>
                    <SelectTrigger
                      className={`w-full h-8 text-xs ${getStatusColor(currentStatus)} text-white border-0`}
                    >
                      <SelectValue placeholder="Cambiar estado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="REALIZADO">REALIZADO</SelectItem>
                      <SelectItem value="CONFIRMADO">CONFIRMADO</SelectItem>
                      <SelectItem value="CANCELADO">CANCELADO</SelectItem>
                      <SelectItem value="NO CONFIRMADO">NO CONFIRMADO</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <p className="text-[#7DD3FC] text-sm mb-1">ANFITRIÓN:</p>
                  <p className="text-white">{guestList.anfitrion}</p>
                </div>
                <div>
                  <p className="text-[#7DD3FC] text-sm mb-1">RUT:</p>
                  <p className="text-white">{guestList.rut}</p>
                </div>
                <div>
                  <p className="text-[#7DD3FC] text-sm mb-1">FECHA DEL EVENTO:</p>
                  <p className="text-white">{guestList.fecha}</p>
                </div>
                <div>
                  <p className="text-[#7DD3FC] text-sm mb-1">HORA DE INICIO:</p>
                  <p className="text-white">{guestList.hora}</p>
                </div>
              </div>
            </div>

            <div className="mt-6 mb-8 bg-[#2D2D30] rounded-lg p-4">
              <p className="text-[#7DD3FC] text-sm mb-2">DESCRIPCIÓN:</p>
              <p className="text-white">{guestList.descripcion || generateEventDescription(guestList.nombre)}</p>
            </div>

            {/* Guest List */}
            <div className="bg-[#27272A] rounded-lg overflow-hidden">
              <div className="p-4 border-b border-[#3F3F46]">
                <div className="flex justify-between items-center">
                  <h3 className="text-[#7DD3FC] text-lg font-medium">Lista de invitados</h3>
                  <p className="text-white text-sm">Total: {guestList.guests?.length || 0}</p>
                </div>
              </div>

              <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
                <table className="w-full text-sm">
                  <thead className="bg-[#3F3F46] text-white sticky top-0">
                    <tr>
                      <th className="py-2 px-4 text-left font-medium">#</th>
                      <th className="py-2 px-4 text-left font-medium">NOMBRES</th>
                      <th className="py-2 px-4 text-left font-medium">APELLIDOS</th>
                      <th className="py-2 px-4 text-left font-medium">RUT</th>
                      <th className="py-2 px-4 text-left font-medium">ACCIONES</th>
                    </tr>
                  </thead>
                  <tbody>
                    {guestList.guests?.map((guest, index) => (
                      <tr key={guest.id} className="border-b border-[#3F3F46] hover:bg-[#2D2D30]">
                        <td className="py-2 px-4 text-white">{index + 1}</td>
                        {editingGuest?.index === index ? (
                          <>
                            <td className="py-2 px-4">
                              <input
                                type="text"
                                value={editingGuest.guest.nombres}
                                onChange={(e) =>
                                  setEditingGuest({
                                    index,
                                    guest: { ...editingGuest.guest, nombres: e.target.value },
                                  })
                                }
                                className="w-full bg-[#3F3F46] text-white px-2 py-1 rounded border-0"
                              />
                            </td>
                            <td className="py-2 px-4">
                              <input
                                type="text"
                                value={editingGuest.guest.apellidos}
                                onChange={(e) =>
                                  setEditingGuest({
                                    index,
                                    guest: { ...editingGuest.guest, apellidos: e.target.value },
                                  })
                                }
                                className="w-full bg-[#3F3F46] text-white px-2 py-1 rounded border-0"
                              />
                            </td>
                            <td className="py-2 px-4">
                              <input
                                type="text"
                                value={editingGuest.guest.rut}
                                onChange={(e) =>
                                  setEditingGuest({
                                    index,
                                    guest: { ...editingGuest.guest, rut: formatRut(e.target.value) },
                                  })
                                }
                                className="w-full bg-[#3F3F46] text-white px-2 py-1 rounded border-0"
                              />
                            </td>
                            <td className="py-2 px-4">
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleEditGuest(guest.id, editingGuest.guest)}
                                  className="text-emerald-500 hover:text-emerald-400"
                                >
                                  <Check className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => setEditingGuest(null)}
                                  className="text-red-500 hover:text-red-400"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </>
                        ) : (
                          <>
                            <td className="py-2 px-4 text-white">{guest.nombres}</td>
                            <td className="py-2 px-4 text-white">{guest.apellidos}</td>
                            <td className="py-2 px-4 text-white font-mono">{guest.rut}</td>
                            <td className="py-2 px-4">
                              <div className="flex gap-2">
                                <button
                                  onClick={() => setEditingGuest({ index, guest: { ...guest } })}
                                  className="text-blue-500 hover:text-blue-400"
                                >
                                  <Pencil className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteGuest(guest.id)}
                                  className="text-red-500 hover:text-red-400"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Add Guest Form */}
            <form onSubmit={handleAddGuest} className="mt-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-[#7DD3FC] text-lg font-medium">Agregar nuevo invitado</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <input
                    type="text"
                    value={newGuest.nombres}
                    onChange={(e) => setNewGuest({ ...newGuest, nombres: e.target.value })}
                    placeholder="Nombres"
                    className="w-full bg-[#27272A] text-white px-3 py-2 rounded-md border border-[#3F3F46] focus:border-[#7DD3FC] focus:outline-none"
                  />
                </div>
                <div>
                  <input
                    type="text"
                    value={newGuest.apellidos}
                    onChange={(e) => setNewGuest({ ...newGuest, apellidos: e.target.value })}
                    placeholder="Apellidos"
                    className="w-full bg-[#27272A] text-white px-3 py-2 rounded-md border border-[#3F3F46] focus:border-[#7DD3FC] focus:outline-none"
                  />
                </div>
                <div>
                  <input
                    type="text"
                    value={newGuest.rut}
                    onChange={(e) => setNewGuest({ ...newGuest, rut: formatRut(e.target.value) })}
                    placeholder="12.345.678-9"
                    className="w-full bg-[#27272A] text-white px-3 py-2 rounded-md border border-[#3F3F46] focus:border-[#7DD3FC] focus:outline-none"
                  />
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-[#3F3F46]">
                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={addGuestMutation.isPending}
                    className="flex-1 bg-[#3B82F6] text-white py-2.5 rounded-lg hover:bg-[#2563EB] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {addGuestMutation.isPending ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Plus className="w-5 h-5" />
                    )}
                    Agregar invitado
                  </button>
                  <div className="relative flex-1">
                    <input
                      type="file"
                      accept=".xlsx, .xls, .csv"
                      onChange={
                        handleFileUpload
                      }
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <button
                      type="button"
                      className="w-full bg-[#22C55E] text-white py-2.5 rounded-lg hover:bg-[#16A34A] flex items-center justify-center gap-2"
                    >
                      <Upload className="w-5 h-5" />
                      Cargar plantilla
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex gap-3">
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      if (hasStatusChanges) {
                        await updateMutation.mutateAsync({
                          id: guestList.id,
                          data: { estado: currentStatus },
                        })
                      }
                      if (hasGuestChanges) {
                        // Los cambios de invitados ya se guardaron en tiempo real
                        await queryClient.invalidateQueries({ queryKey: ["guest-lists"] })
                      }
                      setHasStatusChanges(false)
                      setHasGuestChanges(false)
                      setHasUnsavedChanges(false)

                      toast({
                        title: "Éxito",
                        description: "Cambios guardados correctamente",
                      })
                      onClose()
                    } catch (error) {
                      toast({
                        title: "Error",
                        description: "No se pudieron guardar los cambios",
                        variant: "destructive",
                      })
                    }
                  }}
                  className="flex-1 bg-[#22C55E] text-white py-2.5 rounded-lg hover:bg-[#16A34A]"
                >
                  Guardar cambios
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (hasUnsavedChanges) {
                      if (window.confirm("Hay cambios sin guardar. ¿Desea salir sin guardar los cambios?")) {
                        setHasStatusChanges(false)
                        setHasGuestChanges(false)
                        setHasUnsavedChanges(false)
                        onClose()
                      }
                    } else {
                      onClose()
                    }
                  }}
                  className="flex-1 bg-[#3F3F46] text-white py-2.5 rounded-lg hover:bg-[#52525B]"
                >
                  Cerrar
                </button>
              </div>
            </form>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
          <ToastContainer position="top-right" autoClose={3000} />
</div>
  )
}


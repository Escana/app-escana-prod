"use client"

import { X, Plus } from "lucide-react"
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog"

interface Guest {
  nombres: string
  apellidos: string
  rut: string
}

interface GuestListModalProps {
  isOpen: boolean
  onClose: () => void
  guestList: {
    nombre: string
    anfitrion: string
    rut: string
    codigo: string
    fecha: string
    hora: string
    estado: string
    descripcion?: string
    invitados: Guest[]
  }
}

export function GuestListModal({ isOpen, onClose, guestList }: GuestListModalProps) {
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg bg-[#1A1B1C] border-[#3F3F46] p-2">
        <DialogHeader className="p-0">
          <div className="flex justify-between items-start">
            <h2 className="text-white text-lg font-medium">{guestList.nombre}</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>
        </DialogHeader>

        <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2">
          <div>
            <div className="text-[#7DD3FC] text-xs mb-0.5">ANFITRIÓN:</div>
            <div className="text-white text-xs">{guestList.anfitrion}</div>
          </div>
          <div>
            <div className="text-[#7DD3FC] text-xs mb-0.5">RUT:</div>
            <div className="text-white text-xs">{guestList.rut}</div>
          </div>
          <div>
            <div className="text-[#7DD3FC] text-xs mb-0.5">CÓDIGO</div>
            <div className="text-white text-xs">{guestList.codigo}</div>
          </div>
          <div>
            <div className="text-[#7DD3FC] text-xs mb-0.5">ESTADO:</div>
            <span className={`${getStatusColor(guestList.estado)} text-white text-xs px-2 py-0.5 rounded`}>
              {guestList.estado}
            </span>
          </div>
          <div>
            <div className="text-[#7DD3FC] text-xs mb-0.5">FECHA DEL EVENTO:</div>
            <div className="text-white text-xs">{guestList.fecha}</div>
          </div>
          <div>
            <div className="text-[#7DD3FC] text-xs mb-0.5">HORA DE INICIO:</div>
            <div className="text-white text-xs">{guestList.hora}</div>
          </div>
        </div>

        <div className="mt-3">
          <div className="text-[#7DD3FC] text-xs mb-0.5">Descripción del evento:</div>
          <div className="bg-[#27272A] text-white text-xs p-2 rounded">
            {guestList.descripcion || "Evento de celebración de cumpleaños con espectáculo de luces y barra libre."}
          </div>
        </div>

        <div className="mt-3">
          <div className="flex justify-between items-center mb-2">
            <div className="text-[#7DD3FC] text-xs">Invitados</div>
            <div className="text-white text-xs">Total asistentes: {guestList.invitados?.length || 0}</div>
          </div>

          <div className="bg-[#27272A] rounded overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-[#7DD3FC] text-[#1A1B1C]">
                  <th className="py-1 px-2 text-left w-8 text-xs">#</th>
                  <th className="py-1 px-2 text-left text-xs">NOMBRES</th>
                  <th className="py-1 px-2 text-left text-xs">APELLIDOS</th>
                  <th className="py-1 px-2 text-left text-xs">RUT</th>
                </tr>
              </thead>
              <tbody>
                {guestList.invitados?.map((guest, index) => (
                  <tr key={index} className="border-b border-[#3F3F46]">
                    <td className="py-1 px-2 text-white text-xs">{index + 1}</td>
                    <td className="py-1 px-2 text-white text-xs">{guest.nombres}</td>
                    <td className="py-1 px-2 text-white text-xs">{guest.apellidos}</td>
                    <td className="py-1 px-2 text-white text-xs">{guest.rut}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-3 space-y-2">
          <button className="w-full bg-[#3B82F6] text-white py-1.5 rounded hover:bg-[#2563EB] flex items-center justify-center gap-2 text-xs">
            <Plus className="w-4 h-4" />
            Agregar invitados
          </button>
          <div className="flex gap-1">
            <button className="flex-1 bg-[#3B82F6] text-white py-1.5 rounded hover:bg-[#2563EB] text-xs">
              Modificar lista
            </button>
            <button
              onClick={onClose}
              className="flex-1 bg-[#3F3F46] text-white py-1.5 rounded hover:bg-[#52525B] text-xs"
            >
              Cancelar
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}


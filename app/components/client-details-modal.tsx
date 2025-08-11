"use client"

import { X, Check } from "lucide-react"
import Image from "next/image"
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog"

interface ClientDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  client: {
    photo: string
    nombres: string
    apellidos: string
    rut: string
    nacionalidad: string
    sexo: string
    nacimiento?: string
    vencimiento?: string
    id: string
    ingreso: string
    incidentes?: boolean
  }
  onBanClient: (rut: string) => void
}

export function ClientDetailsModal({ isOpen, onClose, client, onBanClient }: ClientDetailsModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl bg-[#1A1B1C] border-[#3F3F46]">
        <DialogHeader>
          <div className="flex justify-end">
            <button onClick={onClose} className="text-gray-400 hover:text-white">
              <X className="w-6 h-6" />
            </button>
          </div>
        </DialogHeader>

        <div className="grid grid-cols-[300px,1fr] gap-8">
          <div>
            <h2 className="text-white text-xl mb-4">Fotografía</h2>
            <div className="aspect-[3/4] relative rounded-lg overflow-hidden">
              <Image
                src={client.photo || "/placeholder.svg"}
                alt={`${client.nombres} ${client.apellidos}`}
                fill
                className="object-cover"
              />
            </div>
          </div>

          <div>
            <h2 className="text-white text-xl mb-4">Datos capturados (OCR)</h2>
            <div className="space-y-3">
              <div className="bg-[#27272A] px-4 py-2 rounded">
                <span className="text-white">RUT: {client.rut}</span>
              </div>
              <div className="bg-[#27272A] px-4 py-2 rounded">
                <span className="text-white">NOMBRES: {client.nombres}</span>
              </div>
              <div className="bg-[#27272A] px-4 py-2 rounded">
                <span className="text-white">APELLIDOS: {client.apellidos}</span>
              </div>
              <div className="bg-[#27272A] px-4 py-2 rounded">
                <span className="text-white">NACIONALIDAD: {client.nacionalidad}</span>
              </div>
              <div className="bg-[#27272A] px-4 py-2 rounded">
                <span className="text-white">SEXO: {client.sexo}</span>
              </div>
              {client.nacimiento && (
                <div className="bg-[#27272A] px-4 py-2 rounded">
                  <span className="text-white">NACIMIENTO: {client.nacimiento}</span>
                </div>
              )}
              {client.vencimiento && (
                <div className="bg-[#27272A] px-4 py-2 rounded">
                  <span className="text-white">VENCIMIENTO CÉDULA: {client.vencimiento}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-6 space-y-4">
          <div className="flex items-center gap-2 text-white">
            <span>COD {client.id}</span>
            <Check className="w-5 h-5 text-emerald-500" />
          </div>
          <div className="text-white">REGISTRO DE INGRESO: {client.ingreso}</div>
          <div className="bg-[#3F3F46] px-4 py-3 rounded text-white text-center">
            REGISTRO DE INCIDENTES: {client.incidentes ? "SI" : "NO"}
          </div>
        </div>

        <div className="flex gap-4 mt-6">
          <button className="flex-1 bg-[#3B82F6] text-white py-3 rounded-lg hover:bg-[#2563EB]">
            Eliminar de clientes
          </button>
          <button
            onClick={() => onBanClient(client.rut)}
            className="flex-1 bg-red-500 text-white py-3 rounded-lg hover:bg-red-600"
          >
            Banear
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}


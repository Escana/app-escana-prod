"use client"
import Image from "next/image"
import { Crown } from "lucide-react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { useState } from "react"
import { BanModal } from "@/app/components/ban-modal"

interface ClientDetailsModalProps {
  isOpen: boolean
  handleConfirmBan:void,
  onClose: () => void
  client: {
    photo: string
    nombres: string
    apellidos: string
    rut: string
    nacionalidad: string
    sexo: string
    fecha_nacimiento?: string
    nacimiento?: string
    id: string
    visits?: {
      id: string
      entry_time: string
      exit_time?: string
      status: string
    }[]
    is_guest?: boolean
    is_banned?: boolean
    ban_level?: number
    guest_list?: string
    entry_dates?: string[]
    updated_at?: string
    created_at?: string
    document_image?: string
  }
  onBanClient?: (id: string, data: any) => Promise<void>
  onUnbanClient?: (id: string) => Promise<void>
}

const getBanLevelColor = (level: number) => {
  switch (level) {
    case 1:
      return "bg-blue-500"
    case 2:
      return "bg-yellow-500"
    case 3:
      return "bg-orange-500"
    case 4:
      return "bg-purple-500"
    case 5:
      return "bg-red-500"
    default:
      return "bg-gray-500"
  }
}

const calculateAge = (fechaNacimiento: string): number => {
  try {
    console.log("Modal - Calculating age for:", fechaNacimiento)

    // Parse the ISO date string directly
    const birth = new Date(fechaNacimiento)
    console.log("Modal - Parsed birth date:", birth)

    const today = new Date()
    let age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--
    }

    console.log("Modal - Calculated age:", age)
    return age
  } catch (error) {
    console.error("Modal - Error calculating age:", error, "for date:", fechaNacimiento)
    return 0
  }
}

export function ClientDetailsModal({handleConfirmBan, isOpen, onClose, client, onBanClient, onUnbanClient }: ClientDetailsModalProps) {
  const [isBanModalOpen, setIsBanModalOpen] = useState(false)

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd MMM yyyy", { locale: es }).toUpperCase()
    } catch (error) {
      console.error("Error formatting date:", error)
      return dateString
    }
  }

  const formatDateTime = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd/MM/yyyy HH:mm", { locale: es })
    } catch (error) {
      console.error("Error formatting date:", error)
      return dateString
    }
  }

  const handleBanConfirm = async (banData: any) => {
    console.log(client)
    console.log(banData)
    await onBanClient?.(client.rut, banData)
    setIsBanModalOpen(false)
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-3xl bg-[#1A1B1C] border-[#3F3F46] p-0">
          <div className="p-6">
            {/* Header */}
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-[#7DD3FC] text-xl font-semibold">Detalles de cliente</h2>
              <div className="flex items-center gap-4">
                {client.is_guest && (
                  <span className="bg-emerald-500 text-white px-3 py-1 rounded-md text-sm flex items-center gap-2">
                    <Crown className="w-4 h-4" />
                    Invitado
                  </span>
                )}
              </div>
            </div>

            <div className="flex gap-4">
              {/* Profile Photo */}
              <div className="flex flex-col gap-2">
                <div className="w-32 h-40 rounded-lg overflow-hidden bg-gray-800 flex-shrink-0">
                  <Image
                    src={client.document_image || "/placeholder.svg"}
                    alt={`${client.nombres} ${client.apellidos}`}
                    width={128}
                    height={160}
                    className="w-full h-full object-cover"
                  />
                </div>
                {client.is_banned && (
                  <>
                    <p className="text-gray-400 text-sm">Estado:</p>
                    <span
                      className={`text-white text-sm px-2 py-1 rounded flex items-center justify-center w-full -mt-1 ${getBanLevelColor(client.ban_level || 1)}`}
                    >
                      Nivel {client.ban_level}
                    </span>
                  </>
                )}
              </div>

              {/* Client Information */}
              <div className="flex-1">
                <div className="mb-4">
                  <h3 className="text-white text-lg font-semibold">
                    {client.nombres} {client.apellidos}
                  </h3>
                  <div className="mt-1">
                    <p className="text-gray-400 text-sm">RUT:</p>
                    <p className="text-white font-mono">{client.rut}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-x-4 gap-y-6">
                  <div>
                    <p className="text-gray-400 text-sm mb-1">Nacionalidad:</p>
                    <p className="text-white">{client.nacionalidad}</p>
                  </div>

                  <div>
                    <p className="text-gray-400 text-sm mb-1">Sexo:</p>
                    <p className="text-white">{client.sexo}</p>
                  </div>

                  <div>
                    <p className="text-gray-400 text-sm mb-1">Edad:</p>
                    <p className="text-white">
                      {client.nacimiento
                        ? (() => {
                            console.log("Modal - Processing nacimiento:", client.nacimiento)
                            const age = calculateAge(client.nacimiento)
                            return `${age} años`
                          })()
                        : "No especificada"}
                    </p>
                  </div>

                  <div>
                    <p className="text-gray-400 text-sm mb-1">Nacimiento:</p>
                    <p className="text-white">
                      {client.nacimiento ? formatDate(client.nacimiento) : "No especificado"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Information */}
            <div className="mt-8 bg-[#27272A] rounded-lg p-4">
              <h4 className="text-[#7DD3FC] text-lg font-medium mb-4">Información adicional</h4>

              <div className="space-y-4">
                <div>
                  <p className="text-gray-400 text-sm mb-1">Lista de invitados:</p>
                  <p className="text-white">{client.guest_list || "No especificada"}</p>
                </div>

                <div>
                  <p className="text-gray-400 text-sm mb-1">Último ingreso:</p>
                  <p className="text-white">
                    {client.visits && client.visits.length > 0
    ? formatDateTime(client.visits[0].entry_time)
    : "Sin ingresos registrados"}
                  </p>
                </div>

                <div>
                  <p className="text-gray-400 text-sm mb-1">Historial de ingresos:</p>
                  <div className="space-y-1 max-h-40 overflow-y-auto">
                    {client.visits && client.visits.length > 0 ? (
                      client.visits
                        .sort((a, b) => new Date(b.entry_time).getTime() - new Date(a.entry_time).getTime())
                        .map((visit, index) => (
                          <p key={visit.id} className="text-white">
                            {formatDateTime(visit.entry_time)}
                           
                          </p>
                        ))
                    ) : (
                      <p className="text-white">
                        {formatDateTime(client.updated_at)}
                        <span className="ml-2 px-2 py-0.5 rounded text-xs bg-blue-500">Actualización</span>
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 mt-8">
              {client.is_banned ? (
                <button
                  onClick={() => onUnbanClient?.(client.rut)}
                  className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white py-3 rounded-lg transition-colors"
                >
                  Desbanear
                </button>
              ) : (
                <button
                  onClick={() => setIsBanModalOpen(true)}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white py-3 rounded-lg transition-colors"
                >
                  Banear
                </button>
              )}
              <button
                onClick={onClose}
                className="flex-1 bg-[#3F3F46] hover:bg-[#52525B] text-white py-3 rounded-lg transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <BanModal
        isOpen={isBanModalOpen}
        onClose={() => setIsBanModalOpen(false)}
        onConfirm={handleBanConfirm}
        clientRut={client.rut}
      />
    </>
  )
}


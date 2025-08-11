"use client"

import { Dialog, DialogContent } from "@/components/ui/dialog"
import { AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useEffect, useRef } from "react"

interface BannedClientModalProps {
  isOpen: boolean
  onClose: () => void
  clientData: {
    nombres?: string
    apellidos?: string
  } | null
}

export function BannedClientModal({ isOpen, onClose, clientData }: BannedClientModalProps) {
  if (!clientData) return null
console.log('Este componente es')
  const fullName = `${clientData.nombres || ""} ${clientData.apellidos || ""}`.trim()

  const timerRef = useRef<number | null>(null)

  useEffect(() => {
    if (isOpen) {
      timerRef.current = window.setTimeout(() => {
        onClose()
      }, 3000)
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
    }
  }, [isOpen, onClose])

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#1A1B1C] border-none max-w-md mx-4 p-0 overflow-hidden">
        {/* Mensaje de advertencia simple */}
        <div className="bg-red-600 rounded-lg p-4 m-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-6 w-6 text-white flex-shrink-0" />
            <div className="text-white">
              <p className="font-medium">Acceso Restringido</p>
              <p className="text-sm mt-1">{fullName} es un cliente baneado. Tiene el acceso prohibido al local.</p>
            </div>
          </div>
        </div>

        {/* Botón de cerrar */}
        <div className="px-4 pb-4">
          <Button onClick={onClose} className="w-full bg-[#2A2A2A] hover:bg-[#3A3A3A] text-white">
            Entendido
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}


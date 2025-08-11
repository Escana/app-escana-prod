"use client"

import { XCircle } from "lucide-react"
import { Dialog, DialogContent } from "@/components/ui/dialog"

interface CriticalDataDialogProps {
  isOpen: boolean
  onClose: () => void
  onRetry: () => void
}

export function CriticalDataDialog({ isOpen, onClose, onRetry }: CriticalDataDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#1A1B1C] border-[#3F3F46] max-w-md mx-4">
        <div className="flex flex-col space-y-4">
          {/* Header */}
          <div className="flex items-start space-x-3">
            <XCircle className="w-6 h-6 text-red-500 flex-shrink-0 mt-1" />
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-white">Datos críticos no detectados</h2>
            </div>
          </div>

          {/* Critical Errors Section */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 rounded-full bg-red-500" />
              <h3 className="text-red-500 font-medium">Errores críticos:</h3>
            </div>
          </div>

          {/* Instructions */}
          <div className="text-gray-400">
            <p className="mb-2">Por favor, intente capturar la imagen nuevamente asegurándose de que:</p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>El documento esté bien iluminado</li>
              <li>No haya reflejos en el documento</li>
              <li>El documento esté completamente visible</li>
              <li>La imagen no esté borrosa</li>
            </ul>
          </div>

          {/* Buttons */}
          <div className="flex justify-end space-x-3 mt-4">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-[#27272A] text-white hover:bg-[#3F3F46] transition-colors"
            >
              Cerrar
            </button>
            <button
              onClick={onRetry}
              className="px-4 py-2 rounded-lg bg-[#3B82F6] text-white hover:bg-[#2563EB] transition-colors"
            >
              Intentar de nuevo
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}


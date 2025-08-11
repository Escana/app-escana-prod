"use client"

import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Edit2, Trash2 } from "lucide-react"
import type { Guard } from "@/types/guard"

interface GuardCardProps {
  guard: Guard
  onEdit: (guard: Guard) => void
  onDelete: (guard: Guard) => void
}

export function GuardCard({ guard, onEdit, onDelete }: GuardCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "text-green-500"
      case "inactive":
        return "text-yellow-500"
      case "disconnected":
        return "text-red-500"
      default:
        return "text-gray-500"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "active":
        return "Activo"
      case "inactive":
        return "Inactivo"
      case "disconnected":
        return "Desconectado"
      default:
        return "Desconocido"
    }
  }

  const formatLastActive = (date: Date) => {
    return `Hace ${formatDistanceToNow(date, { locale: es })}`
  }

  return (
    <Card className="bg-[#2A2B2C] border-secondary-dark/20 hover:border-secondary-dark/50 transition-all">
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-semibold text-white">{guard.name}</h3>
          <div className="flex space-x-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-gray-400 hover:text-white hover:bg-secondary-dark/20"
              onClick={() => onEdit(guard)}
            >
              <Edit2 className="h-4 w-4" />
              <span className="sr-only">Editar</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-gray-400 hover:text-red-500 hover:bg-red-500/10"
              onClick={() => onDelete(guard)}
            >
              <Trash2 className="h-4 w-4" />
              <span className="sr-only">Eliminar</span>
            </Button>
          </div>
        </div>
        <div className={`text-sm font-medium ${getStatusColor(guard.status)}`}>{getStatusText(guard.status)}</div>
        <div className="text-sm text-gray-400 mt-1">Última actividad: {formatLastActive(guard.lastActive)}</div>
      </CardContent>
    </Card>
  )
}


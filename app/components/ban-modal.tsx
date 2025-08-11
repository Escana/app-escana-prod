"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"

interface BanModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (banData: {
    banLevel: number
    banReason: string
    banDescription: string
  }) => Promise<void>
  clientRut: string
}

export function BanModal({ isOpen, onClose, onConfirm, clientRut }: BanModalProps) {
  const [banLevel, setBanLevel] = useState("1")
  const [banReason, setBanReason] = useState("")
  const [banDescription, setBanDescription] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!clientRut) {
      toast({
        title: "Error",
        description: "No se ha seleccionado un cliente para banear",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    setIsLoading(true)

    // Derive duration from ban level
    const getDuration = (level: number) => {
      switch (level) {
        case 1:
          return "7"
        case 2:
          return "14"
        case 3:
          return "30"
        case 4:
          return "90"
        case 5:
          return "Permanente"
        default:
          return "7"
      }
    }

    try {
      await onConfirm({
        banLevel: Number(banLevel),
        banReason,
        banDescription,
        banDuration: getDuration(Number(banLevel)),
      })

      toast({
        title: "Éxito",
        description: "Cliente baneado correctamente",
      })
      onClose()
    } catch (error) {
      console.error("Error banning client:", error)
      toast({
        title: "Error",
        description: "No se pudo banear al cliente",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-[#1A1B1C] border-[#3F3F46] p-6">
        <DialogHeader>
          <DialogTitle className="text-white">Banear Cliente</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="banLevel" className="text-white mb-2 block">
                Nivel de Ban
              </Label>
              <Select value={banLevel} onValueChange={setBanLevel}>
                <SelectTrigger id="banLevel" className="w-full bg-[#27272A] border-[#3F3F46] text-white">
                  <SelectValue placeholder="Nivel 1 - 7 días" />
                </SelectTrigger>
                <SelectContent className="bg-[#27272A] border-[#3F3F46]">
                  <SelectItem value="1">Nivel 1 - 7 días</SelectItem>
                  <SelectItem value="2">Nivel 2 - 14 días</SelectItem>
                  <SelectItem value="3">Nivel 3 - 30 días</SelectItem>
                  <SelectItem value="4">Nivel 4 - 90 días</SelectItem>
                  <SelectItem value="5">Nivel 5 - Permanente</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="banReason" className="text-white mb-2 block">
                Motivo del Ban
              </Label>
              <Input
                id="banReason"
                value={banReason}
                onChange={(e) => setBanReason(e.target.value)}
                className="w-full bg-[#27272A] border-[#3F3F46] text-white"
                placeholder="Ingrese el motivo"
                required
              />
            </div>

            <div>
              <Label htmlFor="banDescription" className="text-white mb-2 block">
                Descripción Detallada
              </Label>
              <Textarea
                id="banDescription"
                value={banDescription}
                onChange={(e) => setBanDescription(e.target.value)}
                className="w-full bg-[#27272A] border-[#3F3F46] text-white min-h-[120px]"
                placeholder="Ingrese una descripción detallada del incidente"
                required
              />
            </div>
          </div>

          <div className="flex gap-3 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="bg-[#27272A] text-white border-[#3F3F46] hover:bg-[#3F3F46]"
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting} className="bg-red-500 text-white hover:bg-red-600">
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Baneando...
                </div>
              ) : (
                "Confirmar Ban"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}


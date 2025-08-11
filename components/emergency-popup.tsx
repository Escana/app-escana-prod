"use client"

import type React from "react"
import { useState, useContext } from "react"
import { AlertTriangle, Phone, FileText, X, CheckCircle, Loader2 } from "lucide-react"
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { AppContext } from "@/components/status-bar"
import { useToast } from "@/components/ui/use-toast"
import { Input } from "@/components/ui/input"

interface EmergencyPopupProps {
  isOpen: boolean
  onClose: () => void
  currentClientId?: string
  currentEmployeeId?: string
}

// Dummy createIncident function (replace with your actual implementation)
const createIncident = async (incidentData: any) => {
  // Simulate an API call
  await new Promise((resolve) => setTimeout(resolve, 1000))
  console.log("Incident created:", incidentData)
  return { success: true }
}

export function EmergencyPopup({ isOpen, onClose, currentClientId, currentEmployeeId }: EmergencyPopupProps) {
  const [currentView, setCurrentView] = useState<"main" | "incident" | "admin">("main")
  const [incidentDetails, setIncidentDetails] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { userName } = useContext(AppContext)
  const currentDate = new Date().toLocaleDateString("es-CL")
  const currentTime = new Date().toLocaleTimeString("es-CL")
  const [showSuccess, setShowSuccess] = useState(false)
  const { toast } = useToast()
  const [incidentTitle, setIncidentTitle] = useState("")

  const handleAdminContact = () => {
    setCurrentView("admin")
    setTimeout(() => {
      setCurrentView("main")
      onClose()
    }, 3000)
  }

  const handleIncidentSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!currentClientId || !currentEmployeeId) {
      toast({
        title: "Error",
        description: "No se pudo identificar el cliente o empleado",
        variant: "destructive",
      })
      return
    }

    if (!incidentDetails.trim()) {
      toast({
        title: "Error",
        description: "Por favor, proporcione una descripción del incidente",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      await createIncident({
        client_id: currentClientId,
        employee_id: currentEmployeeId,
        title: incidentTitle,
        description: incidentDetails,
        severity: 3,
        location: "Bar principal",
      })

      setShowSuccess(true)
      toast({
        title: "Éxito",
        description: "Incidente registrado correctamente",
      })

      setTimeout(() => {
        setShowSuccess(false)
        setCurrentView("main")
        setIncidentDetails("")
        setIncidentTitle("")
        onClose()
      }, 2000)
    } catch (error) {
      console.error("Error creating incident:", error)
      toast({
        title: "Error",
        description: "No se pudo registrar el incidente. Por favor, intente nuevamente.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    if (isSubmitting) return
    setCurrentView("main")
    setIncidentDetails("")
    setIncidentTitle("")
    onClose()
  }

  if (!isOpen) return null

  return (
    <AlertDialog open={isOpen} onOpenChange={handleClose}>
      <AlertDialogContent className="bg-[#1A2B41] border border-[#EAB308] text-white p-6 max-w-md">
        <div className="absolute right-4 top-4">
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-white transition-colors"
            disabled={isSubmitting}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {currentView === "main" && (
          <>
            <div className="flex items-center justify-center mb-4">
              <AlertTriangle className="w-16 h-16 text-[#EAB308]" />
            </div>
            <AlertDialogHeader>
              <AlertDialogTitle className="text-2xl font-bold text-center mb-2">Emergencia</AlertDialogTitle>
              <AlertDialogDescription className="text-center text-gray-300">
                Seleccione una acción de emergencia:
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="flex flex-col gap-4 mt-6">
              <Button
                className="w-full py-3 bg-[#3B82F6] text-white rounded hover:bg-[#2563EB] flex items-center justify-center gap-2"
                onClick={handleAdminContact}
              >
                <Phone className="w-5 h-5" />
                Contactar a administración
              </Button>
             
              <Button onClick={handleClose} className="w-full py-3 bg-[#3F3F46] text-white rounded hover:bg-[#52525B]">
                Cancelar
              </Button>
            </div>
          </>
        )}

        {currentView === "admin" && (
          <div className="text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Solicitud Enviada</h2>
            <p className="text-gray-300">
              Se ha enviado una solicitud a la administración. Pronto se pondrán en contacto con usted.
            </p>
          </div>
        )}

        {currentView === "incident" && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-center">Registrar Incidente</h2>
            <div className="flex items-center justify-between text-sm mb-4">
              <div className="text-[#7DD3FC]">
                {userName} • {currentDate} • {currentTime}
              </div>
            </div>
            <form onSubmit={handleIncidentSubmit} className="space-y-4">
              <div>
                <label htmlFor="incidentTitle" className="block text-sm font-medium text-gray-300 mb-1">
                  Título del incidente
                </label>
                <Input
                  id="incidentTitle"
                  value={incidentTitle}
                  onChange={(e) => setIncidentTitle(e.target.value)}
                  placeholder="Ingrese un título descriptivo"
                  className="w-full bg-[#3F3F46] border-[#6B7280] text-white"
                  required
                />
              </div>

              <div>
                <label htmlFor="incidentDetails" className="block text-sm font-medium text-gray-300 mb-1">
                  Descripción del incidente
                </label>
                <textarea
                  id="incidentDetails"
                  className="w-full p-2 bg-[#3F3F46] text-white rounded-md border border-[#6B7280] focus:border-[#3B82F6] focus:ring focus:ring-[#3B82F6] focus:ring-opacity-50"
                  rows={4}
                  value={incidentDetails}
                  onChange={(e) => setIncidentDetails(e.target.value)}
                  placeholder="Describe el incidente con detalle..."
                  required
                  disabled={isSubmitting}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  onClick={() => setCurrentView("main")}
                  variant="outline"
                  className="bg-[#3F3F46] text-white hover:bg-[#4B5563]"
                  disabled={isSubmitting}
                >
                  Volver
                </Button>
                <Button
                  type="submit"
                  className="bg-[#EAB308] text-black hover:bg-[#CA8A04] min-w-[100px]"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Enviar Reporte"}
                </Button>
              </div>
            </form>
          </div>
        )}

        {showSuccess && (
          <div className="text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Reporte Enviado</h2>
            <p className="text-gray-300">
              El incidente ha sido registrado correctamente. Se tomarán las medidas necesarias.
            </p>
          </div>
        )}
      </AlertDialogContent>
    </AlertDialog>
  )
}


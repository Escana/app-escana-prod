"use client"

import { useState } from "react"
import type { Guard, GuardFormData } from "@/types/guard"
import { GuardCard } from "./guard-card"
import { GuardForm } from "./guard-form"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { createGuard, updateGuard, deleteGuard } from "@/app/actions/guards"

interface GuardsManagementProps {
  initialGuards: Guard[]
  establishmentId: string
}

export function GuardsManagement({ initialGuards, establishmentId }: GuardsManagementProps) {
  const [guards, setGuards] = useState<Guard[]>(initialGuards)
  const [formOpen, setFormOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedGuard, setSelectedGuard] = useState<Guard | null>(null)

  const handleCreateGuard = async (data: GuardFormData) => {
    await createGuard(data, establishmentId)
    // Actualización optimista
    const newGuard: Guard = {
      id: Date.now().toString(),
      ...data,
      status: "inactive",
      lastActive: new Date(),
      establishment: establishmentId,
      role: "guard",
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    setGuards([...guards, newGuard])
  }

  const handleUpdateGuard = async (data: GuardFormData) => {
    if (!selectedGuard) return
    await updateGuard(selectedGuard.id, data)
    // Actualización optimista
    setGuards(
      guards.map((guard) => (guard.id === selectedGuard.id ? { ...guard, ...data, updatedAt: new Date() } : guard)),
    )
  }

  const handleDeleteGuard = async () => {
    if (!selectedGuard) return
    await deleteGuard(selectedGuard.id)
    // Actualización optimista
    setGuards(guards.filter((guard) => guard.id !== selectedGuard.id))
    setDeleteDialogOpen(false)
  }

  const openEditForm = (guard: Guard) => {
    setSelectedGuard(guard)
    setFormOpen(true)
  }

  const openDeleteDialog = (guard: Guard) => {
    setSelectedGuard(guard)
    setDeleteDialogOpen(true)
  }

  return (
    <div className="space-y-6 p-6 bg-[#0F1A2A] rounded-lg w-full h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">Administración de Guardias</h2>
        <Button
          onClick={() => {
            setSelectedGuard(null)
            setFormOpen(true)
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Guardia
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 flex-1 overflow-auto">
        {guards.map((guard) => (
          <GuardCard key={guard.id} guard={guard} onEdit={openEditForm} onDelete={openDeleteDialog} />
        ))}
      </div>

      <GuardForm
        guard={selectedGuard || undefined}
        open={formOpen}
        onClose={() => {
          setFormOpen(false)
          setSelectedGuard(null)
        }}
        onSubmit={selectedGuard ? handleUpdateGuard : handleCreateGuard}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-[#1A2B41] text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              Esta acción eliminará permanentemente al guardia {selectedGuard?.name}. Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-secondary-dark">Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteGuard}>Eliminar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}


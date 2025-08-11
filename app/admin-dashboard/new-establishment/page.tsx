"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import SimpleEstablishmentForm from "../components/simple-establishment-form"

export default function NewEstablishmentPage() {
  const router = useRouter()

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center">
        <Button variant="ghost" onClick={() => router.back()} className="mr-4 text-gray-400 hover:text-white">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver
        </Button>
        <h1 className="text-2xl font-bold text-white">Nuevo Establecimiento</h1>
      </div>

      <SimpleEstablishmentForm />
    </div>
  )
}


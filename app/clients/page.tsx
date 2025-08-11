"use client"

import { Suspense, useState, useEffect } from "react"
import ClientsTable from "./clients-table"
import { Loader2, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function ClientsPage() {
  const [error, setError] = useState<Error | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  

  return (
    <div className="bg-[#1A1B1C] min-h-screen">
      <Suspense
        fallback={
          <div className="min-h-screen bg-[#1A1B1C] flex items-center justify-center">
            <div className="text-center">
              <Loader2 className="w-8 h-8 text-[#3B82F6] animate-spin mx-auto mb-4" />
              <p className="text-gray-400">Cargando clientes...</p>
            </div>
          </div>
        }
      >
        <ClientsTable />
      </Suspense>
    </div>
  )
}


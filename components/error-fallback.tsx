"use client"

interface ErrorFallbackProps {
  error: Error
  resetErrorBoundary: () => void
}

export function ErrorFallback({ error, resetErrorBoundary }: ErrorFallbackProps) {
  return (
    <div className="min-h-screen bg-[#1A1B1C] flex items-center justify-center">
      <div className="text-white text-center">
        <h2 className="text-xl font-bold mb-2">Ha ocurrido un error</h2>
        <p className="text-gray-400 mb-4">{error.message || "Por favor, intente de nuevo más tarde"}</p>
        <button
          onClick={resetErrorBoundary}
          className="px-4 py-2 bg-[#3B82F6] text-white rounded-md hover:bg-[#2563EB]"
        >
          Reintentar
        </button>
      </div>
    </div>
  )
}


export function LoadingFallback() {
  return (
    <div className="min-h-screen bg-[#1A1B1C] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-8 h-8 border-4 border-[#3B82F6] border-t-transparent rounded-full animate-spin" />
        <p className="text-white text-sm">Cargando datos...</p>
      </div>
    </div>
  )
}


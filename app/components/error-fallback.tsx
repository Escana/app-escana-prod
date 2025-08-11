"use client"

export function ErrorFallback({ error }: { error: Error }) {
  return (
    <div className="flex items-center justify-center min-h-screen bg-[#1A1B1C] text-white">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Oops! Something went wrong</h1>
        <p className="mb-4">We're sorry for the inconvenience. Please try refreshing the page.</p>
        <p className="text-sm text-gray-400">Error details: {error?.message || "Unknown error"}</p>
      </div>
    </div>
  )
}


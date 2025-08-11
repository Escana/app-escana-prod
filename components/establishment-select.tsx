"use client"

import { useState, useEffect } from "react"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

export function EstablishmentSelect({ value, onChange, disabled, placeholder, className }) {
  const [open, setOpen] = useState(false)
  const [establishments, setEstablishments] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchEstablishments() {
      try {
        setLoading(true)
        // Obtener establecimientos desde la API
        const response = await fetch("/api/establishments")
        const data = await response.json()
        setEstablishments(data)
      } catch (error) {
        console.error("Error al cargar establecimientos:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchEstablishments()
  }, [])

  // Función para obtener el nombre del establecimiento seleccionado
  const getSelectedEstablishmentName = () => {
    if (!value) return ""
    const establishment = establishments.find((est) => est.id === value)
    return establishment ? establishment.name : ""
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn(
            "w-full justify-between bg-gray-800 border-gray-700 text-white",
            !value && "text-muted-foreground",
            className,
          )}
        >
          {loading
            ? "Cargando..."
            : value
              ? getSelectedEstablishmentName()
              : placeholder || "Seleccionar establecimiento"}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0 bg-gray-800 border-gray-700">
        <Command className="bg-gray-800">
          <CommandInput placeholder="Buscar establecimiento..." className="text-white" />
          <CommandList>
            <CommandEmpty>No se encontraron establecimientos.</CommandEmpty>
            <CommandGroup className="max-h-60 overflow-y-auto">
              {establishments.map((establishment) => (
                <CommandItem
                  key={establishment.id}
                  value={establishment.id}
                  onSelect={() => {
                    onChange(establishment.id === value ? "" : establishment.id)
                    setOpen(false)
                  }}
                  className="text-white hover:bg-gray-700"
                >
                  <Check className={cn("mr-2 h-4 w-4", value === establishment.id ? "opacity-100" : "opacity-0")} />
                  {establishment.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}


"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Building, MapPin } from "lucide-react"

export default function SimpleEstablishmentForm() {
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    city: "",
    country: "Chile",
    description: "",
    status: "active",
    plan: "basic",
    maxCapacity: "",
  })

  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleNumberChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value === "" ? "" : Number.parseInt(value),
    }))
  }

  const handleSelectChange = (name, value) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSwitchChange = (checked) => {
    setFormData((prev) => ({
      ...prev,
      status: checked ? "active" : "inactive",
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulamos envío
    console.log("Datos del formulario:", formData)

    setTimeout(() => {
      alert("Local creado con éxito")
      setIsSubmitting(false)
      setFormData({
        name: "",
        address: "",
        city: "",
        country: "Chile",
        description: "",
        status: "active",
        plan: "basic",
        maxCapacity: "",
      })
    }, 1000)
  }

  return (
    <Card className="bg-gray-900 border border-gray-700 w-full max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center gap-2 mb-2">
          <Building className="h-5 w-5 text-blue-500" />
          <CardTitle className="text-xl text-white">Registrar Nuevo Local</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Información básica */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-white border-b border-gray-700 pb-2">Información básica</h3>

              <div className="space-y-2">
                <Label htmlFor="name">Nombre del local *</Label>
                <div className="relative">
                  <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="name"
                    name="name"
                    placeholder="Ej: Club Nocturno XYZ"
                    className="bg-gray-800 border-gray-700 pl-10"
                    value={formData.name}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Dirección *</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="address"
                    name="address"
                    placeholder="Ej: Av. Principal 123"
                    className="bg-gray-800 border-gray-700 pl-10"
                    value={formData.address}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">Ciudad *</Label>
                  <Input
                    id="city"
                    name="city"
                    placeholder="Ej: Santiago"
                    className="bg-gray-800 border-gray-700"
                    value={formData.city}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="country">País</Label>
                  <Input
                    id="country"
                    name="country"
                    placeholder="Ej: Chile"
                    className="bg-gray-800 border-gray-700"
                    value={formData.country}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Breve descripción del local..."
                  className="bg-gray-800 border-gray-700 min-h-[100px]"
                  value={formData.description}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Configuración */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-white border-b border-gray-700 pb-2">Configuración</h3>

              <div className="space-y-2">
                <Label htmlFor="plan">Plan</Label>
                <Select value={formData.plan} onValueChange={(value) => handleSelectChange("plan", value)}>
                  <SelectTrigger className="bg-gray-800 border-gray-700">
                    <SelectValue placeholder="Seleccionar plan" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    <SelectItem value="basic">Básico</SelectItem>
                    <SelectItem value="premium">Premium</SelectItem>
                    <SelectItem value="enterprise">Empresarial</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxCapacity">Capacidad máxima</Label>
                <Input
                  id="maxCapacity"
                  name="maxCapacity"
                  type="number"
                  placeholder="Ej: 500"
                  className="bg-gray-800 border-gray-700"
                  value={formData.maxCapacity}
                  onChange={handleNumberChange}
                />
              </div>

              <div className="flex items-center justify-between rounded-lg border border-gray-700 p-3 bg-gray-800">
                <div>
                  <Label htmlFor="status">Estado del local</Label>
                  <p className="text-xs text-gray-400">Activar o desactivar el local</p>
                </div>
                <Switch id="status" checked={formData.status === "active"} onCheckedChange={handleSwitchChange} />
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-4 pt-4 border-t border-gray-700">
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                setFormData({
                  name: "",
                  address: "",
                  city: "",
                  country: "Chile",
                  description: "",
                  status: "active",
                  plan: "basic",
                  maxCapacity: "",
                })
              }
              className="bg-gray-800 hover:bg-gray-700 border-gray-700"
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700">
              {isSubmitting ? "Guardando..." : "hola Local"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}


"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/components/ui/use-toast"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Building, MapPin, Mail, Phone, User, Calendar, Users } from "lucide-react"

// Esquema de validación con Zod
const establishmentSchema = z.object({
  name: z.string().min(3, { message: "El nombre debe tener al menos 3 caracteres" }),
  address: z.string().min(5, { message: "La dirección debe tener al menos 5 caracteres" }),
  city: z.string().min(2, { message: "La ciudad es requerida" }),
  country: z.string().default("Chile"),
  description: z.string().optional(),
  status: z.enum(["active", "inactive"]).default("active"),
  plan: z.enum(["basic", "premium", "enterprise"]).default("basic"),
  contactName: z.string().optional(),
  contactEmail: z.string().email({ message: "Email inválido" }).optional().or(z.literal("")),
  contactPhone: z.string().optional(),
  openingHours: z.string().optional(),
  maxCapacity: z.coerce.number().positive().optional(),
  paymentMethod: z.enum(["monthly", "annual"]).default("monthly"),
  notes: z.string().optional(),
})

type EstablishmentFormValues = z.infer<typeof establishmentSchema>

export default function NewEstablishmentForm({ currentUser, onSuccess }) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  // Definir el formulario con React Hook Form y Zod
  const form = useForm<EstablishmentFormValues>({
    resolver: zodResolver(establishmentSchema),
    defaultValues: {
      name: "",
      address: "",
      city: "",
      country: "Chile",
      description: "",
      status: "active",
      plan: "basic",
      contactName: "",
      contactEmail: "",
      contactPhone: "",
      openingHours: "",
      maxCapacity: undefined,
      paymentMethod: "monthly",
      notes: "",
    },
  })

  async function onSubmit(data: EstablishmentFormValues) {
    try {
      setIsSubmitting(true)

      // Simulamos la creación del establecimiento
      console.log("Datos del establecimiento:", data)

      // Simulamos una espera de 1 segundo
      await new Promise((resolve) => setTimeout(resolve, 1000))

      toast({
        title: "Local creado correctamente",
        description: `El local "${data.name}" ha sido registrado con éxito.`,
      })

      // Resetear el formulario
      form.reset()

      // Llamar al callback de éxito si existe
      if (onSuccess) {
        onSuccess()
      }
    } catch (error) {
      console.error("Error al crear local:", error)
      toast({
        title: "Error",
        description: "No se pudo crear el local: " + (error instanceof Error ? error.message : String(error)),
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="bg-gray-900 border border-gray-700 w-full max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center gap-2 mb-2">
          <Building className="h-5 w-5 text-blue-500" />
          <CardTitle className="text-xl text-white">Registrar Nuevo Local</CardTitle>
        </div>
        <CardDescription>
          Complete el formulario para registrar un nuevo establecimiento en la plataforma
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Información básica */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-white border-b border-gray-700 pb-2">Información básica</h3>

                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre del local *</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                          <Input
                            placeholder="Ej: Club Nocturno XYZ"
                            className="bg-gray-800 border-gray-700 pl-10"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Dirección *</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                          <Input
                            placeholder="Ej: Av. Principal 123"
                            className="bg-gray-800 border-gray-700 pl-10"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ciudad *</FormLabel>
                        <FormControl>
                          <Input placeholder="Ej: Santiago" className="bg-gray-800 border-gray-700" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="country"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>País</FormLabel>
                        <FormControl>
                          <Input placeholder="Ej: Chile" className="bg-gray-800 border-gray-700" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descripción</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Breve descripción del local..."
                          className="bg-gray-800 border-gray-700 min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Información de contacto y configuración */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-white border-b border-gray-700 pb-2">
                  Contacto y configuración
                </h3>

                <FormField
                  control={form.control}
                  name="contactName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre de contacto</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                          <Input
                            placeholder="Ej: Juan Pérez"
                            className="bg-gray-800 border-gray-700 pl-10"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="contactEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email de contacto</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                          <Input
                            placeholder="Ej: contacto@local.com"
                            className="bg-gray-800 border-gray-700 pl-10"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="contactPhone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Teléfono de contacto</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                          <Input
                            placeholder="Ej: +56 9 1234 5678"
                            className="bg-gray-800 border-gray-700 pl-10"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="plan"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Plan</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="bg-gray-800 border-gray-700">
                              <SelectValue placeholder="Seleccionar plan" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-gray-800 border-gray-700">
                            <SelectItem value="basic">Básico</SelectItem>
                            <SelectItem value="premium">Premium</SelectItem>
                            <SelectItem value="enterprise">Empresarial</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="paymentMethod"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Método de pago</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="bg-gray-800 border-gray-700">
                              <SelectValue placeholder="Seleccionar método" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-gray-800 border-gray-700">
                            <SelectItem value="monthly">Mensual</SelectItem>
                            <SelectItem value="annual">Anual</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border border-gray-700 p-3 bg-gray-800">
                      <div className="space-y-0.5">
                        <FormLabel>Estado del local</FormLabel>
                        <FormDescription className="text-xs">
                          Activar o desactivar el local en la plataforma
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value === "active"}
                          onCheckedChange={(checked) => field.onChange(checked ? "active" : "inactive")}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Información adicional */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-white border-b border-gray-700 pb-2">Información adicional</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="openingHours"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Horario de apertura</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                          <Input
                            placeholder="Ej: Lun-Vie 22:00-05:00, Sáb 23:00-06:00"
                            className="bg-gray-800 border-gray-700 pl-10"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="maxCapacity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Capacidad máxima</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                          <Input
                            type="number"
                            placeholder="Ej: 500"
                            className="bg-gray-800 border-gray-700 pl-10"
                            value={field.value || ""}
                            onChange={(e) => {
                              const value = e.target.value
                              field.onChange(value === "" ? undefined : Number.parseInt(value))
                            }}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notas adicionales</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Información adicional relevante..."
                        className="bg-gray-800 border-gray-700"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end space-x-4 pt-4 border-t border-gray-700">
              <Button
                type="button"
                variant="outline"
                onClick={() => form.reset()}
                className="bg-gray-800 hover:bg-gray-700 border-gray-700"
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700">
                {isSubmitting ? "Guardando..." : "Guardar"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}


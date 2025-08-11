"use client"

import { Camera, Users, AlertCircle, BarChart, HelpCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { useRouter } from "next/navigation"

const tutorialSections = [
  {
    id: "scanning",
    title: "Escaneo de Documentos",
    icon: Camera,
    description: "Aprende a escanear y procesar documentos de identidad de manera eficiente.",
    steps: [
      "Accede a la sección 'Escanear' desde el menú principal.",
      "Asegúrate de que el documento esté bien iluminado y centrado en el área designada.",
      "Haz clic en el botón 'Escanear' para capturar la imagen del documento.",
      "El sistema OCR procesará automáticamente la imagen y extraerá la información.",
      "Verifica que todos los campos se hayan llenado correctamente en la sección 'Datos capturados (OCR)'.",
      "Si es necesario, utiliza el botón de edición (ícono de lápiz) para corregir manualmente cualquier dato.",
      "Revisa el estado del cliente: regular, invitado o baneado, indicado por el color del borde.",
      "Utiliza los botones de acción en la columna derecha para aceptar, cancelar o banear al cliente según sea necesario.",
      "En caso de emergencia, utiliza el botón 'Emergencia' para acceder a opciones rápidas de respuesta.",
    ],
  },
  {
    id: "guests",
    title: "Gestión de Listas de Invitados",
    icon: Users,
    description: "Maneja la información de los clientes y las listas de invitados para eventos especiales.",
    steps: [
      "Navega a la sección 'Listas de invitados' en el menú principal.",
      "Para crear una nueva lista, haz clic en 'Crear nueva lista' y completa el formulario con los detalles del evento.",
      "Agrega invitados manualmente ingresando sus datos o importa una lista desde un archivo Excel.",
      "Utiliza los filtros y la barra de búsqueda para encontrar listas de invitados específicas.",
      "Haz clic en una lista para ver sus detalles y la relación de invitados.",
      "Edita la lista según sea necesario, agregando o eliminando invitados.",
      "Asigna códigos únicos a cada lista para facilitar el acceso de los invitados.",
      "Actualiza el estado de la lista (confirmado, realizado, cancelado) según avance el evento.",
      "Utiliza la información de las listas para gestionar el acceso prioritario de los invitados.",
    ],
  },
  {
    id: "incidents",
    title: "Registro y Gestión de Incidentes",
    icon: AlertCircle,
    description: "Aprende a reportar y gestionar incidentes de seguridad de manera efectiva.",
    steps: [
      "Accede a la sección 'Incidentes' desde el menú principal.",
      "Para reportar un nuevo incidente, haz clic en 'Nuevo Incidente'.",
      "Completa el formulario con los detalles del incidente: descripción, fecha, hora, personas involucradas.",
      "Clasifica el incidente según su gravedad y tipo (ej. agresión, robo, consumo de drogas).",
      "Adjunta evidencias si es necesario (fotos, videos) utilizando el botón de carga.",
      "Asigna el incidente a un empleado responsable del seguimiento.",
      "Utiliza la pestaña 'Lista de incidentes' para ver y filtrar todos los incidentes registrados.",
      "Haz clic en un incidente para ver sus detalles completos y actualizar su estado.",
      "En la pestaña 'Lista de baneados', gestiona los usuarios con restricciones de acceso.",
      "Revisa y actualiza los niveles de baneo según sea necesario, considerando la gravedad y frecuencia de los incidentes.",
    ],
  },
  {
    id: "statistics",
    title: "Estadísticas",
    icon: BarChart,
    description: "Interpreta los datos y métricas clave de tu establecimiento para tomar decisiones informadas.",
    steps: [
      "Accede a la sección 'Estadísticas' en el menú principal.",
      "Utiliza los filtros de tiempo (24h, 7d, 30d, 12m) para ajustar el rango de datos a analizar.",
      "Revisa el resumen de estadísticas clave: asistentes por género, incidentes, nacionalidades.",
      "Examina los gráficos de distribución de edad para entender la demografía de tus clientes.",
      "Analiza la afluencia de público semanal para identificar los días y horas más concurridos.",
      "Revisa la tendencia de escaneos mensuales para detectar patrones de crecimiento o declive.",
      "Utiliza el calendario de engagement para visualizar la actividad diaria del establecimiento.",
      "Identifica el día con mejor performance y sus métricas asociadas.",
      "Usa esta información para optimizar la planificación de personal, eventos y promociones.",
      "Exporta los datos o gráficos necesarios para presentaciones o análisis más detallados.",
    ],
  },
]

export default function TutorialPage() {
  const [activeSection, setActiveSection] = useState("scanning")
  const router = useRouter()
  return (
    <div className="min-h-screen bg-[#1A1B1C] p-6">
      <div className="max-w-6xl mx-auto bg-[#27272A] rounded-lg shadow-lg overflow-hidden">
        <div className="p-6 border-b border-[#3F3F46]">
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <HelpCircle className="w-8 h-8 text-[#3B82F6]" />
            Tutorial de la Aplicación
          </h1>
        </div>

        <div className="p-6">
          <div className="flex flex-wrap gap-4 mb-8 p-4 bg-[#1E1E1E] rounded-lg">
            {tutorialSections.map((section) => (
              <Button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                variant={activeSection === section.id ? "default" : "outline"}
                className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 ${
                  activeSection === section.id
                    ? "bg-gradient-to-r from-[#3B82F6] to-[#2563EB] text-white shadow-md"
                    : "bg-[#2A2A2A] text-gray-300 hover:bg-[#3F3F46] hover:text-white"
                }`}
              >
                <section.icon className={`w-5 h-5 ${activeSection === section.id ? "text-white" : "text-[#3B82F6]"}`} />
                <span className="font-medium">{section.title}</span>
              </Button>
            ))}
          </div>
          <Tabs value={activeSection} className="mt-8">
            {tutorialSections.map((section) => (
              <TabsContent key={section.id} value={section.id}>
                <Card className="bg-[#1A1B1C] border-[#3F3F46]">
                  <CardHeader>
                    <CardTitle className="text-2xl text-white flex items-center gap-2">
                      <section.icon className="w-6 h-6 text-[#3B82F6]" />
                      {section.title}
                    </CardTitle>
                    <CardDescription className="text-gray-400">{section.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ol className="list-decimal list-inside space-y-4">
                      {section.steps.map((step, index) => (
                        <li key={index} className="text-white">
                          {step}
                        </li>
                      ))}
                    </ol>
                  </CardContent>
                </Card>
              </TabsContent>
            ))}
          </Tabs>
        </div>

        <div className="p-6 border-t border-[#3F3F46] text-center">
          <Button onClick={() => router.push("/scan")} className="bg-[#3B82F6] hover:bg-[#2563EB] text-white">
            Ir a Escanear
          </Button>
        </div>
      </div>
    </div>
  )
}


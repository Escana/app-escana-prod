"use client"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { HelpCircle } from "lucide-react"
import { useState } from "react"

export default function HelpPage() {
  const helpTopics = [
    {
      question: "¿Cómo funciona el sistema de escaneo de documentos?",
      answer:
        "El sistema de escaneo utiliza tecnología OCR (Reconocimiento Óptico de Caracteres) para extraer información de documentos de identidad. Para escanear, vaya a la página 'Escanear', coloque el documento en el área designada y haga clic en 'Escanear'. El sistema procesará la imagen y extraerá automáticamente los datos relevantes.",
    },
    {
      question: "¿Cómo se gestionan las listas de invitados?",
      answer:
        "Las listas de invitados se manejan en la sección 'Listas de invitados'. Puede crear nuevas listas, agregar invitados manualmente o importar desde un archivo Excel. Cada lista incluye detalles como el nombre del evento, anfitrión, fecha y hora. Los invitados en la lista tendrán acceso prioritario al establecimiento.",
    },
    {
      question: "¿Cómo se registra y gestiona un incidente?",
      answer:
        "Para registrar un incidente, vaya a la sección 'Incidentes' y haga clic en 'Nuevo Incidente'. Complete el formulario con los detalles del incidente, incluyendo descripción, fecha, hora y personas involucradas. Los incidentes se pueden categorizar y se utilizan para tomar decisiones sobre posibles sanciones o baneos.",
    },
    {
      question: "¿Cuáles son los diferentes niveles de baneo y qué significan?",
      answer:
        "El sistema utiliza 5 niveles de baneo:\n\n" +
        "1. Nivel 1: Advertencia, duración de 7 días.\n" +
        "2. Nivel 2: Baneo leve, duración de 14 días.\n" +
        "3. Nivel 3: Baneo moderado, duración de 30 días.\n" +
        "4. Nivel 4: Baneo severo, duración de 90 días.\n" +
        "5. Nivel 5: Baneo permanente.\n\n" +
        "Cada nivel representa la gravedad de la infracción y determina la duración del baneo. Los niveles pueden escalar si se repiten las infracciones.",
    },
    {
      question: "¿Cómo puedo ver las estadísticas del establecimiento?",
      answer:
        "Las estadísticas se encuentran en la sección 'Estadísticas'. Aquí podrá ver gráficos y datos sobre la afluencia de clientes, distribución por género y edad, incidentes registrados y tendencias de asistencia. Puede filtrar las estadísticas por rango de fechas para análisis más detallados.",
    },
    {
      question: "¿Cómo funciona el proceso de verificación de edad?",
      answer:
        "El proceso de verificación de edad se realiza automáticamente durante el escaneo del documento. El sistema calcula la edad basándose en la fecha de nacimiento y la compara con la edad mínima requerida. Si un cliente es menor de edad, el sistema alertará al personal y negará la entrada.",
    },
  ]

  const [expandedTopic, setExpandedTopic] = useState<number | null>(null)

  const toggleTopic = (index: number) => {
    setExpandedTopic(expandedTopic === index ? null : index)
  }

  return (
    <div className="min-h-screen bg-[#1A1B1C] p-8">
      <div className="max-w-4xl mx-auto bg-[#27272A] rounded-lg shadow-lg overflow-hidden">
        <div className="p-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-white flex items-center gap-2">
              <HelpCircle className="w-8 h-8" />
              Centro de Ayuda
            </h1>
            <Button asChild className="bg-[#22C55E] hover:bg-[#16A34A] text-white">
              <Link href="/tutorial">Ir al Tutorial</Link>
            </Button>
          </div>

          <Accordion type="single" collapsible className="w-full">
            {helpTopics.map((topic, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger onClick={() => toggleTopic(index)} className="text-white hover:text-[#7DD3FC]">
                  {topic.question}
                </AccordionTrigger>
                <AccordionContent className="text-gray-300">
                  {expandedTopic === index ? (
                    <p className="whitespace-pre-line">{topic.answer}</p>
                  ) : (
                    <p>{topic.answer.split("\n")[0]}...</p>
                  )}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          {/* {filteredTopics.length === 0 && (
            <p className="text-gray-400 text-center mt-4">No se encontraron resultados para su búsqueda.</p>
          )} */}
        </div>
      </div>
    </div>
  )
}


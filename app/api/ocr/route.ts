import { NextResponse } from "next/server"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"
import { encode } from "gpt-tokenizer"

const apiKey =
  "R8D6a9JjM-LBdXUfmPPTYPMOoJ5wB2_BdFb1yOfDpufotUvVh4rllFW2K4GDYTHCvpqIuaK-uHT3BlbkFJKMXPaTR8203z8jzFtpHnv9rfF0VsYuBI6dCgU2D_VhD7VLqVIXjV6lcCs-M5-kh09cbOd9QYsA"
if (!apiKey) {
  console.error("Missing OpenAI API key. Please set OPENAI_API_KEY in your environment variables.")
}

export async function POST(req: Request) {
  try {
    const { text } = await req.json()

    if (!text) {
      return NextResponse.json({ error: "No se proporcionó texto OCR" }, { status: 400 })
    }

    console.log("Texto OCR completo:", text)
const now = new Date()
const todayFormatted = now.toLocaleDateString("es-CL")
const todayTimestamp = now.getTime() // este es el que diste: 1747678787199

    const prompt = `Extrae la siguiente información del texto OCR de una cédula de identidad chilena:
- RUN (formato: XX.XXX.XXX-X)
- Apellidos
- Nombres (solo los dos primeros)
- Nacionalidad
- Sexo (M o F en caso de no estar en el OCR, debe utilizarse el nombre para definir si es M o F)
- Fecha de Nacimiento (formato: DD MMM YYYY)
- Edad(la debes calcular en base a la fecha de nacimiento Año actual 2025 y la fecha de hoy)
- Fecha de hoy: ${todayFormatted}
- Timestamp de hoy: ${todayTimestamp}
Texto OCR:
${text}

Responde en formato JSON con las siguientes claves: run, apellidos, nombres, nacionalidad, sexo, nacimiento.
Si algún dato no se encuentra, deja el valor vacío.`
console.log("Prompt enviado a OpenAI:", prompt)
    const inputTokens = encode(prompt).length
    console.log(`Tokens de entrada: ${inputTokens}`)

    try {
      console.log("Enviando solicitud a OpenAI...")
      const { text: jsonResponse } = await generateText({
        model: openai("gpt-4", { apiKey }),
        prompt: prompt,
        temperature: 0.1,
        max_tokens: 500,
      })

      console.log("Respuesta de OpenAI recibida:", jsonResponse)

      const outputTokens = encode(jsonResponse).length
      console.log(`Tokens de salida: ${outputTokens}`)
      console.log(`Total de tokens utilizados: ${inputTokens + outputTokens}`)

      const parsedResponse = JSON.parse(jsonResponse)
      console.log("Datos extraídos por OpenAI:", parsedResponse)

      return NextResponse.json(parsedResponse)
    } catch (openaiError) {
      console.error("Error al procesar con OpenAI:", openaiError)
      if (openaiError.message.includes("API key")) {
        return NextResponse.json({ error: "Error de configuración de API key de OpenAI" }, { status: 500 })
      }
      return NextResponse.json({ error: `Error de OpenAI: ${openaiError.message}` }, { status: 500 })
    }
  } catch (error) {
    console.error("Error en el procesamiento de la API:", error)
    return NextResponse.json({ error: "Error en el procesamiento de la API" }, { status: 500 })
  }
}


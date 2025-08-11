"use server"

import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import OpenAI from "openai"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function processImage(imageUrl: string) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4-vision-preview",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Extract all text from this ID document. Format the response as JSON with fields for name, document_number, date_of_birth, expiration_date, and document_type. If a field is not visible or unclear, set its value to null.",
            },
            {
              type: "image_url",
              image_url: {
                url: imageUrl,
              },
            },
          ],
        },
      ],
      max_tokens: 300,
    })

    const content = response.choices[0].message.content
    if (!content) {
      throw new Error("No content returned from OpenAI")
    }

    // Extract JSON from the response
    const jsonMatch = content.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error("No JSON found in the response")
    }

    const extractedData = JSON.parse(jsonMatch[0])
    return { success: true, data: extractedData }
  } catch (error) {
    console.error("OCR processing error:", error)
    return { success: false, error: "Failed to process the image" }
  }
}

export async function saveDocumentData(clientId: string, documentData: any, imageUrl: string) {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)

  try {
    const { data, error } = await supabase
      .from("documents")
      .insert({
        client_id: clientId,
        document_type: documentData.document_type || "Unknown",
        document_number: documentData.document_number,
        name: documentData.name,
        date_of_birth: documentData.date_of_birth,
        expiration_date: documentData.expiration_date,
        image_url: imageUrl,
      })
      .select()

    if (error) throw error

    return { success: true, data }
  } catch (error) {
    console.error("Error saving document data:", error)
    return { success: false, error: "Failed to save document data" }
  }
}


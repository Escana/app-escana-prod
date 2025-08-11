import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export const dynamic = "force-dynamic" // Disable static optimization
export const revalidate = 0 // Disable cache

export async function GET() {
  console.log("GET /api/clients - Starting request")
  const startTime = Date.now()

  try {
    console.log("Fetching clients from Supabase...")
    let { data, error, status } = await supabase.from("clients").select("*").order("created_at", { ascending: false })

    // Handle rate limiting
    if (error && (status === 429 || (error.message && error.message.includes("Too Many")))) {
      console.log("Rate limit exceeded, retrying after delay...")
      // Wait 2 seconds and try again
      await new Promise((resolve) => setTimeout(resolve, 2000))
      const retryResponse = await supabase.from("clients").select("*").order("created_at", { ascending: false })

      if (retryResponse.error) {
        console.error("Retry failed:", retryResponse.error)
        console.error("Status code:", retryResponse.status)
        console.error("Error details:", JSON.stringify(retryResponse.error))
        return NextResponse.json(
          {
            error: "Rate limit exceeded",
            details: retryResponse.error.message,
            status: retryResponse.status,
          },
          { status: 429 },
        )
      }

      data = retryResponse.data
    } else if (error) {
      console.error("Supabase error:", error)
      console.error("Status:", status)
      console.error("Error details:", JSON.stringify(error))
      return NextResponse.json(
        {
          error: "Error fetching clients",
          details: error.message,
          status,
          code: error.code,
        },
        { status: 500 },
      )
    }

    if (!data) {
      console.log("No data returned from Supabase")
      return NextResponse.json([])
    }

    console.log(`Found ${data.length} clients`)

    // Format dates for frontend display
    const formattedData = data.map((client) => {
      try {
        return {
          ...client,
          ingreso: new Date(client.ingreso).toLocaleString("es-CL"),
          created_at: new Date(client.created_at).toLocaleString("es-CL"),
          updated_at: new Date(client.updated_at).toLocaleString("es-CL"),
          ban_start_date: client.ban_start_date ? new Date(client.ban_start_date).toLocaleString("es-CL") : null,
          ban_end_date: client.ban_end_date ? new Date(client.ban_end_date).toLocaleString("es-CL") : null,
          // Calculate age from nacimiento
          edad: client.nacimiento
            ? Math.floor((new Date().getTime() - new Date(client.nacimiento).getTime()) / 31557600000)
            : null,
        }
      } catch (e) {
        console.error("Error formatting client data:", e, "for client:", client.id)
        return client // Return unformatted data if formatting fails
      }
    })

    const endTime = Date.now()
    console.log(`Successfully formatted client data. Request took ${endTime - startTime}ms`)
    return NextResponse.json(formattedData)
  } catch (error) {
    console.error("Error in GET /api/clients:", error)
    console.error("Stack trace:", error instanceof Error ? error.stack : "No stack trace available")
    return NextResponse.json(
      {
        error: "Error fetching clients",
        details: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}


import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export const dynamic = "force-dynamic"
export const revalidate = 0

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("incidents")
      .select(`
        *,
        client:client_id(*),
        employee:employee_id(*)
      `)
      .order("created_at", { ascending: false })

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching incidents:", error)
    return NextResponse.json({ error: "Error fetching incidents" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { error } = await supabase.from("incidents").insert([body])

    if (error) throw error

    return NextResponse.json({ message: "Incident created successfully" })
  } catch (error) {
    console.error("Error creating incident:", error)
    return NextResponse.json({ error: "Error creating incident" }, { status: 500 })
  }
}


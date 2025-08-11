import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const { data, error } = await supabase
      .from("incidents")
      .select(`
        *,
        client:client_id(*),
        employee:employee_id(*)
      `)
      .eq("id", params.id)
      .single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching incident:", error)
    return NextResponse.json({ error: "Error fetching incident" }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const { error } = await supabase
      .from("incidents")
      .update({
        ...body,
        updated_at: new Date().toISOString(),
      })
      .eq("id", params.id)

    if (error) throw error

    return NextResponse.json({ message: "Incident updated successfully" })
  } catch (error) {
    console.error("Error updating incident:", error)
    return NextResponse.json({ error: "Error updating incident" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const { error } = await supabase.from("incidents").delete().eq("id", params.id)

    if (error) throw error

    return NextResponse.json({ message: "Incident deleted successfully" })
  } catch (error) {
    console.error("Error deleting incident:", error)
    return NextResponse.json({ error: "Error deleting incident" }, { status: 500 })
  }
}


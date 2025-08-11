import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const { banLevel, banDuration, banReason, banDescription } = await request.json()

    // Calculate ban dates
    const banStartDate = new Date()
    let banEndDate = null

    if (banDuration !== "Permanente") {
      const days = Number.parseInt(banDuration)
      banEndDate = new Date(banStartDate.getTime() + days * 24 * 60 * 60 * 1000)
    }

    // Update client record with ban information
    const { data, error } = await supabase
      .from("clients")
      .update({
        is_banned: true,
        ban_level: banLevel,
        ban_duration: banDuration,
        ban_reason: banReason,
        ban_description: banDescription,
        ban_start_date: banStartDate.toISOString(),
        ban_end_date: banEndDate?.toISOString() || null,
      })
      .eq("rut", params.id)
      .select()
      .single()

    if (error) {
      console.error("Error banning client:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error in ban client route:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const { data, error } = await supabase
      .from("clients")
      .update({
        is_banned: false,
        ban_level: null,
        ban_duration: null,
        ban_reason: null,
        ban_description: null,
        ban_start_date: null,
        ban_end_date: null,
      })
      .eq("rut", params.id)
      .select()
      .single()

    if (error) {
      console.error("Error unbanning client:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error in unban client route:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}


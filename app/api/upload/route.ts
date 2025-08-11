import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)

  try {
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer())

    // Generate a unique filename
    const filename = `${Date.now()}_${file.name.replace(/\s+/g, "_")}`

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage.from("documents").upload(filename, buffer, {
      contentType: file.type,
      cacheControl: "3600",
    })

    if (error) {
      console.error("Upload error:", error)
      return NextResponse.json({ error: "Failed to upload file" }, { status: 500 })
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from("documents").getPublicUrl(filename)

    return NextResponse.json({ url: publicUrl })
  } catch (error) {
    console.error("Server error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

